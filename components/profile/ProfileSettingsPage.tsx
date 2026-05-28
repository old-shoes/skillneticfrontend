"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { getProfile, getProfileSecurity, updateProfile } from "@/lib/api/profile";
import { clearAuthSession, fetchRealMe } from "@/lib/auth";
import type { Locale } from "@/lib/i18n";
import type { ProfileSecurity, ProfileUser } from "@/lib/types/profile";
import {
  ProfileLoginRequired,
  ProfileWorkspaceShell,
  formatProfileDate,
  getProfileCopy,
  getProfileInitials,
} from "@/components/profile/profile-shared";

type Props = {
  locale: Locale;
};

function getCopy(locale: Locale) {
  const base = getProfileCopy(locale);
  if (locale === "en") {
    return {
      ...base,
      pageTitle: "Account Settings",
      pageDescription: "Update your profile details, locale, and public profile card.",
      fields: {
        nickname: "Nickname",
        avatarUrl: "Avatar URL",
        bio: "Bio",
        location: "Location",
        locale: "Locale",
        email: "Email",
      },
      placeholders: {
        nickname: "Enter your nickname",
        avatarUrl: "Paste an avatar image URL",
        bio: "Tell other users what you focus on or share.",
        location: "City, region, or country",
      },
      status: {
        title: "Status",
        emailVerified: "Email verified",
        githubConnected: "GitHub connected",
        lastJoined: "Joined at",
      },
      saved: "Profile updated.",
    };
  }

  return {
    ...base,
    pageTitle: "账号设置",
    pageDescription: "更新昵称、头像、简介、所在地和语言设置，完善你的个人资料卡。",
    fields: {
      nickname: "昵称",
      avatarUrl: "头像地址",
      bio: "个人简介",
      location: "所在地",
      locale: "语言",
      email: "邮箱",
    },
    placeholders: {
      nickname: "输入你的昵称",
      avatarUrl: "粘贴头像图片 URL",
      bio: "介绍一下你关注的方向、擅长内容或分享内容。",
      location: "城市、地区或国家",
    },
    status: {
      title: "状态",
      emailVerified: "邮箱已验证",
      githubConnected: "GitHub 已绑定",
      lastJoined: "加入时间",
    },
    saved: "资料已更新。",
  };
}

export function ProfileSettingsPage({ locale }: Props) {
  const copy = getCopy(locale);
  const [authReady, setAuthReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [security, setSecurity] = useState<ProfileSecurity | null>(null);
  const [form, setForm] = useState({
    nickname: "",
    avatarUrl: "",
    bio: "",
    location: "",
    locale: "zh",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        const [profileData, securityData] = await Promise.all([
          getProfile(),
          getProfileSecurity(),
        ]);
        if (!active) {
          return;
        }
        setProfile(profileData);
        setSecurity(securityData);
        setForm({
          nickname: profileData.nickname || "",
          avatarUrl: profileData.avatarUrl || "",
          bio: profileData.bio || "",
          location: profileData.location || "",
          locale: profileData.locale || "zh",
        });
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const nextProfile = await updateProfile({
        nickname: form.nickname.trim(),
        avatarUrl: form.avatarUrl.trim() || null,
        bio: form.bio.trim() || null,
        location: form.location.trim() || null,
        locale: form.locale,
      });
      setProfile(nextProfile);
      setForm({
        nickname: nextProfile.nickname || "",
        avatarUrl: nextProfile.avatarUrl || "",
        bio: nextProfile.bio || "",
        location: nextProfile.location || "",
        locale: nextProfile.locale || "zh",
      });
      setMessage(copy.saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSaving(false);
    }
  }

  if (!authReady) {
    return <div className="mx-auto max-w-7xl px-4 py-12 text-sm text-slate-500 sm:px-6 lg:px-8">{copy.checking}</div>;
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
        <section className="grid gap-6">
            <form onSubmit={handleSubmit} className="rounded-[32px] border border-white/80 bg-white/92 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
              <div className="grid gap-6 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">{copy.fields.nickname}</span>
                  <input
                    value={form.nickname}
                    onChange={(event) => setForm((current) => ({ ...current, nickname: event.target.value }))}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none"
                    placeholder={copy.placeholders.nickname}
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">{copy.fields.email}</span>
                  <input
                    value={profile?.email || ""}
                    disabled
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none"
                  />
                </label>
              </div>

              <label className="mt-6 grid gap-2">
                <span className="text-sm font-semibold text-slate-700">{copy.fields.avatarUrl}</span>
                <input
                  value={form.avatarUrl}
                  onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none"
                  placeholder={copy.placeholders.avatarUrl}
                />
              </label>

              <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">{copy.fields.bio}</span>
                  <textarea
                    value={form.bio}
                    onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                    rows={6}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none"
                    placeholder={copy.placeholders.bio}
                  />
                </label>
                <div className="grid gap-6">
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-slate-700">{copy.fields.location}</span>
                    <input
                      value={form.location}
                      onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none"
                      placeholder={copy.placeholders.location}
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-slate-700">{copy.fields.locale}</span>
                    <select
                      value={form.locale}
                      onChange={(event) => setForm((current) => ({ ...current, locale: event.target.value }))}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                    >
                      <option value="zh">中文</option>
                      <option value="en">English</option>
                    </select>
                  </label>
                </div>
              </div>

              {message ? <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">{message}</div> : null}
              {error ? <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saving || loading}
                  className="rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? copy.saving : copy.save}
                </button>
              </div>
            </form>
        </section>

        <aside className="grid gap-5">
            <div className="rounded-[30px] border border-white/80 bg-white/92 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
              <div className="flex items-start gap-4">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.nickname} className="h-20 w-20 rounded-[24px] border border-slate-100 object-cover" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[linear-gradient(135deg,#dbeafe,#bfdbfe)] text-2xl font-semibold text-brand-700">
                    {getProfileInitials(profile?.nickname || "")}
                  </div>
                )}
                <div>
                  <div className="text-xl font-semibold text-slate-900">{profile?.nickname}</div>
                  <div className="mt-1 text-sm text-slate-500">{profile?.email}</div>
                  <div className="mt-3 text-sm text-slate-600">{profile?.bio || "-"}</div>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/80 bg-white/92 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
              <h3 className="text-xl font-semibold text-slate-900">{copy.status.title}</h3>
              <div className="mt-4 grid gap-3 text-sm">
                <div className="flex items-center justify-between rounded-[20px] border border-slate-100 px-4 py-3">
                  <span className="text-slate-700">{copy.status.emailVerified}</span>
                  <span className="font-semibold text-emerald-600">{security?.emailVerified ? "OK" : "-"}</span>
                </div>
                <div className="flex items-center justify-between rounded-[20px] border border-slate-100 px-4 py-3">
                  <span className="text-slate-700">{copy.status.githubConnected}</span>
                  <span className="font-semibold text-emerald-600">{security?.githubConnected ? "OK" : "-"}</span>
                </div>
                <div className="flex items-center justify-between rounded-[20px] border border-slate-100 px-4 py-3">
                  <span className="text-slate-700">{copy.status.lastJoined}</span>
                  <span className="font-semibold text-slate-900">{formatProfileDate(profile?.joinedAt, locale)}</span>
                </div>
              </div>
            </div>
        </aside>
      </div>
    </ProfileWorkspaceShell>
  );
}
