import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export const ARCHITECT_HANDSHAKE = "Nakamitshe-Telstp-235153";

type ChatMessage = { role: string; content: string };

export function containsArchitectHandshake(messages: ChatMessage[]): boolean {
  return messages.some((message) =>
    typeof message.content === "string" &&
    message.content.includes(ARCHITECT_HANDSHAKE),
  );
}

export async function isVerifiedArchitectSession(
  sessionId: string | undefined,
): Promise<boolean> {
  if (!supabase || !sessionId) return false;

  const { data, error } = await supabase
    .from("ana_moslem_sessions")
    .select("is_architect")
    .eq("id", sessionId)
    .maybeSingle();

  if (error) {
    console.warn("[AnaMoslem] Could not read architect session:", error.message);
    return false;
  }

  return data?.is_architect === true;
}

export async function verifyArchitectSession(
  sessionId: string | undefined,
): Promise<boolean> {
  if (!supabase || !sessionId) return false;

  const { error } = await supabase.from("ana_moslem_sessions").upsert({
    id: sessionId,
    is_architect: true,
    architect_verified_at: new Date().toISOString(),
    last_active_at: new Date().toISOString(),
  });

  if (error) {
    console.warn("[AnaMoslem] Could not save architect session:", error.message);
    return false;
  }

  return true;
}