"use client";

import { resolveApiUrl } from "@/lib/api-base";

type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

export type NewsletterSubscribeResult = {
  email: string;
  subscribed: boolean;
  alreadySubscribed: boolean;
};

export async function subscribeNewsletter(payload: {
  email: string;
  locale: string;
  source?: string;
}): Promise<NewsletterSubscribeResult> {
  const res = await fetch(resolveApiUrl("/api/v1/newsletter/subscribe"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({
      email: payload.email,
      locale: payload.locale,
      source: payload.source || "footer",
    }),
  });

  const json = (await res.json()) as Partial<ApiResponse<NewsletterSubscribeResult>> & { detail?: string };
  if (!res.ok || json.code !== 0 || !json.data) {
    throw new Error(json.message || json.detail || "Subscribe failed");
  }

  return json.data;
}
