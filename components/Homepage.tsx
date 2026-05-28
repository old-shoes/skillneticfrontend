"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { HeroButton } from "@/components/HeroButton";
import { LocalizedLink } from "@/components/LocalizedLink";
import { favoriteSkill, unfavoriteSkill } from "@/lib/api/skills";
import { trackEvent } from "@/lib/api/track";
import { getMessages, localeNumberFormat, type Locale, withLocale } from "@/lib/i18n";
import type { HomepageData, HomepageSkill } from "@/lib/types/homepage";

type Props = {
  data: HomepageData;
  locale: Locale;
};

const chipStyles: Record<string, string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  orange: "bg-orange-50 text-orange-700 ring-orange-100",
  purple: "bg-violet-50 text-violet-700 ring-violet-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  cyan: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

const categoryIconMap: Record<string, string> = {
  writing: "/icons/category-writing.svg",
  coding: "/icons/category-coding.svg",
  office: "/icons/category-office.svg",
  design: "/icons/category-design.svg",
  marketing: "/icons/category-marketing.svg",
  learning: "/icons/category-learning.svg",
  video: "/icons/category-video.svg",
  automation: "/icons/category-automation.svg",
};

const skillIconMap: Record<string, string> = {
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

const statIconMap: Record<string, string> = {
  favorites: "/icons/bookmark.svg",
  templates: "/icons/cube.svg",
  visits: "/icons/users.svg",
};

function SectionTitle({
  title,
  actionLabel,
  actionHref,
}: {
  title: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-3 text-[22px] font-semibold text-slate-900">
        <span className="h-6 w-1 rounded-full bg-brand-500" />
        {title}
      </h2>
      {actionLabel && actionHref ? (
        <LocalizedLink href={actionHref} className="text-sm font-medium text-slate-500 hover:text-brand-600">
          <span className="inline-flex items-center gap-1.5">
            {actionLabel}
            <BoxIcon src="/icons/arrow-right.svg" alt="" size={10} boxClassName="h-4 w-4" />
          </span>
        </LocalizedLink>
      ) : null}
    </div>
  );
}

function HeroIcon({ label }: { label: string }) {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/95 text-sm font-semibold text-brand-600 shadow-sm ring-1 ring-white/80">
      {label}
    </span>
  );
}

function CategoryIcon({
  slug,
  name,
  size,
}: {
  slug: string;
  name: string;
  size: number;
}) {
  const src = categoryIconMap[slug];

  if (!src) {
    return <HeroIcon label={name.slice(0, 1)} />;
  }

  return <Image src={src} alt={name} width={size} height={size} className="h-auto w-auto" />;
}

function AssetIcon({
  src,
  alt,
  size,
}: {
  src: string;
  alt: string;
  size: number;
}) {
  return <Image src={src} alt={alt} width={size} height={size} className="h-auto w-auto" />;
}

function BoxIcon({
  src,
  alt,
  boxClassName,
  size,
}: {
  src: string;
  alt: string;
  boxClassName: string;
  size: number;
}) {
  return (
    <span className={`inline-flex items-center justify-center ${boxClassName}`}>
      <AssetIcon src={src} alt={alt} size={size} />
    </span>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
      {children}
    </span>
  );
}

function trackCategoryClick(locale: Locale, category: HomepageData["categories"][number]) {
  trackEvent({
    eventName: "home_category_click",
    pageUrl: withLocale(locale, "/"),
    targetType: "category",
    targetId: category.id,
    extra: {
      slug: category.slug,
      name: category.name,
    },
  });
}

