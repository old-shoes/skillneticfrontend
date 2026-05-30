import type {
  LearningPath,
  TutorialFilters,
  TutorialListQuery,
  TutorialListResponse,
  WeeklyHotTutorial,
} from "@/lib/types/tutorials";
import { resolveApiUrl } from "@/lib/api-base";
import { fetchWithSsrTimeout, isRetryableFetchError } from "@/lib/api/ssr-fetch";
import type { Locale } from "@/lib/i18n";

function toQueryString(query: TutorialListQuery): string {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  return params.toString();
}

function withLocaleQuery(path: string, locale: Locale): string {
  const joiner = path.includes("?") ? "&" : "?";
  return `${path}${joiner}locale=${locale}`;
}

type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

const EMPTY_TUTORIAL_FILTERS: TutorialFilters = {
  categories: [],
  hotKeywords: [],
  hotTags: [],
};

function getEmptyTutorialList(query: TutorialListQuery): TutorialListResponse {
  const page = query.page && query.page > 0 ? query.page : 1;
  const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : 6;

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

async function getJson<T>(path: string): Promise<T> {
  const res = await fetchWithSsrTimeout(resolveApiUrl(path), {
    next: {
      revalidate: 60,
    },
  });
  const json = (await res.json()) as ApiResponse<T>;

  if (!res.ok || json.code !== 0) {
    throw new Error(json.message || "Failed to fetch tutorials data");
  }

  return json.data;
}

export async function getTutorials(query: TutorialListQuery, locale: Locale): Promise<TutorialListResponse> {
  const qs = toQueryString(query);
  try {
    return await getJson<TutorialListResponse>(withLocaleQuery(`/api/v1/tutorials${qs ? `?${qs}` : ""}`, locale));
  } catch (error) {
    if (isRetryableFetchError(error)) {
      return getEmptyTutorialList(query);
    }
    throw error;
  }
}

export async function getTutorialFilters(locale: Locale): Promise<TutorialFilters> {
  try {
    return await getJson<TutorialFilters>(withLocaleQuery("/api/v1/tutorials/filters", locale));
  } catch (error) {
    if (isRetryableFetchError(error)) {
      return EMPTY_TUTORIAL_FILTERS;
    }
    throw error;
  }
}

export async function getLearningPaths(locale: Locale): Promise<LearningPath[]> {
  try {
    return await getJson<LearningPath[]>(withLocaleQuery("/api/v1/tutorials/learning-paths", locale));
  } catch (error) {
    if (isRetryableFetchError(error)) {
      return [];
    }
    throw error;
  }
}

export async function getWeeklyHotTutorials(locale: Locale): Promise<WeeklyHotTutorial[]> {
  try {
    return await getJson<WeeklyHotTutorial[]>(withLocaleQuery("/api/v1/tutorials/weekly-hot", locale));
  } catch (error) {
    if (isRetryableFetchError(error)) {
      return [];
    }
    throw error;
  }
}
