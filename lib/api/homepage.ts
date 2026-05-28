import type { HomepageData } from "@/lib/types/homepage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type HomepageResponse = {
  code: number;
  message: string;
  data: HomepageData;
};

export async function getHomepageData(init?: RequestInit): Promise<HomepageData> {
  const res = await fetch(`${API_BASE_URL}/api/v1/homepage`, {
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
