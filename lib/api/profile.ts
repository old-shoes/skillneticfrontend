import type {
  PointLogListResponse,
  ProfileFavoriteListResponse,
  ProfileNotificationListResponse,
  ProfileOverview,
  ProfileSecurity,
  ProfileUpdatePayload,
  ProfileUser,
} from "@/lib/types/profile";
import type { SkillSubmissionListResponse, SkillSubmitStatus } from "@/lib/types/submit-skill";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

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

function normalizeSubmissionListResponse(data: SkillSubmissionListResponse): SkillSubmissionListResponse {
  return {
    ...data,
    list: Array.isArray(data.list)
      ? data.list.map((item) => ({
          ...item,
          tags: Array.isArray(item.tags) ? item.tags : [],
        }))
      : [],
    pagination: data.pagination || {
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
    },
  };
}

function normalizeProfileOverview(data: ProfileOverview): ProfileOverview {
  return {
    ...data,
    recentNotifications: Array.isArray(data.recentNotifications) ? data.recentNotifications : [],
    recentSubmissions: Array.isArray(data.recentSubmissions)
      ? data.recentSubmissions.map((item) => ({
          ...item,
          tags: Array.isArray(item.tags) ? item.tags : [],
        }))
      : [],
  };
}

export function getProfileOverview(): Promise<ProfileOverview> {
  return request<ProfileOverview>("/api/v1/me/overview").then(normalizeProfileOverview);
}

export function getProfile(): Promise<ProfileUser> {
  return request<ProfileUser>("/api/v1/me/profile");
}

export function updateProfile(payload: ProfileUpdatePayload): Promise<ProfileUser> {
  return request<ProfileUser>("/api/v1/me/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function getProfileSecurity(): Promise<ProfileSecurity> {
  return request<ProfileSecurity>("/api/v1/me/security");
}

export function getPointSummary() {
  return request<ProfileOverview["pointSummary"]>("/api/v1/me/points/summary");
}

export function getPointLogs(params?: {
  page?: number;
  pageSize?: number;
  eventType?: string;
}): Promise<PointLogListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) {
    searchParams.set("page", String(params.page));
  }
  if (params?.pageSize) {
    searchParams.set("pageSize", String(params.pageSize));
  }
  if (params?.eventType) {
    searchParams.set("eventType", params.eventType);
  }
  const query = searchParams.toString();
  return request<PointLogListResponse>(`/api/v1/me/points/logs${query ? `?${query}` : ""}`);
}

export function getNotifications(params?: {
  page?: number;
  pageSize?: number;
  isRead?: boolean;
  type?: string;
}): Promise<ProfileNotificationListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) {
    searchParams.set("page", String(params.page));
  }
  if (params?.pageSize) {
    searchParams.set("pageSize", String(params.pageSize));
  }
  if (typeof params?.isRead === "boolean") {
    searchParams.set("isRead", String(params.isRead));
  }
  if (params?.type) {
    searchParams.set("type", params.type);
  }
  const query = searchParams.toString();
  return request<ProfileNotificationListResponse>(`/api/v1/me/notifications${query ? `?${query}` : ""}`);
}

export function getFavorites(params?: {
  page?: number;
  pageSize?: number;
}): Promise<ProfileFavoriteListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) {
    searchParams.set("page", String(params.page));
  }
  if (params?.pageSize) {
    searchParams.set("pageSize", String(params.pageSize));
  }
  const query = searchParams.toString();
  return request<ProfileFavoriteListResponse>(`/api/v1/me/favorites${query ? `?${query}` : ""}`);
}

export function getMeSkillSubmissions(params?: {
  page?: number;
  pageSize?: number;
  status?: SkillSubmitStatus | "all";
}): Promise<SkillSubmissionListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) {
    searchParams.set("page", String(params.page));
  }
  if (params?.pageSize) {
    searchParams.set("pageSize", String(params.pageSize));
  }
  if (params?.status && params.status !== "all") {
    searchParams.set("status", params.status);
  }
  const query = searchParams.toString();
  return request<SkillSubmissionListResponse>(`/api/v1/me/skill-submissions${query ? `?${query}` : ""}`).then(
    normalizeSubmissionListResponse,
  );
}

export function markNotificationRead(notificationId: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/v1/me/notifications/${notificationId}/read`, {
    method: "POST",
  });
}

export function markAllNotificationsRead(): Promise<{ success: boolean }> {
  return request<{ success: boolean }>("/api/v1/me/notifications/read-all", {
    method: "POST",
  });
}

export function dailyMeCheckIn(): Promise<{ success: boolean }> {
  return request<{ success: boolean }>("/api/v1/me/check-in", {
    method: "POST",
  });
}
