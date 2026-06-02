import type { HomepageData } from "@/lib/types/homepage";
import { resolveApiUrl } from "@/lib/api-base";
import { fetchWithSsrTimeout, isRetryableFetchError } from "@/lib/api/ssr-fetch";

type HomepageResponse = {
  code: number;
  message: string;
  data: HomepageData;
};

const EMPTY_HOMEPAGE_DATA: HomepageData = {
  categories: [],
  featuredSkills: [],
  trendingSkills: [],
  latestSkills: [],
  latestActivities: [],
  weeklyContributors: [],
  sceneCounts: [],
  tutorials: [],
  stats: {
    skillFavorites: 0,
    qualityTemplates: 0,
    monthlyVisits: 0,
    beginnerTutorials: 0,
  },
};

export async function getHomepageData(init?: RequestInit): Promise<HomepageData> {
  try {
    const res = await fetchWithSsrTimeout(resolveApiUrl("/api/v1/homepage"), {
      cache: "no-store",
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
    if (isRetryableFetchError(error)) {
      return EMPTY_HOMEPAGE_DATA;
    }
    throw error;
  }
}
