export default function TutorialDetailLoading() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#f5f8ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-[32px] border border-white/80 bg-white/92 p-8 shadow-sm">
            <div className="h-5 w-80 rounded-full bg-slate-100" />
            <div className="mt-6 h-14 w-full max-w-4xl rounded-3xl bg-slate-100" />
            <div className="mt-4 h-6 w-full max-w-3xl rounded-2xl bg-slate-100" />
            <div className="mt-8 h-16 w-full rounded-[24px] bg-slate-100" />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="h-48 rounded-[24px] bg-slate-100" />
              <div className="h-48 rounded-[24px] bg-slate-100" />
            </div>
            <div className="mt-8 h-16 w-full rounded-[24px] bg-slate-100" />
            <div className="mt-8 space-y-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <div className="h-8 w-80 rounded-2xl bg-slate-100" />
                  <div className="h-5 w-full rounded-2xl bg-slate-100" />
                  <div className="h-5 w-11/12 rounded-2xl bg-slate-100" />
                  <div className="h-5 w-9/12 rounded-2xl bg-slate-100" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-64 rounded-[28px] border border-white/80 bg-white/92 shadow-sm" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
