import { createClient } from "@supabase/supabase-js";

declare global {
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL?: string;
    readonly VITE_SUPABASE_ANON_KEY?: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("[AnaMoslem] Supabase env vars not set — conversations will not persist.");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

export type Persona = "noura" | "hayat" | "companion";

export interface ConversationMessage {
  id?: string;
  session_id: string;
  persona: Persona;
  role: "user" | "assistant";
  content: string;
  is_architect_context?: boolean;
  created_at?: string;
}

export async function saveMessage(msg: ConversationMessage): Promise<void> {
  try {
    await supabase.from("ana_moslem_conversations").insert(msg);
  } catch (e) {
    console.warn("[AnaMoslem] Could not save message:", e);
  }
}

export async function loadConversation(
  sessionId: string,
  persona: Persona,
  limit = 50
): Promise<ConversationMessage[]> {
  try {
    const { data, error } = await supabase
      .from("ana_moslem_conversations")
      .select("*")
      .eq("session_id", sessionId)
      .eq("persona", persona)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) return [];
    return (data as ConversationMessage[]) || [];
  } catch {
    return [];
  }
}

export async function initSession(sessionId: string, isArchitect: boolean): Promise<void> {
  try {
    await supabase.from("ana_moslem_sessions").upsert({
      id: sessionId,
      is_architect: isArchitect,
      architect_verified_at: isArchitect ? new Date().toISOString() : null,
      last_active_at: new Date().toISOString(),
    });
  } catch (e) {
    console.warn("[AnaMoslem] Could not init session:", e);
  }
}
