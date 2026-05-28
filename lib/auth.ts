"use client";

export type AuthUser = {
  id: string;
  email: string;
  nickname: string;
  avatarUrl?: string | null;
  githubConnected?: boolean;
  level: string;
  locale: string;
  createdAt: string;
};

const USER_KEY = "ai_skill_user";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function getAuthUser(): AuthUser | null {
  if (!isBrowser()) {
    return null;
  }
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function saveAuthUser(user: AuthUser) {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent("auth-changed"));
}

export function clearAuthSession() {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.removeItem("ai_skill_token");
  window.localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new CustomEvent("auth-changed"));
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    credentials: "include",
    cache: "no-store",
    ...init,
  });
  const json = (await res.json()) as Partial<ApiResponse<T>> & { detail?: string };
  if (!res.ok || json.code !== 0 || json.data === undefined) {
    throw new Error(json.message || json.detail || "Request failed");
  }
  return json.data;
}

export async function registerAuth(payload: {
  email: string;
  emailCode: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
  locale: string;
}): Promise<{ user: AuthUser }> {
  return request<{ user: AuthUser }>(
    "/api/v1/auth/register/email",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function getGithubLoginUrl(intent: "login" | "register"): Promise<string> {
  const result = await request<{ url: string }>(`/api/v1/auth/github/login?intent=${intent}`);
  return result.url;
}

export async function loginAuth(payload: {
  email: string;
  password: string;
  rememberMe?: boolean;
}): Promise<{ user: AuthUser }> {
  return request<{ user: AuthUser }>(
    "/api/v1/auth/login/email",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function sendEmailCode(payload: {
  email: string;
  scene: "register" | "forgot_password";
}): Promise<{ cooldownSeconds: number; debugCode?: string | null }> {
  return request<{ cooldownSeconds: number; debugCode?: string | null }>("/api/v1/auth/email-code/send", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resetPassword(payload: {
  email: string;
  emailCode: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ success: boolean }> {
  return request<{ success: boolean }>("/api/v1/auth/password/reset", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ success: boolean }> {
  return request<{ success: boolean }>("/api/v1/account/password/change", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logoutAuth(): Promise<{ success: boolean }> {
  return request<{ success: boolean }>("/api/v1/auth/logout", {
    method: "POST",
  });
}

export async function fetchRealMe(): Promise<AuthUser> {
  const user = await request<AuthUser>("/api/v1/auth/me");
  saveAuthUser(user);
  return user;
}

export async function fetchMe(): Promise<AuthUser> {
  return fetchRealMe();
}

export async function legacyRegisterAuth(payload: {
  email: string;
  password: string;
  locale: string;
}): Promise<{ user: AuthUser }> {
  return request<{ token: string; user: AuthUser }>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function legacyLoginAuth(payload: {
  email: string;
  password: string;
}): Promise<{ user: AuthUser }> {
  return request<{ token: string; user: AuthUser }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function uploadSkillCover(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  const contentBase64 = btoa(binary);
  const result = await request<{ url: string }>("/api/v1/upload/skill-cover", {
    method: "POST",
    body: JSON.stringify({
      filename: file.name,
      mimeType: file.type,
      contentBase64,
    }),
  });
  return result.url;
}
