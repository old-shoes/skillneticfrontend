"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { LocalizedLink } from "@/components/LocalizedLink";
import { getLocaleFromPathname, getMessages } from "@/lib/i18n";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
};

export function PlaceholderPage({
  eyebrow,
  title,
  description,
  backHref = "/",
  backLabel,
}: Props) {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const copy = getMessages(locale).placeholder;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_32%),linear-gradient(180deg,#f8fbff_0%,#f4f8ff_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <LocalizedLink href="/" className="inline-flex items-center">
          <Image
            src="/icons/skillnetic_logo_horizontal.png"
            alt="skillnetic.ai"
            width={1085}
            height={360}
            className="h-10 w-auto"
            priority
          />
        </LocalizedLink>

        <section className="mt-12 overflow-hidden rounded-[32px] border border-white/70 bg-white/88 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-10">
          <div className="inline-flex rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-600">
            {eyebrow}
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">{description}</p>

          <div className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[28px] border border-slate-100 bg-gradient-to-br from-brand-50 via-white to-cyan-50 p-6">
              <div className="flex items-center gap-3">
                <Image src="/icons/prompt-bubble.svg" alt="" width={28} height={28} className="h-7 w-7" />
                <p className="text-sm font-medium text-slate-700">{copy.ready}</p>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-white/90">
                  <div className="flex items-center gap-3">
                    <Image src="/icons/document.svg" alt="" width={22} height={22} className="h-[22px] w-[22px]" />
                    <span className="text-sm font-medium text-slate-800">{copy.entryReady}</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-white/90">
                  <div className="flex items-center gap-3">
                    <Image src="/icons/bookmark.svg" alt="" width={22} height={22} className="h-[22px] w-[22px]" />
                    <span className="text-sm font-medium text-slate-800">{copy.reserveSpace}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-100 bg-slate-950 p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
              <div className="flex items-center gap-3">
                <Image src="/icons/robot.svg" alt="" width={30} height={30} className="h-[30px] w-[30px]" />
                <span className="text-sm font-medium text-white/80">{copy.nextStep}</span>
              </div>
              <p className="mt-6 text-2xl font-semibold">{copy.pageReady}</p>
              <p className="mt-4 text-sm leading-7 text-white/70">{copy.hint}</p>
              <div className="mt-8">
                <LocalizedLink
                  href={backHref}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  {backLabel || copy.backHome}
                  <Image src="/icons/arrow-right.svg" alt="" width={16} height={16} className="h-4 w-4" />
                </LocalizedLink>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
