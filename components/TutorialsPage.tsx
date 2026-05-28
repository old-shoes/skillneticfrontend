"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HeroButton } from "@/components/HeroButton";
import { HeroSelect } from "@/components/HeroSelect";
import { LocalizedLink } from "@/components/LocalizedLink";
import { trackEvent } from "@/lib/api/track";
import { getMessages, localeNumberFormat, type Locale, withLocale } from "@/lib/i18n";
import type {
  LearningPath,
  TutorialFilterOption,
  TutorialFilters,
  TutorialListItem,
  TutorialListQuery,
  TutorialListResponse,
  TutorialSort,
  WeeklyHotTutorial,
} from "@/lib/types/tutorials";

type Props = {
  locale: Locale;
  filters: TutorialFilters;
  learningPaths: LearningPath[];
  weeklyHot: WeeklyHotTutorial[];
  initialQuery: TutorialListQuery;
  initialResponse: TutorialListResponse;
};

const categoryIconMap: Record<string, string> = {
  all: "/icons/tutorials/category-all-tutorials.svg",
  beginner: "/icons/tutorials/category-beginner.svg",
  prompt: "/icons/tutorials/category-prompt.svg",
  tools: "/icons/tutorials/category-tool.svg",
  workflow: "/icons/tutorials/category-workflow.svg",
  industry: "/icons/tutorials/category-industry.svg",
  advanced: "/icons/tutorials/category-advanced.svg",
  cases: "/icons/tutorials/category-case.svg",
};

const pathIconMap: Record<string, string> = {
  "path-beginner": "/icons/tutorials/path-beginner.svg",
  "path-prompt": "/icons/tutorials/path-prompt.svg",
  "path-workflow": "/icons/tutorials/path-workflow.svg",
  "path-industry": "/icons/tutorials/path-industry.svg",
};

function formatMetric(locale: Locale, value: number): string {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toLocaleString(localeNumberFormat[locale]);
}

function formatDateAgo(locale: Locale, value: string): string {
  const diff = Date.now() - new Date(value).getTime();
  const days = Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)));
  if (locale === "en") {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
  return `${days} 天前更新`;
}

function buildQueryString(query: TutorialListQuery): string {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && !(key === "page" && value === 1)) {
      params.set(key, String(value));
    }
  });

  const qs = params.toString();
  return qs ? `/tutorials?${qs}` : "/tutorials";
}

function normalizeQuery(query: TutorialListQuery): TutorialListQuery {
  return {
    q: query.q || undefined,
    category: query.category || undefined,
    tag: query.tag || undefined,
    sort: query.sort || "latest",
    page: query.page && query.page > 0 ? query.page : 1,
    pageSize: query.pageSize || 6,
  };
}

