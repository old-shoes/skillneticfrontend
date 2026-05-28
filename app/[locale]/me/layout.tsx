import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { ProfileWorkspaceLayout } from "@/components/profile/profile-shared";
import { isLocale } from "@/lib/i18n";

type Props = {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export default async function LocaleMeLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <ProfileWorkspaceLayout locale={locale}>{children}</ProfileWorkspaceLayout>;
}
