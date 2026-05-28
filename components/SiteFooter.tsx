"use client";

import Image from "next/image";
import { LocalizedLink } from "@/components/LocalizedLink";
import { getLocaleFromPathname, getMessages } from "@/lib/i18n";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const copy = getMessages(locale).shell.footer;

  return (
    <footer className="border-t border-white/70 bg-white/85">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1.1fr] lg:px-8">
        <div>
          <LocalizedLink href="/" className="flex items-center">
            <Image
              src="/icons/skillnetic_logo_horizontal.png"
              alt="skillnetic.ai"
              width={1085}
              height={360}
              className="h-10 w-auto"
            />
          </LocalizedLink>
          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">{copy.tagline}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">{copy.product}</h3>
          <div className="mt-4 grid gap-3 text-sm text-slate-500">
            <LocalizedLink href="/skills">{copy.skills}</LocalizedLink>
            <LocalizedLink href="/submit">{copy.submit}</LocalizedLink>
            <LocalizedLink href="/changelog">{copy.changelog}</LocalizedLink>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">{copy.resources}</h3>
          <div className="mt-4 grid gap-3 text-sm text-slate-500">
            <LocalizedLink href="/learn">{copy.learn}</LocalizedLink>
            <LocalizedLink href="/help">{copy.help}</LocalizedLink>
            <LocalizedLink href="/faq">{copy.faq}</LocalizedLink>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">{copy.about}</h3>
          <div className="mt-4 grid gap-3 text-sm text-slate-500">
            <LocalizedLink href="/about">{copy.aboutLink}</LocalizedLink>
            <LocalizedLink href="/contact">{copy.contact}</LocalizedLink>
            <LocalizedLink href="/join">{copy.join}</LocalizedLink>
            <LocalizedLink href="/partners">{copy.partners}</LocalizedLink>
          </div>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <h3 className="text-sm font-semibold text-slate-900">{copy.subscribeTitle}</h3>
          <p className="mt-2 text-sm text-slate-500">{copy.subscribeDesc}</p>
          <div className="mt-4 flex gap-2">
            <input className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" placeholder={copy.emailPlaceholder} />
            <button className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white">{copy.subscribe}</button>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        {copy.copyright}
      </div>
    </footer>
  );
}
