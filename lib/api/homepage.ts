import type { HomepageData } from "@/lib/types/homepage";
import { resolveApiUrl } from "@/lib/api-base";
import { getHomepageMockData } from "@/lib/homepage-data";

const SERVER_FETCH_TIMEOUT_MS = 1200;
const ENABLE_HOMEPAGE_API_FALLBACK =
  process.env.NEXT_PUBLIC_ENABLE_HOMEPAGE_API_FALLBACK === "true" ||
  process.env.NEXT_PUBLIC_ENABLE_SKILLS_API_FALLBACK === "true" ||
  process.env.NODE_ENV !== "production";

type HomepageResponse = {
  code: number;
  message: string;
  data: HomepageData;
};

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

export async function getHomepageData(init?: RequestInit): Promise<HomepageData> {
  try {
    const res = await fetchWithTimeout(resolveApiUrl("/api/v1/homepage"), {
      next: {
        revalidate: 60,
      },
      ...init,
    });

    if (!res.ok) {
      throw new Error("Failed to fetch homepage data");
    }

    const json = (await res.json()) as HomepageResponse;

    if (json.code !== 0) {
      throw new Error(json.message || "Failed to fetch homepage data");
    }

    return json.data;
  } catch (error) {
    if (!ENABLE_HOMEPAGE_API_FALLBACK) {
      throw error;
    }

    return getHomepageMockData();
  }
}
