"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { getLocaleFromPathname, withLocale } from "@/lib/i18n";

type Props = Omit<ComponentProps<typeof NextLink>, "href"> & {
  href: string;
};

export function LocalizedLink({ href, ...props }: Props) {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);

  return <NextLink href={withLocale(locale, href)} {...props} />;
}
