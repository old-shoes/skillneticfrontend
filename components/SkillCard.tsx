"use client";

type SkillCardTag = {
  id: string;
  name: string;
  type?: string;
};

type SkillCardVariant = "recommended" | "grid" | "compact";

type SkillCardData = {
  id: string;
  title: string;
  summary: string;
  coverIcon?: string | null;
  categorySlug?: string;
  categoryName?: string | null;
  categoryColor?: string;
  type?: string;
  tags: SkillCardTag[];
  favoriteCount: number;
  viewCount: number;
  isFavorited?: boolean;
  isFeatured?: boolean;
  authorName?: string;
  sourceType?: string;
  sourceName?: string | null;
  originalAuthor?: string | null;
  runtimeLabels?: string[];
};

type Props = {
  skill: SkillCardData;
  variant: SkillCardVariant;
  favoriteLabel: string;
  onOpen: () => void;
  onFavorite?: () => void | Promise<void>;
  maxTags?: number;
};

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
  browse: "/v2skills-filter-icons/category.svg",
  user: "/v2skills-filter-icons/agent.svg",
};

const cardColorMap: Record<string, string> = {
  blue: "from-[#5c90ff] to-[#4e7df0]",
  green: "from-[#58d07c] to-[#43b663]",
  orange: "from-[#ffaf54] to-[#f08c2e]",
  purple: "from-[#8b63ff] to-[#6d4ff2]",
  rose: "from-[#ff6fb1] to-[#ec4e97]",
  indigo: "from-[#6d90ff] to-[#5277ef]",
  cyan: "from-[#53d0da] to-[#35b5c2]",
  emerald: "from-[#41d29e] to-[#24b57e]",
};

function formatMetric(value: number): string {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);
}

function getAuthorInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return "S";
  }
  return trimmed.slice(0, 1).toUpperCase();
}

function pickIcon(skill: SkillCardData): string {
  if (skill.coverIcon && typeIconMap[skill.coverIcon]) {
    return typeIconMap[skill.coverIcon];
  }
  if (skill.type && typeIconMap[skill.type]) {
    return typeIconMap[skill.type];
  }
  if (skill.categorySlug && categoryIconMap[skill.categorySlug]) {
    return categoryIconMap[skill.categorySlug];
  }
  return categoryIconMap.all;
}

function pickTone(skill: SkillCardData): string {
  if (skill.categoryColor && cardColorMap[skill.categoryColor]) {
    return cardColorMap[skill.categoryColor];
  }
  if (skill.coverIcon === "tutorial") {
    return cardColorMap.purple;
  }
  if (skill.coverIcon === "workflow") {
    return cardColorMap.cyan;
  }
  if (skill.coverIcon === "agent" || skill.coverIcon === "user") {
    return cardColorMap.rose;
  }
  if (skill.coverIcon === "browse") {
    return cardColorMap.green;
  }
  return cardColorMap.blue;
}

function formatTypeLabel(type?: string): string {
  if (!type) {
    return "未标注";
  }

  const labelMap: Record<string, string> = {
    prompt: "提示词",
    workflow: "工作流",
    tutorial: "教程",
    tool_config: "工具配置",
    agent: "智能体",
    browse: "浏览器技能",
    user: "用户技能",
  };

  return labelMap[type] || type.replace(/_/g, " ");
}

