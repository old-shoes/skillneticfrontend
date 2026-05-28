"use client";

import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LocalizedLink } from "@/components/LocalizedLink";
import { clearAuthSession, fetchRealMe, getAuthUser, logoutAuth } from "@/lib/auth";
import { trackEvent } from "@/lib/api/track";
import {
  getLocaleFromPathname,
  getMessages,
  localeDisplayName,
  locales,
  stripLocaleFromPath,
  withLocale,
} from "@/lib/i18n";

type NavKey = "home" | "skills" | "community";

const navItems = [
  { key: "home", href: "/" },
  { key: "skills", href: "/skills" },
  { key: "community", href: "/community" },
] as const;

function isActiveNavItem(href: string, pathname: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function HeaderIcon({
  src,
  alt,
  size,
  boxClassName,
}: {
  src: string;
  alt: string;
  size: number;
  boxClassName: string;
}) {
  return (
    <span className={`inline-flex items-center justify-center ${boxClassName}`}>
      <img src={src} alt={alt} width={size} height={size} className="h-auto w-auto" />
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = getLocaleFromPathname(pathname);
  const copy = getMessages(locale);
  const strippedPath = stripLocaleFromPath(pathname);
  const search = searchParams.toString();
  const pageUrl = `${pathname || withLocale(locale, "/")}${search ? `?${search}` : ""}`;
  const active = navItems.find((item) => isActiveNavItem(item.href, strippedPath))?.key || "home";
  const showSearchShortcut = strippedPath === "/skills" || strippedPath.startsWith("/skills/");
  const searchShortcutIconSrc = "/skills-icons/search.svg";
  const currentHref = `${strippedPath}${search ? `?${search}` : ""}`;
  const [userName, setUserName] = useState("");

  useEffect(() => {
    let active = true;
    const sync = () => {
      if (!active) {
        return;
      }
      setUserName(getAuthUser()?.nickname || "");
    };
    sync();
    fetchRealMe().catch(() => {
      clearAuthSession();
    });
    window.addEventListener("auth-changed", sync);
    return () => {
      active = false;
      window.removeEventListener("auth-changed", sync);
    };
  }, []);

  async function handleLogout() {
    try {
      await logoutAuth();
    } catch {
      // ignore server-side logout failures and still clear the local session
    }
    clearAuthSession();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/88 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-xl">
      <div className="mx-auto flex h-[62px] max-w-[1680px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <LocalizedLink href="/" className="flex items-center">
          <Image
            src="/icons/skillnetic_logo_horizontal.png"
            alt="skillnetic.ai"
            width={1085}
            height={360}
            className="h-9 w-auto"
            priority
          />
        </LocalizedLink>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <LocalizedLink
              key={item.key}
              href={item.href}
              aria-current={item.key === active ? "page" : undefined}
              className={`border-b-2 pb-[18px] pt-[18px] text-[14px] font-medium transition ${
                item.key === active
                  ? "border-brand-500 text-slate-950"
                  : "border-transparent text-slate-600 hover:text-slate-950"
              }`}
            >
              {copy.shell.nav[item.key]}
            </LocalizedLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {showSearchShortcut ? (
            <a
              href="#skills-search"
              className="hidden h-10 w-10 items-center justify-center rounded-[14px] border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:inline-flex"
            >
              <HeaderIcon src={searchShortcutIconSrc} alt="搜索" size={15} boxClassName="h-5 w-5" />
            </a>
          ) : (
            <span
              aria-hidden="true"
              className="hidden h-10 w-10 rounded-[14px] border border-transparent sm:inline-flex"
            />
          )}
          <div className="inline-flex items-center rounded-[12px] border border-slate-300 bg-white p-1 shadow-[0_4px_14px_rgba(15,23,42,0.06)]">
            {locales.map((targetLocale) => (
              <a
                key={targetLocale}
                href={withLocale(targetLocale, currentHref || "/")}
                className={`rounded-[9px] px-3 py-1.5 text-[12px] font-semibold tracking-[0.01em] transition ${
                  targetLocale === locale
                    ? "bg-slate-900 !text-white shadow-[0_4px_12px_rgba(15,23,42,0.18)]"
                    : "bg-white !text-slate-800 hover:bg-slate-100 hover:!text-slate-950"
                }`}
                style={{
                  color: targetLocale === locale ? "#ffffff" : "#1f2937",
                }}
              >
                {localeDisplayName[targetLocale]}
              </a>
            ))}
          </div>
          {userName ? (
            <>
              <LocalizedLink
                href="/me"
                className="rounded-[14px] border border-slate-200/80 bg-white px-4 py-2 text-[14px] font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition hover:border-slate-300"
              >
                {userName}
              </LocalizedLink>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-[14px] bg-slate-900 px-4 py-2 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition hover:bg-slate-800"
              >
                {copy.shell.logout}
              </button>
            </>
          ) : (
            <>
              <LocalizedLink
                href="/login"
                className="rounded-[14px] border border-slate-200/80 bg-white px-4 py-2 text-[14px] font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition hover:border-slate-300"
              >
                {copy.shell.login}
              </LocalizedLink>
              <LocalizedLink
                href="/register"
                onClick={() => {
                  trackEvent({
                    eventName: "home_register_click",
                    pageUrl,
                    targetType: "button",
                    targetId: "register",
                    extra: {},
                  });
                }}
                className="rounded-[14px] bg-slate-900 px-4 py-2 text-[14px] font-medium !text-white shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition hover:bg-slate-800 hover:!text-white"
              >
                {copy.shell.register}
              </LocalizedLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
