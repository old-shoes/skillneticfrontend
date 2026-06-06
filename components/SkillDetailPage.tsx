"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { LocalizedLink } from "@/components/LocalizedLink";
import { favoriteSkill, unfavoriteSkill } from "@/lib/api/skills";
import { trackEvent } from "@/lib/api/track";
import { getMessages, localeNumberFormat, type Locale, withLocale } from "@/lib/i18n";
import type { SkillDetail, SkillTag } from "@/lib/types/skills";

type Props = {
  locale: Locale;
  skill: SkillDetail;
};

type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
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
  document: "/icons/document.svg",
  group: "/icons/group.svg",
  resume: "/icons/resume.svg",
  chart: "/icons/chart.svg",
  cube: "/icons/cube.svg",
  email: "/icons/email.svg",
  play: "/icons/play.svg",
  "code-block": "/icons/code-block.svg",
  calendar: "/icons/calendar.svg",
};

function slugifyHeading(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/[^\p{Letter}\p{Number}\u4e00-\u9fa5]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function flattenText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(flattenText).join("");
  }
  if (children && typeof children === "object" && "props" in children) {
    const props = children.props as { children?: ReactNode };
    return flattenText(props.children);
  }
  return "";
}

function extractTocItems(markdown: string): TocItem[] {
  return markdown
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("## ") || line.startsWith("### "))
    .map((line) => {
      const level = line.startsWith("### ") ? 3 : 2;
      const text = line.replace(/^###?\s+/, "").trim();
      return { id: slugifyHeading(text), text, level };
    });
}

function formatMetric(locale: Locale, value: number): string {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toLocaleString(localeNumberFormat[locale]);
}

