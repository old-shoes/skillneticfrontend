"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HeroButton } from "@/components/HeroButton";
import { HeroSelect } from "@/components/HeroSelect";
import { LocalizedLink } from "@/components/LocalizedLink";
import { favoriteSkill, getSkills, unfavoriteSkill } from "@/lib/api/skills";
import { trackEvent } from "@/lib/api/track";
import { getMessages, type Locale, withLocale } from "@/lib/i18n";
import type {
  Pagination,
  SkillCategoryTree,
  SkillFilterOption,
  SkillFilters,
  SkillListItem,
  SkillListQuery,
  SkillListResponse,
  SkillSort,
  SkillTag,
} from "@/lib/types/skills";

type Props = {
  filters: SkillFilters;
  initialQuery: SkillListQuery;
  initialResponse: SkillListResponse;
  queryKey: string;
  locale: Locale;
};

const categoryIconMap: Record<string, string> = {
  all: "/skills-icons/filter.svg",
  writing: "/skills-icons/prompt.svg",
  coding: "/skills-icons/browse.svg",
  office: "/skills-icons/tool.svg",
  design: "/skills-icons/browse.svg",
  marketing: "/skills-icons/prompt.svg",
  learning: "/skills-icons/tutorial.svg",
  video: "/skills-icons/browse.svg",
  automation: "/skills-icons/agent.svg",
};

const skillIconMap: Record<string, string> = {
  prompt: "/skills-icons/prompt.svg",
  workflow: "/skills-icons/workflow.svg",
  tutorial: "/skills-icons/tutorial.svg",
  tool: "/skills-icons/tool.svg",
  tool_config: "/skills-icons/tool.svg",
  agent: "/skills-icons/agent.svg",
  browse: "/skills-icons/browse.svg",
  user: "/skills-icons/user.svg",
};

const categoryToneMap: Record<string, string> = {
  blue: "from-blue-50 to-blue-100/70 text-blue-600",
  green: "from-emerald-50 to-emerald-100/70 text-emerald-600",
  orange: "from-orange-50 to-orange-100/70 text-orange-500",
  purple: "from-violet-50 to-violet-100/70 text-violet-500",
  rose: "from-rose-50 to-rose-100/70 text-rose-500",
  indigo: "from-indigo-50 to-indigo-100/70 text-indigo-500",
  cyan: "from-cyan-50 to-cyan-100/70 text-cyan-500",
  emerald: "from-emerald-50 to-emerald-100/70 text-emerald-500",
};

const tagToneMap: Record<string, string> = {
  model: "bg-blue-50 text-blue-600",
  scene: "bg-cyan-50 text-cyan-600",
  type: "bg-orange-50 text-orange-500",
};

