import type { Locale } from "@/lib/i18n";
import { getTutorialDetailMockData } from "@/lib/tutorial-detail-data";
import type { TutorialDetail } from "@/lib/types/tutorial-detail";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const SERVER_FETCH_TIMEOUT_MS = 1200;

type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

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

function shouldUseFallback(error: unknown): boolean {
  return error instanceof Error && (error.name === "AbortError" || error.message.includes("fetch failed"));
}

export async function getTutorialDetail(slug: string, locale: Locale): Promise<TutorialDetail | null> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}${withLocaleQuery(`/api/v1/tutorials/${slug}`, locale)}`, {
      next: {
        revalidate: 60,
      },
    });

    if (res.status === 404) {
      return getTutorialDetailMockData(slug, locale);
    }

    const json = (await res.json()) as Partial<ApiResponse<TutorialDetail>> & { detail?: string };

    if (!res.ok || json.code !== 0 || !json.data) {
      throw new Error(json.message || json.detail || "Failed to fetch tutorial detail");
    }

    return json.data;
  } catch (error) {
    if (shouldUseFallback(error)) {
      return getTutorialDetailMockData(slug, locale);
    }
    throw error;
  }
}

export async function incrementTutorialView(tutorialId: string): Promise<void> {
  await fetch(`${API_BASE_URL}/api/v1/tutorials/${tutorialId}/view`, {
    method: "POST",
    cache: "no-store",
  });
}

export async function incrementTutorialFavorite(tutorialId: string): Promise<void> {
  await fetch(`${API_BASE_URL}/api/v1/tutorials/${tutorialId}/favorite`, {
    method: "POST",
    cache: "no-store",
  });
}

export async function incrementTutorialLike(tutorialId: string): Promise<void> {
  await fetch(`${API_BASE_URL}/api/v1/tutorials/${tutorialId}/like`, {
    method: "POST",
    cache: "no-store",
  });
}

export async function submitTutorialHelpfulVote(tutorialId: string, vote: "yes" | "no"): Promise<void> {
  await fetch(`${API_BASE_URL}/api/v1/tutorials/${tutorialId}/helpful`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ vote }),
  });
}
