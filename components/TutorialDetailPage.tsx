"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { LocalizedLink } from "@/components/LocalizedLink";
import {
  incrementTutorialFavorite,
  incrementTutorialLike,
  incrementTutorialView,
  submitTutorialHelpfulVote,
} from "@/lib/api/tutorial-detail";
import { trackEvent } from "@/lib/api/track";
import { getMessages, localeNumberFormat, type Locale, withLocale } from "@/lib/i18n";
import type { TutorialDetailProps, TutorialRelatedItem } from "@/lib/types/tutorial-detail";

type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
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
      return {
        id: slugifyHeading(text),
        text,
        level,
      };
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

function SidebarCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/80 bg-white/92 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function DetailInfoCard({
  title,
  children,
  tone = "blue",
}: {
  title: string;
  children: ReactNode;
  tone?: "blue" | "amber";
}) {
  const toneClass =
    tone === "amber"
      ? "border-amber-100 bg-amber-50/80"
      : "border-brand-100 bg-brand-50/80";

  return (
    <section className={`mt-8 rounded-[24px] border px-5 py-5 ${toneClass}`}>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-3 text-sm leading-7 text-slate-700">{children}</div>
    </section>
  );
}

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="rounded-[20px] border border-slate-200 bg-white px-5 py-4">
      <summary className="cursor-pointer list-none text-base font-semibold text-slate-900">
        {question}
      </summary>
      <p className="mt-3 text-sm leading-7 text-slate-600">{answer}</p>
    </details>
  );
}

function RelatedTutorialCard({
  locale,
  item,
  label,
  pageUrl,
}: {
  locale: Locale;
  item: TutorialRelatedItem;
  label: string;
  pageUrl: string;
}) {
  return (
    <LocalizedLink
      href={`/tutorials/${item.slug}`}
      onClick={() => {
        trackEvent({
          eventName: "tutorial_detail_related_click",
          pageUrl,
          targetType: "tutorial",
          targetId: item.id,
          extra: {
            slug: item.slug,
            source: "inline",
          },
        });
      }}
      className="group rounded-[24px] border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_16px_40px_rgba(37,99,235,0.08)]"
    >
      <div className="overflow-hidden rounded-2xl bg-slate-50">
        {item.coverImage ? (
          <Image src={item.coverImage} alt={item.title} width={320} height={160} className="h-36 w-full object-cover" />
        ) : (
          <div className="flex h-36 items-center justify-center bg-brand-50 text-3xl font-semibold text-brand-600">
            {item.title.slice(0, 1)}
          </div>
        )}
      </div>
      <h3 className="mt-4 line-clamp-2 text-base font-semibold leading-7 text-slate-900">{item.title}</h3>
      {item.summary ? <p className="mt-2 line-clamp-3 text-sm leading-7 text-slate-500">{item.summary}</p> : null}
      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-500">
        <span>{locale === "en" ? `${item.readTimeMinutes} min read` : `${item.readTimeMinutes} 分钟阅读`}</span>
        <span>{formatMetric(locale, item.viewCount)} {locale === "en" ? "views" : "阅读"}</span>
      </div>
      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600">
        {label}
        <Image src="/icons/tutorials/arrow-right.svg" alt="" width={16} height={16} className="h-4 w-4" />
      </div>
    </LocalizedLink>
  );
}

function DetailSidebarRelatedList({
  locale,
  items,
  pageUrl,
}: {
  locale: Locale;
  items: TutorialRelatedItem[];
  pageUrl: string;
}) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <LocalizedLink
          key={item.id}
          href={`/tutorials/${item.slug}`}
          onClick={() => {
            trackEvent({
              eventName: "tutorial_detail_related_click",
              pageUrl,
              targetType: "tutorial",
              targetId: item.id,
              extra: {
                slug: item.slug,
                source: "sidebar",
              },
            });
          }}
          className="flex gap-3 rounded-2xl transition hover:bg-slate-50"
        >
          <div className="overflow-hidden rounded-2xl bg-slate-50">
            {item.coverImage ? (
              <Image src={item.coverImage} alt={item.title} width={80} height={80} className="h-20 w-20 object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center bg-brand-50 text-brand-600">{item.title.slice(0, 1)}</div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-sm font-semibold leading-6 text-slate-900">{item.title}</h3>
            <p className="mt-1 text-xs text-slate-400">
              {locale === "en" ? `${item.readTimeMinutes} min read` : `${item.readTimeMinutes} 分钟阅读`} · {formatMetric(locale, item.viewCount)} {locale === "en" ? "views" : "阅读"}
            </p>
          </div>
        </LocalizedLink>
      ))}
    </div>
  );
}

