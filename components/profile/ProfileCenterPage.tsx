"use client";

import { useEffect, useState } from "react";
import { LocalizedLink } from "@/components/LocalizedLink";
import { ProfileLoginRequired } from "@/components/profile/profile-shared";
import { getMeSkillSubmissions, getProfileOverview, getProfileSecurity } from "@/lib/api/profile";
import { clearAuthSession, fetchRealMe } from "@/lib/auth";
import type { Locale } from "@/lib/i18n";
import { formatChinaDate, localeNumberFormat } from "@/lib/i18n";
import type { ProfileOverview, ProfileSecurity } from "@/lib/types/profile";
import type { SkillSubmissionListItem, SkillSubmitStatus } from "@/lib/types/submit-skill";

type Props = {
  locale: Locale;
};

type SubmissionFilter = "all" | SkillSubmitStatus;

const asset = {
  sidebar: {
    my: "/icons/profile-sidebar-assets/menu-my.svg",
    submissions: "/icons/profile-sidebar-assets/menu-submissions.svg",
    favorites: "/icons/profile-sidebar-assets/menu-favorites.svg",
    points: "/icons/profile-sidebar-assets/menu-points.svg",
    notifications: "/icons/profile-sidebar-assets/menu-notifications.svg",
    security: "/icons/profile-sidebar-assets/menu-account-security.svg",
    settings: "/icons/profile-sidebar-assets/menu-account-settings.svg",
    logout: "/icons/profile-sidebar-assets/logout.svg",
  },
  profile: {
    edit: "/icons/profile-profile-assets/edit-profile.svg",
    safe: "/icons/profile-profile-assets/account-safe.svg",
    email: "/icons/profile-profile-assets/email-verified.svg",
    github: "/icons/profile-profile-assets/github-bound.svg",
    join: "/icons/profile-profile-assets/calendar-join.svg",
    location: "/icons/profile-profile-assets/location.svg",
  },
  stats: {
    favorites: "/icons/profile-stats-assets/stat-favorites.svg",
    submissions: "/icons/profile-stats-assets/stat-submissions.svg",
    reviewing: "/icons/profile-stats-assets/stat-reviewing.svg",
    helpPosts: "/icons/profile-stats-assets/stat-help-posts.svg",
  },
  rightPanel: {
    points: "/icons/profile-right-panel-assets/points-star.svg",
    noticeApproved: "/icons/profile-right-panel-assets/notice-approved.svg",
    noticeReviewing: "/icons/profile-right-panel-assets/notice-reviewing.svg",
    noticeReply: "/icons/profile-right-panel-assets/notice-reply.svg",
    accountEmail: "/icons/profile-right-panel-assets/account-email.svg",
    accountGithub: "/icons/profile-right-panel-assets/account-github.svg",
    accountPassword: "/icons/profile-right-panel-assets/account-password.svg",
    quickSubmit: "/icons/profile-right-panel-assets/quick-submit-skill.svg",
    quickHelp: "/icons/profile-right-panel-assets/quick-help-post.svg",
    quickDrafts: "/icons/profile-right-panel-assets/quick-drafts.svg",
  },
  submissions: {
    category: "/icons/profile-submissions-assets/category-badge.svg",
    approved: "/icons/profile-submissions-assets/status-approved.svg",
    reviewing: "/icons/profile-submissions-assets/status-reviewing.svg",
    rejected: "/icons/profile-submissions-assets/status-rejected.svg",
    revision: "/icons/profile-submissions-assets/status-revision.svg",
    view: "/icons/profile-submissions-assets/view-button.svg",
  },
  shared: {
    arrowRight: "/icons/profile-shared-assets/arrow-right.svg",
    more: "/icons/profile-shared-assets/more-horizontal.svg",
  },
} as const;

