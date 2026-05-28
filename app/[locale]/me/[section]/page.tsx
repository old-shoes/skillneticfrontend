import { notFound } from "next/navigation";
import { PlaceholderPage } from "@/components/PlaceholderPage";
import { ProfileFavoritesPage } from "@/components/profile/ProfileFavoritesPage";
import { ProfileNotificationsPage } from "@/components/profile/ProfileNotificationsPage";
import { ProfilePointsPage } from "@/components/profile/ProfilePointsPage";
import { ProfileSecurityPage } from "@/components/profile/ProfileSecurityPage";
import { ProfileSettingsPage } from "@/components/profile/ProfileSettingsPage";
import { SubmitSkillPage } from "@/components/submit-skill/SubmitSkillPage";
import { SubmitSkillSuccessPage } from "@/components/submit-skill/SubmitSkillSuccessPage";
import { MySkillSubmissionsPage } from "@/components/submit-skill/MySkillSubmissionsPage";
import { getCategories } from "@/lib/api/categories";
import { getSubmitSkillMeta } from "@/lib/api/submit-skill";
import type { Locale } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n";

type Props = {
  params: Promise<{
    locale: string;
    section: string;
  }>;
  searchParams: Promise<{
    id?: string;
  }>;
};

async function getSubmitPageMeta(locale: Locale) {
  const [meta, categoryResponse] = await Promise.all([
    getSubmitSkillMeta(),
    getCategories({ sort: "default" }, locale),
  ]);

  const metaCategories = Array.isArray(meta.categories) ? meta.categories : [];
  const pageCategories = Array.isArray(categoryResponse?.list) ? categoryResponse.list : [];

  const categories =
    metaCategories.length === 0
      ? pageCategories.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
        }))
      : (() => {
          const merged: typeof metaCategories = [];
          const usedSlugs = new Set<string>();

          pageCategories.forEach((item) => {
            const matched = metaCategories.find((category) => category.slug === item.slug);
            if (!matched || usedSlugs.has(matched.slug)) {
              return;
            }
            usedSlugs.add(matched.slug);
            merged.push({
              id: matched.id,
              name: matched.name,
              slug: matched.slug,
            });
          });

          metaCategories.forEach((item) => {
            if (!usedSlugs.has(item.slug)) {
              usedSlugs.add(item.slug);
              merged.push(item);
            }
          });

          return merged;
        })();

  return {
    ...meta,
    categories,
  };
}

function getProfileSectionProps(locale: Locale, section: string) {
  const copy = locale === "en"
    ? {
        favorites: {
          eyebrow: "Favorites",
          title: "Favorites Page Entry",
          description: "The favorites route is reserved. You can continue with the real collection list and favorite management here.",
        },
        points: {
          eyebrow: "Points Center",
          title: "Points Page Entry",
          description: "The points detail route is ready. You can add the real points ledger, filtering, and reward history here.",
        },
        notifications: {
          eyebrow: "Notifications",
          title: "Notifications Page Entry",
          description: "The notifications route is ready. You can continue with the full list, read status, and filters here.",
        },
        security: {
          eyebrow: "Account Security",
          title: "Security Page Entry",
          description: "The security route is reserved. You can continue with device management, login methods, and verification settings here.",
        },
        settings: {
          eyebrow: "Account Settings",
          title: "Settings Page Entry",
          description: "The settings route is ready. You can continue with profile editing, locale, avatar, and preferences here.",
        },
        drafts: {
          eyebrow: "Drafts",
          title: "Drafts Page Entry",
          description: "The drafts route is reserved. You can continue with draft filtering and editing entry points here.",
        },
      }
    : {
        favorites: {
          eyebrow: "我的收藏",
          title: "收藏页开发入口",
          description: "收藏路由已经预留好，后续可以在这里继续接真实收藏列表和取消收藏逻辑。",
        },
        points: {
          eyebrow: "积分中心",
          title: "积分页开发入口",
          description: "积分明细路由已经可用，后续可以在这里补真实流水、筛选和奖励记录。",
        },
        notifications: {
          eyebrow: "通知中心",
          title: "通知页开发入口",
          description: "通知路由已经预留好，后续可以在这里继续接完整通知列表、已读状态和筛选。",
        },
        security: {
          eyebrow: "账号安全",
          title: "安全页开发入口",
          description: "安全路由已经预留好，后续可以在这里继续接设备管理、登录方式和验证设置。",
        },
        settings: {
          eyebrow: "账号设置",
          title: "设置页开发入口",
          description: "设置路由已经可用，后续可以在这里继续接资料编辑、语言、头像和偏好设置。",
        },
        drafts: {
          eyebrow: "我的草稿",
          title: "草稿页开发入口",
          description: "草稿路由已经预留好，后续可以在这里接草稿筛选和继续编辑入口。",
        },
      };

  return copy[section as keyof typeof copy] ?? null;
}

export default async function LocaleMeSectionPage({ params, searchParams }: Props) {
  const { locale, section } = await params;
  const { id } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  if (section === "submit") {
    const meta = await getSubmitPageMeta(locale);
    return <SubmitSkillPage locale={locale} meta={meta} embedded />;
  }

  if (section === "submit-success") {
    return <SubmitSkillSuccessPage locale={locale} submissionId={id} embedded />;
  }

  if (section === "submissions") {
    return <MySkillSubmissionsPage locale={locale} />;
  }

  if (section === "settings") {
    return <ProfileSettingsPage locale={locale} />;
  }

  if (section === "favorites") {
    return <ProfileFavoritesPage locale={locale} />;
  }

  if (section === "points") {
    return <ProfilePointsPage locale={locale} />;
  }

  if (section === "notifications") {
    return <ProfileNotificationsPage locale={locale} />;
  }

  if (section === "security") {
    return <ProfileSecurityPage locale={locale} />;
  }

  const pageProps = getProfileSectionProps(locale, section);
  if (!pageProps) {
    notFound();
  }

  return <PlaceholderPage {...pageProps} backHref="/me" />;
}
