"use client";

import { useEffect, useMemo, useState } from "react";
import { LocalizedLink } from "@/components/LocalizedLink";
import { ProfileLoginRequired, ProfileWorkspaceShell } from "@/components/profile/profile-shared";
import { clearAuthSession, fetchRealMe } from "@/lib/auth";
import { deleteSubmitSkillSubmission, getMySkillSubmissions } from "@/lib/api/submit-skill";
import type { Locale } from "@/lib/i18n";
import type { SkillSubmissionListItem, SkillSubmitStatus } from "@/lib/types/submit-skill";

type Props = {
  locale: Locale;
};

function getCopy(locale: Locale) {
  if (locale === "en") {
    return {
      title: "My Submissions",
      description: "Check your drafts, review progress, and published results in one place.",
      checking: "Checking login status...",
      needLoginTitle: "Log in to view your submissions",
      needLoginDescription: "Your drafts and review results are only available after login.",
      login: "Log in",
      register: "Create account",
      loading: "Loading submissions...",
      emptyTitle: "No submissions yet",
      emptyDescription: "Create your first Skill draft and send it for review.",
      create: "Create Skill",
      continueEdit: "Continue Editing",
      viewSubmit: "View Submission",
      delete: "Delete",
      deleting: "Deleting...",
      prevPage: "Previous",
      nextPage: "Next",
      pageInfo: (page: number, totalPages: number, total: number) => `Page ${page} / ${totalPages} · ${total} items`,
      updatedAt: "Updated",
      submittedAt: "Submitted",
      category: "Category",
      deleteBlocked: "Approved submissions cannot be deleted.",
      deleteFailed: "Failed to delete submission",
      deleteSuccess: "Submission deleted.",
      confirmTitle: "Delete this submission?",
      confirmDescription: "This action cannot be undone. The draft and review record will be removed from your submission list.",
      confirmCancel: "Cancel",
      confirmDelete: "Delete Submission",
      tabs: {
        all: "All",
        draft: "Draft",
        pending_review: "Pending Review",
        needs_revision: "Needs Revision",
        approved: "Approved",
        rejected: "Rejected",
      },
      status: {
        draft: "Draft",
        pending_review: "Pending Review",
        needs_revision: "Needs Revision",
        approved: "Approved",
        rejected: "Rejected",
        withdrawn: "Withdrawn",
      },
    };
  }

  return {
    title: "我的提交",
    description: "统一查看草稿、审核进度和提交结果。",
    checking: "正在检查登录状态...",
    needLoginTitle: "登录后查看我的提交",
    needLoginDescription: "草稿、审核状态和打回结果需要登录后查看。",
    login: "登录",
    register: "注册账号",
    loading: "正在加载我的提交...",
    emptyTitle: "你还没有提交记录",
    emptyDescription: "先创建第一个 Skill 草稿，再继续提交审核。",
    create: "创建 Skill",
    continueEdit: "继续编辑",
    viewSubmit: "查看提交",
    delete: "删除",
    deleting: "删除中...",
    prevPage: "上一页",
    nextPage: "下一页",
    pageInfo: (page: number, totalPages: number, total: number) => `第 ${page} / ${totalPages} 页，共 ${total} 条`,
    updatedAt: "更新于",
    submittedAt: "提交于",
    category: "分类",
    deleteBlocked: "已通过的提交不可删除。",
    deleteFailed: "删除提交失败",
    deleteSuccess: "提交已删除",
    confirmTitle: "确认删除这条提交？",
    confirmDescription: "删除后不可恢复，这条草稿或审核记录会从你的提交列表中移除。",
    confirmCancel: "取消",
    confirmDelete: "确认删除",
    tabs: {
      all: "全部",
      draft: "草稿",
      pending_review: "待审核",
      needs_revision: "需修改",
      approved: "已通过",
      rejected: "已拒绝",
    },
    status: {
      draft: "草稿",
      pending_review: "待审核",
      needs_revision: "需修改",
      approved: "已通过",
      rejected: "已拒绝",
      withdrawn: "已撤回",
    },
  };
}

const filterTabs = [
  { key: "all" },
  { key: "draft" },
  { key: "pending_review" },
  { key: "needs_revision" },
  { key: "approved" },
  { key: "rejected" },
] as const;

