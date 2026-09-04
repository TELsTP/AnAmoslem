const supabaseUrl = (
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
)?.replace(/\/$/, "");
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const ARCHITECT_HANDSHAKE = "Nakamitshe-Telstp-235153";

type ChatMessage = { role: string; content: string };
type SupabaseResult = { data: unknown; error?: string };

async function supabaseRequest(
  path: string,
  init: RequestInit = {},
): Promise<SupabaseResult> {
  if (!supabaseUrl || !supabaseKey) {
    return { data: null };
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
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

    return { data: body ? JSON.parse(body) : null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Supabase request failed",
    };
  }
}

export function containsArchitectHandshake(messages: ChatMessage[]): boolean {
  return messages.some((message) =>
    typeof message.content === "string" &&
    message.content.includes(ARCHITECT_HANDSHAKE),
  );
}

export async function isVerifiedArchitectSession(
  sessionId: string | undefined,
): Promise<boolean> {
  if (!supabaseUrl || !supabaseKey || !sessionId) return false;

  const { data, error } = await supabaseRequest(
    `ana_moslem_sessions?select=is_architect&id=eq.${encodeURIComponent(sessionId)}&limit=1`,
  );

  if (error) {
    console.warn("[AnaMoslem] Could not read architect session:", error);
    return false;
  }

  const rows = Array.isArray(data) ? data : [];
  return (rows[0] as { is_architect?: boolean } | undefined)?.is_architect === true;
}

export async function verifyArchitectSession(
  sessionId: string | undefined,
): Promise<boolean> {
  if (!supabaseUrl || !supabaseKey || !sessionId) return false;

  const now = new Date().toISOString();
  const { error } = await supabaseRequest("ana_moslem_sessions?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      id: sessionId,
      is_architect: true,
      architect_verified_at: now,
      last_active_at: now,
    }),
  });

  if (error) {
    console.warn("[AnaMoslem] Could not save architect session:", error);
    return false;
  }

  return true;
}