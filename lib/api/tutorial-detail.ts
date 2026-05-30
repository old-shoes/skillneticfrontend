import type { Locale } from "@/lib/i18n";
import { resolveApiUrl } from "@/lib/api-base";
import { fetchWithSsrTimeout, isRetryableFetchError } from "@/lib/api/ssr-fetch";
import type { TutorialDetail } from "@/lib/types/tutorial-detail";

type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

function withLocaleQuery(path: string, locale: Locale): string {
  const joiner = path.includes("?") ? "&" : "?";
  return `${path}${joiner}locale=${locale}`;
}

export async function getTutorialDetail(slug: string, locale: Locale): Promise<TutorialDetail | null> {
  let res: Response;

  try {
    res = await fetchWithSsrTimeout(resolveApiUrl(withLocaleQuery(`/api/v1/tutorials/${slug}`, locale)), {
      next: {
        revalidate: 60,
      },
    });
  } catch (error) {
    if (isRetryableFetchError(error)) {
      return null;
    }
    throw error;
  }

  if (res.status === 404) {
    return null;
  }

  const json = (await res.json()) as Partial<ApiResponse<TutorialDetail>> & { detail?: string };

  if (!res.ok || json.code !== 0 || !json.data) {
    throw new Error(json.message || json.detail || "Failed to fetch tutorial detail");
  }

  return json.data;
}

export async function incrementTutorialView(tutorialId: string): Promise<void> {
  await fetch(resolveApiUrl(`/api/v1/tutorials/${tutorialId}/view`), {
    method: "POST",
    cache: "no-store",
  });
}

export async function incrementTutorialFavorite(tutorialId: string): Promise<void> {
  await fetch(resolveApiUrl(`/api/v1/tutorials/${tutorialId}/favorite`), {
    method: "POST",
    cache: "no-store",
  });
}

export async function incrementTutorialLike(tutorialId: string): Promise<void> {
  await fetch(resolveApiUrl(`/api/v1/tutorials/${tutorialId}/like`), {
    method: "POST",
    cache: "no-store",
  });
}

export async function submitTutorialHelpfulVote(tutorialId: string, vote: "yes" | "no"): Promise<void> {
  await fetch(resolveApiUrl(`/api/v1/tutorials/${tutorialId}/helpful`), {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ vote }),
  });
}
