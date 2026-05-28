"use client";

import { LocalizedLink } from "@/components/LocalizedLink";
import { ProfileWorkspaceShell } from "@/components/profile/profile-shared";
import type { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
  submissionId?: string;
  embedded?: boolean;
};

function getCopy(locale: Locale) {
  if (locale === "en") {
    return {
      eyebrow: "Submit Skill",
      title: "Submitted Successfully",
      description: "Your Skill has been added to the review queue. Review usually finishes within 1-3 business days.",
      primary: "View My Submissions",
      secondary: "Submit Another Skill",
      detail: "Submission ID",
    };
  }

  return {
    eyebrow: "提交 Skill",
    title: "提交成功",
    description: "你的 Skill 已进入审核队列，通常会在 1-3 个工作日内完成审核。",
    primary: "查看我的提交",
    secondary: "继续提交 Skill",
    detail: "提交 ID",
  };
}

export function SubmitSkillSuccessPage({ locale, submissionId, embedded = false }: Props) {
  const text = getCopy(locale);

  const content = (
    <div className="rounded-[32px] border border-white/80 bg-white/94 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
      {!embedded ? <div className="text-sm font-medium text-brand-600">{text.eyebrow}</div> : null}
      <h1 className={`${embedded ? "" : "mt-2 "}text-4xl font-semibold tracking-tight text-slate-900`}>{text.title}</h1>
      <p className="mt-3 text-base leading-7 text-slate-600">{text.description}</p>
      {submissionId ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {text.detail}: {submissionId}
        </div>
      ) : null}
      <div className="mt-8 flex flex-wrap gap-3">
        <LocalizedLink href="/me/submissions" className="rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white">
          {text.primary}
        </LocalizedLink>
        <LocalizedLink href="/me/submit" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700">
          {text.secondary}
        </LocalizedLink>
      </div>
    </div>
  );

  if (embedded) {
    return (
      <ProfileWorkspaceShell title={text.title} description={text.description}>
        {content}
      </ProfileWorkspaceShell>
    );
  }

  return (
    <main className="bg-[linear-gradient(180deg,#f8fbff_0%,#f4f7fb_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">{content}</div>
    </main>
  );
}
