const supabaseUrl = () =>
  (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)?.replace(/\/$/, "");
const supabaseKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY;

export const ARCHITECT_HANDSHAKE = "Nakamitshe-Telstp-235153";

export type Persona = "companion" | "noura" | "hayat";
export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  persona?: Persona;
  created_at?: string;
};

type SupabaseResult<T = unknown> = { data: T | null; error?: string };

async function supabaseRequest<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<SupabaseResult<T>> {
  const url = supabaseUrl();
  const key = supabaseKey();
  if (!url || !key) return { data: null };

  try {
    const response = await fetch(`${url}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
    });
    const body = await response.text();
    if (!response.ok) {
      return {
        data: null,
        error: body || `Supabase request failed with ${response.status}`,
      };
    }
    return { data: body ? (JSON.parse(body) as T) : null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Supabase request failed",
    };
  }
}

function filter(value: string): string {
  return encodeURIComponent(value);
}

function warn(operation: string, error?: string) {
  if (error) {
    console.warn(`[AnaMoslem] Supabase ${operation} unavailable:`, error);
  }
}

export function containsArchitectHandshake(messages: ChatMessage[]): boolean {
  return messages.some(
    (message) =>
      typeof message.content === "string" &&
      message.content.includes(ARCHITECT_HANDSHAKE),
  );
}

function configuredArchitectUsers(): Set<string> {
  return new Set(
    (process.env.ARCHITECT_CLERK_USER_IDS || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

export async function ensureUserProfile(userId: string): Promise<void> {
  const { error } = await supabaseRequest("ana_moslem_users?on_conflict=user_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ user_id: userId, last_seen_at: new Date().toISOString() }),
  });
  warn("user profile upsert", error);
}

export async function isVerifiedArchitectSession(
  userId: string,
  sessionId: string | undefined,
): Promise<boolean> {
  if (!userId) return false;
  if (configuredArchitectUsers().has(userId)) return true;
  if (!sessionId) return false;

  const { data, error } = await supabaseRequest<Array<{ is_architect?: boolean }>>(
    `ana_moslem_sessions?select=is_architect&user_id=eq.${filter(userId)}&id=eq.${filter(sessionId)}&limit=1`,
  );
  if (error) {
    warn("architect session read", error);
    return false;
  }
  return data?.[0]?.is_architect === true;
}

export async function verifyArchitectSession(
  userId: string,
  sessionId: string | undefined,
): Promise<boolean> {
  if (!userId || !sessionId) return false;
  if (!configuredArchitectUsers().has(userId)) {
    // The handshake is not an authorization grant. It can only activate a
    // session that has already been allowlisted or provisioned server-side.
    return isVerifiedArchitectSession(userId, sessionId);
  }

  const now = new Date().toISOString();
  const { error } = await supabaseRequest("ana_moslem_sessions?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      id: sessionId,
      user_id: userId,
      is_architect: true,
      architect_verified_at: now,
      last_active_at: now,
    }),
  });
  warn("architect session write", error);
  return !error;
}

export async function loadConversation(
  userId: string,
  sessionId: string,
  limit = 80,
): Promise<Record<Persona, ChatMessage[]>> {
  const empty: Record<Persona, ChatMessage[]> = {
    noura: [],
    hayat: [],
    companion: [],
  };
  const { data, error } = await supabaseRequest<
    Array<{ persona: Persona; role: "user" | "assistant"; content: string; created_at?: string }>
  >(
    `ana_moslem_conversations?select=persona,role,content,created_at&user_id=eq.${filter(userId)}&session_id=eq.${filter(sessionId)}&order=created_at.asc&limit=${limit}`,
  );
  if (error) {
    warn("conversation read", error);
    return empty;
  }
  for (const message of data || []) {
    if (empty[message.persona]) {
      empty[message.persona].push(message);
    }
  }
  return empty;
}

export async function loadRecentConversation(
  userId: string,
  sessionId: string,
  limit = 18,
): Promise<ChatMessage[]> {
  const { data, error } = await supabaseRequest<ChatMessage[]>(
    `ana_moslem_conversations?select=persona,role,content,created_at&user_id=eq.${filter(userId)}&session_id=eq.${filter(sessionId)}&order=created_at.desc&limit=${limit}`,
  );
  if (error) {
    warn("recent conversation read", error);
    return [];
  }
  return (data || []).reverse();
}

export async function saveConversationMessage(
  userId: string,
  sessionId: string,
  persona: Persona,
  message: Pick<ChatMessage, "role" | "content">,
  isArchitectContext: boolean,
): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabaseRequest("ana_moslem_conversations", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      user_id: userId,
      session_id: sessionId,
      persona,
      role: message.role,
      content: message.content,
      is_architect_context: isArchitectContext,
      created_at: now,
    }),
  });
  warn("conversation write", error);
}

export async function deleteConversation(
  userId: string,
  sessionId: string,
  persona?: Persona,
): Promise<void> {
  const personaFilter = persona ? `&persona=eq.${filter(persona)}` : "";
  const { error } = await supabaseRequest(
    `ana_moslem_conversations?user_id=eq.${filter(userId)}&session_id=eq.${filter(sessionId)}${personaFilter}`,
    { method: "DELETE", headers: { Prefer: "return=minimal" } },
  );
  warn("conversation delete", error);
}