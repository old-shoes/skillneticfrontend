import { headers } from "next/headers";
import { Homepage } from "@/components/Homepage";
import { getHomepageData } from "@/lib/api/homepage";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function LocaleHomePage({ params }: Props) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const headerStore = await headers();
  const cookie = headerStore.get("cookie") || "";
  const data = await getHomepageData(cookie ? { headers: { cookie } } : undefined);

  return <Homepage data={data} locale={locale} />;
}
