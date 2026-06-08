"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LocalizedLink } from "@/components/LocalizedLink";
import { SkillCard } from "@/components/SkillCard";
import { favoriteSkill, getSkills, unfavoriteSkill } from "@/lib/api/skills";
import { trackEvent } from "@/lib/api/track";
import { getMessages, type Locale, withLocale } from "@/lib/i18n";
import type {
  Pagination,
  SkillFilters,
  SkillListItem,
  SkillListQuery,
  SkillListResponse,
  SkillSort,
} from "@/lib/types/skills";

type Props = {
  filters: SkillFilters;
  initialQuery: SkillListQuery;
  initialResponse: SkillListResponse;
  queryKey: string;
  locale: Locale;
};

type ViewMode = "grid" | "list";
type FilterPanelKey = "category" | "type" | "scene";

const categoryIconMap: Record<string, string> = {
  all: "/v2skills-filter-icons/all.svg",
  writing: "/v2skills-filter-icons/write.svg",
  coding: "/v2skills-filter-icons/code.svg",
  office: "/v2skills-filter-icons/office.svg",
  image: "/v2skills-filter-icons/image.svg",
  video: "/v2skills-filter-icons/video.svg",
  data: "/v2skills-filter-icons/data.svg",
  automation: "/v2skills-filter-icons/automation.svg",
  agent: "/v2skills-filter-icons/agent.svg",
};

const typeIconMap: Record<string, string> = {
  prompt: "/v2skills-filter-icons/prompt-skill.svg",
  workflow: "/v2skills-filter-icons/workflow-skill.svg",
  tutorial: "/v2skills-filter-icons/tutorial-skill.svg",
  tool_config: "/v2skills-filter-icons/type.svg",
  agent: "/v2skills-filter-icons/agent.svg",
};

function normalizeQuery(query: SkillListQuery): SkillListQuery {
  return {
    q: query.q || undefined,
    category: query.category || undefined,
    scene: query.scene || undefined,
    type: query.type || undefined,
    sort: query.sort || "latest",
    page: query.page && query.page > 0 ? query.page : 1,
    pageSize: query.pageSize || 9,
  };
}

function buildQueryString(query: SkillListQuery): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && !(key === "page" && value === 1)) {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `/skills?${qs}` : "/skills";
}

function pickCategoryIcon(slug?: string): string {
  if (!slug) {
    return categoryIconMap.all;
  }
  return categoryIconMap[slug] || categoryIconMap.all;
}

function buildSceneOptions(filters: SkillFilters, locale: Locale) {
  if (filters.scenes.length > 0) {
    return filters.scenes;
  }
  return locale === "en"
    ? []
    : [
        { label: "办公", value: "office" },
        { label: "图片", value: "image" },
        { label: "视频", value: "video" },
        { label: "数据", value: "data" },
        { label: "自动化", value: "automation" },
      ];
}

