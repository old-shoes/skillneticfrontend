"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { HeroSelect } from "@/components/HeroSelect";
import { LocalizedLink } from "@/components/LocalizedLink";
import { trackEvent } from "@/lib/api/track";
import { getMessages, localeNumberFormat, type Locale, withLocale } from "@/lib/i18n";
import type {
  CategoryItem,
  CategoryListQuery,
  CategoryListResponse,
  CategoryOverviewData,
  CategorySort,
  HotTag,
} from "@/lib/types/categories";

type Props = {
  locale: Locale;
  overview: CategoryOverviewData;
  initialQuery: CategoryListQuery;
  initialResponse: CategoryListResponse;
};

const categoryIconMap: Record<string, string> = {
  "category-prompt": "/icons/category/category-prompt.svg",
  "category-tools": "/icons/category/category-tools.svg",
  "category-workflow": "/icons/category/category-workflow.svg",
  "category-industry": "/icons/category/category-industry.svg",
  "category-automation": "/icons/category/category-automation.svg",
  "category-data": "/icons/category/category-data.svg",
  "category-programming": "/icons/category/category-programming.svg",
  "category-ai-drawing": "/icons/category/category-ai-drawing.svg",
  "category-office": "/icons/category/category-office.svg",
  "category-learning": "/icons/category/category-learning.svg",
};

const statIconMap = {
  categories: "/icons/category/stat-categories.svg",
  tutorials: "/icons/category/stat-tutorials.svg",
  views: "/icons/category/stat-views.svg",
  favorites: "/icons/category/stat-favorites.svg",
};

function formatMetric(locale: Locale, value: number): string {
  if (value >= 10000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString(localeNumberFormat[locale]);
}

function buildQueryString(query: CategoryListQuery): string {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all" && value !== "default") {
      params.set(key, String(value));
    }
  });

  const qs = params.toString();
  return qs ? `/categories?${qs}` : "/categories";
}

function normalizeQuery(query: CategoryListQuery): CategoryListQuery {
  return {
    q: query.q || undefined,
    group: query.group || "all",
    scene: query.scene || undefined,
    sort: query.sort || "default",
  };
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-5">
      <div className="flex h-15 w-15 items-center justify-center rounded-full bg-slate-50">
        <Image src={icon} alt="" width={26} height={26} className="h-6.5 w-6.5" />
      </div>
      <div>
        <div className="text-[2.05rem] font-semibold tracking-tight text-slate-900">{value}</div>
        <div className="mt-1.5 text-[15px] text-slate-500">{label}</div>
      </div>
    </div>
  );
}

function CategoryCard({
  item,
  locale,
  actionLabel,
  position,
  onClick,
}: {
  item: CategoryItem;
  locale: Locale;
  actionLabel: string;
  position: number;
  onClick: (item: CategoryItem, position: number) => void;
}) {
  const iconSrc = categoryIconMap[item.icon] || "/icons/category/category-prompt.svg";

  return (
    <article
      onClick={() => onClick(item, position)}
      className="group flex h-full cursor-pointer flex-col rounded-[24px] border border-[#edf1fb] bg-white/97 px-6 py-7 text-center shadow-[0_14px_42px_rgba(15,23,42,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_56px_rgba(37,99,235,0.1)]"
    >
      <div
        className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full"
        style={{ background: `${item.color}18` }}
      >
        <Image src={iconSrc} alt={item.name} width={40} height={40} className="h-9.5 w-9.5" />
      </div>

      <h3 className="mt-6 text-[2rem] font-semibold tracking-tight text-slate-900">{item.name}</h3>
      <div className="mt-2 text-[1.02rem] text-slate-500">
        {item.tutorialCount.toLocaleString(localeNumberFormat[locale])} {locale === "en" ? "tutorials" : "个教程"}
      </div>
      <p className="mt-4 min-h-[84px] flex-1 text-sm leading-7 text-slate-500">{item.description}</p>

      <div
        className="mt-6 inline-flex items-center gap-2 self-center rounded-full px-5 py-2.5 text-sm font-semibold"
        style={{
          color: item.color,
          background: `${item.color}0f`,
        }}
      >
        {actionLabel}
        <Image src="/icons/category/arrow-right.svg" alt="" width={14} height={14} className="h-3.5 w-3.5" />
      </div>
    </article>
  );
}

