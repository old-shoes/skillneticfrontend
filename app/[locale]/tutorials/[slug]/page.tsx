import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TutorialDetailPage } from "@/components/TutorialDetailPage";
import { getTutorialDetail } from "@/lib/api/tutorial-detail";
import { isLocale } from "@/lib/i18n";

type Props = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const tutorial = await getTutorialDetail(slug, locale);
  if (!tutorial) {
    return {};
  }

  return {
    title: tutorial.seoTitle || tutorial.title,
    description: tutorial.seoDescription || tutorial.summary,
  };
}

export default async function LocaleTutorialDetailPage({ params }: Props) {
  const { locale, slug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const tutorial = await getTutorialDetail(slug, locale);
  if (!tutorial) {
    notFound();
  }

  return <TutorialDetailPage locale={locale} tutorial={tutorial} />;
}
