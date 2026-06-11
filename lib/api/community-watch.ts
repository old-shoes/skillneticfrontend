import { resolveApiUrl } from "@/lib/api-base";
import { fetchWithSsrTimeout, isRetryableFetchError } from "@/lib/api/ssr-fetch";
import type { CommunityWatchSnapshot } from "@/lib/types/community-watch";

type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

const EMPTY_COMMUNITY_WATCH: CommunityWatchSnapshot = {
  meta: {
    generatedAt: "",
    source: "github-community-watch",
    scriptVersion: 1,
    trendingFeedUrl: "",
    githubTrendingUrl: "https://github.com/trending",
    usesGithubToken: false,
  },
  summary: {
    trackedRepositories: 0,
    trackedIssues: 0,
    trackedTopics: 0,
    totalStars: 0,
    totalForks: 0,
    totalStarsLabel: "0",
    totalForksLabel: "0",
    topLanguage: "-",
    topLanguageCount: 0,
    filters: {
      since: "daily",
      language: "",
      topic: "",
    },
  },
  repositories: [],
  issues: [],
  topics: [],
};

export async function getCommunityWatch(): Promise<CommunityWatchSnapshot> {
  try {
    const res = await fetchWithSsrTimeout(resolveApiUrl("/api/v1/community-watch"), {
      next: {
        revalidate: 300,
      },
    });
    const json = (await res.json()) as ApiResponse<CommunityWatchSnapshot>;

    if (!res.ok || json.code !== 0 || !json.data) {
      throw new Error(json.message || "Failed to fetch community watch");
    }

    return json.data;
  } catch (error) {
    if (isRetryableFetchError(error)) {
      return EMPTY_COMMUNITY_WATCH;
    }
    throw error;
  }
}
