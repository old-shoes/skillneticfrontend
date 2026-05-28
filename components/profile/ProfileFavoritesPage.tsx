"use client";

import { useEffect, useState } from "react";
import { LocalizedLink } from "@/components/LocalizedLink";
import { unfavoriteSkill } from "@/lib/api/skills";
import { getFavorites } from "@/lib/api/profile";
import { clearAuthSession, fetchRealMe } from "@/lib/auth";
import type { Locale } from "@/lib/i18n";
import type { ProfileFavorite } from "@/lib/types/profile";
import {
  ProfileLoginRequired,
  ProfileWorkspaceShell,
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
      pageTitle: "My Favorites",
      pageDescription: "Review the skills you saved and jump back into them quickly.",
      empty: "No favorite skills yet.",
      viewSkill: "View Skill",
      removeFavorite: "Remove Favorite",
      prevPage: "Previous",
      nextPage: "Next",
      pageInfo: (page: number, totalPages: number) => `Page ${page} / ${totalPages}`,
      favoritedAt: "Favorited",
      category: "Category",
    };
  }

  return {
    ...base,
    pageTitle: "我的收藏",
    pageDescription: "查看你收藏过的 Skill，快速返回继续使用。",
    empty: "暂时还没有收藏的 Skill。",
    viewSkill: "查看 Skill",
    removeFavorite: "取消收藏",
    prevPage: "上一页",
    nextPage: "下一页",
    pageInfo: (page: number, totalPages: number) => `第 ${page} / ${totalPages} 页`,
    favoritedAt: "收藏时间",
    category: "分类",
  };
}

export function ProfileFavoritesPage({ locale }: Props) {
  const copy = getCopy(locale);
  const [authReady, setAuthReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ProfileFavorite[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState("");

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
        const data = await getFavorites({ page, pageSize: 10 });
        if (!active) {
          return;
        }
        setItems(data.list);
        setTotalPages(Math.max(data.pagination.totalPages, 1));
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
  }, [page]);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = window.setTimeout(() => {
      setToast("");
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function handleUnfavorite(item: ProfileFavorite) {
    try {
      const result = await unfavoriteSkill(item.targetId);
      setItems((current) => current.filter((entry) => entry.targetId !== item.targetId));
      if (items.length === 1 && page > 1) {
        setPage((current) => Math.max(current - 1, 1));
      }
      setToast(result.favorited ? copy.viewSkill : (locale === "en" ? "Removed from favorites" : "已取消收藏"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    }
  }

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
      {toast ? (
        <div className="pointer-events-none fixed right-4 top-20 z-50 rounded-2xl border border-emerald-200 bg-white/96 px-4 py-3 text-sm font-medium text-emerald-700 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur sm:right-6">
          {toast}
        </div>
      ) : null}
      <div className="rounded-[28px] border border-white/80 bg-white/92 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-5">
        <div className="mb-4 border-b border-slate-100 pb-3">
          <h1 className="text-[22px] font-semibold tracking-[-0.03em] text-slate-950 sm:text-[24px]">
            {copy.pageTitle}
          </h1>
          <p className="mt-1 text-sm leading-6 text-slate-500 sm:text-[15px]">
            {copy.pageDescription}
          </p>
        </div>
        {error ? <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}
        {loading ? <div className="text-sm text-slate-500">{copy.loading}</div> : null}

        {!loading && items.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-slate-200 px-5 py-9 text-center text-slate-500">
            {copy.empty}
          </div>
        ) : null}

        {!loading && items.length > 0 ? (
          <div className="grid gap-3 xl:grid-cols-2">
            {items.map((item) => (
              <article
                key={item.targetId}
                className="rounded-[22px] border border-slate-100 bg-white px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] xl:px-5"
              >
                <div className="flex h-full flex-col gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-[17px] font-semibold text-slate-900">{item.title}</h2>
                    <p className="mt-1.5 line-clamp-3 text-sm leading-6 text-slate-600">{item.summary}</p>
                    <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-400">
                      <span>{copy.category}: {item.categoryName || "-"}</span>
                      <span>{copy.favoritedAt}: {formatProfileDateTime(item.favoritedAt, locale)}</span>
                    </div>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <LocalizedLink
                      href={item.slug ? `/skills/${item.slug}` : "/skills"}
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                    >
                      {copy.viewSkill}
                    </LocalizedLink>
                    <button
                      type="button"
                      onClick={() => void handleUnfavorite(item)}
                      className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600"
                    >
                      {copy.removeFavorite}
                    </button>
                  </div>
                </div>
              </article>
            ))}

            <div className="mt-1 flex items-center justify-end gap-3 xl:col-span-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                disabled={page <= 1}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copy.prevPage}
              </button>
              <div className="min-w-[88px] text-center text-sm text-slate-500">
                {copy.pageInfo(page, totalPages)}
              </div>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
                disabled={page >= totalPages}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copy.nextPage}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </ProfileWorkspaceShell>
  );
}
