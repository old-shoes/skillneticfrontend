/** @type {import('next').NextConfig} */
const upstreamBaseUrl = (process.env.INTERNAL_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: `${upstreamBaseUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
