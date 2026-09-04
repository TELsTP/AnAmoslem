const SESSION_KEY = "anamoslem_session_id";
const ARCHITECT_KEY = "anamoslem_is_architect";

export const ARCHITECT_HANDSHAKE = "Nakamitshe-Telstp-235153";

export function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function isArchitectSession(): boolean {
  return localStorage.getItem(ARCHITECT_KEY) === "true";
}

export function markArchitectSession(): void {
  localStorage.setItem(ARCHITECT_KEY, "true");
}

export function containsArchitectHandshake(text: string): boolean {
  return text.includes(ARCHITECT_HANDSHAKE);
}