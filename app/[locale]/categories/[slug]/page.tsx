import { notFound } from "next/navigation";
import { PlaceholderPage } from "@/components/PlaceholderPage";
import { isLocale } from "@/lib/i18n";
import { getCategoryDetailPageProps } from "@/lib/placeholder-pages";

type Props = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export default async function LocaleCategoryDetailPage({ params }: Props) {
  const { locale, slug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <PlaceholderPage {...getCategoryDetailPageProps(locale, slug)} />;
}
