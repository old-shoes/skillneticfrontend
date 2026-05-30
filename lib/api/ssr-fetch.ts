const DEFAULT_SERVER_FETCH_TIMEOUT_MS = 5000;

export async function fetchWithSsrTimeout(input: string, init: RequestInit, timeoutMs = DEFAULT_SERVER_FETCH_TIMEOUT_MS): Promise<Response> {
  if (typeof window !== "undefined") {
    return fetch(input, init);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export function isRetryableFetchError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return error.name === "AbortError" || message.includes("fetch failed") || message.includes("failed to fetch");
}