function BoxIcon({
  src,
  alt,
  size,
  boxClassName,
}: {
  src: string;
  alt: string;
  size: number;
  boxClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center justify-center ${boxClassName || ""}`}>
      <img src={src} alt={alt} width={size} height={size} className="h-auto w-auto" />
    </span>
  );
}

function formatMetric(value: number): string {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);
}

function normalizeQuery(query: SkillListQuery): SkillListQuery {
  return {
    q: query.q || undefined,
    category: query.category || undefined,
    scene: query.scene || undefined,
    model: query.model || undefined,
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

function SectionTitle({ title, actionLabel, actionHref }: { title: string; actionLabel?: string; actionHref?: string }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      {actionLabel && actionHref ? (
        <LocalizedLink href={actionHref} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-600">
          {actionLabel}
          <BoxIcon src="/skills-icons/arrow-right.svg" alt="" size={12} boxClassName="h-4 w-4" />
        </LocalizedLink>
      ) : null}
    </div>
  );
}

function HeroIllustration() {
  return (
    <div className="relative mx-auto hidden w-full max-w-[340px] lg:block">
      <div className="absolute left-6 top-8 h-24 w-24 rounded-full bg-brand-100/70 blur-3xl" />
      <div className="absolute right-0 top-14 h-28 w-28 rounded-full bg-cyan-100/80 blur-3xl" />
      <div className="absolute right-2 top-8 h-3.5 w-3.5 rounded-full bg-amber-200/80" />
      <div className="absolute right-10 top-18 h-3 w-3 rounded-full bg-brand-200/80" />
      <div className="absolute right-0 top-24 h-3.5 w-3.5 rounded-full bg-rose-100/90" />
      <div className="absolute left-8 top-14 rotate-[-6deg] rounded-2xl bg-brand-500 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_14px_28px_rgba(37,99,235,0.22)]">
        <span className="inline-flex items-center gap-2">
          <BoxIcon src="/skills-icons/prompt.svg" alt="" size={14} boxClassName="h-4 w-4" />
          {`{ Prompt }`}
        </span>
      </div>
      <div className="absolute left-16 top-[124px] rotate-[-14deg] rounded-[18px] bg-white/90 p-2.5 shadow-[0_14px_34px_rgba(37,99,235,0.12)] ring-1 ring-white/80">
        <div className="flex h-11 w-10 items-end gap-1.5 rounded-2xl bg-gradient-to-b from-blue-50 to-white px-2.5 pb-2.5 pt-2.5">
          <span className="h-3.5 w-1.5 rounded-full bg-cyan-200" />
          <span className="h-6.5 w-1.5 rounded-full bg-brand-300" />
          <span className="h-9 w-1.5 rounded-full bg-brand-500" />
        </div>
      </div>
      <div className="absolute right-0 top-[120px] rounded-[18px] bg-white/90 p-2.5 shadow-[0_14px_34px_rgba(37,99,235,0.14)] ring-1 ring-white/80">
        <BoxIcon src="/skills-icons/robot.svg" alt="" size={34} boxClassName="h-12 w-12" />
      </div>
      <div className="absolute right-6 bottom-12 rounded-[16px] bg-brand-500 p-3 shadow-[0_14px_30px_rgba(37,99,235,0.24)]">
        <BoxIcon src="/skills-icons/browse.svg" alt="" size={18} boxClassName="h-6 w-6" />
      </div>

      <div className="relative ml-auto mt-3 rounded-[24px] border border-white/80 bg-white/80 p-3 shadow-[0_20px_54px_rgba(37,99,235,0.12)] backdrop-blur">
        <div className="rounded-[20px] border border-slate-100 bg-gradient-to-br from-white via-white to-slate-50 p-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/icons/skillnetic_app_icon_card.png"
                alt="skillnetic.ai"
                width={285}
                height={295}
                className="h-7 w-7 rounded-lg"
              />
              <span className="text-sm font-semibold text-slate-900">skillnetic.ai</span>
            </div>
            <div className="flex gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-200" />
              <span className="h-2.5 w-2.5 rounded-full bg-brand-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
            </div>
          </div>

          <div className="mt-3.5 rounded-[20px] border border-slate-100 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2.5 rounded-full border border-slate-100 bg-slate-50 px-3.5 py-2">
              <BoxIcon src="/skills-icons/search.svg" alt="" size={14} boxClassName="h-4 w-4" />
              <div className="h-2.5 w-32 rounded-full bg-slate-200/80" />
              <span className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 shadow-sm">
                <BoxIcon src="/skills-icons/search.svg" alt="" size={11} boxClassName="h-3 w-3" />
              </span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-blue-50 p-2">
                <div className="h-3.5 w-9 rounded-full bg-blue-200" />
                <div className="mt-2 space-y-1.5 rounded-xl bg-white p-2 shadow-sm">
                  <div className="h-2.5 w-full rounded-full bg-slate-100" />
                  <div className="h-2.5 w-4/5 rounded-full bg-slate-100" />
                  <div className="h-6 rounded-xl bg-blue-50" />
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-2">
                <div className="h-3.5 w-9 rounded-full bg-slate-200" />
                <div className="mt-2 space-y-1.5 rounded-xl bg-white p-2 shadow-sm">
                  <div className="h-2.5 w-full rounded-full bg-slate-100" />
                  <div className="h-2.5 w-3/4 rounded-full bg-slate-100" />
                  <div className="h-6 rounded-xl bg-slate-100" />
                </div>
              </div>
              <div className="rounded-2xl bg-cyan-50 p-2">
                <div className="h-3.5 w-9 rounded-full bg-cyan-200" />
                <div className="mt-2 space-y-1.5 rounded-xl bg-white p-2 shadow-sm">
                  <div className="h-2.5 w-full rounded-full bg-slate-100" />
                  <div className="h-2.5 w-2/3 rounded-full bg-slate-100" />
                  <div className="h-6 rounded-xl bg-cyan-50" />
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-[1.08fr_0.92fr] gap-2">
              <div className="rounded-2xl bg-brand-50 p-2.5">
                <div className="h-13 rounded-xl bg-white shadow-sm" />
              </div>
              <div className="rounded-2xl bg-indigo-50 p-2.5">
                <div className="flex h-13 items-end gap-1.5 rounded-xl bg-white px-2.5 py-2.5 shadow-sm">
                  <span className="h-5 w-2 rounded-full bg-brand-200" />
                  <span className="h-8 w-2 rounded-full bg-brand-300" />
                  <span className="h-10.5 w-2 rounded-full bg-brand-500" />
                  <span className="h-6.5 w-2 rounded-full bg-cyan-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryShortcut({
  iconSrc,
  label,
  active,
  onClick,
}: {
  iconSrc: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-[24px] border px-4 py-5 text-center shadow-sm transition hover:-translate-y-0.5 ${
        active ? "border-brand-200 bg-brand-50/70" : "border-white/80 bg-white/90 hover:border-brand-100"
      }`}
    >
      <span className={`mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${active ? "from-brand-100 to-brand-50 text-brand-600" : "from-slate-50 to-slate-100 text-slate-600"}`}>
        <BoxIcon src={iconSrc} alt={label} size={28} boxClassName="h-9 w-9" />
      </span>
      <span className="mt-4 block text-sm font-semibold text-slate-900">{label}</span>
    </button>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
        active ? "border-brand-200 bg-brand-50 text-brand-600" : "border-slate-200 bg-white text-slate-600 hover:border-brand-100 hover:text-brand-600"
      }`}
    >
      {label}
    </button>
  );
}

function FilterRow({
  label,
  allLabel,
  moreLabel,
  lessLabel,
  activeValue,
  options,
  onClick,
  collapsible = false,
  expanded = false,
  onToggleExpand,
}: {
  label: string;
  allLabel: string;
  moreLabel: string;
  lessLabel: string;
  activeValue?: string;
  options: SkillFilterOption[];
  onClick: (value?: string) => void;
  collapsible?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
}) {
  const shouldShowAll = expanded || (!!activeValue && options.slice(8).some((option) => option.value === activeValue));
  const visibleOptions = collapsible && !shouldShowAll ? options.slice(0, 8) : options;
  const hasMore = collapsible && options.length > 8;

  return (
    <div className="grid gap-3 md:grid-cols-[72px_1fr]">
      <div className="pt-2 text-sm font-semibold text-slate-700">{label}</div>
      <div className="flex flex-wrap gap-2">
        <FilterChip label={allLabel} active={!activeValue} onClick={() => onClick(undefined)} />
        {visibleOptions.map((option) => (
          <FilterChip
            key={`${label}-${option.value}`}
            label={option.label}
            active={activeValue === option.value}
            onClick={() => onClick(option.value)}
          />
        ))}
        {hasMore ? (
          <button
            type="button"
            onClick={onToggleExpand}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-brand-100 hover:text-brand-600"
          >
            {shouldShowAll ? lessLabel : moreLabel}
            <span className={`transition ${shouldShowAll ? "-rotate-90" : "rotate-90"}`}>
              <BoxIcon src="/skills-icons/arrow-right.svg" alt="" size={10} boxClassName="h-3 w-3" />
            </span>
          </button>
        ) : null}
      </div>
    </div>
  );
}

function CategoryFilterSection({
  label,
  allLabel,
  activeValue,
  groups,
  onClick,
}: {
  label: string;
  allLabel: string;
  activeValue?: string;
  groups: SkillCategoryTree[];
  onClick: (value?: string) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-[72px_1fr]">
      <div className="pt-2 text-sm font-semibold text-slate-700">{label}</div>
      <div className="flex flex-wrap gap-2">
        <FilterChip label={allLabel} active={!activeValue} onClick={() => onClick(undefined)} />
        {groups.map((parent) => {
          const hasActiveChild = (parent.children || []).some((child) => child.slug === activeValue);
          const isActiveParent = activeValue === parent.slug || hasActiveChild;

          return (
            <FilterChip
              key={parent.id}
              label={parent.name}
              active={isActiveParent}
              onClick={() => onClick(parent.slug)}
            />
          );
        })}
      </div>
    </div>
  );
}

function TagBadge({ tag }: { tag: SkillTag }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tagToneMap[tag.type] || "bg-slate-100 text-slate-600"}`}>
      {tag.name}
    </span>
  );
}