function SidebarCard({
  title,
  actionLabel,
  children,
}: {
  title: string;
  actionLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/80 bg-white/92 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        {actionLabel ? <span className="text-sm font-medium text-slate-400">{actionLabel}</span> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function TutorialCard({
  locale,
  item,
  onOpen,
  readMoreLabel,
}: {
  locale: Locale;
  item: TutorialListItem;
  onOpen: (item: TutorialListItem) => void;
  readMoreLabel: string;
}) {
  return (
    <article
      onClick={() => onOpen(item)}
      className="grid cursor-pointer gap-5 rounded-[28px] border border-white/80 bg-white/95 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(37,99,235,0.1)] sm:grid-cols-[160px_1fr]"
    >
      <div className="overflow-hidden rounded-[24px] bg-slate-50">
        {item.coverImage ? (
          <Image src={item.coverImage} alt={item.title} width={160} height={160} className="h-40 w-full object-cover" />
        ) : (
          <div className="flex h-40 items-center justify-center bg-brand-50 text-brand-600">{item.title.slice(0, 1)}</div>
        )}
      </div>

      <div className="min-w-0">
        <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
          {item.category.name}
        </span>
        <h3 className="mt-3 text-[30px] font-semibold tracking-tight text-slate-900">{item.title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-500">{item.summary}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Image src="/icons/tutorials/clock.svg" alt="" width={16} height={16} className="h-4 w-4" />
            {locale === "en" ? `${item.readTimeMinutes} min read` : `${item.readTimeMinutes} 分钟阅读`}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Image src="/icons/tutorials/eye.svg" alt="" width={16} height={16} className="h-4 w-4" />
            {formatMetric(locale, item.viewCount)} {locale === "en" ? "views" : "阅读"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Image src="/icons/tutorials/star.svg" alt="" width={16} height={16} className="h-4 w-4" />
            {formatMetric(locale, item.favoriteCount)} {locale === "en" ? "favorites" : "收藏"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Image src="/icons/tutorials/clock.svg" alt="" width={16} height={16} className="h-4 w-4" />
            {formatDateAgo(locale, item.updatedAt)}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span key={tag.id} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                {tag.name}
              </span>
            ))}
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-brand-600">
            {readMoreLabel}
            <Image src="/icons/tutorials/arrow-right.svg" alt="" width={16} height={16} className="h-4 w-4" />
          </span>
        </div>
      </div>
    </article>
  );
}

export function TutorialsPage({
  locale,
  filters,
  learningPaths,
  weeklyHot,
  initialQuery,
  initialResponse,
}: Props) {
  const router = useRouter();
  const copy = getMessages(locale).tutorials;
  const currentQuery = normalizeQuery(initialQuery);
  const [searchKeyword, setSearchKeyword] = useState(initialQuery.q || "");
  const sortOptions: Array<{ label: string; value: TutorialSort }> = [
    { label: copy.sort.latest, value: "latest" },
    { label: copy.sort.popular, value: "popular" },
    { label: copy.sort.favorites, value: "favorites" },
  ];
  const currentPagePath = withLocale(locale, buildQueryString(currentQuery));

  useEffect(() => {
    trackEvent({
      eventName: "tutorials_page_view",
      pageUrl: currentPagePath,
      targetType: "page",
      targetId: "tutorials",
      extra: {
        q: currentQuery.q || "",
        category: currentQuery.category || "",
        tag: currentQuery.tag || "",
        sort: currentQuery.sort || "latest",
      },
    });
  }, [currentPagePath, currentQuery.category, currentQuery.q, currentQuery.sort, currentQuery.tag]);

  function pushQuery(nextQuery: TutorialListQuery) {
    router.push(withLocale(locale, buildQueryString(normalizeQuery(nextQuery))), { scroll: true });
  }

  function updateQuery(partial: Partial<TutorialListQuery>) {
    pushQuery({
      ...currentQuery,
      ...partial,
      page: 1,
    });
  }

  function openArticle(item: TutorialListItem) {
    trackEvent({
      eventName: "tutorials_article_click",
      pageUrl: currentPagePath,
      targetType: "tutorial",
      targetId: item.id,
      extra: {
        slug: item.slug,
        title: item.title,
      },
    });
    router.push(withLocale(locale, `/tutorials/${item.slug}`));
  }

  return (
    <div className="min-h-screen">
      <section className="border-b border-white/60 bg-gradient-to-br from-[#f8fbff] via-[#f5f9ff] to-[#f9fbff]">
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              <span className="text-brand-600">{copy.hero.titleHighlight}</span> {copy.hero.titleSuffix}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              {copy.hero.description}
            </p>
          </div>

          <form
            className="mt-8 max-w-[760px]"
            onSubmit={(event) => {
              event.preventDefault();
              trackEvent({
                eventName: "tutorials_search_submit",
                pageUrl: currentPagePath,
                targetType: "search",
                targetId: null,
                extra: {
                  keyword: searchKeyword.trim(),
                },
              });
              updateQuery({ q: searchKeyword.trim() || undefined });
            }}
          >
            <div className="flex flex-col gap-3 rounded-[24px] border border-white/80 bg-white/90 p-3 shadow-[0_16px_50px_rgba(37,99,235,0.08)] sm:flex-row sm:items-center">
              <label className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2">
                <Image src="/icons/tutorials/search.svg" alt={copy.search} width={18} height={18} className="h-[18px] w-[18px]" />
                <input
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                  placeholder={copy.hero.placeholder}
                  className="w-full border-0 bg-transparent text-base text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>
              <HeroButton type="submit" className="rounded-2xl bg-brand-500 px-9 py-3 text-sm font-semibold text-white">
                {copy.search}
              </HeroButton>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-slate-600">{copy.hotSearch}</span>
            {filters.hotKeywords.map((keyword) => (
              <button
                key={keyword}
                type="button"
                onClick={() => {
                  setSearchKeyword(keyword);
                  trackEvent({
                    eventName: "tutorials_hot_keyword_click",
                    pageUrl: currentPagePath,
                    targetType: "keyword",
                    targetId: keyword,
                    extra: { keyword },
                  });
                  updateQuery({ q: keyword });
                }}
                className="rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-brand-600 shadow-sm ring-1 ring-slate-100"
              >
                {keyword}
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {filters.categories.map((category) => {
              const active = (category.value === "all" && !currentQuery.category) || currentQuery.category === category.value;
              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => {
                    trackEvent({
                      eventName: "tutorials_category_click",
                      pageUrl: currentPagePath,
                      targetType: "category",
                      targetId: category.value,
                      extra: {
                        category: category.value === "all" ? "" : category.value,
                      },
                    });
                    updateQuery({ category: category.value === "all" ? undefined : category.value });
                  }}
                  className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                    active ? "bg-brand-500 text-white shadow-sm" : "bg-white text-slate-700 ring-1 ring-slate-100 hover:text-brand-600"
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
        <div>
          <div className="mb-6 flex flex-col gap-4 rounded-[24px] border border-white/80 bg-white/90 px-5 py-4 shadow-[0_12px_40px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg font-semibold text-slate-900">{copy.results.replace("{count}", String(initialResponse.pagination.total))}</p>
            <div className="flex flex-wrap gap-3">
              <HeroSelect
                ariaLabel={copy.sort.label}
                value={currentQuery.sort || "latest"}
                onChange={(value) => {
                  const nextValue = value as TutorialSort;
                  trackEvent({
                    eventName: "tutorials_sort_change",
                    pageUrl: currentPagePath,
                    targetType: "sort",
                    targetId: nextValue,
                    extra: { sort: nextValue },
                  });
                  updateQuery({ sort: nextValue });
                }}
                options={sortOptions.map((option) => ({
                  label: `${copy.sort.label} ${option.label}`,
                  value: option.value,
                }))}
                className="min-w-[170px]"
                triggerClassName="min-w-[170px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-900"
                popoverClassName="min-w-[220px]"
              />
            </div>
          </div>

          {initialResponse.list.length === 0 ? (
            <div className="rounded-[28px] border border-slate-200 bg-white/92 p-10 text-center shadow-sm">
              <h3 className="text-2xl font-semibold text-slate-900">{copy.empty.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">{copy.empty.description}</p>
            </div>
          ) : (
            <div className="space-y-5">
              {initialResponse.list.map((item) => (
                <TutorialCard
                  key={item.id}
                  locale={locale}
                  item={item}
                  onOpen={openArticle}
                  readMoreLabel={copy.card.readMore}
                />
              ))}
            </div>
          )}

          {initialResponse.pagination.totalPages > 1 ? (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 rounded-[24px] border border-white/80 bg-white/90 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
              {Array.from({ length: initialResponse.pagination.totalPages }).slice(0, 5).map((_, index) => {
                const page = index + 1;
                const active = page === initialResponse.pagination.page;
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => pushQuery({ ...currentQuery, page })}
                    className={`h-10 min-w-10 rounded-xl px-3 text-sm font-semibold ${
                      active ? "bg-brand-500 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              {initialResponse.pagination.totalPages > 5 ? <span className="px-2 text-slate-400">...</span> : null}
            </div>
          ) : null}
        </div>

        <aside className="space-y-6">
          <SidebarCard title={copy.sidebar.pathsTitle} actionLabel={copy.sidebar.viewAll}>
            <div className="space-y-4">
              {learningPaths.map((path) => (
                <button
                  key={path.id}
                  type="button"
                  onClick={() => {
                    trackEvent({
                      eventName: "tutorials_learning_path_click",
                      pageUrl: currentPagePath,
                      targetType: "learning_path",
                      targetId: path.id,
                      extra: {
                        slug: path.slug,
                        title: path.title,
                      },
                    });
                  }}
                  className="flex w-full items-start gap-4 text-left"
                >
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50">
                    <Image src={pathIconMap[path.icon]} alt={path.title} width={28} height={28} className="h-7 w-7" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-base font-semibold text-slate-900">{path.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-slate-500">{path.description}</span>
                    <span className="mt-2 block text-sm text-slate-400">
                      {locale === "en" ? `${path.tutorialCount} tutorials` : `${path.tutorialCount} 篇教程`}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </SidebarCard>

          <SidebarCard title={copy.sidebar.hotTagsTitle} actionLabel={copy.sidebar.viewAll}>
            <div className="flex flex-wrap gap-2">
              {filters.hotTags.map((tag) => (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() => {
                    trackEvent({
                      eventName: "tutorials_tag_click",
                      pageUrl: currentPagePath,
                      targetType: "tag",
                      targetId: tag.value,
                      extra: {
                        tag: tag.value,
                      },
                    });
                    updateQuery({ tag: tag.value });
                  }}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                    currentQuery.tag === tag.value
                      ? "bg-brand-500 text-white"
                      : "bg-slate-50 text-brand-600 ring-1 ring-slate-100"
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </SidebarCard>

          <SidebarCard title={copy.sidebar.weeklyTitle}>
            <div className="space-y-4">
              {weeklyHot.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    trackEvent({
                      eventName: "tutorials_weekly_hot_click",
                      pageUrl: currentPagePath,
                      targetType: "tutorial",
                      targetId: item.id,
                      extra: {
                        slug: item.slug,
                        title: item.title,
                        rank: item.rank,
                      },
                    });
                    router.push(withLocale(locale, `/tutorials/${item.slug}`));
                  }}
                  className="flex w-full items-start gap-3 text-left"
                >
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-600">
                    {item.rank}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-6 text-slate-900">{item.title}</span>
                    <span className="mt-1 block text-sm text-slate-400">
                      {formatMetric(locale, item.viewCount)} {locale === "en" ? "views" : "阅读"}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </SidebarCard>

          <SidebarCard title={copy.sidebar.subscribeTitle}>
            <p className="text-sm leading-7 text-slate-500">{copy.sidebar.subscribeDescription}</p>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const email = String(formData.get("email") || "").trim();
                trackEvent({
                  eventName: "tutorials_subscribe_submit",
                  pageUrl: currentPagePath,
                  targetType: "form",
                  targetId: "tutorial_subscribe",
                  extra: {
                    email,
                  },
                });
              }}
            >
              <input
                name="email"
                placeholder={copy.sidebar.emailPlaceholder}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
              />
              <button className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white">
                {copy.sidebar.subscribe}
              </button>
            </form>
          </SidebarCard>
        </aside>
      </main>
    </div>
  );
}
