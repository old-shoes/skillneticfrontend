import { notFound } from "next/navigation";
import { CommunityWatchPage } from "@/components/CommunityWatchPage";
import { getCommunityWatch } from "@/lib/api/community-watch";
import { isLocale } from "@/lib/i18n";

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function LocaleCommunityPage({ params }: Props) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const snapshot = await getCommunityWatch();
  return <CommunityWatchPage locale={locale} snapshot={snapshot} />;
}
