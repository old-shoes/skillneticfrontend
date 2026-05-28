import { getMessages, getStaticPlaceholderCopy, type Locale } from "@/lib/i18n";

export function getStaticPageProps(locale: Locale, slug: string) {
  return getStaticPlaceholderCopy(locale, slug);
}

export function getSkillDetailPageProps(locale: Locale, slug: string) {
  return locale === "en"
    ? {
        eyebrow: "Skill Detail",
        title: "Skill Detail Scaffold",
        description: `Current route param: ${slug}. Featured Skills and Latest Updates already link to this standalone detail route. Real detail content can be added later.`,
        backHref: "/skills",
        backLabel: "Back to Skills",
      }
    : {
        eyebrow: "Skill 详情",
        title: "Skill 详情页骨架",
        description: `当前路由参数：${slug}。首页里的精选 Skill 和最新更新已经能跳到这个独立详情路由，后续可继续补真实详情内容。`,
        backHref: "/skills",
        backLabel: "返回技能库",
      };
}

export function getCategoryDetailPageProps(locale: Locale, slug: string) {
  return locale === "en"
    ? {
        eyebrow: "Category Detail",
        title: "Category Detail Pending Design",
        description: `Current route param: ${slug}. The category overview page is ready, but this secondary page is still waiting for its dedicated design and detail requirements.`,
        backHref: "/categories",
        backLabel: "Back to Categories",
      }
    : {
        eyebrow: "分类详情",
        title: "分类详情页待设计",
        description: `当前路由参数：${slug}。分类总览页已经完成，但这个二级详情页还在等待单独的设计稿和详细需求。`,
        backHref: "/categories",
        backLabel: "返回分类",
      };
}

export function getTutorialDetailPageProps(locale: Locale, slug: string) {
  return locale === "en"
    ? {
        eyebrow: "Tutorial Detail",
        title: "Tutorial Detail Scaffold",
        description: `Current route param: ${slug}. Homepage tutorial cards already link here. Chapters, duration, and the full article can be added later.`,
        backHref: "/tutorials",
        backLabel: "Back to Tutorials",
      }
    : {
        eyebrow: "教程详情",
        title: "教程详情页骨架",
        description: `当前路由参数：${slug}。首页教程卡片已经可以跳到这里，后续可继续补章节、时长和正文内容。`,
        backHref: "/tutorials",
        backLabel: "返回教程",
      };
}

export function getNotFoundPageProps(locale: Locale) {
  const copy = getMessages(locale).placeholder;

  return locale === "en"
    ? {
        eyebrow: "Not Found",
        title: "Page Not Found",
        description: "The page you visited does not exist or is not available yet. You can return to the homepage and continue browsing skillnetic.ai.",
        backHref: "/",
        backLabel: copy.backHome,
      }
    : {
        eyebrow: "未找到",
        title: "页面不存在",
        description: "当前访问的页面不存在或尚未开放。你可以先回到首页继续浏览 skillnetic.ai。",
        backHref: "/",
        backLabel: copy.backHome,
      };
}
