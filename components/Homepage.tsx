"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LocalizedLink } from "@/components/LocalizedLink";
import { SkillCard } from "@/components/SkillCard";
import { favoriteSkill, unfavoriteSkill } from "@/lib/api/skills";
import { trackEvent } from "@/lib/api/track";
import { localeNumberFormat, type Locale, withLocale } from "@/lib/i18n";
import type { CategoryItem, HomepageContributor, HomepageData, HomepageSkill } from "@/lib/types/homepage";

type Props = {
  data: HomepageData;
  locale: Locale;
};

type HomeCopy = {
  heroTitleTop: string;
  heroTitleHighlight: string;
  heroTitleBottom: string;
  heroDesc: string;
  heroPlaceholder: string;
  hotSearch: string;
  categoriesTitle: string;
  featuredTitle: string;
  featuredDesc: string;
  scenesTitle: string;
  scenesDesc: string;
  trendsTitle: string;
  latestActivity: string;
  platformStats: string;
  weeklyRanking: string;
  weeklyRankingEmpty: string;
  viewMore: string;
  allCategories: string;
  submitCtaTitle: string;
  submitCtaDesc: string;
  submitNow: string;
  favorite: string;
  favorited: string;
  removed: string;
  favoriteFailed: string;
  loginFirst: string;
  skillUnit: string;
  statsUsers: string;
  statsVisits: string;
  statsFavorites: string;
  statsSatisfaction: string;
  trendHot: string;
  trendViews: string;
  uploaded: string;
  liked: string;
  commented: string;
  favoritedAction: string;
};

type SceneCard = {
  slug: string;
  title: string;
  desc: string;
  icon: string;
};

type ActivityItem = {
  user: string;
  action: string;
  target: string;
  ago: string;
};

type LeaderItem = {
  name: string;
  score: number;
  submissionCount: number;
  favoriteCount: number;
};

const copyByLocale: Record<Locale, HomeCopy> = {
  zh: {
    heroTitleTop: "发现、学习和分享",
    heroTitleHighlight: "AI 技能",
    heroTitleBottom: "，让想法变为现实",
    heroDesc: "探索 10,000+ 实用 AI 技能，提升效率，解决问题，创造无限可能",
    heroPlaceholder: "搜索 Skill、场景、工具...",
    hotSearch: "热门搜索：",
    categoriesTitle: "分类导航",
    featuredTitle: "推荐 Skill",
    featuredDesc: "精选优质技能，助你快速成长",
    scenesTitle: "热门场景",
    scenesDesc: "选择场景，找到最适合你的技能组合",
    trendsTitle: "热门趋势",
    latestActivity: "最新动态",
    platformStats: "平台数据",
    weeklyRanking: "本周贡献榜",
    weeklyRankingEmpty: "本周暂无数据",
    viewMore: "查看更多",
    allCategories: "更多分类",
    submitCtaTitle: "成为创作者，分享你的知识与经验",
    submitCtaDesc: "帮助他人，获得认可，提升影响力",
    submitNow: "立即提交 Skill",
    favorite: "收藏",
    favorited: "已收藏",
    removed: "已取消收藏",
    favoriteFailed: "收藏失败，请稍后重试",
    loginFirst: "请先登录",
    skillUnit: "个 Skill",
    statsUsers: "活跃用户",
    statsVisits: "本月访问",
    statsFavorites: "技能总数",
    statsSatisfaction: "用户满意度",
    trendHot: "热门趋势",
    trendViews: "浏览",
    uploaded: "提交了新的Skill",
    liked: "点赞了 Skill",
    commented: "评论了 Skill",
    favoritedAction: "收藏了 Skill",
  },
  en: {
    heroTitleTop: "Discover, Learn and Share",
    heroTitleHighlight: "AI Skills",
    heroTitleBottom: " and turn ideas into reality",
    heroDesc: "Explore 10,000+ practical AI skills to boost productivity, solve problems and unlock more possibilities.",
    heroPlaceholder: "Search skills, scenarios, tools...",
    hotSearch: "Hot searches:",
    categoriesTitle: "Categories",
    featuredTitle: "Recommended Skills",
    featuredDesc: "Curated high-quality skills to help you level up fast",
    scenesTitle: "Popular Scenes",
    scenesDesc: "Pick a scene and find the best-fit skill bundle",
    trendsTitle: "Trending",
    latestActivity: "Latest Activity",
    platformStats: "Platform Stats",
    weeklyRanking: "Weekly Ranking",
    weeklyRankingEmpty: "No data this week",
    viewMore: "View more",
    allCategories: "More categories",
    submitCtaTitle: "Become a creator and share your knowledge",
    submitCtaDesc: "Help others, earn recognition and build influence",
    submitNow: "Submit Skill",
    favorite: "Favorite",
    favorited: "Favorited",
    removed: "Removed",
    favoriteFailed: "Favorite failed, please try again",
    loginFirst: "Please log in first",
    skillUnit: "Skills",
    statsUsers: "Active users",
    statsVisits: "Monthly visits",
    statsFavorites: "Total skills",
    statsSatisfaction: "Satisfaction",
    trendHot: "Trending",
    trendViews: "views",
    uploaded: "submitted a new skill",
    liked: "liked a skill",
    commented: "commented on a skill",
    favoritedAction: "favorited a skill",
  },
};

