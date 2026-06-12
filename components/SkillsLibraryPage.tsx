"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SkillCard } from "@/components/SkillCard";
import { favoriteSkill, getSkills, unfavoriteSkill } from "@/lib/api/skills";
import { trackEvent } from "@/lib/api/track";
import { getMessages, type Locale, withLocale } from "@/lib/i18n";
import type {
  Pagination,
  SkillFilterOption,
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

type ResourceTypeKey = "all" | "prompt" | "skill" | "workflow" | "agent-runtime" | "framework";
type DomainKey = string;
type RuntimeKey =
  | "all"
  | "Codex"
  | "Claude Code"
  | "OpenClaw"
  | "Cursor"
  | "Goose"
  | "Hermes"
  | "Gemini CLI"
  | "MCP Client"
  | "AutoGPT";
type SkillSubtypeKey = "all" | "claude-skill" | "codex-skill" | "openclaw-skill" | "general-skill" | "skill-suite";
type FilterMenuKey = "domain" | "scene" | "runtime" | "sort" | null;

type DerivedSkill = SkillListItem & {
  resourceType: ResourceTypeKey;
  domainKey: string;
  runtimeKeys: Exclude<RuntimeKey, "all">[];
  primaryRuntime: string;
  sceneNames: string[];
};

type RepoSummaryItem = {
  label: string;
  count: number;
};

const resourceTypeConfig: Array<{
  key: ResourceTypeKey;
  label: Record<Locale, string>;
  icon: string;
  tint: string;
}> = [
  { key: "prompt", label: { zh: "Prompt", en: "Prompt" }, icon: "●", tint: "bg-[#5b2ff5]" },
  { key: "skill", label: { zh: "Skill", en: "Skill" }, icon: "◎", tint: "bg-[#11b981]" },
  { key: "workflow", label: { zh: "Workflow", en: "Workflow" }, icon: "∷", tint: "bg-[#ff6a00]" },
  { key: "agent-runtime", label: { zh: "Agent 运行平台", en: "Agent Runtime" }, icon: "◔", tint: "bg-[#5277ff]" },
  { key: "framework", label: { zh: "开发者框架", en: "Framework" }, icon: "✚", tint: "bg-[#7450ff]" },
];

const runtimeConfig = [
  { key: "Claude Code", aliases: ["claude code", "claude"], icon: "◉", tint: "bg-[#111111]" },
  { key: "OpenClaw", aliases: ["openclaw"], icon: "✺", tint: "bg-[#1f2937]" },
  { key: "Codex", aliases: ["codex"], icon: "⌘", tint: "bg-[#1747ff]" },
  { key: "Goose", aliases: ["goose"], icon: "◌", tint: "bg-[#1f2937]" },
  { key: "Cursor", aliases: ["cursor"], icon: "◈", tint: "bg-[#525f7f]" },
  { key: "Hermes", aliases: ["hermes"], icon: "△", tint: "bg-[#2563eb]" },
  { key: "AutoGPT", aliases: ["autogpt"], icon: "◍", tint: "bg-[#111111]" },
  { key: "Gemini CLI", aliases: ["gemini cli", "gemini"], icon: "◇", tint: "bg-[#4f46e5]" },
  { key: "MCP Client", aliases: ["mcp client", "mcp"], icon: "⋯", tint: "bg-[#94a3b8]" },
 ] as const;

const sceneKeywordMap: Array<{ label: string; hints: string[] }> = [
  { label: "PPT 生成", hints: ["ppt", "presentation", "slide"] },
  { label: "AI 编程", hints: ["coding", "code", "编程", "开发", "python"] },
  { label: "数据分析", hints: ["data", "分析", "excel", "report"] },
  { label: "文档撰写", hints: ["writing", "文章", "文档", "写作", "summary"] },
  { label: "个人助理", hints: ["assistant", "resume", "meeting", "job", "个人"] },
  { label: "编写脚本", hints: ["script", "automation", "脚本", "workflow"] },
  { label: "知识管理", hints: ["knowledge", "notebooklm", "文档问答", "记忆"] },
];

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

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatCompact(value: number): string {
  if (value >= 10000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return String(value);
}

function normalizeText(value?: string | null): string {
  return (value || "").toLowerCase().replace(/[\s/_-]+/g, "");
}

function containsChinese(value: string): boolean {
  return /[\u3400-\u9fff]/.test(value);
}

function matchesHints(source: string, hints: string[]): boolean {
  const normalized = normalizeText(source);
  return hints.some((hint) => normalized.includes(normalizeText(hint)));
}

function matchesReadonlyHints(source: string, hints: readonly string[]): boolean {
  return matchesHints(source, [...hints]);
}

function getResourceTypeKey(skill: SkillListItem): Exclude<ResourceTypeKey, "all"> {
  if (skill.type === "prompt") {
    return "prompt";
  }
  if (skill.type === "workflow") {
    return "workflow";
  }
  if (skill.type === "agent") {
    return "agent-runtime";
  }
  if (skill.type === "tutorial") {
    return "framework";
  }
  return "skill";
}

function getRuntimeKeys(skill: SkillListItem): Exclude<RuntimeKey, "all">[] {
  if (skill.runtimeLabels && skill.runtimeLabels.length > 0) {
    return skill.runtimeLabels.filter(Boolean) as Exclude<RuntimeKey, "all">[];
  }
  const source = [
    skill.title,
    skill.summary,
    skill.sourceName || "",
    skill.sourceUrl || "",
    skill.originalAuthor || "",
    ...skill.recommendedModels,
    ...skill.tags.map((tag) => tag.name),
  ].join(" ");

  const runtimes = runtimeConfig.filter((item) => matchesReadonlyHints(source, item.aliases)).map((item) => item.key);
  if (runtimes.length > 0) {
    return runtimes;
  }
  if (skill.type === "agent") {
    return ["OpenClaw"];
  }
  if (skill.type === "tool_config") {
    return ["Codex"];
  }
  if (skill.type === "prompt") {
    return ["Claude Code"];
  }
  return ["MCP Client"];
}

function getInitials(title: string): string {
  const clean = title.trim();
  if (!clean) {
    return "S";
  }
  if (containsChinese(clean)) {
    return clean.slice(0, 2);
  }
  const words = clean.split(/\s+/).filter(Boolean);
  return (words[0]?.[0] || "S").toUpperCase() + (words[1]?.[0] || "").toUpperCase();
}

function relativeUpdateLabel(locale: Locale, publishedAt: string): string {
  const target = new Date(publishedAt).getTime();
  if (!Number.isFinite(target)) {
    return locale === "en" ? "Updated recently" : "更新于近期";
  }
  const diffDays = Math.max(1, Math.round((Date.now() - target) / (1000 * 60 * 60 * 24)));
  if (locale === "en") {
    if (diffDays < 7) {
      return `Updated ${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    }
    const weeks = Math.max(1, Math.round(diffDays / 7));
    return `Updated ${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }
  if (diffDays < 7) {
    return `更新于 ${diffDays} 天前`;
  }
  const weeks = Math.max(1, Math.round(diffDays / 7));
  return `更新于 ${weeks} 周前`;
}

function resourceTypeFromQuery(type?: string): ResourceTypeKey {
  if (type === "prompt") {
    return "prompt";
  }
  if (type === "workflow") {
    return "workflow";
  }
  if (type === "agent") {
    return "agent-runtime";
  }
  if (type === "tool_config") {
    return "skill";
  }
  if (type === "tutorial") {
    return "framework";
  }
  return "all";
}

function StatIcon({ kind }: { kind: "view" | "favorite" }) {
  if (kind === "favorite") {
    return (
      <svg viewBox="0 0 20 20" className="h-4.5 w-4.5 stroke-current" fill="none" strokeWidth="1.8">
        <path d="M10 16.2 3.8 9.8a3.9 3.9 0 0 1 5.5-5.5L10 5l.7-.7a3.9 3.9 0 1 1 5.5 5.5L10 16.2Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" className="h-4.5 w-4.5 stroke-current" fill="none" strokeWidth="1.8">
      <path d="M1.8 10s3-5 8.2-5 8.2 5 8.2 5-3 5-8.2 5-8.2-5-8.2-5Z" />
      <circle cx="10" cy="10" r="2.6" />
    </svg>
  );
}

function FavoriteToggleIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className={`h-4.5 w-4.5 ${active ? "fill-[#4f46ff] text-[#4f46ff]" : "fill-none text-[#4f46ff]"}`} stroke="currentColor" strokeWidth="1.8">
      <path d="M10 15.9 4.4 18l1.1-6.1L1 7.7l6.2-.8L10 1.5l2.8 5.4 6.2.8-4.5 4.2 1.1 6.1L10 15.9Z" />
    </svg>
  );
}

function FilterDropdown({
  label,
  valueLabel,
  options,
  open,
  onToggle,
  onSelect,
}: {
  label: string;
  valueLabel?: string;
  options: Array<{ value: string; label: string; count?: number }>;
  open: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex h-12 items-center gap-3 rounded-[14px] border border-[#e7ebfb] bg-white px-5 text-[15px] font-medium text-[#172449] shadow-[0_4px_14px_rgba(33,47,108,0.04)] transition hover:border-[#cfd7ff]"
      >
        <span>{valueLabel || label}</span>
        <svg viewBox="0 0 20 20" className={`h-4 w-4 text-[#6b7394] transition ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="m5.5 7.5 4.5 5 4.5-5" />
        </svg>
      </button>
      {open ? (
        <div className="absolute left-0 top-[calc(100%+10px)] z-30 min-w-[220px] rounded-[18px] border border-[#e8ecfb] bg-white p-2 shadow-[0_18px_44px_rgba(26,38,89,0.12)]">
          <div className="max-h-[260px] overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#d6defa]">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelect(option.value)}
                className="flex w-full items-center justify-between rounded-[12px] px-3 py-2.5 text-left text-[14px] text-[#172449] transition hover:bg-[#f6f8ff]"
              >
                <span>{option.label}</span>
                {typeof option.count === "number" ? <span className="text-[#7f88aa]">{formatNumber(option.count)}</span> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function countByValue(options: SkillFilterOption[]): Record<string, number> {
  return options.reduce<Record<string, number>>((acc, option) => {
    acc[option.value] = option.count || 0;
    return acc;
  }, {});
}

function sumCounts(options: SkillFilterOption[]): number {
  return options.reduce((sum, option) => sum + (option.count || 0), 0);
}

function formatResourceCount(locale: Locale, count: number): string {
  return locale === "en" ? `${formatNumber(count)} items` : `${formatNumber(count)} 个`;
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
  const currentQuery = normalizeQuery(initialQuery);
  const currentPagePath = withLocale(locale, buildQueryString(currentQuery));

  const [searchKeyword, setSearchKeyword] = useState(initialQuery.q || "");
  const [skills, setSkills] = useState<SkillListItem[]>(initialResponse.list);
  const [pagination, setPagination] = useState<Pagination>(initialResponse.pagination);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");
  const [favoriteMessage, setFavoriteMessage] = useState("");
  const [openFilterMenu, setOpenFilterMenu] = useState<FilterMenuKey>(null);
  const [domainsCollapsed, setDomainsCollapsed] = useState(false);
  const [resourceType, setResourceType] = useState<ResourceTypeKey>(resourceTypeFromQuery(initialQuery.type));
  const [domainFilter, setDomainFilter] = useState<DomainKey>(initialQuery.category || "all");
  const [sceneFilter, setSceneFilter] = useState(initialQuery.scene || "all");
  const [runtimeFilter, setRuntimeFilter] = useState<RuntimeKey>("all");

  const sortOptions: Array<{ value: SkillSort; label: string }> = [
    { label: locale === "en" ? "Latest" : "最新发布", value: "latest" },
    { label: locale === "en" ? "Popular" : "最受欢迎", value: "popular" },
    { label: locale === "en" ? "Most favorited" : "收藏最多", value: "favorites" },
    { label: locale === "en" ? "Most viewed" : "浏览最多", value: "views" },
  ];

  useEffect(() => {
    setSearchKeyword(initialQuery.q || "");
    setSkills(initialResponse.list);
    setPagination(initialResponse.pagination);
    setLoadMoreError("");
    setResourceType(resourceTypeFromQuery(initialQuery.type));
    setDomainFilter(initialQuery.category || "all");
    setSceneFilter(initialQuery.scene || "all");
  }, [initialQuery.category, initialQuery.q, initialQuery.scene, initialQuery.type, initialResponse, queryKey]);

  useEffect(() => {
    if (!favoriteMessage) {
      return;
    }
    const timer = window.setTimeout(() => setFavoriteMessage(""), 1400);
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
        sort: currentQuery.sort || "latest",
      },
    });
  }, [currentPagePath, currentQuery.q, currentQuery.sort]);

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
    setOpenFilterMenu(null);
    setResourceType("all");
    setDomainFilter("all");
    setSceneFilter("all");
    setRuntimeFilter("all");
    pushQuery({ sort: currentQuery.sort || "latest", page: 1, pageSize: currentQuery.pageSize || 9 });
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
      const result = skill.isFavorited ? await unfavoriteSkill(skill.id) : await favoriteSkill(skill.id);
      setSkills((current) =>
        current.map((item) =>
          item.id === skill.id
            ? { ...item, isFavorited: result.favorited, favoriteCount: result.favoriteCount }
            : item,
        ),
      );
      setFavoriteMessage(result.favorited ? (locale === "en" ? "Saved" : "已收藏") : (locale === "en" ? "Removed" : "已取消"));
    } catch {
      setFavoriteMessage(locale === "en" ? "Action failed" : "操作失败");
    }
  }

  const derivedSkills = useMemo<DerivedSkill[]>(() => {
    return skills.map((skill) => {
      const runtimeKeys = getRuntimeKeys(skill);
      return {
        ...skill,
        resourceType: getResourceTypeKey(skill),
        domainKey: skill.category?.slug || "",
        runtimeKeys,
        primaryRuntime: skill.primaryRuntime || runtimeKeys[0] || "MCP Client",
        sceneNames: skill.tags.filter((tag) => tag.type === "scene").map((tag) => tag.name),
      };
    });
  }, [skills]);

  const typeCounts = useMemo(() => countByValue(filters.types), [filters.types]);
  const totalTypeCount = useMemo(() => sumCounts(filters.types), [filters.types]);
  const resourceTypeSummary = useMemo<RepoSummaryItem[]>(() => {
    return resourceTypeConfig.map((item) => {
      const count =
        item.key === "prompt"
          ? typeCounts.prompt || 0
          : item.key === "workflow"
            ? typeCounts.workflow || 0
            : item.key === "skill"
              ? typeCounts.tool_config || 0
              : item.key === "agent-runtime"
                ? typeCounts.agent || 0
                : typeCounts.tutorial || 0;
      return {
        label: item.label[locale],
        count,
      };
    });
  }, [locale, typeCounts]);
  const sceneOptions = useMemo(() => {
    const base = filters.scenes.length > 0 ? filters.scenes : sceneKeywordMap.map((scene) => ({ label: scene.label, value: scene.label, count: 0 }));
    return [{ label: locale === "en" ? "All scenes" : "全部场景", value: "all" }, ...base];
  }, [filters.scenes, locale]);

  const domainOptions = useMemo(() => {
    return filters.categories.map((item) => ({
      key: item.value,
      label: {
        zh: item.label,
        en: item.label,
      },
      count: item.count || 0,
    }));
  }, [filters.categories]);

  const toolRanking = useMemo(() => {
    if (filters.runtimes?.length) {
      return runtimeConfig
        .map((runtime) => ({
          ...runtime,
          count: filters.runtimes.find((item) => item.value === runtime.key || item.label === runtime.key)?.count || 0,
        }))
        .filter((runtime) => runtime.count > 0)
        .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
        .slice(0, 8);
    }

    const counts = runtimeConfig.map((runtime) => ({
      ...runtime,
      count: derivedSkills.filter((skill) => skill.runtimeKeys.includes(runtime.key)).length,
    }));
    return counts.sort((a, b) => b.count - a.count || a.key.localeCompare(b.key)).slice(0, 8);
  }, [derivedSkills, filters.runtimes]);

  const renderedToolRanking = useMemo(() => {
    if (filters.dashboard?.topTools?.length) {
      return filters.dashboard.topTools.map((tool) => {
        const matchedRuntime = runtimeConfig.find((item) => item.key === tool.label);
        return {
          key: matchedRuntime?.key || tool.label,
          label: tool.label,
          count: tool.count || 0,
          icon: matchedRuntime?.icon || "◉",
          tint: matchedRuntime?.tint || "bg-[#2459ff]",
        };
      });
    }
    return toolRanking.map((tool) => ({
      key: tool.key,
      label: tool.key,
      count: tool.count,
      icon: tool.icon,
      tint: tool.tint,
    }));
  }, [filters.dashboard?.topTools, toolRanking]);

  const hotScenes = useMemo(() => {
    const fromFilters = filters.scenes
      .map((scene) => ({ label: scene.label, value: scene.value, count: scene.count || 0 }))
      .filter((scene) => scene.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
    if (fromFilters.length > 0) {
      return fromFilters;
    }
    return sceneKeywordMap.map((scene) => ({
      label: scene.label,
      value: scene.label,
      count: derivedSkills.filter((skill) => matchesHints(`${skill.title} ${skill.summary} ${skill.sceneNames.join(" ")}`, scene.hints)).length,
    })).sort((a, b) => b.count - a.count).slice(0, 7);
  }, [derivedSkills, filters.scenes]);

  const filteredSkills = useMemo(() => {
    return derivedSkills.filter((skill) => {
      if (runtimeFilter !== "all" && !skill.runtimeKeys.includes(runtimeFilter)) {
        return false;
      }
      return true;
    });
  }, [derivedSkills, runtimeFilter]);

  const visibleCount = filteredSkills.length;
  const totalCount = filters.dashboard?.total || pagination.total || totalTypeCount || skills.length;
  const visibleDomainOptions = domainsCollapsed ? domainOptions.slice(0, 8) : domainOptions;
  const selectedSceneLabel = sceneOptions.find((item) => item.value === sceneFilter)?.label;
  const selectedSortLabel = sortOptions.find((item) => item.value === (currentQuery.sort || "latest"))?.label;
  const selectedDomainLabel = domainOptions.find((item) => item.key === domainFilter)?.label[locale];

  function selectResourceType(nextType: ResourceTypeKey) {
    setResourceType(nextType);
    updateQuery({
      type:
        nextType === "all"
          ? undefined
          : nextType === "skill"
            ? "tool_config"
            : nextType === "agent-runtime"
              ? "agent"
              : nextType === "framework"
                ? "tutorial"
                : nextType,
    });
  }

  function selectDomain(nextDomain: string) {
    setDomainFilter(nextDomain);
    updateQuery({ category: nextDomain === "all" ? undefined : nextDomain });
  }

  function selectScene(nextScene: string) {
    setSceneFilter(nextScene);
    updateQuery({ scene: nextScene === "all" ? undefined : nextScene });
  }

  return (
    <main className="h-[calc(100vh-88px)] overflow-hidden bg-transparent px-3 pb-3 pt-3 sm:px-4 lg:px-5">
      {favoriteMessage ? (
        <div className="fixed right-6 top-20 z-50 rounded-[18px] border border-[#dfe5ff] bg-white px-4 py-3 text-sm font-medium text-[#4f46ff] shadow-[0_18px_40px_rgba(33,47,108,0.12)]">
          {favoriteMessage}
        </div>
      ) : null}

      <div className="mx-auto h-full min-w-[1380px] max-w-[1640px]">
        <div className="grid h-full grid-cols-[240px_minmax(0,1fr)_238px] gap-3">
          <aside className="overflow-hidden rounded-[22px] border border-[#e8ecf9] bg-white/92 px-4 py-3.5 shadow-[0_8px_26px_rgba(29,40,92,0.04)] backdrop-blur">
            <div className="flex items-center justify-between border-b border-[#edf1fb] pb-3">
              <div className="text-[15px] font-semibold text-[#121d47]">{locale === "en" ? "All resources" : "全部资源"}</div>
              <div className="text-[14px] font-semibold text-[#40507f]">{formatNumber(totalCount)}</div>
            </div>

            <div className="max-h-[calc(100%-44px)] overflow-y-auto pt-4 pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#d6defa]">
              <div className="mb-2.5 text-[15px] font-semibold text-[#4f46ff]">{locale === "en" ? "Resource type" : "资源类型"}</div>
              <div className="space-y-1">
                {resourceTypeConfig.map((item) => {
                  const countLookup =
                    item.key === "prompt"
                      ? typeCounts.prompt || 0
                      : item.key === "workflow"
                        ? typeCounts.workflow || 0
                        : item.key === "skill"
                          ? typeCounts.tool_config || 0
                          : item.key === "agent-runtime"
                            ? typeCounts.agent || 0
                            : typeCounts.tutorial || 0;
                  const active = resourceType === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => selectResourceType(item.key)}
                      className={`flex w-full items-center justify-between rounded-[12px] px-3.5 py-2.5 text-left transition ${
                        active ? "bg-[linear-gradient(90deg,#eefcf6_0%,#f9fffc_100%)] shadow-[0_6px_16px_rgba(17,185,129,0.08)]" : "hover:bg-[#f7f9ff]"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-[9px] ${item.tint} text-[13px] font-semibold text-white`}>
                          {item.icon}
                        </span>
                        <span className="flex flex-col text-left">
                          <span className="text-[14px] font-medium text-[#131d45]">{item.label[locale]}</span>
                          <span className="text-[12px] text-[#7c87ab]">{formatResourceCount(locale, countLookup)}</span>
                        </span>
                      </span>
                      <span className="text-[14px] text-[#4c5b89]">{formatNumber(countLookup)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </aside>

          <section className="flex min-h-0 flex-col overflow-hidden rounded-[22px] border border-[#e8ecf9] bg-white/92 px-4 py-3.5 shadow-[0_8px_26px_rgba(29,40,92,0.04)] backdrop-blur">
            <div className="shrink-0 pb-3">
              <h1 className="text-[32px] font-semibold tracking-[-0.04em] text-[#101b49]">
                {locale === "en" ? "Skill Library" : "Skill 资源库"}
              </h1>
              <p className="mt-1.5 text-[14px] text-[#5d6b94]">
                {locale === "en"
                  ? "Curated skills and reusable resources to help you ship with AI faster."
                  : "精选优质 Skill 资源，开箱即用，提升您的 AI 生产力。"}
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#d6defa]">
              <form
                id="skills-search"
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
                <div className="flex h-[54px] items-center rounded-[15px] border-2 border-[#6a4dff] bg-white px-4 shadow-[0_10px_26px_rgba(104,66,255,0.08)]">
                  <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0 text-[#7a85ad]" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="9" cy="9" r="5.8" />
                    <path d="m13.5 13.5 4 4" />
                  </svg>
                  <input
                    value={searchKeyword}
                    onChange={(event) => setSearchKeyword(event.target.value)}
                    placeholder={locale === "en" ? "Search Skill name, capability, tag, runtime..." : "搜索 Skill 名称、功能、标签、适用工具..."}
                    className="h-full flex-1 bg-transparent px-4 text-[16px] text-[#15214c] outline-none placeholder:text-[#96a0c4]"
                  />
                  <span className="mr-3 inline-flex h-8 items-center rounded-[10px] bg-[#f4f6fb] px-3 text-[13px] font-semibold text-[#67759f]">
                    ⌘ K
                  </span>
                  <button
                    type="submit"
                    className="inline-flex h-11 items-center gap-2 rounded-[14px] bg-[linear-gradient(180deg,#5d2cff_0%,#4d25f5_100%)] px-5 text-[16px] font-semibold text-white shadow-[0_12px_28px_rgba(93,44,255,0.28)]"
                  >
                    <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="9" cy="9" r="5.8" />
                      <path d="m13.5 13.5 4 4" />
                    </svg>
                    <span>{copy.search}</span>
                  </button>
                </div>
              </form>

              <div className="mt-5 grid grid-cols-5 gap-2">
                {resourceTypeSummary.map((item) => (
                  <div key={item.label} className="rounded-[14px] border border-[#edf1fb] bg-[#fcfdff] px-3 py-2">
                    <div className="text-[12px] text-[#7884a7]">{item.label}</div>
                    <div className="mt-1 text-[16px] font-semibold text-[#121d47]">{formatNumber(item.count)}</div>
                  </div>
                ))}
              </div>

              <div className="sticky top-0 z-20 mt-5 bg-white/95 py-2 backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <FilterDropdown
                      label={locale === "en" ? "Domain" : "领域分类"}
                      valueLabel={selectedDomainLabel || (locale === "en" ? "Domain" : "领域分类")}
                      options={[
                        { value: "all", label: locale === "en" ? "All domains" : "全部领域" },
                        ...domainOptions.map((item) => ({ value: item.key, label: item.label[locale], count: item.count })),
                      ]}
                      open={openFilterMenu === "domain"}
                      onToggle={() => setOpenFilterMenu((current) => (current === "domain" ? null : "domain"))}
                      onSelect={(value) => {
                        selectDomain(value);
                        setOpenFilterMenu(null);
                      }}
                    />

                    <FilterDropdown
                      label={locale === "en" ? "Scene" : "使用场景"}
                      valueLabel={selectedSceneLabel || (locale === "en" ? "Scene" : "使用场景")}
                      options={sceneOptions}
                      open={openFilterMenu === "scene"}
                      onToggle={() => setOpenFilterMenu((current) => (current === "scene" ? null : "scene"))}
                      onSelect={(value) => {
                        selectScene(value);
                        setOpenFilterMenu(null);
                      }}
                    />

                    <FilterDropdown
                      label={locale === "en" ? "Runtime" : "适用工具"}
                      valueLabel={runtimeFilter === "all" ? (locale === "en" ? "Runtime" : "适用工具") : runtimeFilter}
                      options={[
                        { value: "all", label: locale === "en" ? "All runtimes" : "全部工具" },
                        ...toolRanking.map((item) => ({
                          value: item.key,
                          label: item.key,
                          count: item.count,
                        })),
                      ]}
                      open={openFilterMenu === "runtime"}
                      onToggle={() => setOpenFilterMenu((current) => (current === "runtime" ? null : "runtime"))}
                      onSelect={(value) => {
                        setRuntimeFilter(value as RuntimeKey);
                        setOpenFilterMenu(null);
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <FilterDropdown
                      label={locale === "en" ? "Sort" : "排序"}
                      valueLabel={`${locale === "en" ? "Sort" : "排序"}: ${selectedSortLabel}`}
                      options={sortOptions.map((item) => ({ value: item.value, label: item.label }))}
                      open={openFilterMenu === "sort"}
                      onToggle={() => setOpenFilterMenu((current) => (current === "sort" ? null : "sort"))}
                      onSelect={(value) => {
                        updateQuery({ sort: value as SkillSort });
                        setOpenFilterMenu(null);
                      }}
                    />

                    <button type="button" onClick={clearFilters} className="text-[15px] font-semibold text-[#2459ff]">
                      {locale === "en" ? "Clear filters" : "清空筛选"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-1 rounded-[18px] border border-[#e9edfb] bg-[#fbfcff] px-3.5 py-2.5 text-[13px] text-[#61709a]">
                {locale === "en"
                  ? `${visibleCount} results currently visible`
                  : `当前展示 ${formatNumber(visibleCount)} 个资源`}
              </div>

              <div className="mt-3">
              <div className="columns-1 gap-3 xl:columns-2 2xl:columns-3">
              {filteredSkills.length === 0 ? (
                <div className="rounded-[22px] border border-[#e9edfb] bg-white px-6 py-12 text-center">
                  <div className="text-[22px] font-semibold text-[#172449]">{copy.empty.title}</div>
                  <div className="mt-3 text-[15px] text-[#6e7ca5]">{copy.empty.description}</div>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 inline-flex rounded-[14px] bg-[#4f46ff] px-5 py-3 text-sm font-semibold text-white"
                  >
                    {copy.empty.clear}
                  </button>
                </div>
              ) : (
                filteredSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="mb-3 break-inside-avoid"
                  >
                    <SkillCard
                      skill={{
                        id: skill.id,
                        title: skill.title,
                        summary: skill.summary,
                        coverIcon: skill.coverIcon,
                        categorySlug: skill.category?.slug,
                        categoryName: skill.category?.name,
                        categoryColor: skill.category?.color,
                        type: skill.type,
                        tags: skill.tags,
                        favoriteCount: skill.favoriteCount,
                        viewCount: skill.viewCount,
                        isFavorited: skill.isFavorited,
                        isFeatured: skill.isFeatured,
                        authorName: skill.authorName || skill.originalAuthor || (locale === "en" ? "Unknown author" : "未知作者"),
                        sourceType: skill.sourceType,
                        sourceName: skill.sourceName,
                        originalAuthor: skill.originalAuthor,
                        runtimeLabels: skill.runtimeLabels || [],
                      }}
                      variant="grid"
                      favoriteLabel={locale === "en" ? "Save" : "收藏"}
                      onFavorite={() => handleFavorite(skill)}
                      onOpen={() => openSkill(skill)}
                      maxTags={6}
                    />
                  </div>
                ))
              )}
              </div>

              <div className="mt-4 flex flex-col items-center gap-3">
                {pagination.page < pagination.totalPages ? (
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="rounded-full border border-[#dce3fb] bg-white px-7 py-2.5 text-sm font-semibold text-[#4f46ff] shadow-[0_10px_22px_rgba(24,39,97,0.05)] disabled:opacity-60"
                  >
                    {isLoadingMore ? copy.loadingMore : copy.loadMore}
                  </button>
                ) : (
                  <p className="text-sm text-[#8b97bc]">{copy.reachedEnd}</p>
                )}
                {loadMoreError ? <p className="text-sm text-rose-500">{loadMoreError}</p> : null}
              </div>
              </div>
            </div>
          </section>

          <aside className="space-y-3 overflow-hidden">
            <section className="rounded-[22px] border border-[#e8ecf9] bg-white/92 px-4 py-3.5 shadow-[0_8px_26px_rgba(29,40,92,0.04)] backdrop-blur">
              <div className="flex items-center justify-between">
                <h2 className="text-[16px] font-semibold text-[#121d47]">{locale === "en" ? "Hot scenes" : "热门使用场景"}</h2>
                <span className="text-[13px] font-medium text-[#7a86ad]">
                  {formatNumber((filters.dashboard?.hotScenes?.length ? filters.dashboard.hotScenes : hotScenes).length)}
                </span>
              </div>
              <div className="mt-3.5 space-y-2.5">
                {(filters.dashboard?.hotScenes?.length ? filters.dashboard.hotScenes : hotScenes).map((scene, index) => (
                  <button
                    key={scene.value || scene.label}
                    type="button"
                    onClick={() => selectScene(scene.value || scene.label)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <span className="flex items-center gap-3">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-[5px] bg-[#2459ff] text-[11px] font-semibold text-white">
                        {index + 1}
                      </span>
                      <span className="text-[15px] font-medium text-[#121d47]">{scene.label}</span>
                    </span>
                    <span className="text-[15px] text-[#495a88]">{formatNumber(scene.count || 0)}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[22px] border border-[#e8ecf9] bg-white/92 px-4 py-3.5 shadow-[0_8px_26px_rgba(29,40,92,0.04)] backdrop-blur">
              <div className="flex items-center justify-between">
                <h2 className="text-[16px] font-semibold text-[#121d47]">{locale === "en" ? "Runtimes" : "适用工具"}</h2>
                <span className="text-[13px] font-medium text-[#7a86ad]">{formatNumber(renderedToolRanking.length)}</span>
              </div>
              <div className="mt-3.5 space-y-2.5">
                {renderedToolRanking.map((tool) => (
                  <button
                    key={tool.key}
                    type="button"
                    onClick={() => setRuntimeFilter((tool.key as RuntimeKey) || "all")}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <span className="flex items-center gap-3">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-[7px] ${tool.tint} text-[11px] font-semibold text-white`}>
                        {tool.icon}
                      </span>
                      <span className="text-[15px] font-medium text-[#121d47]">{tool.label}</span>
                    </span>
                    <span className="text-[15px] text-[#495a88]">{formatNumber(tool.count || 0)}</span>
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
