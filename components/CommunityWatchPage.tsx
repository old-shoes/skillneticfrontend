import type { Locale } from "@/lib/i18n";
import { formatChinaDateTime, localeNumberFormat } from "@/lib/i18n";
import type { CommunityWatchSnapshot } from "@/lib/types/community-watch";

type Props = {
  locale: Locale;
  snapshot: CommunityWatchSnapshot;
};

function formatNumber(locale: Locale, value: number): string {
  return value.toLocaleString(localeNumberFormat[locale]);
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/70 bg-white/90 p-4 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
      <div className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">{label}</div>
      <div className="mt-2 text-[28px] font-semibold tracking-tight text-slate-950">{value}</div>
      <div className="mt-1.5 text-xs leading-5 text-slate-500">{hint}</div>
    </div>
  );
}

export function CommunityWatchPage({ locale, snapshot }: Props) {
  const isZh = locale === "zh";
  const generatedAt = formatChinaDateTime(snapshot.meta.generatedAt, locale);
  const filters = snapshot.summary.filters;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.12),transparent_26%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_30%),linear-gradient(180deg,#fffdf8_0%,#f8fbff_42%,#f7fafc_100%)]">
      <section className="border-b border-white/70">
        <div className="mx-auto max-w-7xl px-4 pb-7 pt-8 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
              {isZh ? "GitHub 社区观察站" : "GitHub Community Watch"}
            </div>
            <h1 className="mt-4 max-w-3xl text-[32px] font-semibold tracking-tight text-slate-950 sm:text-[40px]">
              {isZh ? "抓 GitHub 社区最受关注的仓库、议题与 Topic" : "Track the repos, issues, and topics GitHub is focusing on"}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              {isZh
                ? "这块看板读取根目录脚本产出的 JSON 快照，适合用来观察开源热点、挖选题、找竞品和追踪开发者讨论方向。"
                : "This board reads the JSON snapshot produced by the root script and is useful for spotting open-source momentum, content ideas, competitors, and developer conversations."}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1">
              {isZh ? `更新时间 ${generatedAt}` : `Updated ${generatedAt}`}
            </span>
            <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1">
              {isZh ? `周期 ${filters.since}` : `Window ${filters.since}`}
            </span>
            {filters.language ? (
              <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1">
                {isZh ? `语言 ${filters.language}` : `Language ${filters.language}`}
              </span>
            ) : null}
            {filters.topic ? (
              <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1">
                {isZh ? `主题 ${filters.topic}` : `Topic ${filters.topic}`}
              </span>
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label={isZh ? "追踪仓库" : "Tracked repos"}
              value={formatNumber(locale, snapshot.summary.trackedRepositories)}
              hint={isZh ? "进入今日趋势池的仓库数量" : "Repositories included in the snapshot"}
            />
            <StatCard
              label={isZh ? "总 Star" : "Total stars"}
              value={snapshot.summary.totalStarsLabel}
              hint={isZh ? "热点仓库整体影响力体量" : "Aggregate influence across tracked repos"}
            />
            <StatCard
              label={isZh ? "活跃议题" : "Active issues"}
              value={formatNumber(locale, snapshot.summary.trackedIssues)}
              hint={isZh ? "高讨论度 open issues / discussions" : "Open issues or discussions with high comment volume"}
            />
            <StatCard
              label={isZh ? "主导语言" : "Top language"}
              value={snapshot.summary.topLanguage}
              hint={
                isZh
                  ? `${formatNumber(locale, snapshot.summary.topLanguageCount)} 个仓库命中`
                  : `${formatNumber(locale, snapshot.summary.topLanguageCount)} repos in view`
              }
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 xl:grid-cols-[1.5fr_0.86fr]">
          <div className="space-y-4">
            <section className="rounded-[26px] border border-white/70 bg-white/92 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">{isZh ? "热门仓库" : "Trending repositories"}</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {isZh ? "优先看短时间内获得社区注意力的项目。" : "A short list of projects currently pulling strong community attention."}
                  </p>
                </div>
                <a
                  href={snapshot.meta.githubTrendingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-slate-950 bg-slate-950 px-3 py-1.5 text-xs font-semibold !text-white transition hover:border-slate-800 hover:bg-slate-800 hover:!text-white"
                >
                  {isZh ? "打开 Trending" : "Open Trending"}
                </a>
              </div>

              <div className="mt-4 space-y-3">
                {snapshot.repositories.map((repo, index) => (
                  <a
                    key={repo.fullName}
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-[20px] border border-slate-100 bg-[linear-gradient(135deg,rgba(255,251,235,0.75),rgba(255,255,255,0.96))] p-4 transition hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(15,23,42,0.07)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
                            {index + 1}
                          </span>
                          <div>
                            <div className="text-base font-semibold text-slate-950">{repo.fullName}</div>
                            <div className="mt-0.5 text-xs text-slate-500">{repo.language || (isZh ? "未标注语言" : "No language")}</div>
                          </div>
                        </div>
                        <p className="mt-3 line-clamp-2 text-xs leading-6 text-slate-600">
                          {(isZh ? repo.descriptionZh : "") || repo.description || (isZh ? "暂无描述" : "No description yet")}
                        </p>
                      </div>
                      <div className="grid shrink-0 grid-cols-2 gap-x-4 gap-y-2 text-right text-xs text-slate-500">
                        <div>
                          <div className="uppercase tracking-[0.16em] text-slate-400">Stars</div>
                          <div className="mt-0.5 text-sm font-semibold text-slate-950">{repo.starsLabel}</div>
                        </div>
                        <div>
                          <div className="uppercase tracking-[0.16em] text-slate-400">Forks</div>
                          <div className="mt-0.5 text-sm font-semibold text-slate-950">{repo.forksLabel}</div>
                        </div>
                        <div>
                          <div className="uppercase tracking-[0.16em] text-slate-400">Watchers</div>
                          <div className="mt-0.5 text-sm font-semibold text-slate-950">{repo.watchersLabel}</div>
                        </div>
                        <div>
                          <div className="uppercase tracking-[0.16em] text-slate-400">{isZh ? "Open Issues" : "Open issues"}</div>
                          <div className="mt-0.5 text-sm font-semibold text-slate-950">{formatNumber(locale, repo.openIssues)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {repo.topics.map((topic) => (
                        <span key={topic} className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white/90">
                          #{topic}
                        </span>
                      ))}
                    </div>
                  </a>
                ))}
              </div>
            </section>

            <section className="rounded-[26px] border border-white/70 bg-white/92 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">{isZh ? "高热讨论" : "High-heat discussions"}</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {isZh ? "评论量高的问题与讨论，适合捕捉社区真实痛点。" : "Issues and discussions with heavy comment volume, useful for identifying real community pain points."}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {snapshot.issues.map((issue) => (
                  <a
                    key={issue.url}
                    href={issue.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-[18px] border border-slate-100 bg-slate-50/85 p-4 transition hover:bg-white hover:shadow-[0_12px_34px_rgba(15,23,42,0.06)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-2 text-base font-semibold text-slate-950">{issue.title}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {issue.repository} · @{issue.author}
                        </div>
                      </div>
                      <div className="rounded-xl bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white">
                        {issue.commentCountLabel} {isZh ? "评论" : "comments"}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {issue.labels.map((label) => (
                        <span key={label} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
                          {label}
                        </span>
                      ))}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-4">
            <section className="rounded-[26px] border border-white/70 bg-slate-950 p-5 text-white shadow-[0_22px_60px_rgba(15,23,42,0.12)]">
              <h2 className="text-xl font-semibold">{isZh ? "Topic 榜单" : "Topic board"}</h2>
              <p className="mt-1 text-xs leading-6 text-white/70">
                {isZh ? "这些 Topic 能帮助我们快速判断开发者讨论重心。" : "These topics make it easier to see where developer attention is clustering."}
              </p>

              <div className="mt-4 space-y-3">
                {snapshot.topics.map((topic, index) => (
                  <a
                    key={topic.name}
                    href={topic.sampleRepoUrl || `https://github.com/topics/${topic.name}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-[18px] border border-white/10 bg-white/6 p-3.5 transition hover:bg-white/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-medium text-white/60">#{index + 1}</div>
                        <div className="mt-1 text-base font-semibold text-white">#{topic.name}</div>
                        <div className="mt-1 text-xs text-white/70">
                          {topic.repoCountLabel} {isZh ? "个相关仓库" : "related repositories"}
                        </div>
                      </div>
                    </div>
                    {topic.sampleRepo ? (
                      <div className="mt-2 text-xs text-white/70">
                        {isZh ? "代表项目" : "Representative repo"}: {topic.sampleRepo}
                      </div>
                    ) : null}
                  </a>
                ))}
              </div>
            </section>

            <section className="rounded-[26px] border border-white/70 bg-white/92 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
              <h2 className="text-xl font-semibold text-slate-950">{isZh ? "使用方式" : "How to use it"}</h2>
              <div className="mt-4 space-y-3 text-xs leading-6 text-slate-600">
                <p>{isZh ? "1. 后端启动后会在启动时刷新一次，并在每天固定时间自动抓取 GitHub 社区热点。" : "1. The backend refreshes once on startup and then pulls fresh GitHub community signals on a daily schedule."}</p>
                <p>{isZh ? "2. 也可以手动触发 `POST /api/v1/community-watch/refresh`，页面会从 `/api/v1/community-watch` 直接读取最新快照。" : "2. You can also trigger `POST /api/v1/community-watch/refresh`, and the board reads the latest snapshot from `/api/v1/community-watch`."}</p>
                <p>{isZh ? "3. 配置 `GITHUB_API_TOKEN` 与 `DEEPL_API_KEY` 后，仓库指标更稳，英文描述也会自动翻译成中文。" : "3. With `GITHUB_API_TOKEN` and `DEEPL_API_KEY`, repository metrics are more stable and English descriptions are translated into Chinese automatically."}</p>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