function StatIcon({ kind }: { kind: "favorite" | "view" | "bookmark" }) {
  if (kind === "favorite") {
    return <span className="text-[#f7b500]">★</span>;
  }
  if (kind === "bookmark") {
    return (
      <svg viewBox="0 0 20 20" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8">
        <path d="M6 3.5h8a1 1 0 0 1 1 1V17l-5-3-5 3V4.5a1 1 0 0 1 1-1Z" />
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
    <img
      src={active ? "/icons/favorite-star-filled.svg" : "/icons/favorite-star-outline.svg"}
      alt=""
      className="h-5 w-5"
    />
  );
}

export function SkillCard({ skill, variant, favoriteLabel, onOpen, onFavorite, maxTags }: Props) {
  const tone = pickTone(skill);
  const icon = pickIcon(skill);
  const tags = skill.tags;
  const sceneTags = tags.filter((tag) => tag.type === "scene").slice(0, maxTags ?? 6);
  const typeTags = tags
    .filter((tag) => tag.type === "type" && tag.name.toLowerCase() !== skill.type?.toLowerCase())
    .slice(0, maxTags ?? 4);
  const runtimeTags = (skill.runtimeLabels || []).filter(Boolean).slice(0, maxTags ?? 6);
  const categoryLabel = skill.categoryName?.trim() || skill.categorySlug || "未分类";
  const typeLabel = formatTypeLabel(skill.type);
  const showBookmark = Boolean(onFavorite);
  const authorName = skill.authorName?.trim();
  const isGithubSource = skill.sourceType === "github" || skill.sourceType === "user_github";
  const isCompact = variant === "compact";
  const isRecommended = variant === "recommended";

  return (
    <article
      className={`rounded-[22px] border border-[#edf1f6] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.035)] ${
        isCompact ? "p-4" : "p-4.5"
      }`}
    >
      <div className="flex items-start gap-3.5">
        <button
          type="button"
          onClick={onOpen}
          className={`flex shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br ${tone} ${
            isCompact ? "h-14 w-14" : "h-15 w-15"
          }`}
        >
          <img src={icon} alt="" className={`${isCompact ? "h-7 w-7" : "h-7.5 w-7.5"} brightness-0 invert`} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <button type="button" onClick={onOpen} className="min-w-0 text-left">
              <div className="flex flex-wrap items-center gap-2">
                {isGithubSource ? (
                  <span className="rounded-full bg-[#eef3ff] px-2.5 py-0.5 text-[10px] font-semibold text-[#4f46ff]">
                    GitHub 收录
                  </span>
                ) : null}
              </div>
              <h3 className={`font-semibold text-[#171c28] ${isCompact ? "line-clamp-1 text-[14px]" : "line-clamp-1 text-[15px]"}`}>
                {skill.title}
              </h3>
            </button>
            {showBookmark ? (
              <button
                type="button"
                onClick={() => void onFavorite?.()}
                className="shrink-0 transition hover:opacity-80"
                aria-label={favoriteLabel}
              >
                <FavoriteToggleIcon active={Boolean(skill.isFavorited)} />
              </button>
            ) : null}
          </div>

          <p className={`line-clamp-2 text-[12px] leading-5.5 text-[#5f6779] ${isCompact ? "mt-1" : "mt-1.5"}`}>
            {skill.summary}
          </p>
        </div>
      </div>

      <div className={`${isCompact ? "mt-2.5" : "mt-3"}`}>
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="rounded-full bg-[#f4f7fb] px-2.5 py-1 font-semibold text-[#5f6779]">领域分类</span>
            <span className="rounded-full bg-[#f9fafb] px-2.5 py-1 font-medium text-[#1f2430]">
              {categoryLabel}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="rounded-full bg-[#f3f5ff] px-2.5 py-1 font-semibold text-[#4f46ff]">资源类型</span>
            <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 font-medium text-[#4f46ff]">{typeLabel}</span>
            {typeTags.length > 0 ? (
              typeTags.map((tag) => (
                <span key={tag.id} className="rounded-full bg-[#f7f8ff] px-2.5 py-1 font-medium text-[#6570d6]">
                  {tag.name}
                </span>
              ))
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="rounded-full bg-[#ecfaf3] px-2.5 py-1 font-semibold text-[#3fa06a]">全部场景</span>
            {sceneTags.length > 0 ? (
              sceneTags.map((tag) => (
                <span key={tag.id} className="rounded-full bg-[#f3fcf7] px-2.5 py-1 font-medium text-[#3fa06a]">
                  {tag.name}
                </span>
              ))
            ) : (
              <span className="rounded-full bg-[#f9fafb] px-2.5 py-1 font-medium text-[#7b8496]">未标注</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="rounded-full bg-[#fff4e8] px-2.5 py-1 font-semibold text-[#d97706]">适用工具</span>
            {runtimeTags.length > 0 ? (
              runtimeTags.map((runtime) => (
                <span key={runtime} className="rounded-full bg-[#fff9f1] px-2.5 py-1 font-medium text-[#b45309]">
                  {runtime}
                </span>
              ))
            ) : null}
            {runtimeTags.length === 0 ? (
              <span className="rounded-full bg-[#f9fafb] px-2.5 py-1 font-medium text-[#7b8496]">未标注</span>
            ) : null}
          </div>
        </div>

        {isRecommended ? (
          <div className="mt-3 flex items-center gap-4 text-[11px] text-[#6b7283]">
            {isGithubSource && skill.sourceName ? <span className="truncate text-[#4f46ff]">{skill.sourceName}</span> : null}
            <span className="inline-flex items-center gap-2">
              <StatIcon kind="favorite" />
              {formatMetric(skill.favoriteCount)}
            </span>
            <span className="inline-flex items-center gap-2">
              <StatIcon kind="view" />
              {formatMetric(skill.viewCount)}
            </span>
          </div>
        ) : (
          <div className="mt-3 flex items-center justify-between gap-3">
            {authorName || (isGithubSource && skill.originalAuthor) ? (
              <div className="flex min-w-0 items-center gap-2">
                <span className="inline-flex h-5.5 w-5.5 items-center justify-center rounded-full bg-gradient-to-br from-[#6f82ff] to-[#5f66f4] text-[10px] font-semibold text-white">
                  {getAuthorInitials(authorName || skill.originalAuthor || "G")}
                </span>
                <span className="truncate text-[12px] text-[#5f6779]">{authorName || skill.originalAuthor}</span>
                {isGithubSource ? <span className="text-[#4f46ff]">GitHub</span> : <span className="text-[#4f46ff]">✔</span>}
              </div>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-4 text-[11px] text-[#6b7283]">
              <span className="inline-flex items-center gap-2">
                <StatIcon kind="favorite" />
                {formatMetric(skill.favoriteCount)}
              </span>
              <span className="inline-flex items-center gap-2">
                <StatIcon kind="view" />
                {formatMetric(skill.viewCount)}
              </span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