function getStatusClass(status: SkillSubmitStatus) {
  switch (status) {
    case "approved":
      return "bg-emerald-50 text-emerald-600";
    case "pending_review":
      return "bg-amber-50 text-amber-600";
    case "needs_revision":
      return "bg-sky-50 text-sky-600";
    case "rejected":
      return "bg-rose-50 text-rose-600";
    case "withdrawn":
      return "bg-slate-100 text-slate-500";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export function MySkillSubmissionsPage({ locale }: Props) {
  const text = getCopy(locale);
  const pageSize = 10;
  const [authReady, setAuthReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | SkillSubmitStatus>("all");
  const [items, setItems] = useState<SkillSubmissionListItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<SkillSubmissionListItem | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    let active = true;
    fetchRealMe()
      .then(() => {
        if (!active) {
          return;
        }
        setAuthed(true);
      })
      .catch((err) => {
        if (!active) {
          return;
        }
        clearAuthSession();
        setAuthed(false);
        setError(err instanceof Error ? err.message : "Request failed");
      })
      .finally(() => {
        if (active) {
          setAuthReady(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (!authReady || !authed) {
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    getMySkillSubmissions({
      status: activeTab === "all" ? undefined : activeTab,
      page,
      pageSize,
    })
      .then((response) => {
        if (!active) {
          return;
        }
        setItems(response.list);
        setTotal(response.pagination.total);
        setTotalPages(Math.max(response.pagination.totalPages, 1));
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
  }, [activeTab, authReady, authed, page, reloadKey]);

  const countLabel = useMemo(() => text.pageInfo(page, totalPages, total), [page, text, total, totalPages]);

  async function handleDeleteSubmission() {
    if (!confirmTarget) {
      return;
    }
    if (confirmTarget.status === "approved") {
      setError(text.deleteBlocked);
      setConfirmTarget(null);
      return;
    }
    setDeletingId(confirmTarget.id);
    setError(null);
    setSuccessMessage(null);
    try {
      await deleteSubmitSkillSubmission(confirmTarget.id);
      setConfirmTarget(null);
      setSuccessMessage(text.deleteSuccess);
      if (items.length === 1 && page > 1) {
        setPage((current) => Math.max(current - 1, 1));
      } else {
        setReloadKey((current) => current + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : text.deleteFailed);
    } finally {
      setDeletingId(null);
    }
  }

  if (!authReady) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-sm text-slate-500 sm:px-6 lg:px-8">
        {text.checking}
      </div>
    );
  }

  if (!authed) {
    return (
      <ProfileLoginRequired
        locale={locale}
        title={text.needLoginTitle}
        description={text.needLoginDescription}
        error={error}
        embedded
      />
    );
  }

  return (
    <ProfileWorkspaceShell locale={locale}>
      <div className="rounded-[28px] border border-white/80 bg-white/92 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-5">
        <div className="mb-4 border-b border-slate-100 pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-[22px] font-semibold tracking-[-0.03em] text-slate-950 sm:text-[24px]">
                {text.title}
              </h1>
              <p className="mt-1 text-sm leading-6 text-slate-500 sm:text-[15px]">
                {text.description}
              </p>
            </div>
            <LocalizedLink href="/me/submit" className="inline-flex items-center justify-center rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white">
              {text.create}
            </LocalizedLink>
          </div>
          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    activeTab === tab.key
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {text.tabs[tab.key]}
                </button>
              ))}
            </div>
            <div className="text-sm text-slate-500">{countLabel}</div>
          </div>
        </div>

        {loading ? <div className="rounded-[22px] border border-dashed border-slate-200 px-5 py-10 text-center text-slate-500">{text.loading}</div> : null}
        {!loading && error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}
        {!loading && !error && successMessage ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div> : null}

        {!loading && !error && items.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-slate-200 px-5 py-10 text-center text-slate-500">
            <div className="text-2xl font-semibold text-slate-900">{text.emptyTitle}</div>
            <div className="mt-3 text-base text-slate-600">{text.emptyDescription}</div>
            <div className="mt-8">
              <LocalizedLink href="/me/submit" className="rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white">
                {text.create}
              </LocalizedLink>
            </div>
          </div>
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <div className="grid gap-3 xl:grid-cols-2">
            {items.map((item) => {
              const tags = Array.isArray(item.tags) ? item.tags : [];

              return (
                <article
                  key={item.id}
                  className="rounded-[22px] border border-slate-100 bg-white px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] xl:px-5"
                >
                  <div className="flex h-full flex-col gap-4">
                    <div className="flex min-w-0 gap-4">
                      {item.coverImage ? (
                        <img src={item.coverImage} alt={item.title} className="h-20 w-28 rounded-[16px] border border-slate-100 object-cover sm:h-24 sm:w-36" />
                      ) : (
                        <div className="flex h-20 w-28 items-end rounded-[16px] bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_100%)] px-3 py-2 text-[11px] font-semibold text-white sm:h-24 sm:w-36">
                          <span className="line-clamp-2">{item.title}</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-[17px] font-semibold text-slate-900">{item.title}</h2>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(item.status)}`}>
                            {text.status[item.status]}
                          </span>
                        </div>
                        <p className="mt-1.5 line-clamp-3 text-sm leading-6 text-slate-600">{item.summary}</p>
                        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-400">
                          <span>{text.category}: {item.category?.name || "-"}</span>
                          <span>{text.updatedAt}: {item.updatedAt}</span>
                          <span>{text.submittedAt}: {item.submittedAt || "-"}</span>
                        </div>
                        {tags.length > 0 ? (
                          <div className="mt-2.5 flex flex-wrap gap-2">
                            {tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-medium text-slate-500">
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-auto flex flex-wrap gap-2">
                      <LocalizedLink
                        href={`/me/submit?id=${item.id}&step=${item.status === "draft" || item.status === "needs_revision" ? "basic" : "review"}`}
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                      >
                        {item.status === "draft" || item.status === "needs_revision" ? text.continueEdit : text.viewSubmit}
                      </LocalizedLink>
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setSuccessMessage(null);
                          setConfirmTarget(item);
                        }}
                        className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                      >
                        {text.delete}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
            <div className="mt-1 flex justify-end gap-3 xl:col-span-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                disabled={page <= 1}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {text.prevPage}
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
                disabled={page >= totalPages}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {text.nextPage}
              </button>
            </div>
          </div>
        ) : null}
      </div>
      {confirmTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/36 px-4">
          <div className="w-full max-w-md rounded-[28px] border border-white/80 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
            <div className="text-xl font-semibold text-slate-950">{text.confirmTitle}</div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{text.confirmDescription}</p>
            <div className="mt-2 text-sm font-medium text-slate-900">{confirmTarget.title}</div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmTarget(null)}
                disabled={Boolean(deletingId)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {text.confirmCancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleDeleteSubmission();
                }}
                disabled={deletingId === confirmTarget.id}
                className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId === confirmTarget.id ? text.deleting : text.confirmDelete}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ProfileWorkspaceShell>
  );
}
