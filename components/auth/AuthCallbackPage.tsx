"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchRealMe } from "@/lib/auth";
import type { Locale } from "@/lib/i18n";
import { withLocale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

function getCopy(locale: Locale) {
  if (locale === "en") {
    return {
      loading: "Signing you in with GitHub...",
      failed: "GitHub sign-in failed. Please try again.",
    };
  }

  return {
    loading: "正在通过 GitHub 登录...",
    failed: "GitHub 登录失败，请重试。",
  };
}

export function AuthCallbackPage({ locale }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const copy = useMemo(() => getCopy(locale), [locale]);
  const [error, setError] = useState("");

  useEffect(() => {
    const redirectError = searchParams.get("error") || "";
    if (redirectError) {
      setError(copy.failed);
      return;
    }

    fetchRealMe()
      .then(() => {
        router.replace(withLocale(locale, "/me/submit"));
      })
      .catch(() => {
        setError(copy.failed);
      });
  }, [copy.failed, locale, router, searchParams]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-[linear-gradient(180deg,#f8fbff_0%,#f4f7fb_100%)] px-4">
      <div className="rounded-[28px] border border-white/80 bg-white/94 px-8 py-10 text-center shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
        <div className={`text-base font-medium ${error ? "text-rose-600" : "text-slate-600"}`}>
          {error || copy.loading}
        </div>
      </div>
    </main>
  );
}
