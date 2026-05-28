const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api-proxy";
const INTERNAL_API_BASE_URL = process.env.INTERNAL_API_BASE_URL || "http://127.0.0.1:8000";
const PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "http://localhost:3000";

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function joinUrl(base: string, path: string): string {
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

export function resolveApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (typeof window !== "undefined") {
    return joinUrl(PUBLIC_API_BASE_URL, normalizedPath);
  }

  if (isAbsoluteUrl(PUBLIC_API_BASE_URL)) {
    return joinUrl(PUBLIC_API_BASE_URL, normalizedPath);
  }

  if (PUBLIC_API_BASE_URL.startsWith("/api-proxy")) {
    return joinUrl(INTERNAL_API_BASE_URL, normalizedPath);
  }

  return new URL(joinUrl(PUBLIC_API_BASE_URL, normalizedPath), PUBLIC_SITE_URL).toString();
}