export function TutorialDetailPage({ locale, tutorial }: TutorialDetailProps) {
  const copy = getMessages(locale).tutorials.detail;
  const tocItems = extractTocItems(tutorial.contentMarkdown);
  const pageUrl = withLocale(locale, `/tutorials/${tutorial.slug}`);
  const primaryPrompt = tutorial.promptBlocks[0] || null;
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [helpfulVote, setHelpfulVote] = useState<"yes" | "no" | null>(null);
  const [favoriteCount, setFavoriteCount] = useState(tutorial.favoriteCount);
  const [likeCount, setLikeCount] = useState(tutorial.likeCount);
  const [favorited, setFavorited] = useState(false);
  const [liked, setLiked] = useState(false);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) {
      return;
    }

    trackedRef.current = true;
    trackEvent({
      eventName: "tutorial_detail_page_view",
      pageUrl,
      targetType: "tutorial",
      targetId: tutorial.id,
      extra: {
        slug: tutorial.slug,
        locale,
      },
    });
    void incrementTutorialView(tutorial.id);
  }, [locale, pageUrl, tutorial.id, tutorial.slug]);

  async function copyText(key: string, text: string, extra: Record<string, unknown>) {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    window.setTimeout(() => {
      setCopiedKey((current) => (current === key ? null : current));
    }, 1500);
    trackEvent({
      eventName: key.startsWith("prompt:") ? "tutorial_detail_prompt_copy" : "tutorial_detail_copy_link_click",
      pageUrl,
      targetType: key.startsWith("prompt:") ? "prompt_block" : "tutorial",
      targetId: key.startsWith("prompt:") ? String(extra.promptId || tutorial.id) : tutorial.id,
      extra,
    });
  }

  async function handleShare() {
    const sharePayload = {
      title: tutorial.title,
      text: tutorial.summary,
      url: window.location.href,
    };

    trackEvent({
      eventName: "tutorial_detail_share_click",
      pageUrl,
      targetType: "tutorial",
      targetId: tutorial.id,
      extra: {
        action: "share",
      },
    });

    if (navigator.share) {
      try {
        await navigator.share(sharePayload);
        return;
      } catch {
        return;
      }
    }

    await copyText("share-link", window.location.href, { action: "share-copy-link" });
  }

  const markdownComponents: Components = {
    h2({ children, node: _node, ...props }) {
      const text = flattenText(children);
      return (
        <h2 id={slugifyHeading(text)} className="mt-10 scroll-mt-24 text-[32px] font-semibold tracking-tight text-slate-900" {...props}>
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
    li({ children, node: _node, ...props }) {
      return <li {...props}>{children}</li>;
    },
    blockquote({ children, node: _node, ...props }) {
      return (
        <blockquote
          className="mt-6 rounded-[24px] border border-brand-100 bg-brand-50/70 px-5 py-4 text-base leading-8 text-slate-700"
          {...props}
        >
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

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#f5f8ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]">
          <article className="rounded-[32px] border border-white/80 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8">
            <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
              <LocalizedLink href="/" className="hover:text-brand-600">
                {copy.breadcrumbHome}
              </LocalizedLink>
              <span>›</span>
              <LocalizedLink href="/tutorials" className="hover:text-brand-600">
                {copy.breadcrumbList}
              </LocalizedLink>
              <span>›</span>
              <LocalizedLink href={`/tutorials?category=${tutorial.category.slug}`} className="hover:text-brand-600">
                {tutorial.category.name}
              </LocalizedLink>
              <span>›</span>
              <span className="line-clamp-1 text-slate-500">{tutorial.title}</span>
            </nav>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">{tutorial.category.name}</span>
              {tutorial.tags.slice(0, 2).map((tag) => (
                <span key={tag.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                  {tag.name}
                </span>
              ))}
              {tutorial.isBeginner ? (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">{copy.beginner}</span>
              ) : null}
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">{tutorial.title}</h1>
            <p className="mt-5 max-w-4xl text-base leading-8 text-slate-600 sm:text-lg">{tutorial.summary}</p>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-600">
                  {tutorial.author.name.slice(0, 2)}
                </span>
                <div>
                  <p className="font-medium text-slate-700">{tutorial.author.name}</p>
                  <p>{tutorial.author.title}</p>
                </div>
              </div>
              <span>{copy.updatedAt} {formatDate(locale, tutorial.updatedAt)}</span>
              <span className="inline-flex items-center gap-1.5">
                <Image src="/icons/tutorials/clock.svg" alt="" width={16} height={16} className="h-4 w-4" />
                {tutorial.readTimeMinutes} {copy.readTime}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Image src="/icons/tutorials/eye.svg" alt="" width={16} height={16} className="h-4 w-4" />
                {formatMetric(locale, tutorial.viewCount)} {copy.views}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Image src="/icons/tutorials/star.svg" alt="" width={16} height={16} className="h-4 w-4" />
                {formatMetric(locale, favoriteCount)} {copy.favorites}
              </span>
            </div>

            <section className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] bg-slate-50 p-5">
                <h2 className="text-base font-semibold text-slate-900">{copy.learnTitle}</h2>
                <ul className="mt-4 space-y-3">
                  {tutorial.learningPoints.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-7 text-slate-600">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-brand-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-5">
                <h2 className="text-base font-semibold text-slate-900">{copy.suitableTitle}</h2>
                <ul className="mt-4 space-y-3">
                  {tutorial.suitableFor.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-7 text-slate-600">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-amber-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="mt-8 flex flex-wrap items-center gap-3 border-y border-slate-100 py-4">
              <button
                type="button"
                onClick={async () => {
                  if (favorited) {
                    return;
                  }
                  setFavorited(true);
                  setFavoriteCount((current) => current + 1);
                  trackEvent({
                    eventName: "tutorial_detail_favorite_click",
                    pageUrl,
                    targetType: "tutorial",
                    targetId: tutorial.id,
                    extra: { action: "favorite" },
                  });
                  try {
                    await incrementTutorialFavorite(tutorial.id);
                  } catch {
                    setFavorited(false);
                    setFavoriteCount((current) => Math.max(tutorial.favoriteCount, current - 1));
                  }
                }}
                className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                  favorited
                    ? "border border-brand-100 bg-brand-50 text-brand-600"
                    : "border border-slate-200 text-slate-600 hover:border-brand-200 hover:text-brand-600"
                }`}
              >
                {copy.favoriteAction}
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-brand-200 hover:text-brand-600"
              >
                {copy.shareAction}
              </button>
              <button
                type="button"
                onClick={() => copyText("page-link", window.location.href, { action: "copy-link" })}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-brand-200 hover:text-brand-600"
              >
                {copiedKey === "page-link" ? copy.copied : copy.copyLinkAction}
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (liked) {
                    return;
                  }
                  setLiked(true);
                  setLikeCount((current) => current + 1);
                  trackEvent({
                    eventName: "tutorial_detail_like_click",
                    pageUrl,
                    targetType: "tutorial",
                    targetId: tutorial.id,
                    extra: { action: "like" },
                  });
                  try {
                    await incrementTutorialLike(tutorial.id);
                  } catch {
                    setLiked(false);
                    setLikeCount((current) => Math.max(tutorial.likeCount, current - 1));
                  }
                }}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
                  liked
                    ? "border border-brand-100 bg-brand-100 text-brand-700"
                    : "border border-brand-100 bg-brand-50 text-brand-600"
                }`}
              >
                {copy.likeAction} ({likeCount})
              </button>
            </section>

            <div className="mt-8">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {tutorial.contentMarkdown}
              </ReactMarkdown>
            </div>

            <DetailInfoCard title={copy.tipCardTitle}>
              {copy.tipCardDescription}
            </DetailInfoCard>

            <DetailInfoCard title={copy.frameworkCardTitle} tone="amber">
              <ol className="list-decimal space-y-2 pl-5">
                {copy.frameworkSteps.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </DetailInfoCard>

            {primaryPrompt ? (
              <section className="mt-8 rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{copy.compareTitle}</h2>
                    <p className="mt-2 text-sm leading-7 text-slate-500">{copy.compareDescription}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      copyText(`prompt:${primaryPrompt.id}`, primaryPrompt.content, {
                        tutorialId: tutorial.id,
                        promptId: primaryPrompt.id,
                        title: primaryPrompt.title,
                      })
                    }
                    className="rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white"
                  >
                    {copiedKey === `prompt:${primaryPrompt.id}` ? copy.copied : copy.copyPrompt}
                  </button>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[20px] border border-rose-100 bg-rose-50/70 p-4">
                    <h3 className="text-sm font-semibold text-rose-700">{copy.compareWeakTitle}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{copy.compareWeakDescription}</p>
                  </div>
                  <div className="rounded-[20px] border border-emerald-100 bg-emerald-50/70 p-4">
                    <h3 className="text-sm font-semibold text-emerald-700">{copy.compareStrongTitle}</h3>
                    <pre className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                      {primaryPrompt.content}
                    </pre>
                  </div>
                </div>
              </section>
            ) : null}

            <section className="mt-8">
              <h2 className="text-[28px] font-semibold tracking-tight text-slate-900">{copy.faqTitle}</h2>
              <div className="mt-5 space-y-3">
                {copy.faqItems.map((item) => (
                  <FAQItem key={item.question} question={item.question} answer={item.answer} />
                ))}
              </div>
            </section>

            {tutorial.relatedTutorials.length > 0 ? (
              <section className="mt-12">
                <h2 className="text-[28px] font-semibold tracking-tight text-slate-900">{copy.advancedTitle}</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {tutorial.relatedTutorials.map((item) => (
                    <RelatedTutorialCard
                      key={item.id}
                      locale={locale}
                      item={item}
                      label={copy.readArticle}
                      pageUrl={pageUrl}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <section className="mt-10 rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-slate-700">{copy.helpfulTitle}</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      setHelpfulVote("yes");
                      trackEvent({
                        eventName: "tutorial_detail_helpful_click",
                        pageUrl,
                        targetType: "tutorial",
                        targetId: tutorial.id,
                        extra: { vote: "yes" },
                      });
                      try {
                        await submitTutorialHelpfulVote(tutorial.id, "yes");
                      } catch {
                        setHelpfulVote(null);
                      }
                    }}
                    className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                      helpfulVote === "yes" ? "bg-brand-500 text-white" : "border border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {copy.helpfulYes}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setHelpfulVote("no");
                      trackEvent({
                        eventName: "tutorial_detail_helpful_click",
                        pageUrl,
                        targetType: "tutorial",
                        targetId: tutorial.id,
                        extra: { vote: "no" },
                      });
                      try {
                        await submitTutorialHelpfulVote(tutorial.id, "no");
                      } catch {
                        setHelpfulVote(null);
                      }
                    }}
                    className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                      helpfulVote === "no" ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {copy.helpfulNo}
                  </button>
                </div>
              </div>
            </section>

            <section className="mt-8 grid gap-4 border-t border-slate-100 pt-6 md:grid-cols-2">
              <div className="rounded-[24px] border border-slate-200 p-5">
                <p className="text-sm font-medium text-slate-400">{copy.prev}</p>
                {tutorial.prevNext.prev ? (
                  <LocalizedLink
                    href={`/tutorials/${tutorial.prevNext.prev.slug}`}
                    onClick={() => {
                      trackEvent({
                        eventName: "tutorial_detail_prev_next_click",
                        pageUrl,
                        targetType: "tutorial",
                        targetId: tutorial.id,
                        extra: { direction: "prev", slug: tutorial.prevNext.prev?.slug },
                      });
                    }}
                    className="mt-2 block text-lg font-semibold leading-8 text-slate-900 hover:text-brand-600"
                  >
                    {tutorial.prevNext.prev.title}
                  </LocalizedLink>
                ) : (
                  <p className="mt-2 text-sm text-slate-400">-</p>
                )}
              </div>
              <div className="rounded-[24px] border border-slate-200 p-5 text-left md:text-right">
                <p className="text-sm font-medium text-slate-400">{copy.next}</p>
                {tutorial.prevNext.next ? (
                  <LocalizedLink
                    href={`/tutorials/${tutorial.prevNext.next.slug}`}
                    onClick={() => {
                      trackEvent({
                        eventName: "tutorial_detail_prev_next_click",
                        pageUrl,
                        targetType: "tutorial",
                        targetId: tutorial.id,
                        extra: { direction: "next", slug: tutorial.prevNext.next?.slug },
                      });
                    }}
                    className="mt-2 block text-lg font-semibold leading-8 text-slate-900 hover:text-brand-600"
                  >
                    {tutorial.prevNext.next.title}
                  </LocalizedLink>
                ) : (
                  <p className="mt-2 text-sm text-slate-400">-</p>
                )}
              </div>
            </section>
          </article>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {tocItems.length > 0 ? (
              <SidebarCard title={copy.articleToc}>
                <ol className="space-y-3 text-sm leading-7 text-slate-600">
                  {tocItems.map((item, index) => (
                    <li key={item.id} className={`flex gap-3 ${item.level === 3 ? "pl-5" : ""}`}>
                      <span className="font-semibold text-brand-600">{index + 1}.</span>
                      <a
                        href={`#${item.id}`}
                        onClick={() => {
                          trackEvent({
                            eventName: "tutorial_detail_toc_click",
                            pageUrl,
                            targetType: "toc",
                            targetId: item.id,
                            extra: { title: item.text, level: item.level },
                          });
                        }}
                        className="hover:text-brand-600"
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </SidebarCard>
            ) : null}

            {primaryPrompt ? (
              <SidebarCard title={copy.promptExamples}>
                <p className="text-sm leading-7 text-slate-500">{copy.promptDescription}</p>
                <div className="mt-4 rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-base font-semibold text-slate-900">{primaryPrompt.title}</h3>
                  {primaryPrompt.description ? <p className="mt-1 text-sm leading-6 text-slate-500">{primaryPrompt.description}</p> : null}
                  <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-2xl bg-white p-4 text-sm leading-7 text-slate-700">
                    {primaryPrompt.content}
                  </pre>
                  <button
                    type="button"
                    onClick={() =>
                      copyText(`prompt:${primaryPrompt.id}`, primaryPrompt.content, {
                        tutorialId: tutorial.id,
                        promptId: primaryPrompt.id,
                        title: primaryPrompt.title,
                      })
                    }
                    className="mt-4 w-full rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white"
                  >
                    {copiedKey === `prompt:${primaryPrompt.id}` ? copy.copied : copy.copyPrompt}
                  </button>
                </div>
              </SidebarCard>
            ) : null}

            {tutorial.relatedTutorials.length > 0 ? (
              <SidebarCard title={copy.relatedTitle}>
                <DetailSidebarRelatedList locale={locale} items={tutorial.relatedTutorials.slice(0, 4)} pageUrl={pageUrl} />
              </SidebarCard>
            ) : null}

            <SidebarCard title={copy.hotTagsTitle}>
              <div className="flex flex-wrap gap-2">
                {tutorial.tags.map((tag) => (
                  <LocalizedLink
                    key={tag.id}
                    href={`/tutorials?tag=${tag.slug}`}
                    onClick={() => {
                      trackEvent({
                        eventName: "tutorial_detail_tag_click",
                        pageUrl,
                        targetType: "tag",
                        targetId: tag.id,
                        extra: { slug: tag.slug, title: tag.name },
                      });
                    }}
                    className="rounded-full bg-slate-50 px-3 py-1.5 text-sm font-medium text-brand-600 ring-1 ring-slate-100 transition hover:bg-brand-50"
                  >
                    {tag.name}
                  </LocalizedLink>
                ))}
              </div>
            </SidebarCard>

            <SidebarCard title={copy.subscribeTitle}>
              <p className="text-sm leading-7 text-slate-500">{copy.subscribeDescription}</p>
              <form
                className="mt-4 flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                }}
              >
                <input
                  placeholder={copy.emailPlaceholder}
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                  name="email"
                />
                <button className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white">{copy.subscribe}</button>
              </form>
            </SidebarCard>
          </aside>
        </div>
      </div>
    </main>
  );
}
