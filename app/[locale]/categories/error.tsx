"use client";

import { usePathname } from "next/navigation";
import { getLocaleFromPathname } from "@/lib/i18n";

export default function CategoriesError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = getLocaleFromPathname(usePathname());
  const copy =
    locale === "en"
      ? {
          eyebrow: "Categories",
          title: "Page Load Failed",
          description: "Category data is temporarily unavailable. Please try again later.",
          retry: "Retry",
        }
      : {
          eyebrow: "分类",
          title: "页面加载失败",
          description: "分类页数据暂时不可用，可以稍后重试。",
          retry: "重新加载",
        };

  return (
    <main className="min-h-screen px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-medium text-brand-600">{copy.eyebrow}</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">{copy.title}</h1>
        <p className="mt-4 text-sm leading-7 text-slate-500">{copy.description}</p>
        <button
          onClick={reset}
          className="mt-8 rounded-2xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white"
        >
          {copy.retry}
        </button>
      </div>
    </main>
  );
}
