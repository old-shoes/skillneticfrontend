export default function SkillsLoading() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_32%),linear-gradient(180deg,#f8fbff_0%,#f4f8ff_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-16 rounded-3xl border border-white/80 bg-white/85 shadow-sm" />
        <div className="mt-8 rounded-[32px] border border-white/80 bg-white/85 p-8 shadow-sm">
          <div className="h-10 w-80 rounded-2xl bg-slate-100" />
          <div className="mt-5 h-6 w-[520px] max-w-full rounded-2xl bg-slate-100" />
          <div className="mt-8 h-16 rounded-[24px] bg-slate-100" />
          <div className="mt-6 flex flex-wrap gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-10 w-28 rounded-full bg-slate-100" />
            ))}
          </div>
        </div>
        <div className="mt-8 h-28 rounded-[28px] border border-white/80 bg-white/85 shadow-sm" />
        <div className="mt-8 h-52 rounded-[28px] border border-white/80 bg-white/85 shadow-sm" />
        <div className="mt-8 h-16 rounded-[24px] border border-white/80 bg-white/85 shadow-sm" />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-72 rounded-[24px] border border-white/80 bg-white/85 shadow-sm" />
          ))}
        </div>
      </div>
    </main>
  );
}