function CategoryCard({
  category,
  locale,
  numberFormat,
}: {
  category: HomepageData["categories"][number];
  locale: Locale;
  numberFormat: string;
}) {
  return (
    <LocalizedLink
      href={`/categories/${category.slug}`}
      onClick={() => trackCategoryClick(locale, category)}
      className="group rounded-[22px] border border-white/70 bg-white/90 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(37,99,235,0.12)]"
    >
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${chipStyles[category.color] ?? chipStyles.blue}`}>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/95 shadow-sm ring-1 ring-white/80">
            <CategoryIcon slug={category.slug} name={category.name} size={26} />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
          <p className="mt-1 line-clamp-none text-sm leading-6 text-slate-500">{category.description}</p>
        </div>
      </div>
      <p className="mt-5 text-sm text-slate-500">
        {locale === "en"
          ? `${category.skillCount.toLocaleString(numberFormat)}+ Skills`
          : `${category.skillCount.toLocaleString(numberFormat)}+ Skill`}
      </p>
    </LocalizedLink>
  );
}

function formatFavoriteCount(locale: Locale, value: number) {
  if (value / 1000 >= 1) {
    return `${(value / 1000).toFixed(1)}k`;
  }

  return value.toLocaleString(localeNumberFormat[locale]);
}

function SkillCard({
  skill,
  locale,
  hotLabel,
  favoriteLabel,
  detailsLabel,
  onFavoriteToggle,
}: {
  skill: HomepageSkill;
  locale: Locale;
  hotLabel: string;
  favoriteLabel: string;
  detailsLabel: string;
  onFavoriteToggle: (skill: HomepageSkill) => Promise<void>;
}) {
  const iconSrc = skill.coverIcon ? skillIconMap[skill.coverIcon] : undefined;

  return (
    <article className="rounded-[22px] border border-white/70 bg-white/95 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
      <div className="mb-4 flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100">
          {iconSrc ? (
            <BoxIcon src={iconSrc} alt={skill.title} size={28} boxClassName="h-11 w-11 rounded-2xl bg-white/90 shadow-sm ring-1 ring-white/80" />
          ) : (
            <HeroIcon label={skill.title.slice(0, 1)} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            {skill.isHot ? <Tag>{hotLabel}</Tag> : null}
            <h3 className="truncate text-lg font-semibold text-slate-900">{skill.title}</h3>
          </div>
          <p className="text-sm leading-6 text-slate-500">{skill.summary}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {skill.tags.map((tag) => (
          <Tag key={tag.id}>{tag.name}</Tag>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 text-sm text-slate-500">
        <span>
          {locale === "en"
            ? `${formatFavoriteCount(locale, skill.favoriteCount)} ${favoriteLabel.toLowerCase()}`
            : `${favoriteLabel} ${formatFavoriteCount(locale, skill.favoriteCount)}`}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void onFavoriteToggle(skill)}
            className={`rounded-xl border px-3 py-2 font-medium transition ${
              skill.isFavorited
                ? "border-brand-200 text-brand-600"
                : "border-slate-200 text-slate-700 hover:border-brand-200 hover:text-brand-600"
            }`}
          >
            {skill.isFavorited ? (locale === "en" ? "Favorited" : "已收藏") : favoriteLabel}
          </button>
          <LocalizedLink
            href={`/skills/${skill.slug}`}
            onClick={() =>
              trackEvent({
                eventName: "home_featured_skill_click",
                pageUrl: withLocale(locale, "/"),
                targetType: "skill",
                targetId: skill.id,
                extra: {
                  slug: skill.slug,
                  title: skill.title,
                },
              })
            }
            className="rounded-xl bg-brand-500 px-3 py-2 font-medium !text-white transition hover:bg-brand-600"
          >
            {detailsLabel}
          </LocalizedLink>
        </div>
      </div>
    </article>
  );
}

function LatestSkillCard({ skill, locale }: { skill: HomepageSkill; locale: Locale }) {
  const iconSrc = skill.coverIcon ? skillIconMap[skill.coverIcon] : undefined;

  return (
    <LocalizedLink
      href={`/skills/${skill.slug}`}
      onClick={() =>
        trackEvent({
          eventName: "home_latest_skill_click",
          pageUrl: withLocale(locale, "/"),
          targetType: "skill",
          targetId: skill.id,
          extra: {
            slug: skill.slug,
            title: skill.title,
          },
        })
      }
      className="rounded-[18px] border border-white/75 bg-white/90 p-4 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(37,99,235,0.12)]"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          {iconSrc ? <BoxIcon src={iconSrc} alt={skill.title} size={18} boxClassName="h-8 w-8 rounded-lg bg-white/90 shadow-sm ring-1 ring-white/80" /> : <HeroIcon label={skill.title.slice(0, 1)} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-sm font-semibold text-slate-900">{skill.title}</h3>
            <span className="inline-flex shrink-0 items-center gap-1 text-xs text-amber-500">
              <BoxIcon src="/icons/star.svg" alt="" size={10} boxClassName="h-3.5 w-3.5" />
              {skill.favoriteCount / 1000 >= 1 ? `${(skill.favoriteCount / 1000).toFixed(1)}k` : skill.favoriteCount}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {skill.tags.slice(0, 2).map((tag) => (
              <span key={tag.id} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                {tag.name}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">{skill.summary}</p>
        </div>
      </div>
    </LocalizedLink>
  );
}

function StatsCard({
  value,
  label,
  description,
  tone,
  iconSrc,
}: {
  value: string;
  label: string;
  description: string;
  tone: string;
  iconSrc: string;
  }) {
  return (
    <div className="flex items-center gap-4 rounded-[22px] border border-white/70 bg-white/90 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
        <BoxIcon src={iconSrc} alt={label} size={18} boxClassName="h-8 w-8 rounded-lg bg-white/90 shadow-sm ring-1 ring-white/80" />
      </div>
      <div>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
        <p className="mt-1 text-sm font-medium text-slate-700">{label}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function formatStatValue(locale: Locale, value: number): string {
  return `${value.toLocaleString(localeNumberFormat[locale])}+`;
}

function HeroIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      <div className="absolute -left-10 top-8 rounded-2xl bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-brand-500/30">
        <AssetIcon src="/icons/prompt-bubble.svg" alt="Prompt" size={68} />
      </div>
      <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 shadow-sm ring-1 ring-white/70">
        <AssetIcon src="/icons/robot.svg" alt="" size={24} />
      </div>
      <div className="absolute -right-4 bottom-10 rounded-2xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700 shadow-sm ring-1 ring-brand-100">
        <AssetIcon src="/icons/code-block.svg" alt="" size={32} />
      </div>
      <div className="absolute -left-8 bottom-12 flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-[0_16px_40px_rgba(15,23,42,0.1)] ring-1 ring-white/80">
        <AssetIcon src="/icons/robot.svg" alt="" size={38} />
      </div>
      <div className="relative rounded-[34px] border border-white/80 bg-white/90 p-4 shadow-[0_30px_90px_rgba(37,99,235,0.16)] backdrop-blur">
        <div className="rounded-[28px] border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/icons/skillnetic_app_icon_card.png"
                alt="skillnetic.ai"
                width={285}
                height={295}
                className="h-6 w-6 rounded-lg"
              />
              <span className="text-sm font-semibold text-slate-900">skillnetic.ai</span>
            </div>
            <div className="flex gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-200" />
              <span className="h-2.5 w-2.5 rounded-full bg-brand-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
            <div className="h-3 w-24 rounded-full bg-slate-100" />
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-blue-50 p-3">
                <div className="h-3 w-14 rounded-full bg-blue-200" />
                <div className="mt-3 h-12 rounded-xl bg-gradient-to-br from-blue-200 to-blue-100" />
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <div className="h-3 w-14 rounded-full bg-slate-200" />
                <div className="mt-3 h-12 rounded-xl bg-slate-200/70" />
              </div>
              <div className="rounded-2xl bg-cyan-50 p-3">
                <div className="h-3 w-14 rounded-full bg-cyan-200" />
                <div className="mt-3 h-12 rounded-xl bg-gradient-to-br from-cyan-200 to-cyan-100" />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-brand-50 p-3">
                <div className="h-20 rounded-xl bg-white shadow-sm" />
              </div>
              <div className="rounded-2xl bg-indigo-50 p-3">
                <div className="flex h-20 items-end gap-2 rounded-xl bg-white px-3 py-3 shadow-sm">
                  <span className="h-8 w-3 rounded-full bg-brand-300" />
                  <span className="h-12 w-3 rounded-full bg-brand-400" />
                  <span className="h-16 w-3 rounded-full bg-brand-500" />
                  <span className="h-10 w-3 rounded-full bg-brand-200" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero({
  categories,
  locale,
}: {
  categories: HomepageData["categories"];
  locale: Locale;
}) {
  const quickCategories = categories.slice(0, 6);
  const copy = getMessages(locale).homepage;
  const pageUrl = withLocale(locale, "/");
  const searchAction = withLocale(locale, "/skills");

  return (
    <section className="border-b border-white/60 bg-gradient-to-br from-[#f7fbff] via-[#eef5ff] to-[#f5f9ff]">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:pt-14">
        <div className="pt-4">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-[56px] lg:leading-[1.06]">
            {copy.hero.titlePrefix} <span className="text-brand-600">{copy.hero.titleHighlight}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            {copy.hero.description}
          </p>

          <form
            action={searchAction}
            method="get"
            className="mt-8 max-w-2xl"
            onSubmit={(event) => {
              const formData = new FormData(event.currentTarget);
              const keyword = String(formData.get("q") || "").trim();

              trackEvent({
                eventName: "home_search_submit",
                pageUrl,
                targetType: "search",
                targetId: null,
                extra: {
                  keyword,
                },
              });
            }}
          >
            <div className="flex flex-col gap-3 rounded-[20px] border border-white/80 bg-white/90 p-3 shadow-soft sm:flex-row sm:items-center">
              <label className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2">
                <BoxIcon src="/icons/search.svg" alt={copy.actions.search} size={14} boxClassName="h-5 w-5" />
                <input
                  name="q"
                  placeholder={copy.hero.placeholder}
                  className="w-full border-0 bg-transparent text-base text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>
              <HeroButton type="submit" className="rounded-2xl bg-brand-500 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600">
                <span className="inline-flex items-center gap-2">
                  {copy.actions.search}
                  <BoxIcon src="/icons/arrow-right.svg" alt="" size={10} boxClassName="h-4 w-4" />
                </span>
              </HeroButton>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap gap-3">
            {quickCategories.map((category) => (
              <LocalizedLink
                key={category.id}
                href={`/categories/${category.slug}`}
                onClick={() => trackCategoryClick(locale, category)}
                className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-brand-200 hover:text-brand-600"
              >
                {categoryIconMap[category.slug] ? (
                  <BoxIcon
                    src={categoryIconMap[category.slug]}
                    alt={category.name}
                    size={14}
                    boxClassName="h-6 w-6 rounded-full bg-white shadow-sm ring-1 ring-slate-100"
                  />
                ) : (
                  <HeroIcon label={category.name.slice(0, 1)} />
                )}
                {category.name}
              </LocalizedLink>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <LocalizedLink href="/skills" className="rounded-2xl bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600">
              <span className="inline-flex items-center gap-2">
                {copy.actions.browseSkills}
                <BoxIcon src="/icons/arrow-right.svg" alt="" size={11} boxClassName="h-4 w-4" />
              </span>
            </LocalizedLink>
            <LocalizedLink
              href="/submit"
              onClick={() =>
                trackEvent({
                  eventName: "home_submit_skill_click",
                  pageUrl,
                  targetType: "button",
                  targetId: "submit_skill",
                  extra: {},
                })
              }
              className="rounded-2xl border border-brand-200 bg-white px-6 py-3.5 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50"
            >
              <span className="inline-flex items-center gap-2">
                {copy.actions.submitSkill}
                <BoxIcon src="/icons/upload.svg" alt="" size={11} boxClassName="h-4 w-4" />
              </span>
            </LocalizedLink>
          </div>
        </div>

        <div className="flex items-center lg:justify-end">
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}

export function Homepage({ data, locale }: Props) {
  const copy = getMessages(locale).homepage;
  const [featuredSkills, setFeaturedSkills] = useState<HomepageSkill[]>(data.featuredSkills);
  const [favoriteMessage, setFavoriteMessage] = useState("");

  useEffect(() => {
    trackEvent({
      eventName: "page_view_home",
      pageUrl: withLocale(locale, "/"),
      targetType: "page",
      targetId: "home",
      extra: {},
    });
  }, [locale]);

  useEffect(() => {
    setFeaturedSkills(data.featuredSkills);
  }, [data.featuredSkills]);

  useEffect(() => {
    if (!favoriteMessage) {
      return;
    }
    const timer = window.setTimeout(() => {
      setFavoriteMessage("");
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [favoriteMessage]);

  async function handleHomepageFavoriteToggle(skill: HomepageSkill) {
    try {
      trackEvent({
        eventName: "skills_favorite_click",
        pageUrl: withLocale(locale, "/"),
        targetType: "skill",
        targetId: skill.id,
        extra: {
          slug: skill.slug,
          title: skill.title,
        },
      });
      const result = skill.isFavorited ? await unfavoriteSkill(skill.id) : await favoriteSkill(skill.id);
      setFeaturedSkills((current) =>
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
      {favoriteMessage ? (
        <div className="pointer-events-none fixed right-4 top-20 z-50 rounded-2xl border border-emerald-200 bg-white/96 px-4 py-3 text-sm font-medium text-emerald-700 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur sm:right-6">
          {favoriteMessage}
        </div>
      ) : null}
      <Hero categories={data.categories} locale={locale} />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section>
          <SectionTitle title={copy.sections.categories} actionLabel={copy.actions.viewAll} actionHref="/categories" />
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {data.categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                locale={locale}
                numberFormat={localeNumberFormat[locale]}
              />
            ))}
          </div>
        </section>

        <section className="mt-14">
          <SectionTitle title={copy.sections.featured} actionLabel={copy.actions.viewAll} actionHref="/skills" />
          <div className="grid gap-5 lg:grid-cols-3">
            {featuredSkills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                locale={locale}
                hotLabel={copy.hot}
                favoriteLabel={copy.actions.favorite}
                detailsLabel={copy.actions.details}
                onFavoriteToggle={handleHomepageFavoriteToggle}
              />
            ))}
          </div>
        </section>

        <section className="mt-14">
          <SectionTitle title={copy.sections.latest} actionLabel={copy.actions.viewAll} actionHref="/skills" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.latestSkills.map((skill) => (
              <LatestSkillCard key={skill.id} skill={skill} locale={locale} />
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-4 lg:grid-cols-3">
          <StatsCard
            value={formatStatValue(locale, data.stats.skillFavorites)}
            label={copy.stats.favorites.label}
            description={copy.stats.favorites.description}
            tone="bg-blue-50 text-brand-600"
            iconSrc={statIconMap.favorites}
          />
          <StatsCard
            value={formatStatValue(locale, data.stats.qualityTemplates)}
            label={copy.stats.templates.label}
            description={copy.stats.templates.description}
            tone="bg-emerald-50 text-emerald-600"
            iconSrc={statIconMap.templates}
          />
          <StatsCard
            value={formatStatValue(locale, data.stats.monthlyVisits)}
            label={copy.stats.visits.label}
            description={copy.stats.visits.description}
            tone="bg-orange-50 text-orange-500"
            iconSrc={statIconMap.visits}
          />
        </section>
      </main>
    </div>
  );
}