function getCopy(locale: Locale) {
  if (locale === "en") {
    return {
      checking: "Checking your login status...",
      loading: "Loading your workspace...",
      loginTitle: "Log in to open your workspace",
      loginDescription: "Your submissions, favorites, points, and account settings are available after you sign in.",
      login: "Log in",
      register: "Create account",
      sidebar: {
        my: "My",
        submissions: "My Submissions",
        favorites: "My Favorites",
        points: "Points Center",
        notifications: "Notifications",
        security: "Account Security",
        settings: "Account Settings",
        logout: "Log out",
      },
      actions: {
        editProfile: "Edit Profile",
        accountSecurity: "Account Security",
        pointDetails: "View points details",
        viewAllNotifications: "View all",
        viewAllSubmissions: "View all submissions",
        view: "View",
        continueEdit: "Continue Editing",
        viewReason: "View Reason",
      },
      stats: {
        favorites: "My Favorites",
        submissions: "My Submissions",
        reviewing: "Pending Review",
        helpPosts: "Help Posts",
        units: {
          favorites: "skills",
          submissions: "items",
          reviewing: "items",
          helpPosts: "posts",
        },
      },
      points: {
        title: "Points Center",
        current: "Current Points",
        earn: "Earn Points",
        consume: "Use Points",
      },
      notifications: {
        title: "Notifications",
        empty: "No notifications yet.",
      },
      security: {
        title: "Account Security",
        email: "Email Verified",
        github: "GitHub Connected",
        password: "Change Password",
        enabled: "Verified",
        pending: "Pending",
        bound: "Connected",
      },
      quick: {
        title: "Quick Access",
        submit: "Submit Skill",
        help: "Create Help Post",
        drafts: "My Drafts",
      },
      profile: {
        bioFallback: "You can add a short bio from account settings later.",
        locationFallback: "Location not set",
        joinedAt: "Joined",
        emailVerified: "Email Verified",
        emailPending: "Email Not Verified",
        githubBound: "GitHub Connected",
        githubPending: "GitHub Not Connected",
      },
      submission: {
        title: "My Submissions",
        subtitle: "Manage your Skill submissions and review status in one place.",
        empty: "No submissions yet. Start your first Skill draft.",
        loading: "Loading submissions...",
      },
      tabs: {
        all: "All",
        pending_review: "Reviewing",
        approved: "Approved",
        needs_revision: "Needs Revision",
        rejected: "Rejected",
        draft: "Draft",
      },
      table: {
        title: "Skill Title",
        category: "Category",
        status: "Status",
        date: "Submitted",
        action: "Action",
      },
      status: {
        draft: "Draft",
        pending_review: "Reviewing",
        approved: "Approved",
        rejected: "Rejected",
        needs_revision: "Needs Revision",
        withdrawn: "Withdrawn",
      },
      date: {
        today: "Today",
        daysAgo: "days ago",
      },
    };
  }

  return {
    checking: "正在检查登录状态...",
    loading: "正在加载个人中心...",
    loginTitle: "登录后打开个人中心",
    loginDescription: "提交记录、收藏、积分和账号设置需要登录后查看。",
    login: "登录",
    register: "注册账号",
    sidebar: {
      my: "我的",
      submissions: "我的提交",
      favorites: "我的收藏",
      points: "积分中心",
      notifications: "通知中心",
      security: "账号安全",
      settings: "账号设置",
      logout: "退出登录",
    },
    actions: {
      editProfile: "编辑资料",
      accountSecurity: "账号安全",
      pointDetails: "查看积分明细",
      viewAllNotifications: "查看全部",
      viewAllSubmissions: "查看全部提交",
      view: "查看",
      continueEdit: "继续修改",
      viewReason: "查看原因",
    },
    stats: {
      favorites: "我的收藏",
      submissions: "我的提交",
      reviewing: "审核中",
      helpPosts: "求助帖",
      units: {
        favorites: "个 Skill",
        submissions: "个",
        reviewing: "个",
        helpPosts: "个",
      },
    },
    points: {
      title: "积分中心",
      current: "当前积分",
      earn: "获得积分",
      consume: "消耗积分",
    },
    notifications: {
      title: "通知中心",
      empty: "暂时还没有通知。",
    },
    security: {
      title: "账号安全",
      email: "邮箱已验证",
      github: "GitHub 已绑定",
      password: "修改密码",
      enabled: "已验证",
      pending: "待处理",
      bound: "已绑定",
    },
    quick: {
      title: "快捷入口",
      submit: "提交 Skill",
      help: "发布求助帖",
      drafts: "我的草稿",
    },
    profile: {
      bioFallback: "AI 爱好者，专注于分享实用的 AI 技能与提示词",
      locationFallback: "暂未设置所在地",
      joinedAt: "加入于",
      emailVerified: "邮箱已验证",
      emailPending: "邮箱未验证",
      githubBound: "GitHub 已绑定",
      githubPending: "GitHub 未绑定",
    },
    submission: {
      title: "我的提交",
      subtitle: "集中管理你的 Skill 提交记录和审核进度。",
      empty: "还没有提交记录，先创建第一个 Skill 草稿。",
      loading: "正在加载提交记录...",
    },
    tabs: {
      all: "全部",
      pending_review: "审核中",
      approved: "已通过",
      needs_revision: "需修改",
      rejected: "已拒绝",
      draft: "草稿",
    },
    table: {
      title: "Skill 标题",
      category: "分类",
      status: "状态",
      date: "提交时间",
      action: "操作",
    },
    status: {
      draft: "草稿",
      pending_review: "审核中",
      approved: "已通过",
      rejected: "未通过",
      needs_revision: "需修改",
      withdrawn: "已撤回",
    },
    date: {
      today: "今天",
      daysAgo: "天前",
    },
  };
}