const hotSearches: Record<Locale, string[]> = {
  zh: ["ChatGPT", "Midjourney", "Python", "自动化", "数据分析", "PPT"],
  en: ["ChatGPT", "Midjourney", "Python", "Automation", "Data", "PPT"],
};

const heroBadges: Record<Locale, Array<{ label: string; icon: string; className: string }>> = {
  zh: [
    { label: "学习新技能", icon: "/v2home/skillnetic_homepage_icons_svg/hero_learning.svg", className: "left-0 top-28" },
    { label: "解决实际问题", icon: "/v2home/skillnetic_homepage_icons_svg/solve_problem.svg", className: "right-0 top-4" },
    { label: "提升工作效率", icon: "/v2home/skillnetic_homepage_icons_svg/general_like.svg", className: "right-4 bottom-12" },
  ],
  en: [
    { label: "Learn new skills", icon: "/v2home/skillnetic_homepage_icons_svg/hero_learning.svg", className: "left-0 top-28" },
    { label: "Solve real problems", icon: "/v2home/skillnetic_homepage_icons_svg/solve_problem.svg", className: "right-0 top-4" },
    { label: "Boost productivity", icon: "/v2home/skillnetic_homepage_icons_svg/general_like.svg", className: "right-4 bottom-12" },
  ],
};

const sceneCardsByLocale: Record<Locale, SceneCard[]> = {
  zh: [
    { slug: "office", title: "职场办公", desc: "提升效率，自动化处理日常任务", icon: "/v2home/skillnetic_homepage_icons_svg/scene_office.svg" },
    { slug: "content", title: "内容创作", desc: "写文章、做视频、做设计", icon: "/v2home/skillnetic_homepage_icons_svg/scene_content.svg" },
    { slug: "data", title: "数据分析", desc: "数据处理、分析与可视化", icon: "/v2home/skillnetic_homepage_icons_svg/scene_analysis.svg" },
    { slug: "learning", title: "学习研究", desc: "文献阅读、知识整理", icon: "/v2home/skillnetic_homepage_icons_svg/scene_study.svg" },
    { slug: "ecommerce", title: "电商运营", desc: "选品、文案、数据分析", icon: "/v2home/skillnetic_homepage_icons_svg/scene_ecommerce.svg" },
    { slug: "programming", title: "编程开发", desc: "代码编写、调试与部署", icon: "/v2home/skillnetic_homepage_icons_svg/scene_dev.svg" },
  ],
  en: [
    { slug: "office", title: "Office Work", desc: "Automate repetitive daily work", icon: "/v2home/skillnetic_homepage_icons_svg/scene_office.svg" },
    { slug: "content", title: "Content", desc: "Write, edit, design and publish", icon: "/v2home/skillnetic_homepage_icons_svg/scene_content.svg" },
    { slug: "data", title: "Data Analysis", desc: "Process, analyze and visualize data", icon: "/v2home/skillnetic_homepage_icons_svg/scene_analysis.svg" },
    { slug: "learning", title: "Study", desc: "Read, summarize and research faster", icon: "/v2home/skillnetic_homepage_icons_svg/scene_study.svg" },
    { slug: "ecommerce", title: "E-commerce", desc: "Optimize selection, copy and ops", icon: "/v2home/skillnetic_homepage_icons_svg/scene_ecommerce.svg" },
    { slug: "programming", title: "Development", desc: "Code, test and ship with speed", icon: "/v2home/skillnetic_homepage_icons_svg/scene_dev.svg" },
  ],
};