function SidebarOption({
  label,
  count,
  active,
  icon,
  onClick,
}: {
  label: string;
  count?: number;
  active?: boolean;
  icon?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition ${
        active ? "bg-brand-50 font-semibold text-brand-600" : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      <span className="inline-flex min-w-0 items-center gap-3">
        {icon ? <Image src={icon} alt="" width={16} height={16} className="h-4 w-4" /> : null}
        <span className="truncate">{label}</span>
      </span>
      {count !== undefined ? <span className="shrink-0">{count}</span> : null}
    </button>
  );
}

function HotTagChip({
  locale,
  item,
  position,
  onClick,
}: {
  locale: Locale;
  item: HotTag;
  position: number;
  onClick: (item: HotTag, position: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(item, position)}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-[#fbfcff] px-3.5 py-1.5 text-[13px] text-slate-600 transition hover:border-brand-200 hover:text-brand-600"
    >
      <span>{item.name}</span>
      <span className="text-slate-400">{item.count.toLocaleString(localeNumberFormat[locale])}</span>
    </button>
  );
}

function MoreTagChip({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-[#fbfcff] px-3.5 py-1.5 text-[13px] text-slate-600 transition hover:border-brand-200 hover:text-brand-600"
    >
      <span>{label}</span>
      <Image src="/icons/category/arrow-right.svg" alt="" width={12} height={12} className="h-3 w-3" />
    </button>
  );
}

export function CategoriesPage({ locale, overview, initialQuery, initialResponse }: Props) {
  const router = useRouter();
  const copy = getMessages(locale).categories;
  const currentQuery = normalizeQuery(initialQuery);
  const [keyword, setKeyword] = useState(initialQuery.q || "");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pageUrl = withLocale(locale, buildQueryString(currentQuery));

  const currentGroup = currentQuery.group || "all";
  const currentSort = (currentQuery.sort || "default") as CategorySort;
  const topTabs = useMemo(
    () => [
      { label: overview.groups[0]?.label || (locale === "en" ? "All Categories" : "全部分类"), value: "all" },
      ...overview.scenes,
    ],
    [locale, overview.groups, overview.scenes],
  );

  const sceneOptions = useMemo(
    () => ({
      collapsed: overview.scenes.slice(0, 5),
      expanded: overview.scenes,
    }),
    [overview.scenes],
  );
  const [showAllScenes, setShowAllScenes] = useState(false);

  useEffect(() => {
    trackEvent({
      eventName: "categories_page_view",
      pageUrl,
      targetType: "page",
      targetId: "categories",
      extra: {
        q: currentQuery.q || "",
        group: currentQuery.group || "all",
        scene: currentQuery.scene || "",
        sort: currentSort,
      },
    });
  }, [currentQuery.group, currentQuery.q, currentQuery.scene, currentSort, pageUrl]);

  function pushQuery(nextQuery: CategoryListQuery) {
    router.push(withLocale(locale, buildQueryString(normalizeQuery(nextQuery))), { scroll: true });
  }

  function updateQuery(partial: Partial<CategoryListQuery>) {
    setSidebarOpen(false);
    pushQuery({
      ...currentQuery,
      ...partial,
    });
  }

  function openCategory(item: CategoryItem, position: number) {
    trackEvent({
      eventName: "categories_card_click",
      pageUrl,
      targetType: "category",
      targetId: item.id,
      extra: {
        slug: item.slug,
        name: item.name,
        position,
      },
    });
    router.push(withLocale(locale, `/tutorials?category=${item.slug}`), { scroll: true });
  }

  return (
    <div className="min-h-screen">
      <section className="border-b border-white/60 bg-gradient-to-br from-[#fafcff] via-[#f7faff] to-[#f8fbff]">
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                <LocalizedLink href="/" className="transition hover:text-brand-600">
                  {copy.breadcrumb.home}
                </LocalizedLink>
                <span>›</span>
                <LocalizedLink href="/tutorials" className="transition hover:text-brand-600">
                  {copy.breadcrumb.tutorials}
                </LocalizedLink>
                <span>›</span>
                <span className="text-slate-600">{copy.breadcrumb.current}</span>
              </div>
              <h1 className="mt-5 text-[3.5rem] font-semibold tracking-tight text-slate-900">{copy.hero.title}</h1>
              <p className="mt-3 max-w-3xl text-[1.1rem] text-slate-500">{copy.hero.description}</p>
            </div>

            <form
              className="w-full max-w-[410px] lg:mb-1"
              onSubmit={(event) => {
                event.preventDefault();
                trackEvent({
                  eventName: "categories_search_submit",
                  pageUrl,
                  targetType: "search",
                  targetId: null,
                  extra: {
                    keyword: keyword.trim(),
                  },
                });
                updateQuery({
                  q: keyword.trim() || undefined,
                });
              }}
            >
              <label className="flex h-[58px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 shadow-[0_10px_40px_rgba(15,23,42,0.04)]">
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder={copy.hero.placeholder}
                  className="h-full flex-1 border-0 bg-transparent text-base text-slate-700 outline-none placeholder:text-slate-400"
                />
                <Image src="/icons/category/search.svg" alt="" width={20} height={20} className="h-5 w-5" />
              </label>
            </form>
          </div>

          <div className="mt-6 grid gap-0 rounded-[30px] border border-white/90 bg-white/95 p-2 shadow-[0_14px_44px_rgba(15,23,42,0.045)] sm:grid-cols-2 xl:grid-cols-4 xl:divide-x xl:divide-slate-100">
            <StatCard icon={statIconMap.categories} value={String(overview.stats.totalCategories)} label={copy.stats.totalCategories} />
            <StatCard icon={statIconMap.tutorials} value={String(overview.stats.totalTutorials)} label={copy.stats.totalTutorials} />
            <StatCard icon={statIconMap.views} value={formatMetric(locale, overview.stats.weeklyViews)} label={copy.stats.weeklyViews} />
            <StatCard icon={statIconMap.favorites} value={formatMetric(locale, overview.stats.weeklyFavorites)} label={copy.stats.weeklyFavorites} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-white/90 bg-white/93 p-4 shadow-[0_14px_46px_rgba(15,23,42,0.045)] sm:p-6">
          <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)] xl:items-start">
            <aside className="rounded-[28px] bg-[#fbfcff] p-5">
              <button
                type="button"
                onClick={() => setSidebarOpen((value) => !value)}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-900 xl:hidden"
              >
                <span>{copy.sidebar.browseTitle}</span>
                <span className="text-slate-500">{sidebarOpen ? copy.sidebar.collapse : copy.sidebar.expand}</span>
              </button>

              <div className={`${sidebarOpen ? "mt-5 block" : "hidden"} xl:mt-0 xl:block`}>
                <div>
                  <h2 className="text-[1.15rem] font-semibold text-slate-900">{copy.sidebar.browseTitle}</h2>
                  <div className="mt-4 space-y-1.5">
                    {overview.groups.map((item) => (
                      <SidebarOption
                        key={item.value}
                        label={item.label}
                        count={item.count}
                        active={currentGroup === item.value}
                        icon={
                          item.value === "all"
                            ? "/icons/category/filter-all.svg"
                            : item.value === "hot"
                              ? "/icons/category/filter-hot.svg"
                              : "/icons/category/filter-recent.svg"
                        }
                        onClick={() => {
                          trackEvent({
                            eventName: "categories_filter_group_click",
                            pageUrl,
                            targetType: "group",
                            targetId: item.value,
                            extra: { label: item.label },
                          });
                          updateQuery({ group: item.value });
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <h2 className="text-[1.15rem] font-semibold text-slate-900">{copy.sidebar.sceneTitle}</h2>
                  <div className="mt-4 space-y-3">
                    {(showAllScenes ? sceneOptions.expanded : sceneOptions.collapsed).map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => {
                          trackEvent({
                            eventName: "categories_filter_scene_click",
                            pageUrl,
                            targetType: "scene",
                            targetId: item.value,
                            extra: { label: item.label },
                          });
                          updateQuery({ scene: item.value });
                        }}
                        className={`flex w-full items-center justify-between gap-3 text-left text-[15px] ${
                          currentQuery.scene === item.value ? "font-semibold text-brand-600" : "text-slate-600"
                        }`}
                      >
                        <span className="min-w-0 truncate">{item.label}</span>
                        <span className="shrink-0">{item.count}</span>
                      </button>
                    ))}
                  </div>
                  {overview.scenes.length > 5 ? (
                    <button
                      type="button"
                      onClick={() => setShowAllScenes((value) => !value)}
                      className="mt-6 inline-flex items-center gap-2 text-[14px] font-medium text-slate-500"
                    >
                      {showAllScenes ? copy.sidebar.collapse : copy.sidebar.expand}
                    </button>
                  ) : null}
                </div>
              </div>
            </aside>

            <div className="min-w-0">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="-mx-1 flex snap-x snap-mandatory overflow-x-auto px-1 pb-1 xl:mx-0 xl:flex-wrap xl:overflow-visible xl:px-0 xl:pb-0">
                  {topTabs.map((item) => {
                    const isActive = currentQuery.scene === item.value || (item.value === "all" && !currentQuery.scene);
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => {
                          trackEvent({
                            eventName: "categories_tab_click",
                            pageUrl,
                            targetType: "tab",
                            targetId: item.value,
                            extra: { label: item.label },
                          });
                          updateQuery({
                            scene: item.value === "all" ? undefined : item.value,
                          });
                        }}
                        className={`mr-3 shrink-0 snap-start rounded-full px-5 py-2 text-sm font-medium transition last:mr-0 xl:mb-3 ${
                          isActive
                            ? "border border-brand-200 bg-brand-50 text-brand-600"
                            : "text-slate-600 hover:text-brand-600"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <div className="inline-flex h-12 items-center gap-3 self-start rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-600 xl:ml-4">
                  <HeroSelect
                    ariaLabel="Category sort"
                    value={currentSort}
                    onChange={(value) => {
                      const nextValue = value as CategorySort;
                      trackEvent({
                        eventName: "categories_sort_change",
                        pageUrl,
                        targetType: "sort",
                        targetId: nextValue,
                        extra: { value: nextValue },
                      });
                      updateQuery({ sort: nextValue });
                    }}
                    options={[
                      { label: copy.sort.default, value: "default" },
                      { label: copy.sort.tutorials, value: "tutorials" },
                      { label: copy.sort.alphabetical, value: "alphabetical" },
                    ]}
                    className="min-w-[150px]"
                    triggerClassName="min-w-[150px] border-0 bg-transparent px-0 py-0 text-left text-sm text-slate-700 shadow-none"
                    popoverClassName="min-w-[180px]"
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                {initialResponse.list.map((item, index) => (
                  <CategoryCard
                    key={item.id}
                    item={item}
                    locale={locale}
                    actionLabel={copy.card.action}
                    position={index + 1}
                    onClick={openCategory}
                  />
                ))}
              </div>

              {initialResponse.list.length === 0 ? (
                <div className="mt-8 rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-slate-500">
                  {copy.empty}
                </div>
              ) : null}

              <section className="mt-7 rounded-[28px] border border-[#edf1fb] bg-white px-5 py-5 shadow-[0_14px_40px_rgba(15,23,42,0.035)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-[1.85rem] font-semibold tracking-tight text-slate-900">{copy.hotTags.title}</h2>
                  <button
                    type="button"
                    onClick={() => router.push(withLocale(locale, "/tutorials"), { scroll: true })}
                    className="inline-flex items-center gap-2 text-[14px] font-medium text-slate-500 transition hover:text-brand-600"
                  >
                    {copy.hotTags.viewAll}
                    <Image src="/icons/category/arrow-right.svg" alt="" width={14} height={14} className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {overview.hotTags.map((item, index) => (
                    <HotTagChip
                      key={item.id}
                      locale={locale}
                      item={item}
                      position={index + 1}
                      onClick={(tag, position) => {
                        trackEvent({
                          eventName: "categories_hot_tag_click",
                          pageUrl,
                          targetType: "tag",
                          targetId: tag.id,
                          extra: {
                            slug: tag.slug,
                            name: tag.name,
                            position,
                          },
                        });
                        router.push(withLocale(locale, `/tutorials?tag=${tag.slug}`), { scroll: true });
                      }}
                    />
                  ))}
                  <MoreTagChip
                    label={copy.hotTags.more}
                    onClick={() => router.push(withLocale(locale, "/tutorials"), { scroll: true })}
                  />
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