function AssetIcon({
  src,
  alt,
  className = "h-5 w-5",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return <img src={src} alt={alt} className={className} />;
}

function formatDate(value: string | null | undefined, locale: Locale) {
  return formatChinaDate(value, locale);
}

function formatRelativeDate(value: string | null | undefined, locale: Locale) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const copy = getCopy(locale);
  if (days <= 0) {
    return copy.date.today;
  }
  return locale === "en" ? `${days} ${copy.date.daysAgo}` : `${days}${copy.date.daysAgo}`;
}

function getProfileInitials(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    return "S";
  }
  return trimmed.slice(0, 2).toUpperCase();
}

function notificationAsset(type: string) {
  if (type === "skill_approved") {
    return asset.rightPanel.noticeApproved;
  }
  if (type === "skill_pending_review" || type === "skill_needs_revision") {
    return asset.rightPanel.noticeReviewing;
  }
  return asset.rightPanel.noticeReply;
}

function statusMeta(status: SkillSubmitStatus, copy: ReturnType<typeof getCopy>) {
  switch (status) {
    case "approved":
      return {
        label: copy.status.approved,
        icon: asset.submissions.approved,
        badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-600",
      };
    case "pending_review":
      return {
        label: copy.status.pending_review,
        icon: asset.submissions.reviewing,
        badgeClassName: "border-amber-200 bg-amber-50 text-amber-600",
      };
    case "rejected":
      return {
        label: copy.status.rejected,
        icon: asset.submissions.rejected,
        badgeClassName: "border-rose-200 bg-rose-50 text-rose-600",
      };
    case "needs_revision":
      return {
        label: copy.status.needs_revision,
        icon: asset.submissions.revision,
        badgeClassName: "border-sky-200 bg-sky-50 text-sky-600",
      };
    default:
      return {
        label: copy.status.draft,
        icon: asset.submissions.reviewing,
        badgeClassName: "border-slate-200 bg-slate-100 text-slate-600",
      };
  }
}

function getSubmissionAction(item: SkillSubmissionListItem, copy: ReturnType<typeof getCopy>) {
  if (item.status === "draft" || item.status === "needs_revision") {
    return {
      label: copy.actions.continueEdit,
      href: `/me/submit?id=${item.id}&step=basic`,
    };
  }
  if (item.status === "rejected") {
    return {
      label: copy.actions.viewReason,
      href: `/me/submit?id=${item.id}&step=review`,
    };
  }
  return {
    label: copy.actions.view,
    href: `/me/submit?id=${item.id}&step=review`,
  };
}

