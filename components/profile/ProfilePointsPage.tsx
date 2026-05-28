"use client";

import { useEffect, useMemo, useState } from "react";
import { getPointLogs, getPointSummary } from "@/lib/api/profile";
import { clearAuthSession, fetchRealMe } from "@/lib/auth";
import type { Locale } from "@/lib/i18n";
import type { PointLogItem, PointSummary } from "@/lib/types/profile";
import {
  ProfileLoginRequired,
  ProfileWorkspaceShell,
  formatProfileDateTime,
  getProfileCopy,
} from "@/components/profile/profile-shared";

type Props = {
  locale: Locale;
};

const EVENT_TABS = ["all", "daily_login", "skill_approved", "create_help_post"] as const;

function getCopy(locale: Locale) {
  const base = getProfileCopy(locale);
  if (locale === "en") {
    return {
      ...base,
      pageTitle: "Points Center",
      pageDescription: "Review your current balance, point rules, and full points ledger.",
      currentPoints: "Current Points",
      earn: "Earn Rules",
      consume: "Use Rules",
      logs: "Points Logs",
      emptyLogs: "No point logs yet.",
      prevPage: "Previous",
      nextPage: "Next",
      filters: {
        all: "All",
        daily_login: "Daily Login",
        skill_approved: "Approved",
        create_help_post: "Help Post",
      },
    };
  }

  return {
    ...base,
    pageTitle: "积分中心",
    pageDescription: "查看当前积分、积分规则和完整积分流水。",
    currentPoints: "当前积分",
    earn: "获得规则",
    consume: "消耗规则",
    logs: "积分流水",
    emptyLogs: "暂时还没有积分流水。",
    prevPage: "上一页",
    nextPage: "下一页",
    filters: {
      all: "全部",
      daily_login: "每日登录",
      skill_approved: "审核通过",
      create_help_post: "求助帖",
    },
  };
}

export function ProfilePointsPage({ locale }: Props) {
  const copy = getCopy(locale);
  const [authReady, setAuthReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<PointSummary | null>(null);
  const [logs, setLogs] = useState<PointLogItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeEvent, setActiveEvent] = useState<(typeof EVENT_TABS)[number]>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadInitial() {
      setLoading(true);
      setError(null);
      try {
        await fetchRealMe();
        if (!active) {
          return;
        }
        setAuthed(true);
        const summaryData = await getPointSummary();
        if (!active) {
          return;
        }
        setSummary(summaryData);
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
    loadInitial();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [activeEvent]);

  useEffect(() => {
    let active = true;
    if (!authReady || !authed) {
      return;
    }
    setLoading(true);
    setError(null);
    getPointLogs({
      page,
      pageSize: 10,
      eventType: activeEvent === "all" ? undefined : activeEvent,
    })
      .then((data) => {
        if (!active) {
          return;
        }
        setLogs(data.list);
        setTotalPages(Math.max(data.pagination.totalPages, 1));
      })
      .catch((err) => {
        if (!active) {
          return;
        }
        setError(err instanceof Error ? err.message : "Request failed");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [activeEvent, authReady, authed, page]);

  const deltaClassName = useMemo(
    () => ({
      positive: "text-emerald-600",
      negative: "text-rose-500",
    }),
    [],
  );

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
      <section className="space-y-3">
        <div className="rounded-[26px] border border-white/80 bg-white/92 px-4 py-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:px-4.5 sm:py-2">
          <h1 className="text-[19px] font-semibold tracking-[-0.03em] text-slate-950 sm:text-[21px]">
            {copy.pageTitle}
          </h1>
          <p className="mt-0 text-[13px] leading-[1.3] text-slate-500">
            {copy.pageDescription}
          </p>
          <div className="mt-2.5 grid gap-2.5 xl:grid-cols-3">
            <div className="rounded-[18px] border border-slate-100 bg-white px-3.5 py-2.5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <div className="text-sm font-medium text-slate-500">{copy.currentPoints}</div>
              <div className="mt-1 text-[28px] font-semibold tracking-tight text-slate-900">{summary?.currentPoints ?? 0}</div>
            </div>

            <div className="rounded-[18px] border border-slate-100 bg-white px-3.5 py-2.5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <div className="text-sm font-semibold text-emerald-600">{copy.earn}</div>
              <div className="mt-1.5 grid gap-1 text-sm leading-5 text-slate-600">
                {summary?.rules.earn.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3">
                    <span className="truncate">{item.label}</span>
                    <span className="shrink-0 font-semibold text-emerald-600">+{item.points}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[18px] border border-slate-100 bg-white px-3.5 py-2.5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <div className="text-sm font-semibold text-rose-500">{copy.consume}</div>
              <div className="mt-1.5 grid gap-1 text-sm leading-5 text-slate-600">
                {summary?.rules.consume.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3">
                    <span className="truncate">{item.label}</span>
                    <span className="shrink-0 font-semibold text-rose-500">{item.points}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/80 bg-white/92 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-slate-900">{copy.logs}</h2>
            <div className="flex flex-wrap gap-2">
              {EVENT_TABS.map((eventType) => (
                <button
                  key={eventType}
                  type="button"
                  onClick={() => setActiveEvent(eventType)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium ${
                    activeEvent === eventType
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {copy.filters[eventType]}
                </button>
              ))}
            </div>
          </div>

          {error ? <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}
          {loading ? <div className="text-sm text-slate-500">{copy.loading}</div> : null}

          {!loading && logs.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-200 px-6 py-12 text-center text-slate-500">
              {copy.emptyLogs}
            </div>
          ) : null}

          {!loading && logs.length > 0 ? (
            <div className="grid gap-3">
              {logs.map((item) => {
                const changeClass = item.pointsChange >= 0 ? deltaClassName.positive : deltaClassName.negative;
                return (
                  <article key={item.id} className="rounded-[24px] border border-slate-100 bg-white px-5 py-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-base font-semibold text-slate-900">{item.description || item.eventType}</div>
                        <div className="mt-1 text-sm text-slate-500">{formatProfileDateTime(item.createdAt, locale)}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-semibold ${changeClass}`}>
                          {item.pointsChange >= 0 ? `+${item.pointsChange}` : item.pointsChange}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">{item.pointsBefore} → {item.pointsAfter}</div>
                      </div>
                    </div>
                  </article>
                );
              })}

              <div className="mt-3 flex justify-end gap-3">
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
        </div>
      </section>
    </ProfileWorkspaceShell>
  );
}