function formatDate(locale: Locale, value: string): string {
  return new Date(value).toLocaleDateString(localeNumberFormat[locale], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function DetailPill({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{children}</span>;
}

function markdownComponents(): Components {
  return {
    h2({ children, node: _node, ...props }) {
      const text = flattenText(children);
      return (
        <h2 id={slugifyHeading(text)} className="mt-10 scroll-mt-24 text-[30px] font-semibold tracking-tight text-slate-900" {...props}>
          {children}
        </h2>
      );
    },
    h3({ children, node: _node, ...props }) {
      return (
        <h3 className="mt-6 text-xl font-semibold text-slate-900" {...props}>
          {children}
        </h3>
      );
    },
    p({ children, node: _node, ...props }) {
      return (
        <p className="mt-4 text-base leading-8 text-slate-600" {...props}>
          {children}
        </p>
      );
    },
    ul({ children, node: _node, ...props }) {
      return (
        <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-8 text-slate-600" {...props}>
          {children}
        </ul>
      );
    },
    ol({ children, node: _node, ...props }) {
      return (
        <ol className="mt-4 list-decimal space-y-2 pl-6 text-base leading-8 text-slate-600" {...props}>
          {children}
        </ol>
      );
    },
    blockquote({ children, node: _node, ...props }) {
      return (
        <blockquote className="mt-6 rounded-[24px] border border-brand-100 bg-brand-50/70 px-5 py-4 text-base leading-8 text-slate-700" {...props}>
          {children}
        </blockquote>
      );
    },
    code({ children, node: _node, ...props }) {
      return (
        <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[0.95em] text-slate-800" {...props}>
          {children}
        </code>
      );
    },
    a({ children, href, node: _node, ...props }) {
      return (
        <a href={href} target="_blank" rel="noreferrer" className="text-brand-600 underline underline-offset-4" {...props}>
          {children}
        </a>
      );
    },
  };
}

function tagTone(tag: SkillTag) {
  if (tag.type === "scene") {
    return "bg-cyan-50 text-cyan-600";
  }
  if (tag.type === "type") {
    return "bg-orange-50 text-orange-500";
  }
  return "bg-slate-100 text-slate-600";
}

function downloadMarkdownFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function SkillDetailPage({ locale, skill }: Props) {
  const copy = getMessages(locale).skills;
  const pageUrl = withLocale(locale, `/skills/${skill.slug}`);
  const tocItems = useMemo(() => extractTocItems(skill.contentMarkdown), [skill.contentMarkdown]);
  const [favoriteCount, setFavoriteCount] = useState(skill.favoriteCount);
  const [isFavorited, setIsFavorited] = useState(Boolean(skill.isFavorited));
  const [toast, setToast] = useState("");
  const iconSrc = skill.coverIcon ? skillIconMap[skill.coverIcon] : skillIconMap[skill.type];

  useEffect(() => {
    trackEvent({
      eventName: "skills_card_click",
      pageUrl,
      targetType: "skill",
      targetId: skill.id,
      extra: {
        slug: skill.slug,
        title: skill.title,
        source: "skill_detail",
      },
    });
  }, [pageUrl, skill.id, skill.slug, skill.title]);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = window.setTimeout(() => {
      setToast("");
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function handleFavoriteToggle() {
    try {
      trackEvent({
        eventName: "skills_favorite_click",
        pageUrl,
        targetType: "skill",
        targetId: skill.id,
        extra: {
          slug: skill.slug,
          title: skill.title,
          source: "skill_detail",
        },
      });
      const result = isFavorited ? await unfavoriteSkill(skill.id) : await favoriteSkill(skill.id);
      setIsFavorited(result.favorited);
      setFavoriteCount(result.favoriteCount);
      setToast(
        result.favorited
          ? (locale === "en" ? "Favorited" : "已收藏")
          : (locale === "en" ? "Removed from favorites" : "已取消收藏"),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.toLowerCase().includes("unauthorized")) {
        setToast(locale === "en" ? "Please log in first" : "请先登录");
        return;
      }
      setToast(locale === "en" ? "Favorite failed, please try again" : "收藏失败，请稍后重试");
    }
  }

  function handleDownloadMarkdown() {
    trackEvent({
      eventName: "skill_detail_download_markdown",
      pageUrl,
      targetType: "skill",
      targetId: skill.id,
      extra: {
        slug: skill.slug,
        title: skill.title,
      },
    });
    downloadMarkdownFile(`${skill.slug || skill.id}.md`, skill.contentMarkdown || "");
    setToast(copy.detail.downloadSuccess);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#f5f8ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      {toast ? (
        <div className="pointer-events-none fixed right-4 top-20 z-50 rounded-2xl border border-emerald-200 bg-white/96 px-4 py-3 text-sm font-medium text-emerald-700 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur sm:right-6">
          {toast}
        </div>
      ) : null}
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]">
          <article className="rounded-[32px] border border-white/80 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8">
            <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
              <LocalizedLink href="/" className="hover:text-brand-600">Home</LocalizedLink>
              <span>›</span>
              <LocalizedLink href="/skills" className="hover:text-brand-600">{locale === "en" ? "Skills" : "技能库"}</LocalizedLink>
              <span>›</span>
              <LocalizedLink href={`/skills?category=${skill.category.slug}`} className="hover:text-brand-600">
                {skill.category.name}
              </LocalizedLink>
              <span>›</span>
              <span className="line-clamp-1 text-slate-500">{skill.title}</span>
            </nav>

            <div className="mt-6 flex items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-brand-50 to-cyan-50">
                {iconSrc ? (
                  <Image src={iconSrc} alt={skill.title} width={32} height={32} className="h-8 w-8" />
                ) : (
                  <span className="text-xl font-semibold text-brand-600">{skill.title.slice(0, 1)}</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">{skill.category.name}</span>
                  {skill.sourceType === "github" ? (
                    <span className="rounded-full bg-[#eef3ff] px-3 py-1 text-xs font-semibold text-[#4f46ff]">
                      {locale === "en" ? "GitHub Imported" : "GitHub 收录"}
                    </span>
                  ) : null}
                  {skill.isHot ? <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-500">Hot</span> : null}
                  {skill.isFeatured ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">Featured</span> : null}
                </div>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">{skill.title}</h1>
                <p className="mt-4 max-w-4xl text-base leading-8 text-slate-600 sm:text-lg">{skill.summary}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
              {skill.authorName ? <span>{locale === "en" ? "Uploaded by" : "上传者"} {skill.authorName}</span> : null}
              {skill.sourceType === "github" ? <span>{locale === "en" ? "Source" : "来源"}: GitHub</span> : null}
              {skill.sourceType === "github" && skill.sourceName ? <span>{locale === "en" ? "Repository" : "原仓库"}: {skill.sourceName}</span> : null}
              {skill.sourceType === "github" && skill.originalAuthor ? <span>{locale === "en" ? "Author" : "原作者"}: {skill.originalAuthor}</span> : null}
              {skill.sourceType === "github" && skill.license ? <span>License: {skill.license}</span> : null}
              {skill.sourceType === "github" && skill.sourceUrl ? (
                <a href={skill.sourceUrl} target="_blank" rel="noreferrer" className="font-medium text-brand-600 underline underline-offset-4">
                  {locale === "en" ? "Open GitHub Repo" : "查看 GitHub 仓库"}
                </a>
              ) : null}
              <span>{locale === "en" ? "Updated" : "更新于"} {formatDate(locale, skill.updatedAt)}</span>
              <span>{formatMetric(locale, skill.viewCount)} {locale === "en" ? "views" : "浏览"}</span>
              <span>{formatMetric(locale, favoriteCount)} {locale === "en" ? "favorites" : "收藏"}</span>
              {skill.useCase ? <span>{locale === "en" ? "Use case" : "使用场景"}: {skill.useCase}</span> : null}
            </div>

            <section className="mt-8 rounded-[24px] bg-slate-50 p-5">
              <div className="flex flex-wrap gap-2">
                {skill.tags.map((tag) => (
                  <span key={tag.id} className={`rounded-full px-3 py-1 text-xs font-semibold ${tagTone(tag)}`}>
                    {tag.name}
                  </span>
                ))}
                <DetailPill>{skill.type}</DetailPill>
                <DetailPill>{skill.difficulty}</DetailPill>
                {skill.recommendedModels.map((model) => (
                  <DetailPill key={model}>{model}</DetailPill>
                ))}
              </div>
            </section>

            <section className="mt-8 flex flex-wrap items-center gap-3 border-y border-slate-100 py-4">
              <button
                type="button"
                onClick={() => void handleFavoriteToggle()}
                className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                  isFavorited
                    ? "border border-brand-100 bg-brand-50 text-brand-600"
                    : "border border-slate-200 text-slate-600 hover:border-brand-200 hover:text-brand-600"
                }`}
              >
                {isFavorited ? (locale === "en" ? "Favorited" : "已收藏") : copy.card.favorite}
              </button>
              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-brand-200 hover:text-brand-600"
              >
                {copy.detail.downloadMarkdown}
              </button>
            </section>

            <div className="mt-8">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents()}>
                {skill.contentMarkdown}
              </ReactMarkdown>
            </div>
          </article>

          <aside className="space-y-6">
            <section className="rounded-[28px] border border-white/80 bg-white/92 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
              <h2 className="text-xl font-semibold text-slate-900">{locale === "en" ? "Quick Info" : "快速信息"}</h2>
              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <div className="flex items-start justify-between gap-3">
                  <span>{locale === "en" ? "Category" : "分类"}</span>
                  <span className="text-right font-medium text-slate-900">{skill.category.name}</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span>{locale === "en" ? "Type" : "类型"}</span>
                  <span className="text-right font-medium text-slate-900">{skill.type}</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span>{locale === "en" ? "Difficulty" : "难度"}</span>
                  <span className="text-right font-medium text-slate-900">{skill.difficulty}</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span>{locale === "en" ? "Favorites" : "收藏"}</span>
                  <span className="text-right font-medium text-slate-900">{formatMetric(locale, favoriteCount)}</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span>{locale === "en" ? "Views" : "浏览"}</span>
                  <span className="text-right font-medium text-slate-900">{formatMetric(locale, skill.viewCount)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className="mt-5 w-full rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                {copy.detail.downloadMarkdown}
              </button>
            </section>

            {tocItems.length > 0 ? (
              <section className="rounded-[28px] border border-white/80 bg-white/92 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
                <h2 className="text-xl font-semibold text-slate-900">{locale === "en" ? "Outline" : "目录"}</h2>
                <div className="mt-5 space-y-3">
                  {tocItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block text-sm text-slate-600 hover:text-brand-600 ${item.level === 3 ? "pl-4" : ""}`}
                    >
                      {item.text}
                    </a>
                  ))}
                </div>
              </section>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}
