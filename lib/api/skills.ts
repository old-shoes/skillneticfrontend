import type { SkillDetail, SkillFavoriteResponse, SkillFilters, SkillListQuery, SkillListResponse } from "@/lib/types/skills";
import { resolveApiUrl } from "@/lib/api-base";
import { fetchWithSsrTimeout, isRetryableFetchError } from "@/lib/api/ssr-fetch";
import { getSkillsMockData, skillFiltersMockData } from "@/lib/skills-data";

const ENABLE_SKILLS_API_FALLBACK = process.env.NEXT_PUBLIC_ENABLE_SKILLS_API_FALLBACK === "true";

type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

const EMPTY_SKILL_FILTERS: SkillFilters = {
  categories: [],
  categoryTree: [],
  scenes: [],
  types: [],
  runtimes: [],
  languages: [],
  dashboard: {
    total: 0,
    featuredTypes: [],
    hotScenes: [],
    topTools: [],
  },
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

function getEmptySkillList(query: SkillListQuery): SkillListResponse {
  const page = query.page && query.page > 0 ? query.page : 1;
  const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : 9;

  return {
    list: [],
    pagination: {
      page,
      pageSize,
      total: 0,
      totalPages: 0,
    },
  };
}

function canUseSkillsFallback(error: unknown): boolean {
  if (ENABLE_SKILLS_API_FALLBACK) {
    return true;
  }
  return isRetryableFetchError(error);
}

export async function getSkillFilters(): Promise<SkillFilters> {
  try {
    const res = await fetchWithSsrTimeout(resolveApiUrl("/api/v1/skills/filters"), {
      next: { revalidate: 300 },
    });
    const json = await res.json();

    if (!res.ok || json.code !== 0) {
      throw new Error(json.message || "Failed to fetch skill filters");
    }

    return json.data;
  } catch (error) {
    if (!canUseSkillsFallback(error)) {
      throw error;
    }
    return ENABLE_SKILLS_API_FALLBACK ? skillFiltersMockData : EMPTY_SKILL_FILTERS;
  }
}

export async function getSkills(query: SkillListQuery): Promise<SkillListResponse> {
  const qs = toQueryString(query);
  const url = resolveApiUrl(`/api/v1/skills${qs ? `?${qs}` : ""}`);
  try {
    const res = await fetchWithSsrTimeout(
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
    if (!canUseSkillsFallback(error)) {
      throw error;
    }
    return ENABLE_SKILLS_API_FALLBACK ? getSkillsMockData(query) : getEmptySkillList(query);
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

export async function getSkillDetail(
  slug: string,
  init?: RequestInit,
  options?: { trackView?: boolean },
): Promise<SkillDetail | null> {
  const params = new URLSearchParams();
  if (options?.trackView) {
    params.set("trackView", "true");
  }
  const res = await fetchWithSsrTimeout(resolveApiUrl(`/api/v1/skills/${slug}${params.size ? `?${params.toString()}` : ""}`), {
    cache: "no-store",
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