function SidebarSection({
  title,
  icon,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[#eef1f6] pt-6 first:border-t-0 first:pt-0">
      <button
        type="button"
        onClick={onToggle}
        className="mb-3 flex w-full items-center justify-between gap-3 text-left text-[13px] font-semibold text-[#1f2430]"
      >
        <span className="flex items-center gap-2">
          <img src={icon} alt="" className="h-4.5 w-4.5 opacity-80" />
          <span>{title}</span>
        </span>
        <svg
          viewBox="0 0 20 20"
          className={`h-4 w-4 stroke-current text-[#98a1b2] transition ${expanded ? "rotate-180" : ""}`}
          fill="none"
          strokeWidth="1.8"
        >
          <path d="m5.5 7.5 4.5 5 4.5-5" />
        </svg>
      </button>
      {expanded ? (
        <div className="max-h-[280px] overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200">
          {children}
        </div>
      ) : null}
    </section>
  );
}

function SidebarOption({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition ${
        active ? "bg-[#f3f1ff] font-semibold text-[#4f46ff]" : "text-[#30384a] hover:bg-[#f8f9fc]"
      }`}
    >
      <img src={icon} alt="" className={`h-4.5 w-4.5 ${active ? "" : "opacity-80"}`} />
      <span>{label}</span>
    </button>
  );
}

export function SkillsLibraryPage({
  filters,
  initialQuery,
  initialResponse,
  queryKey,
  locale,
}: Props) {
  const router = useRouter();
  const copy = getMessages(locale).skills;
  const [searchKeyword, setSearchKeyword] = useState(initialQuery.q || "");
  const [skills, setSkills] = useState<SkillListItem[]>(initialResponse.list);
  const [pagination, setPagination] = useState<Pagination>(initialResponse.pagination);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");
  const [favoriteMessage, setFavoriteMessage] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [expandedPanels, setExpandedPanels] = useState<Record<FilterPanelKey, boolean>>({
    category: true,
    type: true,
    scene: true,
  });

  const currentQuery = normalizeQuery(initialQuery);
  const currentPagePath = withLocale(locale, buildQueryString(currentQuery));
  const sceneOptions = useMemo(() => buildSceneOptions(filters, locale), [filters, locale]);
  const categoryOptions = useMemo(
    () => [{ label: copy.filters.all, value: "all" }, ...filters.categories],
    [copy.filters.all, filters.categories],
  );
  const typeOptions = useMemo(
    () => [{ label: copy.filters.all, value: "all" }, ...filters.types],
    [copy.filters.all, filters.types],
  );
  const sortOptions: Array<{ label: string; value: SkillSort }> = [
    { label: copy.sort.latest, value: "latest" },
    { label: copy.sort.popular, value: "popular" },
    { label: copy.sort.favorites, value: "favorites" },
    { label: copy.sort.views, value: "views" },
  ];

  useEffect(() => {
    setSearchKeyword(initialQuery.q || "");
    setSkills(initialResponse.list);
    setPagination(initialResponse.pagination);
    setLoadMoreError("");
  }, [initialQuery.q, initialResponse, queryKey]);

  useEffect(() => {
    if (!favoriteMessage) {
      return;
    }
    const timer = window.setTimeout(() => setFavoriteMessage(""), 1200);
    return () => window.clearTimeout(timer);
  }, [favoriteMessage]);

  useEffect(() => {
    trackEvent({
      eventName: "skills_page_view",
      pageUrl: currentPagePath,
      targetType: "page",
      targetId: "skills",
      extra: {
        q: currentQuery.q || "",
        category: currentQuery.category || "",
        scene: currentQuery.scene || "",
        type: currentQuery.type || "",
        sort: currentQuery.sort || "latest",
      },
    });
  }, [currentPagePath, currentQuery.category, currentQuery.q, currentQuery.scene, currentQuery.sort, currentQuery.type]);

  function pushQuery(nextQuery: SkillListQuery) {
    router.push(withLocale(locale, buildQueryString(normalizeQuery(nextQuery))), { scroll: false });
  }

  function updateQuery(partial: Partial<SkillListQuery>, resetPage = true) {
    pushQuery({
      ...currentQuery,
      ...partial,
      page: resetPage ? 1 : partial.page ?? currentQuery.page,
    });
  }

  function clearFilters() {
    setSearchKeyword("");
    pushQuery({ sort: currentQuery.sort || "latest", page: 1, pageSize: currentQuery.pageSize || 9 });
  }

  function togglePanel(key: FilterPanelKey) {
    setExpandedPanels((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function openSkill(skill: SkillListItem) {
    trackEvent({
      eventName: "skills_card_click",
      pageUrl: currentPagePath,
      targetType: "skill",
      targetId: skill.id,
      extra: {
        slug: skill.slug,
        title: skill.title,
      },
    });
    router.push(withLocale(locale, `/skills/${skill.slug}`));
  }

  async function loadMore() {
    if (isLoadingMore || pagination.page >= pagination.totalPages) {
      return;
    }
    setIsLoadingMore(true);
    setLoadMoreError("");
    try {
      const nextPage = pagination.page + 1;
      trackEvent({
        eventName: "skills_load_more_click",
        pageUrl: currentPagePath,
        targetType: "button",
        targetId: "load_more",
        extra: { nextPage },
      });
      const response = await getSkills({
        ...currentQuery,
        page: nextPage,
        pageSize: pagination.pageSize,
      });
      setSkills((prev) => [...prev, ...response.list]);
      setPagination(response.pagination);
    } catch {
      setLoadMoreError(locale === "en" ? "Failed to load more." : "加载更多失败。");
    } finally {
      setIsLoadingMore(false);
    }
  }

  async function handleFavorite(skill: SkillListItem) {
    try {
      trackEvent({
        eventName: "skills_favorite_click",
        pageUrl: currentPagePath,
        targetType: "skill",
        targetId: skill.id,
        extra: {
          slug: skill.slug,
          title: skill.title,
        },
      });
      const result = skill.isFavorited ? await unfavoriteSkill(skill.id) : await favoriteSkill(skill.id);
      setSkills((current) =>
        current.map((item) =>
          item.id === skill.id
            ? { ...item, isFavorited: result.favorited, favoriteCount: result.favoriteCount }
            : item,
        ),
      );
      setFavoriteMessage(result.favorited ? (locale === "en" ? "Favorited" : "已收藏") : (locale === "en" ? "Removed" : "已取消"));
    } catch {
      setFavoriteMessage(locale === "en" ? "Action failed" : "操作失败");
    }
  }

  return (
    <main className="min-h-[max(760px,calc(100vh-88px))] overflow-x-auto bg-white">
      {favoriteMessage ? (
        <div className="fixed right-6 top-20 z-50 rounded-2xl border border-[#e4e7ff] bg-white px-4 py-3 text-sm font-medium text-[#6c5ce7] shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
          {favoriteMessage}
        </div>
      ) : null}

      <div className="mx-auto grid min-h-[max(720px,calc(100vh-112px))] min-w-[1240px] max-w-[1760px] gap-6 px-5 pb-4 pt-3 lg:px-8 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="xl:sticky xl:h-[calc(100vh-120px)]">
          <div className="mb-5 px-1">
            <h1 className="text-[44px] font-semibold leading-none tracking-tight text-[#0f1728]">
              {locale === "en" ? "Skills" : "技能库"}
            </h1>
          </div>

          <aside className="flex h-[calc(100%-76px)] min-h-[640px] flex-col overflow-hidden rounded-[24px] border border-[#edf1f6] bg-white px-5 py-6 shadow-[0_10px_32px_rgba(15,23,42,0.04)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-[#171c28]">{copy.filters.title}</h2>
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 text-[13px] font-medium text-[#98a1b2] transition hover:text-[#4f46ff]"
              >
                <img src="/v2skills-filter-icons/clear-filter.svg" alt="" className="h-4.5 w-4.5" />
                <span>{copy.filters.clear}</span>
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-7 overflow-y-auto pr-2">
              <SidebarSection
                title={copy.filters.category}
                icon="/v2skills-filter-icons/category.svg"
                expanded={expandedPanels.category}
                onToggle={() => togglePanel("category")}
              >
                <div className="space-y-1">
                  {categoryOptions.map((option) => (
                    <SidebarOption
                      key={option.value}
                      label={option.label}
                      icon={pickCategoryIcon(option.value === "all" ? undefined : option.value)}
                      active={(option.value === "all" && !currentQuery.category) || currentQuery.category === option.value}
                      onClick={() =>
                        updateQuery({ category: option.value === "all" ? undefined : option.value })
                      }
                    />
                  ))}
                </div>
              </SidebarSection>

              <SidebarSection
                title={copy.filters.type}
                icon="/v2skills-filter-icons/type.svg"
                expanded={expandedPanels.type}
                onToggle={() => togglePanel("type")}
              >
                <div className="space-y-1">
                  {typeOptions.map((option) => (
                    <SidebarOption
                      key={option.value}
                      label={option.label}
                      icon={option.value === "all" ? categoryIconMap.all : typeIconMap[option.value] || "/v2skills-filter-icons/type.svg"}
                      active={(option.value === "all" && !currentQuery.type) || currentQuery.type === option.value}
                      onClick={() =>
                        updateQuery({ type: option.value === "all" ? undefined : option.value })
                      }
                    />
                  ))}
                </div>
              </SidebarSection>

              {sceneOptions.length > 0 ? (
                <SidebarSection
                  title={copy.filters.scene}
                  icon="/v2skills-filter-icons/category.svg"
                  expanded={expandedPanels.scene}
                  onToggle={() => togglePanel("scene")}
                >
                  <div className="space-y-1">
                    <SidebarOption
                      label={copy.filters.all}
                      icon={categoryIconMap.all}
                      active={!currentQuery.scene}
                      onClick={() => updateQuery({ scene: undefined })}
                    />
                    {sceneOptions.map((option) => (
                      <SidebarOption
                        key={option.value}
                        label={option.label}
                        icon={pickCategoryIcon(option.value)}
                        active={currentQuery.scene === option.value}
                        onClick={() => updateQuery({ scene: option.value })}
                      />
                    ))}
                  </div>
                </SidebarSection>
              ) : null}

              <div className="border-t border-[#eef1f6] pt-5">
                <button
                  type="button"
                  onClick={clearFilters}
                className="inline-flex items-center gap-2.5 text-[15px] font-medium text-[#30384a] transition hover:text-[#4f46ff]"
                >
                  <img src="/v2skills-filter-icons/clear-filter.svg" alt="" className="h-5 w-5" />
                  <span>{copy.filters.clear}</span>
                </button>
              </div>
            </div>
          </aside>
        </div>

        <section className="min-w-0 xl:flex xl:h-[calc(100vh-120px)] xl:min-h-0 xl:flex-col">
          <div className="mb-8 shrink-0">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                trackEvent({
                  eventName: "skills_search_submit",
                  pageUrl: currentPagePath,
                  targetType: "search",
                  targetId: null,
                  extra: { keyword: searchKeyword.trim() },
                });
                updateQuery({ q: searchKeyword.trim() || undefined });
              }}
              className="relative"
            >
              <input
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                placeholder={copy.hero.placeholder}
                className="h-[64px] w-full rounded-[24px] border border-[#e7ebf2] bg-white pl-6 pr-18 text-[16px] text-[#1f2430] shadow-[0_8px_24px_rgba(15,23,42,0.03)] outline-none placeholder:text-[#b3bac8]"
              />
              <button
                type="submit"
                className="absolute right-5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-[#9aa3b2] transition hover:bg-[#f8f9fc] hover:text-[#5f6779]"
                aria-label={copy.search}
              >
                <svg viewBox="0 0 20 20" className="h-6 w-6 stroke-current" fill="none" strokeWidth="1.8">
                  <circle cx="9" cy="9" r="5.6" />
                  <path d="m13.4 13.4 4 4" />
                </svg>
              </button>
            </form>
          </div>

          <section className="min-h-0 flex-1 xl:overflow-y-auto xl:pr-2">
            <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-end gap-4">
                <h2 className="text-[26px] font-semibold tracking-tight text-[#0f1728]">
                  {locale === "en" ? "All Skills" : "全部 Skill"}
                </h2>
                <span className="pb-1 text-[14px] text-[#7a8395]">
                  {locale === "en" ? `${pagination.total} items` : `共 ${pagination.total} 个`}
                </span>
              </div>

              <div className="flex items-center gap-3 self-start">
                <label className="text-[14px] text-[#7a8395]">{copy.sort.label}</label>
                <select
                  value={currentQuery.sort || "latest"}
                  onChange={(event) => updateQuery({ sort: event.target.value as SkillSort })}
                  className="h-10 rounded-xl border border-[#e7ebf2] bg-white px-3.5 text-[14px] text-[#1f2430] outline-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <div className="ml-1 inline-flex rounded-xl border border-[#edf1f6] bg-white p-1 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${viewMode === "grid" ? "bg-[#f3f1ff] text-[#4f46ff]" : "text-[#98a1b2]"}`}
                    aria-label="grid"
                  >
                    <span className="grid grid-cols-2 gap-1">
                      <span className="h-2 w-2 rounded-[3px] bg-current" />
                      <span className="h-2 w-2 rounded-[3px] bg-current" />
                      <span className="h-2 w-2 rounded-[3px] bg-current" />
                      <span className="h-2 w-2 rounded-[3px] bg-current" />
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${viewMode === "list" ? "bg-[#f3f1ff] text-[#4f46ff]" : "text-[#98a1b2]"}`}
                    aria-label="list"
                  >
                    <span className="flex flex-col gap-1">
                      <span className="h-0.5 w-4.5 rounded-full bg-current" />
                      <span className="h-0.5 w-4.5 rounded-full bg-current" />
                      <span className="h-0.5 w-4.5 rounded-full bg-current" />
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {skills.length === 0 ? (
              <div className="rounded-[24px] border border-[#edf1f6] bg-white p-12 text-center shadow-[0_8px_28px_rgba(15,23,42,0.04)]">
                <h3 className="text-[24px] font-semibold text-[#171c28]">{copy.empty.title}</h3>
                <p className="mt-3 text-[15px] text-[#7a8395]">{copy.empty.description}</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-xl border border-slate-200 bg-white px-4.5 py-2.5 text-sm font-semibold text-slate-700"
                  >
                    {copy.empty.clear}
                  </button>
                  <LocalizedLink href="/submit" className="rounded-xl bg-[#6c5ce7] px-4.5 py-2.5 text-sm font-semibold text-white">
                    {copy.empty.submit}
                  </LocalizedLink>
                </div>
              </div>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="columns-1 gap-4 md:columns-2 xl:columns-3">
                    {skills.map((skill) => (
                      <div key={skill.id} className="mb-4 break-inside-avoid">
                        <SkillCard
                          skill={{ ...skill, categoryName: skill.category.name }}
                          variant="grid"
                          favoriteLabel={copy.card.favorite}
                          onFavorite={() => handleFavorite(skill)}
                          onOpen={() => openSkill(skill)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {skills.map((skill) => (
                      <SkillCard
                        key={skill.id}
                        skill={{ ...skill, categoryName: skill.category.name }}
                        variant="compact"
                        favoriteLabel={copy.card.favorite}
                        onFavorite={() => handleFavorite(skill)}
                        onOpen={() => openSkill(skill)}
                      />
                    ))}
                  </div>
                )}

                <div className="mt-5 flex flex-col items-center gap-3">
                  {pagination.page < pagination.totalPages ? (
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      className="rounded-full border border-slate-200 bg-white px-7 py-2.5 text-sm font-semibold text-[#6c5ce7] shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition hover:border-[#d9d2ff] disabled:opacity-60"
                    >
                      {isLoadingMore ? copy.loadingMore : copy.loadMore}
                    </button>
                  ) : (
                    <p className="text-sm text-slate-400">{copy.reachedEnd}</p>
                  )}
                  {loadMoreError ? <p className="text-sm text-rose-500">{loadMoreError}</p> : null}
                </div>
              </>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
