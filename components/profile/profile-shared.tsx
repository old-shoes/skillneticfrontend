"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LocalizedLink } from "@/components/LocalizedLink";
import { dailyMeCheckIn } from "@/lib/api/profile";
import { clearAuthSession, logoutAuth } from "@/lib/auth";
import type { Locale } from "@/lib/i18n";
import { formatChinaDate, formatChinaDateTime, stripLocaleFromPath, withLocale } from "@/lib/i18n";

const sidebarAsset = {
  my: "/icons/profile-sidebar-assets/menu-my.svg",
  submit: "/icons/profile-right-panel-assets/quick-submit-skill.svg",
  submissions: "/icons/profile-sidebar-assets/menu-submissions.svg",
  favorites: "/icons/profile-sidebar-assets/menu-favorites.svg",
  points: "/icons/profile-sidebar-assets/menu-points.svg",
  notifications: "/icons/profile-sidebar-assets/menu-notifications.svg",
  security: "/icons/profile-sidebar-assets/menu-account-security.svg",
  settings: "/icons/profile-sidebar-assets/menu-account-settings.svg",
  logout: "/icons/profile-sidebar-assets/logout.svg",
} as const;

export function getProfileCopy(locale: Locale) {
  if (locale === "en") {
    return {
      brand: "Profile Center",
      title: "My Workspace",
      description: "Manage your account, recent submissions, points, and notifications from one place.",
      checking: "Checking your login status...",
      loading: "Loading your workspace...",
      loginTitle: "Log in to open your workspace",
      loginDescription: "Your submissions, favorites, points, and account settings are available after you sign in.",
      login: "Log in",
      register: "Create account",
      save: "Save Changes",
      saving: "Saving...",
      retry: "Retry",
      cancel: "Cancel",
      sidebar: {
        my: "My",
        submit: "Submit Skill",
        submissions: "My Submissions",
        favorites: "My Favorites",
        points: "Points Center",
        notifications: "Notifications",
        security: "Account Security",
        settings: "Account Settings",
        logout: "Log out",
      },
      empty: "No data yet.",
    };
  }

  return {
    brand: "个人中心",
    title: "我的工作台",
    description: "在一个页面里管理账号资料、最近提交、积分和通知。",
    checking: "正在检查登录状态...",
    loading: "正在加载个人中心...",
    loginTitle: "登录后打开个人中心",
    loginDescription: "提交记录、收藏、积分和账号设置需要登录后查看。",
    login: "登录",
    register: "注册账号",
    save: "保存修改",
    saving: "保存中...",
    retry: "重试",
    cancel: "取消",
    sidebar: {
      my: "我的",
      submit: "提交 Skill",
      submissions: "我的提交",
      favorites: "我的收藏",
      points: "积分中心",
      notifications: "通知中心",
      security: "账号安全",
      settings: "账号设置",
      logout: "退出登录",
    },
    empty: "暂时没有数据。",
  };
}

export function getProfileInitials(name: string) {
  const value = name.trim();
  if (!value) {
    return "S";
  }
  return value.slice(0, 2).toUpperCase();
}

export function formatProfileDate(value: string | null | undefined, locale: Locale) {
  return formatChinaDate(value, locale);
}

export function formatProfileDateTime(value: string | null | undefined, locale: Locale) {
  return formatChinaDateTime(value, locale);
}

