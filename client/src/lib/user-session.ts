const USER_KEY = "anamoslem_user_profile";

export interface UserProfile {
  id: string;
  name: string;
  createdAt: string;
  permissions: {
    microphone: boolean;
    camera: boolean;
    storage: boolean;
  };
}

export function getUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function setUserProfile(profile: UserProfile): void {
  localStorage.setItem(USER_KEY, JSON.stringify(profile));
}

export function clearUserProfile(): void {
  localStorage.removeItem(USER_KEY);
}

export function hasUserProfile(): boolean {
  return !!getUserProfile();
}

export async function requestBasicPermissions() {
  const microphone = await navigator.mediaDevices.getUserMedia({ audio: true }).then(() => true).catch(() => false);
  const camera = await navigator.mediaDevices.getUserMedia({ video: true }).then(() => true).catch(() => false);
  const storage = !!navigator.storage?.persist && await navigator.storage.persist().catch(() => false);
  return { microphone, camera, storage };
}