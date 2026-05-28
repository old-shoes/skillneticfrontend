export default function AppLoading() {
  return (
    <main className="bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_32%),linear-gradient(180deg,#f8fbff_0%,#f4f8ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="rounded-[30px] border border-white/80 bg-white/85 p-8 shadow-sm">
          <div className="h-10 w-72 max-w-full rounded-2xl bg-slate-100" />
          <div className="mt-4 h-5 w-[520px] max-w-full rounded-2xl bg-slate-100" />
          <div className="mt-8 h-14 max-w-2xl rounded-[22px] bg-slate-100" />
          <div className="mt-6 flex flex-wrap gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-10 w-24 rounded-full bg-slate-100" />
            ))}
          </div>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-48 rounded-[24px] border border-white/80 bg-white/85 shadow-sm" />
          ))}
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-64 rounded-[24px] border border-white/80 bg-white/85 shadow-sm" />
          ))}
        </div>
      </div>
    </main>
  );
}
