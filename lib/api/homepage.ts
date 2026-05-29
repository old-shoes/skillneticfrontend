import type { HomepageData } from "@/lib/types/homepage";
import { resolveApiUrl } from "@/lib/api-base";

const SERVER_FETCH_TIMEOUT_MS = 1200;

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
}
