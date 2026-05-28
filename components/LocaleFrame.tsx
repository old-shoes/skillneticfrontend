"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { stripLocaleFromPath } from "@/lib/i18n";

type Props = {
  children: React.ReactNode;
};

const AUTH_PATHS = ["/account/security/change-password", "/auth/callback"];

export function LocaleFrame({ children }: Props) {
  const pathname = usePathname();
  const strippedPath = stripLocaleFromPath(pathname);
  const isAuthPage = AUTH_PATHS.some((path) => strippedPath === path || strippedPath.startsWith(`${path}/`));

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