export function ProfileLoginRequired({
  locale,
  title,
  description,
  error,
  embedded = false,
}: {
  locale: Locale;
  title: string;
  description: string;
  error?: string | null;
  embedded?: boolean;
}) {
  const copy = getProfileCopy(locale);

  if (embedded) {
    return (
      <div className="rounded-[32px] border border-white/80 bg-white/94 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
        <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
        {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <LocalizedLink href="/login" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700">
            {copy.login}
          </LocalizedLink>
          <LocalizedLink href="/register" className="rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white">
            {copy.register}
          </LocalizedLink>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-[linear-gradient(180deg,#f8fbff_0%,#f4f7fb_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-white/80 bg-white/94 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
        <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
        {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <LocalizedLink href="/login" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700">
            {copy.login}
          </LocalizedLink>
          <LocalizedLink href="/register" className="rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white">
            {copy.register}
          </LocalizedLink>
        </div>
      </div>
    </main>
  );
}

function SidebarIcon({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" />;
}

export function ProfileSidebar({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const copy = getProfileCopy(locale);
  const strippedPath = stripLocaleFromPath(pathname);
  const section = strippedPath.split("/").filter(Boolean)[1] || "";

  async function handleLogout() {
    try {
      await logoutAuth();
    } catch {
      // ignore remote logout failures and still clear the local session
    }
    clearAuthSession();
    router.push(withLocale(locale, "/"));
  }

  const items = [
    { href: "/me", label: copy.sidebar.my, icon: sidebarAsset.my, active: section === "me" || section === "" },
    { href: "/me/submit", label: copy.sidebar.submit, icon: sidebarAsset.submit, active: section === "submit" || section === "submit-success" },
    { href: "/me/submissions", label: copy.sidebar.submissions, icon: sidebarAsset.submissions, active: section === "submissions" },
    { href: "/me/favorites", label: copy.sidebar.favorites, icon: sidebarAsset.favorites, active: section === "favorites" },
    { href: "/me/points", label: copy.sidebar.points, icon: sidebarAsset.points, active: section === "points" },
    { href: "/me/notifications", label: copy.sidebar.notifications, icon: sidebarAsset.notifications, active: section === "notifications" },
    { href: "/me/security", label: copy.sidebar.security, icon: sidebarAsset.security, active: section === "security" },
    { href: "/me/settings", label: copy.sidebar.settings, icon: sidebarAsset.settings, active: section === "settings" },
  ];

  return (
    <aside className="flex min-h-0 flex-col rounded-[24px] border border-white/80 bg-white/92 p-3 shadow-[0_24px_60px_rgba(15,23,42,0.06)] sm:rounded-[28px] sm:p-4 xl:min-h-[860px]">
      <nav className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-1">
        {items.map((item) => (
          <LocalizedLink
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-[16px] px-3 py-3 text-[14px] font-medium transition sm:gap-4 sm:rounded-[18px] sm:px-4 sm:py-4 sm:text-[15px] ${
              item.active
                ? "bg-[linear-gradient(135deg,#eef2ff_0%,#f5f3ff_100%)] text-[#4f46e5]"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <SidebarIcon src={item.icon} alt={item.label} />
            <span className="min-w-0 break-words leading-5">{item.label}</span>
          </LocalizedLink>
        ))}
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 flex items-center gap-3 rounded-[16px] px-3 py-3 text-left text-[14px] font-medium text-slate-700 transition hover:bg-slate-50 sm:mt-3 sm:gap-4 sm:rounded-[18px] sm:px-4 sm:py-4 sm:text-[15px] xl:mt-auto"
        >
          <SidebarIcon src={sidebarAsset.logout} alt={copy.sidebar.logout} />
          {copy.sidebar.logout}
        </button>
      </nav>
    </aside>
  );
}

export function ProfileWorkspaceShell({
  title,
  description,
  compactHeader = false,
  children,
}: {
  locale?: Locale;
  title?: string;
  description?: string;
  compactHeader?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      {title ? (
        <div
          className={`rounded-[24px] border border-white/80 bg-white/94 shadow-[0_24px_60px_rgba(15,23,42,0.06)] sm:rounded-[30px] ${
            compactHeader ? "p-4 sm:px-6 sm:py-5" : "p-4 sm:p-7"
          }`}
        >
          <h1
            className={`font-semibold tracking-[-0.04em] text-slate-950 ${
              compactHeader ? "text-[22px] sm:text-[26px] lg:text-[30px]" : "text-[24px] sm:text-[30px] lg:text-[36px]"
            }`}
          >
            {title}
          </h1>
          {description ? (
            <p
              className={`max-w-3xl text-slate-600 ${
                compactHeader ? "mt-2 text-[14px] leading-6 sm:text-[15px]" : "mt-4 text-[15px] leading-7 sm:text-[17px] lg:text-[18px] lg:leading-8"
              }`}
            >
              {description}
            </p>
          ) : null}
        </div>
      ) : null}
      {children}
    </>
  );
}

export function ProfileWorkspaceLayout({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  useEffect(() => {
    void dailyMeCheckIn().catch(() => {
      // ignore unauthenticated or transient failures; page components handle auth state separately
    });
  }, []);

  return (
    <main className="min-h-[calc(100vh-62px)] bg-[linear-gradient(180deg,#fbfdff_0%,#f4f7fb_100%)] px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto max-w-[1680px]">
        <div className="grid gap-4 sm:gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
          <ProfileSidebar locale={locale} />
          <section className="grid min-w-0 gap-4 sm:gap-6">{children}</section>
        </div>
      </div>
    </main>
  );
}
