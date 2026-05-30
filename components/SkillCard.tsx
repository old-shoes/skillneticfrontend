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
  categoryColor?: string;
  type?: string;
  tags: SkillCardTag[];
  favoriteCount: number;
  viewCount: number;
  isFavorited?: boolean;
  isFeatured?: boolean;
  authorName?: string;
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

export function SkillCard({ skill, variant, favoriteLabel, onOpen, onFavorite, maxTags }: Props) {
  const tone = pickTone(skill);
  const icon = pickIcon(skill);
  const tagCount = maxTags ?? (variant === "recommended" ? 3 : 2);
  const tags = skill.tags.slice(0, tagCount);
  const showBookmark = Boolean(onFavorite);
  const authorName = skill.authorName?.trim();
  const isCompact = variant === "compact";
  const isRecommended = variant === "recommended";

  return (
    <article
      className={`rounded-[22px] border border-[#edf1f6] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.035)] ${
        isCompact ? "p-4" : "p-4.5"
      } ${isCompact ? "flex gap-4" : ""}`}
    >
      <button
        type="button"
        onClick={onOpen}
        className={`flex shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br ${tone} ${
          isCompact ? "h-14 w-14" : "h-16 w-16"
        }`}
      >
        <img src={icon} alt="" className={`${isCompact ? "h-7 w-7" : "h-8 w-8"} brightness-0 invert`} />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <button type="button" onClick={onOpen} className="min-w-0 text-left">
            <h3 className={`font-semibold text-[#171c28] ${isCompact ? "line-clamp-1 text-[14px]" : "line-clamp-1 text-[15px]"}`}>
              {skill.title}
            </h3>
          </button>
          {showBookmark ? (
            <button
              type="button"
              onClick={() => void onFavorite?.()}
              className={`shrink-0 text-[#9aa3b2] transition hover:text-[#4f46ff] ${
                skill.isFavorited ? "text-[#4f46ff]" : ""
              }`}
              aria-label={favoriteLabel}
            >
              <StatIcon kind="bookmark" />
            </button>
          ) : null}
        </div>

        <p className={`line-clamp-2 text-[12px] leading-6 text-[#5f6779] ${isCompact ? "mt-1" : "mt-1.5"}`}>
          {skill.summary}
        </p>

        <div className={`flex flex-wrap gap-2 ${isCompact ? "mt-3" : "mt-3.5"}`}>
          {tags.map((tag) => (
            <span
              key={tag.id}
              className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                tag.type === "scene" ? "bg-[#ecfaf3] text-[#3fa06a]" : "bg-[#f3f5ff] text-[#4f46ff]"
              }`}
            >
              {tag.name}
            </span>
          ))}
        </div>

        {isRecommended ? (
          <div className="mt-3.5 flex items-center gap-4 text-[11px] text-[#6b7283]">
            <span className="inline-flex items-center gap-2">
              <StatIcon kind="favorite" />
              {formatMetric(skill.favoriteCount)}
            </span>
            <span className="inline-flex items-center gap-2">
              <StatIcon kind="view" />
              {formatMetric(skill.viewCount)}
            </span>
            <span className="inline-flex items-center gap-2 text-[#98a1b2]">
              <span className="text-[15px]">♡</span>
              {Math.max(1, Math.round(skill.favoriteCount / 4))}
            </span>
          </div>
        ) : (
          <div className="mt-4 flex items-center justify-between gap-3">
            {authorName ? (
              <div className="flex min-w-0 items-center gap-2">
                <span className="inline-flex h-5.5 w-5.5 items-center justify-center rounded-full bg-gradient-to-br from-[#6f82ff] to-[#5f66f4] text-[10px] font-semibold text-white">
                  {getAuthorInitials(authorName)}
                </span>
                <span className="truncate text-[12px] text-[#5f6779]">{authorName}</span>
                <span className="text-[#4f46ff]">✔</span>
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
