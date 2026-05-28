"use client";

import { useEffect, useState } from "react";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/api/profile";
import { clearAuthSession, fetchRealMe } from "@/lib/auth";
import type { Locale } from "@/lib/i18n";
import type { ProfileNotification } from "@/lib/types/profile";
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
      pageTitle: "Notifications",
      pageDescription: "Review system updates, submission progress, and community replies.",
      empty: "No notifications yet.",
      unread: "Unread",
      all: "All",
      markAll: "Mark all as read",
      markRead: "Mark as read",
      prevPage: "Previous",
      nextPage: "Next",
    };
  }

  return {
    ...base,
    pageTitle: "通知中心",
    pageDescription: "查看系统通知、审核进度和社区回复提醒。",
    empty: "暂时还没有通知。",
    unread: "未读",
    all: "全部",
    markAll: "全部标记已读",
    markRead: "标记已读",
    prevPage: "上一页",
    nextPage: "下一页",
  };
}

export function ProfileNotificationsPage({ locale }: Props) {
  const copy = getCopy(locale);
  const [authReady, setAuthReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ProfileNotification[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [showUnreadOnly]);

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
        const data = await getNotifications({
          page,
          pageSize: 10,
          isRead: showUnreadOnly ? false : undefined,
        });
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
  }, [page, showUnreadOnly]);

  async function handleMarkRead(notificationId: string) {
    try {
      await markNotificationRead(notificationId);
      setItems((current) => {
        const next = current.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item));
        return showUnreadOnly ? next.filter((item) => !item.isRead) : next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();
      setItems((current) => (showUnreadOnly ? [] : current.map((item) => ({ ...item, isRead: true }))));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
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
      <section className="rounded-[28px] border border-white/80 bg-white/92 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-5">
            <div className="mb-4 border-b border-slate-100 pb-3">
              <h1 className="text-[22px] font-semibold tracking-[-0.03em] text-slate-950 sm:text-[24px]">
                {copy.pageTitle}
              </h1>
              <p className="mt-1 text-sm leading-6 text-slate-500 sm:text-[15px]">
                {copy.pageDescription}
              </p>
            </div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowUnreadOnly(false)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium ${
                    !showUnreadOnly ? "border-brand-500 bg-brand-500 text-white" : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {copy.all}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUnreadOnly(true)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium ${
                    showUnreadOnly ? "border-brand-500 bg-brand-500 text-white" : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {copy.unread}
                </button>
              </div>

              <button
                type="button"
                onClick={handleMarkAllRead}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                {copy.markAll}
              </button>
            </div>

            {error ? <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}
            {loading ? <div className="text-sm text-slate-500">{copy.loading}</div> : null}

            {!loading && items.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-slate-200 px-5 py-9 text-center text-slate-500">
                {copy.empty}
              </div>
            ) : null}

            {!loading && items.length > 0 ? (
              <div className="grid gap-2.5">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className={`rounded-[22px] border px-4 py-3.5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] ${
                      item.isRead ? "border-slate-100 bg-white" : "border-brand-100 bg-brand-50/40"
                    }`}
                  >
                    <div className="flex flex-col gap-2.5 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-[15px] font-semibold text-slate-900">{item.title}</div>
                          {!item.isRead ? <span className="rounded-full bg-brand-500 px-2 py-1 text-[11px] font-semibold text-white">{copy.unread}</span> : null}
                        </div>
                        {item.content ? <div className="mt-1.5 line-clamp-3 text-sm leading-6 text-slate-600">{item.content}</div> : null}
                        <div className="mt-1.5 text-xs text-slate-400">{formatProfileDateTime(item.createdAt, locale)}</div>
                      </div>
                      {!item.isRead ? (
                        <button
                          type="button"
                          onClick={() => handleMarkRead(item.id)}
                          className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 md:shrink-0"
                        >
                          {copy.markRead}
                        </button>
                      ) : null}
                    </div>
                  </article>
                ))}

                <div className="mt-1 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(current - 1, 1))}
                    disabled={page <= 1}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {copy.prevPage}
                  </button>
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
      </section>
    </ProfileWorkspaceShell>
  );
}
