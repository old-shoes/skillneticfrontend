import { getCategoriesMockData, getCategoriesOverviewMockData } from "@/lib/categories-data";
import type { Locale } from "@/lib/i18n";
import type {
  CategoryListQuery,
  CategoryListResponse,
  CategoryOverviewData,
} from "@/lib/types/categories";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const SERVER_FETCH_TIMEOUT_MS = 1200;

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

async function getJson<T>(path: string): Promise<T> {
  const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
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
  } catch {
    return getCategoriesOverviewMockData(locale);
  }
}

export async function getCategories(query: CategoryListQuery, locale: Locale): Promise<CategoryListResponse> {
  const qs = toQueryString(query);
  try {
    return await getJson<CategoryListResponse>(
      withLocaleQuery(`/api/v1/categories${qs ? `?${qs}` : ""}`, locale),
    );
  } catch {
    return getCategoriesMockData(query, locale);
  }
}
