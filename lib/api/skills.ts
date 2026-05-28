import type { SkillDetail, SkillFavoriteResponse, SkillFilters, SkillListQuery, SkillListResponse } from "@/lib/types/skills";
import { resolveApiUrl } from "@/lib/api-base";
import { getSkillsMockData, skillFiltersMockData } from "@/lib/skills-data";

const SERVER_FETCH_TIMEOUT_MS = 1200;
const ENABLE_SKILLS_API_FALLBACK = process.env.NEXT_PUBLIC_ENABLE_SKILLS_API_FALLBACK === "true";

type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

function toQueryString(query: SkillListQuery): string {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  return params.toString();
}

async function fetchWithTimeout(input: string, init: RequestInit): Promise<Response> {
  if (typeof window !== "undefined") {
    return fetch(input, init);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SERVER_FETCH_TIMEOUT_MS);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getSkillFilters(): Promise<SkillFilters> {
  try {
    const res = await fetchWithTimeout(resolveApiUrl("/api/v1/skills/filters"), {
      next: { revalidate: 300 },
    });
    const json = await res.json();

    if (!res.ok || json.code !== 0) {
      throw new Error(json.message || "Failed to fetch skill filters");
    }

    return json.data;
  } catch (error) {
    if (!ENABLE_SKILLS_API_FALLBACK) {
      throw error;
    }
    return skillFiltersMockData;
  }
}

export async function getSkills(query: SkillListQuery): Promise<SkillListResponse> {
  const qs = toQueryString(query);
  const url = resolveApiUrl(`/api/v1/skills${qs ? `?${qs}` : ""}`);
  try {
    const res = await fetchWithTimeout(
      url,
      typeof window === "undefined"
        ? {
            next: { revalidate: 60 },
          }
        : {
            cache: "no-store",
          },
    );
    const json = await res.json();

    if (!res.ok || json.code !== 0) {
      throw new Error(json.message || "Failed to fetch skills");
    }

    return json.data;
  } catch (error) {
    if (!ENABLE_SKILLS_API_FALLBACK) {
      throw error;
    }
    return getSkillsMockData(query);
  }
}

export async function favoriteSkill(skillId: string): Promise<SkillFavoriteResponse> {
  const res = await fetch(resolveApiUrl(`/api/v1/skills/${skillId}/favorite`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    cache: "no-store",
  });
  const json = (await res.json()) as Partial<ApiResponse<SkillFavoriteResponse>> & { detail?: string };
  if (!res.ok || json.code !== 0 || json.data === undefined) {
    throw new Error(json.message || json.detail || "Favorite failed");
  }
  return json.data;
}

export async function unfavoriteSkill(skillId: string): Promise<SkillFavoriteResponse> {
  const res = await fetch(resolveApiUrl(`/api/v1/skills/${skillId}/favorite`), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    cache: "no-store",
  });
  const json = (await res.json()) as Partial<ApiResponse<SkillFavoriteResponse>> & { detail?: string };
  if (!res.ok || json.code !== 0 || json.data === undefined) {
    throw new Error(json.message || json.detail || "Unfavorite failed");
  }
  return json.data;
}

export async function getSkillDetail(slug: string, init?: RequestInit): Promise<SkillDetail | null> {
  const res = await fetchWithTimeout(resolveApiUrl(`/api/v1/skills/${slug}`), {
    ...(typeof window === "undefined" ? { next: { revalidate: 60 } } : { cache: "no-store" }),
    ...(init || {}),
  });

  if (res.status === 404) {
    return null;
  }

  const json = (await res.json()) as Partial<ApiResponse<SkillDetail>> & { detail?: string };
  if (!res.ok || json.code !== 0 || json.data === undefined) {
    throw new Error(json.message || json.detail || "Failed to fetch skill detail");
  }
  return json.data;
}
