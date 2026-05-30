import { resolveApiUrl } from "@/lib/api-base";
import { fetchWithSsrTimeout, isRetryableFetchError } from "@/lib/api/ssr-fetch";
import type { Locale } from "@/lib/i18n";
import type {
  CategoryListQuery,
  CategoryListResponse,
  CategoryOverviewData,
} from "@/lib/types/categories";

function toQueryString(query: CategoryListQuery): string {
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

const EMPTY_CATEGORY_OVERVIEW: CategoryOverviewData = {
  stats: {
    totalCategories: 0,
    totalTutorials: 0,
    weeklyViews: 0,
    weeklyFavorites: 0,
  },
  groups: [],
  scenes: [],
  hotTags: [],
};

function getEmptyCategoryList(_query: CategoryListQuery): CategoryListResponse {
  return {
    list: [],
  };
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetchWithSsrTimeout(resolveApiUrl(path), {
    next: { revalidate: 120 },
  });
  const json = await response.json();

  if (!response.ok || json.code !== 0 || json.data === undefined) {
    throw new Error(json.message || "Failed to fetch categories data");
  }

  return json.data as T;
}

export async function getCategoriesOverview(locale: Locale): Promise<CategoryOverviewData> {
  try {
    return await getJson<CategoryOverviewData>(withLocaleQuery("/api/v1/categories/overview", locale));
  } catch (error) {
    if (isRetryableFetchError(error)) {
      return EMPTY_CATEGORY_OVERVIEW;
    }
    throw error;
  }
}

export async function getCategories(query: CategoryListQuery, locale: Locale): Promise<CategoryListResponse> {
  const qs = toQueryString(query);
  try {
    return await getJson<CategoryListResponse>(
      withLocaleQuery(`/api/v1/categories${qs ? `?${qs}` : ""}`, locale),
    );
  } catch (error) {
    if (isRetryableFetchError(error)) {
      return getEmptyCategoryList(query);
    }
    throw error;
  }
}
