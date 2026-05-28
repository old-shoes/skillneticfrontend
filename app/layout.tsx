import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "skillnetic.ai",
  description: "skillnetic.ai 首页 MVP",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = (await headers()).get("x-locale") === "en" ? "en" : "zh";

  return (
    <html lang={locale === "en" ? "en" : "zh-CN"}>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