function SubmissionThumb({ item }: { item: SkillSubmissionListItem }) {
  if (item.coverImage) {
    return (
      <img
        src={item.coverImage}
        alt={item.title}
        className="h-[56px] w-[92px] rounded-[12px] object-cover shadow-[0_10px_24px_rgba(15,23,42,0.10)] sm:h-[64px] sm:w-[116px] sm:rounded-[14px]"
      />
    );
  }

  return (
    <div className="flex h-[56px] w-[92px] items-end rounded-[12px] bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_100%)] px-2.5 py-2 text-[11px] font-semibold text-white shadow-[0_10px_24px_rgba(15,23,42,0.10)] sm:h-[64px] sm:w-[116px] sm:rounded-[14px] sm:px-3 sm:text-[12px]">
      <span className="line-clamp-2">{item.title}</span>
    </div>
  );
}

export function ProfileCenterPage({ locale }: Props) {
  const copy = getCopy(locale);
  const [authReady, setAuthReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<ProfileOverview | null>(null);
  const [security, setSecurity] = useState<ProfileSecurity | null>(null);
  const [submissionTab, setSubmissionTab] = useState<SubmissionFilter>("all");
  const [submissions, setSubmissions] = useState<SkillSubmissionListItem[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        await fetchRealMe();
        if (!active) {
          return;
        }
        setAuthed(true);
        const [overviewData, securityData] = await Promise.all([getProfileOverview(), getProfileSecurity()]);
        if (!active) {
          return;
        }
        setOverview(overviewData);
        setSecurity(securityData);
      } catch (err) {
        if (!active) {
          return;
        }
        clearAuthSession();
        setAuthed(false);
        setError(err instanceof Error ? err.message : "Request failed");
      } finally {
        if (active) {
          setAuthReady(true);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!authed) {
      return;
    }

    let active = true;

    async function loadSubmissions() {
      setSubmissionsLoading(true);
      setSubmissionsError(null);
      try {
        const data = await getMeSkillSubmissions({
          page: 1,
          pageSize: 6,
          status: submissionTab,
        });
        if (!active) {
          return;
        }
        setSubmissions(data.list);
      } catch (err) {
        if (!active) {
          return;
        }
        setSubmissionsError(err instanceof Error ? err.message : "Request failed");
      } finally {
        if (active) {
          setSubmissionsLoading(false);
        }
      }
    }

    loadSubmissions();
    return () => {
      active = false;
    };
  }, [authed, submissionTab]);

  if (!authReady) {
    return <div className="px-6 py-10 text-sm text-slate-500">{copy.checking}</div>;
  }

  if (!authed) {
    return (
      <ProfileLoginRequired
        locale={locale}
        title={copy.loginTitle}
        description={copy.loginDescription}
        error={error}
        embedded
      />
    );
  }

  if (loading && !overview) {
    return <div className="px-6 py-10 text-sm text-slate-500">{copy.loading}</div>;
  }

  if (!overview) {
    return null;
  }

  const stats = [
    {
      key: "favorites",
      label: copy.stats.favorites,
      value: overview.stats.favoriteCount,
      unit: copy.stats.units.favorites,
      icon: asset.stats.favorites,
    },
    {
      key: "submissions",
      label: copy.stats.submissions,
      value: overview.stats.submissionCount,
      unit: copy.stats.units.submissions,
      icon: asset.stats.submissions,
    },
    {
      key: "reviewing",
      label: copy.stats.reviewing,
      value: overview.stats.pendingReviewCount,
      unit: copy.stats.units.reviewing,
      icon: asset.stats.reviewing,
    },
    {
      key: "helpPosts",
      label: copy.stats.helpPosts,
      value: overview.stats.helpPostCount,
      unit: copy.stats.units.helpPosts,
      icon: asset.stats.helpPosts,
    },
  ];

  const submissionTabs: Array<{ key: SubmissionFilter; label: string }> = [
    { key: "all", label: copy.tabs.all },
    { key: "pending_review", label: copy.tabs.pending_review },
    { key: "approved", label: copy.tabs.approved },
    { key: "needs_revision", label: copy.tabs.needs_revision },
    { key: "rejected", label: copy.tabs.rejected },
    { key: "draft", label: copy.tabs.draft },
  ];

  const notifications = Array.isArray(overview.recentNotifications) ? overview.recentNotifications.slice(0, 3) : [];
  const emailVerified = security?.emailVerified ?? overview.user.emailVerified;
  const githubConnected = security?.githubConnected ?? overview.user.githubConnected;
  const profileSecurityRows = [
    {
      icon: asset.rightPanel.accountEmail,
      label: copy.security.email,
      status: emailVerified ? copy.security.enabled : copy.security.pending,
      href: "/me/security",
      showBadge: true,
    },
    {
      icon: asset.rightPanel.accountGithub,
      label: copy.security.github,
      status: githubConnected ? copy.security.bound : copy.security.pending,
      href: "/me/security",
      showBadge: true,
    },
    {
      icon: asset.rightPanel.accountPassword,
      label: copy.security.password,
      status: "",
      href: "/account/security/change-password",
      showBadge: false,
    },
  ];

  return (
    <>
      {error ? (
        <div className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      ) : null}

      <div className="rounded-[24px] border border-white/80 bg-white/94 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.06)] sm:rounded-[30px] sm:p-7">
              <div className="flex flex-col gap-6 sm:gap-8 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
                  {overview.user.avatarUrl ? (
                    <img
                      src={overview.user.avatarUrl}
                      alt={overview.user.nickname}
                      className="h-[76px] w-[76px] rounded-full object-cover shadow-[0_16px_30px_rgba(59,130,246,0.15)] sm:h-[92px] sm:w-[92px] lg:h-[108px] lg:w-[108px]"
                    />
                  ) : (
                    <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#bfdbfe_0%,#c4b5fd_100%)] text-[20px] font-semibold text-slate-900 shadow-[0_16px_30px_rgba(99,102,241,0.13)] sm:h-[92px] sm:w-[92px] sm:text-[23px] lg:h-[108px] lg:w-[108px] lg:text-[26px]">
                      {getProfileInitials(overview.user.nickname)}
                    </div>
                  )}

                  <div className="min-w-0 pt-1">
                    <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-slate-950 sm:text-[30px] lg:text-[36px]">
                      {overview.user.nickname}
                    </h1>
                    <div className="mt-2 text-[14px] text-slate-600 sm:mt-3 sm:text-[16px] lg:text-[18px]">{overview.user.email}</div>
                    <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[12px] font-semibold text-emerald-600 sm:px-3 sm:py-2 sm:text-[14px]">
                        <AssetIcon src={asset.profile.email} alt="email" className="h-[16px] w-[16px] sm:h-[18px] sm:w-[18px]" />
                        <span>{emailVerified ? copy.profile.emailVerified : copy.profile.emailPending}</span>
                      </span>
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-semibold sm:px-3 sm:py-2 sm:text-[14px] ${
                          githubConnected
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <AssetIcon src={asset.profile.github} alt="github" className="h-[16px] w-[16px] sm:h-[18px] sm:w-[18px]" />
                        <span>{githubConnected ? copy.profile.githubBound : copy.profile.githubPending}</span>
                      </span>
                    </div>
                    <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-600 sm:mt-5 sm:text-[17px] lg:text-[18px] lg:leading-8">
                      {overview.user.bio || copy.profile.bioFallback}
                    </p>
                    <div className="mt-5 flex flex-col gap-2 text-[14px] text-slate-600 sm:mt-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-3 sm:text-[15px]">
                      <div className="inline-flex items-center gap-2">
                        <AssetIcon src={asset.profile.join} alt="joined" className="h-[16px] w-[16px] sm:h-[18px] sm:w-[18px]" />
                        <span>
                          {copy.profile.joinedAt} {formatDate(overview.user.joinedAt, locale)}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-2">
                        <AssetIcon src={asset.profile.location} alt="location" className="h-[16px] w-[16px] sm:h-[18px] sm:w-[18px]" />
                        <span>{overview.user.location || copy.profile.locationFallback}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:flex sm:flex-wrap xl:self-end">
                  <LocalizedLink
                    href="/me/settings"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-[14px] font-semibold text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:w-auto sm:px-5 sm:text-[15px]"
                  >
                    <AssetIcon src={asset.profile.edit} alt="edit" className="h-[16px] w-[16px] sm:h-[18px] sm:w-[18px]" />
                    <span>{copy.actions.editProfile}</span>
                  </LocalizedLink>
                  <LocalizedLink
                    href="/me/security"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-[14px] font-semibold text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:w-auto sm:px-5 sm:text-[15px]"
                  >
                    <AssetIcon src={asset.profile.safe} alt="security" className="h-[16px] w-[16px] sm:h-[18px] sm:w-[18px]" />
                    <span>{copy.actions.accountSecurity}</span>
                  </LocalizedLink>
                </div>
              </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[20px] border border-white/80 bg-white/94 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                <div className="flex items-center gap-3">
                  <AssetIcon src={asset.rightPanel.points} alt="points" className="h-[38px] w-[38px]" />
                  <div>
                    <div className="text-[13px] text-slate-500">{copy.points.current}</div>
                    <div className="mt-1 text-[28px] font-semibold leading-none tracking-[-0.04em] text-slate-950">
                      {overview.pointSummary.currentPoints}
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid gap-1.5 text-[13px] text-slate-700">
                  {overview.pointSummary.rules.earn.slice(0, 2).map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-3">
                      <span className="truncate">+ {item.label}</span>
                      <span className="shrink-0 font-semibold text-emerald-600">+{item.points}</span>
                    </div>
                  ))}
                </div>
                <LocalizedLink
                  href="/me/points"
                  className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-[#4f46e5]"
                >
                  <span>{copy.actions.pointDetails}</span>
                  <AssetIcon src={asset.shared.arrowRight} alt="arrow" className="h-[14px] w-[14px]" />
                </LocalizedLink>
        </div>

        <div className="rounded-[20px] border border-white/80 bg-white/94 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[18px] font-semibold tracking-[-0.03em] text-slate-950">{copy.notifications.title}</h3>
                  <LocalizedLink
                    href="/me/notifications"
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#4f46e5]"
                  >
                    <span>{copy.actions.viewAllNotifications}</span>
                    <AssetIcon src={asset.shared.arrowRight} alt="arrow" className="h-[13px] w-[13px]" />
                  </LocalizedLink>
                </div>
                <div className="mt-4 grid gap-3">
                  {notifications.length === 0 ? (
                    <div className="text-[13px] text-slate-500">{copy.notifications.empty}</div>
                  ) : (
                    notifications.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex gap-2.5">
                        <AssetIcon src={notificationAsset(item.type)} alt={item.type} className="mt-0.5 h-[18px] w-[18px]" />
                        <div className="min-w-0">
                          <div className="line-clamp-1 text-[13px] font-medium text-slate-900">{item.title}</div>
                          <div className="mt-1 text-[12px] text-slate-400">{formatRelativeDate(item.createdAt, locale)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
        </div>

        <div className="rounded-[20px] border border-white/80 bg-white/94 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                <h3 className="text-[18px] font-semibold tracking-[-0.03em] text-slate-950">{copy.security.title}</h3>
                <div className="mt-4 grid gap-3">
                  {profileSecurityRows.map((item) => (
                    <LocalizedLink key={item.label} href={item.href} className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <AssetIcon src={item.icon} alt={item.label} className="h-[18px] w-[18px]" />
                        <span className="truncate text-[13px] text-slate-900">{item.label}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {item.showBadge ? (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-semibold text-emerald-600">
                            {item.status}
                          </span>
                        ) : null}
                        <AssetIcon src={asset.shared.arrowRight} alt="arrow" className="h-[14px] w-[14px]" />
                      </div>
                    </LocalizedLink>
                  ))}
                </div>
        </div>

        <div className="rounded-[20px] border border-white/80 bg-white/94 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                <h3 className="text-[18px] font-semibold tracking-[-0.03em] text-slate-950">{copy.quick.title}</h3>
                <div className="mt-4 grid grid-cols-3 gap-2.5">
                  <LocalizedLink
                    href="/me/submit"
                    className="rounded-[14px] border border-slate-200 bg-white px-2 py-3 text-center shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
                  >
                    <AssetIcon src={asset.rightPanel.quickSubmit} alt={copy.quick.submit} className="mx-auto h-[32px] w-[32px]" />
                    <div className="mt-2 text-[12px] font-medium text-slate-700">{copy.quick.submit}</div>
                  </LocalizedLink>
                  <LocalizedLink
                    href="/community/help/create"
                    className="rounded-[14px] border border-slate-200 bg-white px-2 py-3 text-center shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
                  >
                    <AssetIcon src={asset.rightPanel.quickHelp} alt={copy.quick.help} className="mx-auto h-[32px] w-[32px]" />
                    <div className="mt-2 text-[12px] font-medium text-slate-700">{copy.quick.help}</div>
                  </LocalizedLink>
                  <LocalizedLink
                    href="/me/submissions?status=draft"
                    className="rounded-[14px] border border-slate-200 bg-white px-2 py-3 text-center shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
                  >
                    <AssetIcon src={asset.rightPanel.quickDrafts} alt={copy.quick.drafts} className="mx-auto h-[32px] w-[32px]" />
                    <div className="mt-2 text-[12px] font-medium text-slate-700">{copy.quick.drafts}</div>
                  </LocalizedLink>
                </div>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.key}
            className="rounded-[20px] border border-white/80 bg-white/94 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.05)] sm:rounded-[24px] sm:p-5"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <AssetIcon src={item.icon} alt={item.label} className="h-[42px] w-[42px] sm:h-[52px] sm:w-[52px]" />
              <div>
                <div className="text-[15px] font-semibold text-slate-800 sm:text-[16px]">{item.label}</div>
                <div className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.04em] text-slate-950 sm:text-[38px]">
                  {item.value}
                </div>
                <div className="mt-1 text-[13px] text-slate-500 sm:mt-2 sm:text-[15px]">{item.unit}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[24px] border border-white/80 bg-white/94 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.06)] sm:rounded-[30px] sm:p-6">
              <div className="border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-slate-950 sm:text-[28px]">
                    {copy.submission.title}
                  </h2>
                  <p className="mt-1 text-[14px] leading-6 text-slate-500 sm:text-[15px]">{copy.submission.subtitle}</p>
                </div>
              </div>

              <div className="-mx-2 mt-2 flex overflow-x-auto px-2">
                {submissionTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setSubmissionTab(tab.key)}
                    className={`relative mr-6 shrink-0 whitespace-nowrap border-b-2 px-0 py-3 text-[14px] font-semibold transition last:mr-0 ${
                      submissionTab === tab.key
                        ? "border-[#4f46e5] text-[#4f46e5]"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <div className="hidden grid-cols-[minmax(0,1.85fr)_132px_132px_122px_96px_28px] gap-6 border-b border-slate-100 px-4 pb-4 text-[14px] font-semibold text-slate-800 lg:grid">
                  <div>{copy.table.title}</div>
                  <div>{copy.table.category}</div>
                  <div>{copy.table.status}</div>
                  <div>{copy.table.date}</div>
                  <div>{copy.table.action}</div>
                  <div />
                </div>

                {submissionsError ? (
                  <div className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                    {submissionsError}
                  </div>
                ) : null}

                {submissionsLoading ? (
                  <div className="rounded-[20px] border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500 sm:px-6 sm:py-12">
                    {copy.submission.loading}
                  </div>
                ) : null}

                {!submissionsLoading && submissions.length === 0 ? (
                  <div className="rounded-[20px] border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500 sm:px-6 sm:py-12">
                    {copy.submission.empty}
                  </div>
                ) : null}

                {!submissionsLoading && submissions.length > 0 ? (
                  <div className="grid">
                    {submissions.map((item) => {
                      const meta = statusMeta(item.status, copy);
                      const action = getSubmissionAction(item, copy);
                      const tags = Array.isArray(item.tags) ? item.tags : [];
                      return (
                        <div
                          key={item.id}
                          className="mt-3 rounded-[20px] border border-slate-200 bg-slate-50/70 p-3 first:mt-0 sm:p-4 lg:mt-0 lg:grid lg:grid-cols-[minmax(0,1.85fr)_132px_132px_122px_96px_28px] lg:items-center lg:rounded-none lg:border-x-0 lg:border-b-0 lg:border-t lg:border-slate-100 lg:bg-transparent lg:px-4 lg:py-5 first:lg:border-t-0"
                        >
                          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                            <SubmissionThumb item={item} />
                            <div className="min-w-0">
                              <div className="truncate text-[16px] font-semibold text-slate-950 sm:text-[18px]">{item.title}</div>
                              <div className="mt-1 line-clamp-2 max-w-[620px] text-[13px] leading-5 text-slate-500 sm:text-[14px] sm:leading-6">
                                {item.summary}
                              </div>
                              {item.githubUrl ? (
                                <a
                                  href={item.githubUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-2 block truncate text-[12px] font-medium text-brand-600 hover:text-brand-700 sm:text-[13px]"
                                >
                                  {item.githubUrl}
                                </a>
                              ) : null}
                              {tags.length > 0 ? (
                                <div className="mt-2.5 flex flex-wrap gap-2">
                                  {tags.slice(0, 3).map((tag) => (
                                    <span
                                      key={tag}
                                      className="rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-medium text-slate-500"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:hidden">
                            <div>
                              <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                {copy.table.category}
                              </div>
                              <span className="inline-flex items-center gap-2 rounded-full bg-[#eff6ff] px-3 py-1.5 text-[13px] font-semibold text-[#2563eb]">
                                <AssetIcon src={asset.submissions.category} alt="category" className="h-[14px] w-[14px]" />
                                <span>{item.category?.name || "-"}</span>
                              </span>
                            </div>

                            <div>
                              <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                {copy.table.status}
                              </div>
                              <span
                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-semibold ${meta.badgeClassName}`}
                              >
                                <AssetIcon src={meta.icon} alt={meta.label} className="h-[14px] w-[14px]" />
                                <span>{meta.label}</span>
                              </span>
                            </div>

                            <div className="sm:col-span-1">
                              <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                {copy.table.date}
                              </div>
                              <div className="text-[14px] text-slate-600 sm:text-[15px]">
                                {formatDate(item.submittedAt || item.updatedAt, locale)}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 lg:hidden">
                            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                              {copy.table.action}
                            </div>
                            <LocalizedLink
                              href={action.href}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-[14px] border border-slate-200 bg-white px-4 py-2.5 text-[14px] font-semibold text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] lg:w-auto"
                            >
                              <AssetIcon src={asset.submissions.view} alt={action.label} className="h-[16px] w-[16px]" />
                              <span>{action.label}</span>
                            </LocalizedLink>
                          </div>

                          <div className="hidden lg:block">
                            <span className="inline-flex items-center gap-2 rounded-full bg-[#eff6ff] px-3 py-1.5 text-[13px] font-semibold text-[#2563eb]">
                              <AssetIcon src={asset.submissions.category} alt="category" className="h-[14px] w-[14px]" />
                              <span>{item.category?.name || "-"}</span>
                            </span>
                          </div>

                          <div className="hidden lg:block">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-semibold ${meta.badgeClassName}`}
                            >
                              <AssetIcon src={meta.icon} alt={meta.label} className="h-[14px] w-[14px]" />
                              <span>{meta.label}</span>
                            </span>
                          </div>

                          <div className="hidden text-[14px] text-slate-600 sm:text-[15px] lg:block">
                            {formatDate(item.submittedAt || item.updatedAt, locale)}
                          </div>

                          <div className="hidden justify-self-start lg:block">
                            <LocalizedLink
                              href={action.href}
                              className="inline-flex min-w-[60px] items-center justify-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                            >
                              <AssetIcon src={asset.submissions.view} alt={action.label} className="h-[16px] w-[16px]" />
                              <span>{action.label}</span>
                            </LocalizedLink>
                          </div>

                          <button type="button" className="hidden lg:block">
                            <AssetIcon src={asset.shared.more} alt="more" className="h-[18px] w-[18px]" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                {!submissionsLoading && submissions.length > 0 ? (
                  <div className="mt-5 border-t border-slate-100 pt-5 text-center">
                    <LocalizedLink
                      href="/me/submissions"
                      className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#4f46e5]"
                    >
                      <span>{copy.actions.viewAllSubmissions}</span>
                      <AssetIcon src={asset.shared.arrowRight} alt="arrow" className="h-[16px] w-[16px]" />
                    </LocalizedLink>
                  </div>
                ) : null}
              </div>
      </div>
    </>
  );
}
