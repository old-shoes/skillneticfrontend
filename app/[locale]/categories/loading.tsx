export default function CategoriesLoading() {
  return (
    <main className="min-h-screen">
      <section className="border-b border-white/60 bg-gradient-to-br from-[#fafcff] via-[#f7faff] to-[#f8fbff]">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <div className="h-4 w-40 rounded-full bg-slate-100" />
          <div className="mt-6 h-14 w-64 rounded-2xl bg-slate-100" />
          <div className="mt-4 h-6 w-[420px] max-w-full rounded-full bg-slate-100" />
          <div className="mt-8 h-16 w-full max-w-[410px] rounded-2xl bg-white shadow-[0_10px_40px_rgba(15,23,42,0.04)]" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-28 rounded-[30px] bg-white/92 shadow-[0_18px_60px_rgba(15,23,42,0.05)]" />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
          <div className="h-[640px] rounded-[32px] bg-white/92 shadow-[0_18px_60px_rgba(15,23,42,0.05)]" />
          <div>
            <div className="h-12 w-full rounded-2xl bg-white/92 shadow-[0_18px_60px_rgba(15,23,42,0.05)]" />
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="h-[300px] rounded-[28px] bg-white/92 shadow-[0_18px_55px_rgba(15,23,42,0.05)]" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
