"use client";

import { usePathname } from "next/navigation";
import { PlaceholderPage } from "@/components/PlaceholderPage";
import { getLocaleFromPathname } from "@/lib/i18n";
import { getNotFoundPageProps } from "@/lib/placeholder-pages";

export default function LocaleNotFoundPage() {
  const locale = getLocaleFromPathname(usePathname());

  return <PlaceholderPage {...getNotFoundPageProps(locale)} />;
}