const categoryIconMap: Record<string, string> = {
  writing: "/v2home/skillnetic_homepage_icons_svg/cat_write.svg",
  coding: "/v2home/skillnetic_homepage_icons_svg/cat_code.svg",
  office: "/v2home/skillnetic_homepage_icons_svg/cat_productivity.svg",
  design: "/v2home/skillnetic_homepage_icons_svg/cat_design.svg",
  marketing: "/v2home/skillnetic_homepage_icons_svg/cat_write.svg",
  learning: "/v2home/skillnetic_homepage_icons_svg/scene_read.svg",
  video: "/v2home/skillnetic_homepage_icons_svg/cat_video.svg",
  automation: "/v2home/skillnetic_homepage_icons_svg/cat_automation.svg",
  "design-visual": "/v2home/skillnetic_homepage_icons_svg/cat_design.svg",
  "writing-content": "/v2home/skillnetic_homepage_icons_svg/cat_write.svg",
  engineering: "/v2home/skillnetic_homepage_icons_svg/cat_code.svg",
  "operations-growth": "/v2home/skillnetic_homepage_icons_svg/cat_productivity.svg",
  "data-business-analysis": "/v2home/skillnetic_homepage_icons_svg/cat_data.svg",
  "marketing-brand": "/v2home/skillnetic_homepage_icons_svg/cat_write.svg",
  "product-project": "/v2home/skillnetic_homepage_icons_svg/cat_productivity.svg",
};

function iconForCategory(category: CategoryItem): string {
  return categoryIconMap[category.slug] || "/v2home/skillnetic_homepage_icons_svg/cat_more.svg";
}

function buildRanking(contributors: HomepageContributor[]): LeaderItem[] {
  return contributors.map((item) => ({
    name: item.user,
    score: item.score,
    submissionCount: item.submissionCount,
    favoriteCount: item.favoriteCount,
  }));
}

