import { initSession } from "./supabase";

const SESSION_KEY = "anamoslem_session_id";
const ARCHITECT_KEY = "anamoslem_is_architect";
const HANDSHAKE_CODE = "Nakamitshe-Telstp-235153";

export function getOrCreateSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function isArchitectSession(): boolean {
  return localStorage.getItem(ARCHITECT_KEY) === "true";
}

export function activateArchitectMode(): void {
  localStorage.setItem(ARCHITECT_KEY, "true");
  const sessionId = getOrCreateSessionId();
  initSession(sessionId, true);
}

export function deactivateArchitectMode(): void {
  localStorage.removeItem(ARCHITECT_KEY);
}

export function detectHandshake(text: string): boolean {
  return text.includes(HANDSHAKE_CODE);
}

export function getSessionInfo() {
  return {
    sessionId: getOrCreateSessionId(),
    isArchitect: isArchitectSession(),
    handshakeCode: HANDSHAKE_CODE,
  };
}
