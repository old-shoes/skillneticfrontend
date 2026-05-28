"use client";

import { useEffect, useState } from "react";
import { getProfile, getProfileSecurity } from "@/lib/api/profile";
import { clearAuthSession, fetchRealMe } from "@/lib/auth";
import type { Locale } from "@/lib/i18n";
import type { ProfileSecurity, ProfileUser } from "@/lib/types/profile";
import {
  ProfileLoginRequired,
  ProfileWorkspaceShell,
  formatProfileDate,
  formatProfileDateTime,
  getProfileCopy,
} from "@/components/profile/profile-shared";

type Props = {
  locale: Locale;
};

function getCopy(locale: Locale) {
  const base = getProfileCopy(locale);
  if (locale === "en") {
    return {
      ...base,
      pageTitle: "Account Security",
      pageDescription: "Check email verification, GitHub binding, password status, and recent login information.",
      emailVerified: "Email Verified",
      githubConnected: "GitHub Connected",
      password: "Password",
      lastLoginAt: "Last Login",
      lastLoginIp: "Last Login IP",
      joinedAt: "Joined At",
      yes: "Enabled",
      no: "Not Set",
    };
  }

  return {
    ...base,
    pageTitle: "账号安全",
    pageDescription: "查看邮箱验证、GitHub 绑定、密码状态和最近登录信息。",
    emailVerified: "邮箱已验证",
    githubConnected: "GitHub 已绑定",
    password: "登录密码",
    lastLoginAt: "最近登录",
    lastLoginIp: "最近登录 IP",
    joinedAt: "加入时间",
    yes: "已开启",
    no: "未设置",
  };
}

export function ProfileSecurityPage({ locale }: Props) {
  const copy = getCopy(locale);
  const [authReady, setAuthReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [security, setSecurity] = useState<ProfileSecurity | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setError(null);
      try {
        await fetchRealMe();
        if (!active) {
          return;
        }
        setAuthed(true);
        const [profileData, securityData] = await Promise.all([getProfile(), getProfileSecurity()]);
        if (!active) {
          return;
        }
        setProfile(profileData);
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
        }
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  if (!authReady) {
    return <div className="px-4 py-12 text-sm text-slate-500">{copy.checking}</div>;
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

  return (
    <ProfileWorkspaceShell locale={locale}>
      <div className="rounded-[28px] border border-white/80 bg-white/92 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-5">
        <h1 className="text-[22px] font-semibold tracking-[-0.03em] text-slate-950 sm:text-[24px]">
          {copy.pageTitle}
        </h1>
        <p className="mt-1 text-sm leading-6 text-slate-500 sm:text-[15px]">
          {copy.pageDescription}
        </p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),320px]">
        <section className="rounded-[32px] border border-white/80 bg-white/92 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          {error ? <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}
          <div className="grid gap-4">
            {[
              { label: copy.emailVerified, value: security?.emailVerified ? copy.yes : copy.no },
              { label: copy.githubConnected, value: security?.githubConnected ? copy.yes : copy.no },
              { label: copy.password, value: security?.hasPassword ? copy.yes : copy.no },
              { label: copy.lastLoginAt, value: formatProfileDateTime(security?.lastLoginAt, locale) },
              { label: copy.lastLoginIp, value: security?.lastLoginIp || "-" },
              { label: copy.joinedAt, value: formatProfileDate(profile?.joinedAt, locale) },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-[24px] border border-slate-100 bg-white px-5 py-4">
                <span className="text-sm font-medium text-slate-600">{item.label}</span>
                <span className="text-sm font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-[32px] border border-white/80 bg-white/92 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="text-sm font-medium text-slate-500">{profile?.email}</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{profile?.nickname}</div>
          <div className="mt-4 text-sm leading-7 text-slate-600">{profile?.bio || "-"}</div>
          <div className="mt-6 grid gap-3 text-sm text-slate-500">
            <div>{copy.joinedAt}: {formatProfileDate(profile?.joinedAt, locale)}</div>
            <div>{copy.lastLoginAt}: {formatProfileDateTime(security?.lastLoginAt, locale)}</div>
          </div>
        </aside>
      </div>
    </ProfileWorkspaceShell>
  );
}