function TopTrendCard({ skills, copy }: { skills?: HomepageSkill[]; copy: HomeCopy }) {
  const items = skills ?? [];
  return (
    <section>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[18px] font-semibold text-[#1b2140]">
          <img src="/v2home/skillnetic_homepage_icons_svg/trend_fire.svg" alt="" className="h-6 w-6" />
          <span>{copy.trendsTitle}</span>
        </div>
        <LocalizedLink href="/skills" className="text-sm font-medium text-[#9398B3] hover:text-[#5B5CEB]">
          {copy.viewMore} <span className="ml-1">›</span>
        </LocalizedLink>
      </div>
      <div className="mt-4 space-y-4">
        {items.slice(0, 5).map((skill, index) => (
          <div key={skill.id} className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-[9px] text-[13px] font-semibold text-white ${
                index === 0 ? "bg-[#FDB64B]" : index === 1 ? "bg-[#FF6C67]" : index === 2 ? "bg-[#7285FF]" : "bg-[#E4E7F2] text-[#7E839C]"
              }`}
            >
              {index + 1}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-[#232948]">{skill.title}</p>
            </div>
            <div className="flex items-center gap-1.5 text-[13px] text-[#7F86A4]">
              <img src="/v2home/skillnetic_homepage_icons_svg/trend_views.svg" alt="" className="h-4 w-4" />
              <span>{skill.viewCount >= 1000 ? `${(skill.viewCount / 1000).toFixed(1)}k` : String(skill.viewCount || skill.favoriteCount)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HeroVisual({ locale }: { locale: Locale }) {
  const badges = heroBadges[locale];
  return (
    <div className="relative mx-auto flex min-h-[308px] w-full max-w-[620px] items-center justify-center">
      {badges.map((badge) => (
        <div key={badge.label} className={`absolute ${badge.className} rounded-[16px] bg-white/94 px-4 py-3 shadow-[0_14px_38px_rgba(86,106,214,0.12)] ring-1 ring-white/85`}>
          <div className="flex items-center gap-2.5 text-[14px] font-semibold text-[#21274A]">
            <img src={badge.icon} alt="" className="h-6 w-6" />
            <span>{badge.label}</span>
          </div>
        </div>
      ))}

      <div className="relative h-[300px] w-[450px]">
        <div className="absolute left-1/2 top-[26px] h-3 w-3 -translate-x-1/2 rounded-full bg-[#C6D0FF]" />
        <div className="absolute left-[82px] top-[54px] h-3.5 w-3.5 rounded-full bg-[#D9E2FF]" />
        <div className="absolute right-[84px] top-[46px] h-3.5 w-3.5 rounded-full bg-[#D9E2FF]" />
        <div className="absolute left-[84px] top-[74px] right-[84px] h-[1px] bg-gradient-to-r from-transparent via-[#D7DEFF] to-transparent" />

        <div className="absolute left-[126px] top-[62px] rounded-[12px] bg-white/88 p-3 shadow-[0_14px_34px_rgba(114,133,255,0.16)]">
          <img src="/v2home/skillnetic_homepage_icons_svg/hero_code.svg" alt="" className="h-7 w-7" />
        </div>
        <div className="absolute left-[204px] top-[8px] rounded-[12px] bg-white/88 p-3 shadow-[0_14px_34px_rgba(114,133,255,0.16)]">
          <img src="/v2home/skillnetic_homepage_icons_svg/hero_chart.svg" alt="" className="h-7 w-7" />
        </div>
        <div className="absolute right-[106px] top-[102px] rounded-[12px] bg-white/88 p-3 shadow-[0_14px_34px_rgba(114,133,255,0.16)]">
          <img src="/v2home/skillnetic_homepage_icons_svg/hero_play.svg" alt="" className="h-7 w-7" />
        </div>
        <div className="absolute left-[126px] top-[188px] rounded-[12px] bg-white/88 p-3 shadow-[0_14px_34px_rgba(114,133,255,0.16)]">
          <img src="/v2home/skillnetic_homepage_icons_svg/hero_robot.svg" alt="" className="h-7 w-7" />
        </div>
        <div className="absolute right-[120px] top-[194px] rounded-[12px] bg-white/88 p-3 shadow-[0_14px_34px_rgba(114,133,255,0.16)]">
          <img src="/v2home/skillnetic_homepage_icons_svg/hero_image.svg" alt="" className="h-7 w-7" />
        </div>

        <div className="absolute inset-x-[52px] bottom-[16px] h-[92px] rounded-[999px] bg-[radial-gradient(circle_at_center,rgba(129,151,255,0.18),rgba(129,151,255,0.04)_60%,transparent_75%)]" />

        <div className="absolute left-1/2 top-[76px] h-[206px] w-[206px] -translate-x-1/2 rounded-[50%] border border-[#E1E7FF] opacity-70" />
        <div className="absolute left-1/2 top-[98px] h-[154px] w-[304px] -translate-x-1/2 rounded-[50%] border border-[#E6EBFF] opacity-70" />

        <div className="absolute bottom-[26px] left-1/2 h-[82px] w-[316px] -translate-x-1/2 rounded-[34px] bg-gradient-to-b from-[#EDF2FF] to-[#DDE7FF] shadow-[0_20px_48px_rgba(108,124,228,0.14)]" />
        <div className="absolute bottom-[44px] left-1/2 h-[56px] w-[228px] -translate-x-1/2 rounded-[22px] bg-gradient-to-b from-[#DFE7FF] to-[#C3D2FF]" />

        <div className="absolute bottom-[66px] left-1/2 h-[166px] w-[166px] -translate-x-1/2 rounded-[20px] bg-[linear-gradient(180deg,#6D65FF_0%,#7E76FF_48%,#64E4F1_100%)] shadow-[0_26px_58px_rgba(98,109,255,0.35)]">
          <div className="absolute inset-[11px] rounded-[14px] border border-white/35" />
          <div className="absolute inset-x-0 top-[34px] text-center text-[72px] font-semibold tracking-tight text-white/95 drop-shadow-[0_8px_16px_rgba(38,51,180,0.32)]">
            AI
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeHero({
  locale,
}: {
  locale: Locale;
}) {
  const copy = copyByLocale[locale];
  const pageUrl = withLocale(locale, "/");

  return (
    <section>
      <div className="grid gap-4 xl:grid-cols-[1.06fr_0.94fr] xl:items-start">
        <div className="pt-2">
          <h1 className="text-[44px] font-semibold leading-[1.15] tracking-[-0.045em] text-[#12193A]">
            <span className="block">{copy.heroTitleTop}</span>
            <span className="mt-1.5 block">
              <span className="bg-[linear-gradient(180deg,#796BFF_0%,#4D47FF_100%)] bg-clip-text text-transparent">
                {copy.heroTitleHighlight}
              </span>
              <span>{copy.heroTitleBottom}</span>
            </span>
          </h1>
          <p className="mt-4 max-w-[620px] text-[15px] leading-7 text-[#5E678B]">{copy.heroDesc}</p>

          <form
            action={withLocale(locale, "/skills")}
            method="get"
            className="mt-5"
            onSubmit={(event) => {
              const keyword = String(new FormData(event.currentTarget).get("q") || "").trim();
              trackEvent({
                eventName: "home_search_submit",
                pageUrl,
                targetType: "search",
                targetId: null,
                extra: { keyword },
              });
            }}
          >
            <div className="flex h-[58px] max-w-[652px] items-center rounded-[18px] bg-white/94 pl-6 pr-2.5 shadow-[0_12px_32px_rgba(91,109,196,0.08)] ring-1 ring-white/90">
              <input
                name="q"
                placeholder={copy.heroPlaceholder}
                className="h-full flex-1 border-0 bg-transparent text-[15px] text-[#3B4262] outline-none placeholder:text-[#A5ACC5]"
              />
              <button
                type="submit"
                className="flex h-[46px] w-[52px] items-center justify-center rounded-[14px] bg-[linear-gradient(180deg,#5F63FF_0%,#4B3DFF_100%)] shadow-[0_14px_30px_rgba(79,74,255,0.34)]"
              >
                <img src="/v2home/skillnetic_homepage_icons_svg/search_icon.svg" alt="" className="h-6 w-6" />
              </button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[14px] font-medium text-[#6D7392]">{copy.hotSearch}</span>
            {hotSearches[locale].map((item) => (
              <LocalizedLink
                key={item}
                href={`/skills?q=${encodeURIComponent(item)}`}
                className="rounded-full bg-[linear-gradient(180deg,#F4F1FF_0%,#EEF2FF_100%)] px-4 py-2 text-[14px] font-medium text-[#6668F4] shadow-[0_4px_14px_rgba(129,121,255,0.08)]"
              >
                {item}
              </LocalizedLink>
            ))}
          </div>
        </div>

        <HeroVisual locale={locale} />
      </div>
    </section>
  );
}

function CategoryStrip({ locale, categories }: { locale: Locale; categories: CategoryItem[] }) {
  const copy = copyByLocale[locale];
  const visible = categories.slice(0, 7);
  const cardColors = [
    "from-[#F2ECFF] to-[#FBFAFF]",
    "from-[#E9F1FF] to-[#F9FBFF]",
    "from-[#E9FFF2] to-[#FBFFFD]",
    "from-[#FFF0EE] to-[#FFF9F8]",
    "from-[#ECFAFF] to-[#FAFDFF]",
    "from-[#F0EBFF] to-[#FBFAFF]",
    "from-[#FFF3E5] to-[#FFFDFC]",
  ];

  return (
    <div className="grid gap-0 rounded-[22px] bg-white/92 shadow-[0_16px_48px_rgba(102,118,197,0.06)] ring-1 ring-white/90 xl:grid-cols-8">
      {visible.map((category, index) => (
        <LocalizedLink
          key={category.id}
          href={`/skills?category=${encodeURIComponent(category.slug)}`}
          className="flex min-h-[92px] flex-col justify-between border-r border-[#EEF1FA] bg-[linear-gradient(180deg,var(--tw-gradient-stops))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] last:border-r-0"
          style={{ backgroundImage: `linear-gradient(180deg, ${cardColors[index % cardColors.length].replace("from-[", "").replace("] to-[", ", ").replace("]", "")})` }}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-white shadow-[0_8px_20px_rgba(100,115,200,0.14)]">
            <img src={iconForCategory(category)} alt={category.name} className="h-7 w-7" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#1A2341]">{category.name}</p>
            <p className="mt-1 text-[11px] text-[#727999]">
              {category.skillCount.toLocaleString(localeNumberFormat[locale])} {copy.skillUnit}
            </p>
          </div>
        </LocalizedLink>
      ))}
      <LocalizedLink
      href="/skills"
        className="flex min-h-[84px] flex-col justify-between bg-[linear-gradient(180deg,#F7F8FF_0%,#FCFCFF_100%)] px-4 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-white shadow-[0_8px_20px_rgba(100,115,200,0.14)]">
          <img src="/v2home/skillnetic_homepage_icons_svg/cat_more.svg" alt="" className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-[#1A2341]">{copy.allCategories}</p>
          <p className="mt-0.5 text-[11px] text-[#727999]">{copy.viewMore}</p>
        </div>
      </LocalizedLink>
    </div>
  );
}

function LatestActivityCard({ locale, items }: { locale: Locale; items: ActivityItem[] }) {
  const copy = copyByLocale[locale];
  return (
    <section>
      <div className="flex items-center justify-between">
        <h3 className="text-[17px] font-semibold text-[#171E3D]">{copy.latestActivity}</h3>
      </div>
      <div className="mt-4 space-y-4">
        {items.map((item, index) => (
          <div key={`${item.user}-${index}`} className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(180deg,#EEF2FF_0%,#FFFFFF_100%)] text-[12px] font-semibold text-[#5965F6] shadow-[0_8px_18px_rgba(92,101,235,0.14)]">
              {item.user.slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] leading-5.5 text-[#222948]">
                <span className="font-semibold">{item.user}</span>
                <span className="mx-1 text-[#646D8D]">{item.action}</span>
              </p>
              <p className="mt-0.5 truncate text-[13px] text-[#5E678B]">{item.target}</p>
            </div>
            <span className="shrink-0 pt-0.5 text-[12px] text-[#959CB8]">{item.ago}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({
  title,
  desc,
  href,
  locale,
}: {
  title: string;
  desc?: string;
  href?: string;
  locale: Locale;
}) {
  const copy = copyByLocale[locale];
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="flex items-end gap-3">
        <h2 className="text-[25px] font-semibold tracking-[-0.03em] text-[#171E3D]">{title}</h2>
        {desc ? <p className="pb-0.5 text-[14px] text-[#868DA9]">{desc}</p> : null}
      </div>
      {href ? (
        <LocalizedLink href={href} className="pb-1 text-[14px] font-medium text-[#7A80A0] hover:text-[#5B5CEB]">
          {copy.viewMore} <span className="ml-1">›</span>
        </LocalizedLink>
      ) : null}
    </div>
  );
}

type HomeSkillClickEventName = "home_featured_skill_click" | "home_latest_skill_click";

function WeeklyRankingCard({ locale, contributors }: { locale: Locale; contributors: HomepageContributor[] }) {
  const copy = copyByLocale[locale];
  const ranking = useMemo(() => buildRanking(contributors), [contributors]);
  return (
    <section>
      <div className="flex items-center justify-between">
        <h3 className="text-[18px] font-semibold text-[#171E3D]">{copy.weeklyRanking}</h3>
      </div>
      {ranking.length ? (
        <div className="mt-5 space-y-4">
          {ranking.map((item, index) => (
            <div key={item.name} className="flex items-center gap-3">
              <div className="w-4 text-[22px] font-semibold text-[#F18E2B]">{index + 1}</div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(180deg,#EEF2FF_0%,#FFFFFF_100%)] text-[12px] font-semibold text-[#5965F6] shadow-[0_8px_18px_rgba(92,101,235,0.14)]">
                {item.name.slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] text-[#242B49]">{item.name}</p>
                <p className="mt-0.5 text-[12px] text-[#8B91AD]">
                  {locale === "en"
                    ? `${item.submissionCount} submissions · ${item.favoriteCount} favorites`
                    : `${item.submissionCount} 次提交 · ${item.favoriteCount} 次收藏`}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[14px] font-medium text-[#F18E2B]">
                <img src="/v2home/skillnetic_homepage_icons_svg/trend_fire.svg" alt="" className="h-4.5 w-4.5" />
                <span>{item.score}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[16px] bg-[linear-gradient(180deg,#F7F9FF_0%,#FFFFFF_100%)] px-4 py-5 text-center text-[13px] text-[#8B91AD]">
          {copy.weeklyRankingEmpty}
        </div>
      )}
    </section>
  );
}

function SceneCardView({ scene, count, locale }: { scene: SceneCard; count: number; locale: Locale }) {
  return (
    <div className="rounded-[20px] bg-white/94 p-4.5 shadow-[0_16px_48px_rgba(92,106,184,0.08)] ring-1 ring-white/90">
      <div className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[linear-gradient(180deg,#F4F7FF_0%,#FFFFFF_100%)] shadow-[0_8px_20px_rgba(92,106,184,0.1)]">
        <img src={scene.icon} alt={scene.title} className="h-7 w-7" />
      </div>
      <h3 className="mt-3.5 text-[16px] font-semibold text-[#171E3D]">{scene.title}</h3>
      <p className="mt-1.5 text-[13px] leading-6 text-[#6D7493]">{scene.desc}</p>
      <p className="mt-4 text-[14px] font-medium text-[#5A5EF5]">
        {count.toLocaleString(localeNumberFormat[locale])} {locale === "en" ? "skills" : "个技能"}
      </p>
    </div>
  );
}

function SubmitBanner({ locale }: { locale: Locale }) {
  const copy = copyByLocale[locale];
  return (
    <div className="overflow-hidden rounded-[22px] bg-[linear-gradient(180deg,#E8EDFF_0%,#DCE3FF_100%)] px-7 py-5 shadow-[0_16px_48px_rgba(92,106,184,0.08)]">
      <div className="flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-18 w-18 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#FFFFFF,rgba(255,255,255,0.7))] shadow-[0_14px_34px_rgba(112,126,217,0.18)]">
            <img src="/v2home/skillnetic_homepage_icons_svg/general_trophy.svg" alt="" className="h-10 w-10" />
          </div>
          <div>
            <h3 className="text-[24px] font-semibold tracking-[-0.03em] text-[#2C38B5]">{copy.submitCtaTitle}</h3>
            <p className="mt-1.5 text-[15px] text-[#6D7493]">{copy.submitCtaDesc}</p>
          </div>
        </div>
        <LocalizedLink
          href="/submit"
          className="inline-flex h-[52px] items-center gap-3 rounded-[14px] bg-[linear-gradient(180deg,#5F63FF_0%,#4B3DFF_100%)] px-6 text-[18px] font-semibold text-white shadow-[0_16px_34px_rgba(79,74,255,0.34)]"
        >
          <span>{copy.submitNow}</span>
          <span className="text-[22px]">→</span>
        </LocalizedLink>
      </div>
    </div>
  );
}

export function Homepage({ data, locale }: Props) {
  const router = useRouter();
  const copy = copyByLocale[locale];
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
    if (!favoriteMessage) return;
    const timer = window.setTimeout(() => setFavoriteMessage(""), 1200);
    return () => window.clearTimeout(timer);
  }, [favoriteMessage]);

  async function handleHomepageFavoriteToggle(skill: HomepageSkill) {
    try {
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
      setFavoriteMessage(result.favorited ? copy.favorited : copy.removed);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.toLowerCase().includes("unauthorized")) {
        setFavoriteMessage(copy.loginFirst);
        return;
      }
      setFavoriteMessage(copy.favoriteFailed);
    }
  }

  function openSkill(skill: HomepageSkill, eventName: HomeSkillClickEventName) {
    trackEvent({
      eventName,
      pageUrl: withLocale(locale, "/"),
      targetType: "skill",
      targetId: skill.id,
      extra: { slug: skill.slug, title: skill.title },
    });
    router.push(withLocale(locale, `/skills/${skill.slug}`));
  }

  const sceneCards = sceneCardsByLocale[locale];
  const sceneCountMap = useMemo(
    () => new Map((data.sceneCounts ?? []).map((item) => [item.slug, item.count])),
    [data.sceneCounts],
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(134,155,255,0.18),transparent_38%),linear-gradient(180deg,#F6F8FF_0%,#FBFCFF_100%)]">
      {favoriteMessage ? (
        <div className="pointer-events-none fixed right-6 top-20 z-50 rounded-[18px] bg-white/95 px-5 py-3 text-sm font-medium text-[#3A46E8] shadow-[0_18px_40px_rgba(88,98,199,0.18)] ring-1 ring-white/90">
          {favoriteMessage}
        </div>
      ) : null}

      <div className="mx-auto max-w-[1780px]">
        <main className="px-4 pb-7 pt-5 xl:px-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
            <div className="min-w-0">
              <HomeHero locale={locale} />
              <div className="mt-4">
                <CategoryStrip locale={locale} categories={data.categories} />
              </div>

              <section>
                <SectionHeader title={copy.featuredTitle} desc={copy.featuredDesc} href="/skills" locale={locale} />
                <div className="grid gap-3 xl:grid-cols-4">
                  {featuredSkills.slice(0, 4).map((skill) => (
                    <SkillCard
                      key={skill.id}
                      skill={{
                        ...skill,
                        categoryName: skill.categoryName,
                        type: skill.coverIcon || "prompt",
                      }}
                      variant="recommended"
                      maxTags={3}
                      favoriteLabel={copy.favorite}
                      onOpen={() => openSkill(skill, "home_featured_skill_click")}
                      onFavorite={() => handleHomepageFavoriteToggle(skill)}
                    />
                  ))}
                </div>
              </section>

              <section className="mt-6">
                <SectionHeader title={copy.scenesTitle} desc={copy.scenesDesc} href="/skills" locale={locale} />
                <div className="grid gap-3 xl:grid-cols-3">
                  {sceneCards.map((scene) => (
                    <SceneCardView
                      key={scene.slug}
                      scene={scene}
                      count={sceneCountMap.get(scene.slug) ?? 0}
                      locale={locale}
                    />
                  ))}
                </div>
              </section>

              <section className="mt-5">
                <SubmitBanner locale={locale} />
              </section>
            </div>

            <aside className="sticky top-5 self-start">
              <div className="rounded-[22px] bg-white/94 px-5 py-4.5 shadow-[0_16px_48px_rgba(102,118,197,0.06)] ring-1 ring-white/90">
                <TopTrendCard skills={data.trendingSkills ?? data.latestSkills} copy={copy} />
                <div className="my-4 h-px bg-[#EEF1FA]" />
                <LatestActivityCard locale={locale} items={data.latestActivities ?? []} />
                <div className="my-4 h-px bg-[#EEF1FA]" />
                <WeeklyRankingCard locale={locale} contributors={data.weeklyContributors ?? []} />
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