function SkillCard({
  skill,
  onOpen,
  onFavorite,
  locale,
  copy,
}: {
  skill: SkillListItem;
  onOpen: (skill: SkillListItem) => void;
  onFavorite: (skill: SkillListItem) => Promise<void>;
  locale: Locale;
  copy: ReturnType<typeof getMessages>["skills"];
}) {
  const iconSrc = skill.coverIcon ? skillIconMap[skill.coverIcon] : undefined;
  const tone = categoryToneMap[skill.category.color] || categoryToneMap.blue;

  return (
    <article
      onClick={() => onOpen(skill)}
      className="cursor-pointer rounded-[24px] border border-slate-200/80 bg-white/94 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(37,99,235,0.12)]"
    >
      <div className="flex items-start gap-4">
        <div className={`inline-flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br ${tone}`}>
          {iconSrc ? (
            <BoxIcon src={iconSrc} alt={skill.title} size={28} boxClassName="h-11 w-11 rounded-2xl bg-white/92 shadow-sm" />
          ) : (
            <span className="text-lg font-semibold">{skill.title.slice(0, 1)}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {skill.isHot ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-500 shadow-sm">
                    <BoxIcon src="/skills-icons/hot.svg" alt="" size={12} boxClassName="h-3.5 w-3.5" />
                    {copy.hot}
                  </span>
                ) : null}
                <h3 className="truncate text-lg font-semibold leading-none text-slate-900">{skill.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-500">{skill.summary}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {skill.tags.filter((tag) => tag.type !== "difficulty").slice(0, 4).map((tag) => (
          <TagBadge key={tag.id} tag={tag} />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <BoxIcon src="/skills-icons/favorite-heart.svg" alt="" size={12} boxClassName="h-4 w-4" />
          {locale === "en"
            ? `${formatMetric(skill.favoriteCount)} ${copy.card.favoritesSuffix}`
            : `${formatMetric(skill.favoriteCount)} ${copy.card.favoritesSuffix}`}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <BoxIcon src="/skills-icons/user.svg" alt="" size={12} boxClassName="h-4 w-4" />
          {`${formatMetric(skill.viewCount)} ${copy.card.viewsSuffix}`}
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpen(skill);
          }}
          className="rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
        >
          {copy.card.details}
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            void onFavorite(skill);
          }}
          className={`inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-semibold transition ${
            skill.isFavorited
              ? "border-brand-200 text-brand-600"
              : "border-slate-200 text-slate-700 hover:border-brand-200 hover:text-brand-600"
          }`}
        >
          <BoxIcon src="/skills-icons/favorite-heart.svg" alt="" size={14} boxClassName="h-4 w-4" />
          {skill.isFavorited ? (locale === "en" ? "Favorited" : "已收藏") : copy.card.favorite}
        </button>
      </div>
    </article>
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
  const hotKeywords =
    locale === "en"
      ? ["Xiaohongshu copy", "Resume polish", "Excel analysis", "Code explain", "PPT outline", "Meeting notes"]
      : ["小红书文案", "简历优化", "Excel 分析", "代码解释", "PPT 大纲", "会议纪要"];
  const sortOptions: Array<{ label: string; value: SkillSort }> = [
    { label: copy.sort.latest, value: "latest" },
    { label: copy.sort.popular, value: "popular" },
    { label: copy.sort.favorites, value: "favorites" },
    { label: copy.sort.views, value: "views" },
  ];
  const [searchKeyword, setSearchKeyword] = useState(initialQuery.q || "");
  const [skills, setSkills] = useState<SkillListItem[]>(initialResponse.list);
  const [pagination, setPagination] = useState<Pagination>(initialResponse.pagination);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isSceneExpanded, setIsSceneExpanded] = useState(false);
  const [isModelExpanded, setIsModelExpanded] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState("");

  const currentQuery = normalizeQuery(initialQuery);
  const shortcutCategories: SkillFilterOption[] = [{ label: copy.filters.allCategories, value: "all" }, ...filters.categories];
  const hasActiveFilters = Boolean(
    currentQuery.q || currentQuery.category || currentQuery.scene || currentQuery.model || currentQuery.type,
  );
  const currentPagePath = withLocale(locale, buildQueryString(currentQuery));

  useEffect(() => {
    setSearchKeyword(initialQuery.q || "");
    setSkills(initialResponse.list);
    setPagination(initialResponse.pagination);
    setLoadMoreError("");
    setIsFilterPanelOpen(false);
    setIsSceneExpanded(false);
    setIsModelExpanded(false);
  }, [initialQuery.q, initialResponse, queryKey]);

  useEffect(() => {
    if (!favoriteMessage) {
      return;
    }
    const timer = window.setTimeout(() => {
      setFavoriteMessage("");
    }, 1000);
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
        model: currentQuery.model || "",
        type: currentQuery.type || "",
        sort: currentQuery.sort || "latest",
      },
    });
  }, [currentPagePath, currentQuery.category, currentQuery.model, currentQuery.q, currentQuery.scene, currentQuery.sort, currentQuery.type]);

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
      trackEvent({
        eventName: "skills_load_more_click",
        pageUrl: currentPagePath,
        targetType: "button",
        targetId: "load_more",
        extra: {
          nextPage: pagination.page + 1,
        },
      });

      const nextPage = pagination.page + 1;
      const response = await getSkills({
        ...currentQuery,
        page: nextPage,
        pageSize: pagination.pageSize,
      });

      setSkills((prev) => [...prev, ...response.list]);
      setPagination(response.pagination);
    } catch (error) {
      setLoadMoreError(locale === "en" ? "Failed to load more. Please try again later." : "加载更多失败，请稍后重试。");
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
            ? {
                ...item,
                isFavorited: result.favorited,
                favoriteCount: result.favoriteCount,
              }
            : item,
        ),
      );
      setFavoriteMessage(
        result.favorited
          ? (locale === "en" ? "Favorited" : "已收藏")
          : (locale === "en" ? "Removed from favorites" : "已取消收藏"),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.toLowerCase().includes("unauthorized")) {
        setFavoriteMessage(locale === "en" ? "Please log in first" : "请先登录");
        return;
      }
      setFavoriteMessage(locale === "en" ? "Favorite failed, please try again" : "收藏失败，请稍后重试");
    }
  }

  return (
    <div className="min-h-screen">
      <section className="overflow-hidden border-b border-white/60 bg-gradient-to-br from-[#f7fbff] via-[#eef5ff] to-[#f8fbff]">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 pb-8 pt-8 sm:px-6 lg:grid-cols-[1.18fr_0.82fr] lg:px-8 lg:pt-10">
          <div className="pt-1">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-[50px] lg:leading-[1.08]">
              {copy.hero.titlePrefix} <span className="text-brand-600">{copy.hero.titleHighlight}</span> {copy.hero.titleSuffix}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              {copy.hero.description}
            </p>

            <form
              id="skills-search"
              className="mt-6 max-w-[680px]"
              onSubmit={(event) => {
                event.preventDefault();
                trackEvent({
                  eventName: "skills_search_submit",
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
              <div className="flex flex-col gap-3 rounded-[20px] border border-white/80 bg-white/92 p-2.5 shadow-[0_10px_30px_rgba(37,99,235,0.08)] sm:flex-row sm:items-center">
                <label className="flex min-w-0 flex-1 items-center gap-3 px-3 py-1.5">
                  <BoxIcon src="/skills-icons/search.svg" alt={copy.search} size={16} boxClassName="h-5 w-5" />
                  <input
                    value={searchKeyword}
                    onChange={(event) => setSearchKeyword(event.target.value)}
                    placeholder={copy.hero.placeholder}
                    className="w-full border-0 bg-transparent text-base text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </label>
                <HeroButton
                  type="submit"
                  className="rounded-2xl bg-brand-500 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
                >
                  {copy.search}
                </HeroButton>
              </div>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-slate-500">{copy.hotSearch}</span>
              {hotKeywords.map((keyword) => (
                <button
                  key={keyword}
                  type="button"
                  onClick={() => {
                    setSearchKeyword(keyword);
                    trackEvent({
                      eventName: "skills_hot_keyword_click",
                      pageUrl: currentPagePath,
                      targetType: "keyword",
                      targetId: keyword,
                      extra: {
                        keyword,
                      },
                    });
                    updateQuery({ q: keyword });
                  }}
                  className="rounded-full border border-white/80 bg-white/90 px-4 py-2 text-sm font-medium text-brand-600 shadow-sm transition hover:border-brand-200"
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-start justify-end pt-0.5">
            <HeroIllustration />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[28px] border border-white/80 bg-white/88 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-9">
            {shortcutCategories.map((category) => (
              <CategoryShortcut
                key={category.value}
                iconSrc={categoryIconMap[category.value] || "/skills-icons/filter.svg"}
                label={category.label}
                active={(category.value === "all" && !currentQuery.category) || currentQuery.category === category.value}
                onClick={() => {
                  trackEvent({
                    eventName: "skills_category_shortcut_click",
                    pageUrl: currentPagePath,
                    targetType: "category",
                    targetId: category.value,
                    extra: {
                      category: category.value === "all" ? "" : category.value,
                    },
                  });
                  updateQuery({ category: category.value === "all" ? undefined : category.value });
                }}
              />
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-white/80 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <BoxIcon src="/skills-icons/filter.svg" alt="" size={15} boxClassName="h-5 w-5" />
              {copy.filters.title}
            </div>
            <button
              type="button"
              onClick={() => setIsFilterPanelOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 md:hidden"
            >
              {isFilterPanelOpen ? copy.filters.collapse : copy.filters.expand}
            </button>
          </div>

          <div className={`${isFilterPanelOpen ? "block" : "hidden"} space-y-5 md:block`}>
            {filters.categoryTree.length > 0 ? (
              <CategoryFilterSection
                label={copy.filters.category}
                allLabel={copy.filters.all}
                activeValue={currentQuery.category}
                groups={filters.categoryTree}
                onClick={(value) => {
                  trackEvent({
                    eventName: "skills_filter_category_click",
                    pageUrl: currentPagePath,
                    targetType: "filter",
                    targetId: value || "all",
                    extra: {
                      category: value || "",
                    },
                  });
                  updateQuery({ category: value });
                }}
              />
            ) : (
              <FilterRow
                label={copy.filters.category}
                allLabel={copy.filters.all}
                moreLabel={copy.filters.more}
                lessLabel={copy.filters.less}
                activeValue={currentQuery.category}
                options={filters.categories}
                onClick={(value) => {
                  trackEvent({
                    eventName: "skills_filter_category_click",
                    pageUrl: currentPagePath,
                    targetType: "filter",
                    targetId: value || "all",
                    extra: {
                      category: value || "",
                    },
                  });
                  updateQuery({ category: value });
                }}
              />
            )}
            <FilterRow
              label={copy.filters.scene}
              allLabel={copy.filters.all}
              moreLabel={copy.filters.more}
              lessLabel={copy.filters.less}
              activeValue={currentQuery.scene}
              options={filters.scenes}
              collapsible
              expanded={isSceneExpanded}
              onToggleExpand={() => setIsSceneExpanded((prev) => !prev)}
              onClick={(value) => {
                trackEvent({
                  eventName: "skills_filter_scene_click",
                  pageUrl: currentPagePath,
                  targetType: "filter",
                  targetId: value || "all",
                  extra: {
                    scene: value || "",
                  },
                });
                updateQuery({ scene: value });
              }}
            />
            <FilterRow
              label={copy.filters.model}
              allLabel={copy.filters.all}
              moreLabel={copy.filters.more}
              lessLabel={copy.filters.less}
              activeValue={currentQuery.model}
              options={filters.models}
              collapsible
              expanded={isModelExpanded}
              onToggleExpand={() => setIsModelExpanded((prev) => !prev)}
              onClick={(value) => {
                trackEvent({
                  eventName: "skills_filter_model_click",
                  pageUrl: currentPagePath,
                  targetType: "filter",
                  targetId: value || "all",
                  extra: {
                    model: value || "",
                  },
                });
                updateQuery({ model: value });
              }}
            />
            <FilterRow
              label={copy.filters.type}
              allLabel={copy.filters.all}
              moreLabel={copy.filters.more}
              lessLabel={copy.filters.less}
              activeValue={currentQuery.type}
              options={filters.types}
              onClick={(value) => {
                trackEvent({
                  eventName: "skills_filter_type_click",
                  pageUrl: currentPagePath,
                  targetType: "filter",
                  targetId: value || "all",
                  extra: {
                    type: value || "",
                  },
                });
                updateQuery({ type: value });
              }}
            />
          </div>

          {hasActiveFilters ? (
            <div className="mt-5 flex justify-start">
              <button
                type="button"
                onClick={() => {
                  setSearchKeyword("");
                  pushQuery({ sort: currentQuery.sort || "latest", page: 1, pageSize: currentQuery.pageSize || 9 });
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-brand-200 hover:text-brand-600"
              >
                {copy.filters.clear}
              </button>
            </div>
          ) : null}
        </section>

        <section className="mt-6">
          {favoriteMessage ? (
            <div className="pointer-events-none fixed right-4 top-20 z-50 rounded-2xl border border-emerald-200 bg-white/96 px-4 py-3 text-sm font-medium text-emerald-700 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur sm:right-6">
              {favoriteMessage}
            </div>
          ) : null}
          <div className="mb-5 flex flex-col gap-4 rounded-[24px] border border-white/80 bg-white/88 px-5 py-4 shadow-[0_12px_40px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg font-semibold text-slate-900">{copy.results.replace("{count}", String(pagination.total))}</p>
            <div className="inline-flex items-center gap-3 self-start rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              <BoxIcon src="/skills-icons/sort.svg" alt="" size={14} boxClassName="h-4 w-4" />
              {copy.sort.label}
              <HeroSelect
                ariaLabel={copy.sort.label}
                value={currentQuery.sort || "latest"}
                onChange={(value) => {
                  const nextValue = value as SkillSort;
                  trackEvent({
                    eventName: "skills_sort_change",
                    pageUrl: currentPagePath,
                    targetType: "sort",
                    targetId: nextValue,
                    extra: {
                      sort: nextValue,
                    },
                  });
                  updateQuery({ sort: nextValue });
                }}
                options={sortOptions.map((option) => ({ label: option.label, value: option.value }))}
                className="min-w-[140px]"
                triggerClassName="min-w-[140px] border-0 bg-transparent px-0 py-0 text-left text-sm font-semibold text-slate-900 shadow-none"
                popoverClassName="min-w-[180px]"
              />
            </div>
          </div>

          {skills.length === 0 ? (
            <div className="rounded-[28px] border border-slate-200 bg-white/92 p-10 text-center shadow-sm">
              <h3 className="text-2xl font-semibold text-slate-900">{copy.empty.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">{copy.empty.description}</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => pushQuery({ sort: "latest", page: 1, pageSize: 9 })}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
                >
                  {copy.empty.clear}
                </button>
                <LocalizedLink href="/submit" className="rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white">
                  {copy.empty.submit}
                </LocalizedLink>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 lg:grid-cols-3">
                {skills.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} onOpen={openSkill} onFavorite={handleFavorite} locale={locale} copy={copy} />
                ))}
              </div>

              <div className="mt-8 text-center">
                {pagination.page < pagination.totalPages ? (
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="rounded-full border border-slate-200 bg-white px-8 py-3 text-sm font-semibold text-brand-600 shadow-sm transition hover:border-brand-200 disabled:opacity-60"
                  >
                    {isLoadingMore ? copy.loadingMore : copy.loadMore}
                  </button>
                ) : (
                  <p className="text-sm text-slate-400">{copy.reachedEnd}</p>
                )}
                {loadMoreError ? <p className="mt-3 text-sm text-rose-500">{loadMoreError}</p> : null}
              </div>
            </>
          )}
        </section>

        <section className="mt-14 rounded-[30px] border border-white/80 bg-gradient-to-r from-[#f8fbff] via-white to-[#f4f8ff] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-cyan-50 shadow-sm ring-1 ring-white/90">
                <BoxIcon src="/skills-icons/submit.svg" alt="" size={34} boxClassName="h-10 w-10" />
              </span>
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{copy.cta.title}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                  {copy.cta.description}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <LocalizedLink
                href="/submit"
                onClick={() =>
                  trackEvent({
                    eventName: "skills_submit_skill_click",
                    pageUrl: currentPagePath,
                    targetType: "button",
                    targetId: "submit_skill",
                    extra: {},
                  })
                }
                className="min-w-[144px] rounded-2xl bg-brand-500 px-6 py-3 text-center text-sm font-semibold text-white"
              >
                {copy.cta.submit}
              </LocalizedLink>
              <LocalizedLink
                href="/skills?sort=latest"
                className="min-w-[144px] rounded-2xl border border-slate-200 bg-white px-6 py-3 text-center text-sm font-semibold text-brand-600"
              >
                {copy.cta.latest}
              </LocalizedLink>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
