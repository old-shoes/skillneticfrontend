"use client";

export default function SkillsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-medium text-brand-600">技能库</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">页面加载失败</h1>
        <p className="mt-4 text-sm leading-7 text-slate-500">技能库数据暂时不可用，可以稍后重试。</p>
        <button
          onClick={reset}
          className="mt-8 rounded-2xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white"
        >
          重新加载
        </button>
      </div>
    </main>
  );
}
