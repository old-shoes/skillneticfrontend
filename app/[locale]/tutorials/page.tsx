import { notFound } from "next/navigation";
import { TutorialsPage } from "@/components/TutorialsPage";
import {
  getLearningPaths,
  getTutorialFilters,
  getTutorials,
  getWeeklyHotTutorials,
} from "@/lib/api/tutorials";
import { isLocale } from "@/lib/i18n";
import type { TutorialListQuery, TutorialSort } from "@/lib/types/tutorials";

type Props = {
  searchParams?: Promise<{
    q?: string | string[];
    category?: string | string[];
    tag?: string | string[];
    sort?: string | string[];
    page?: string | string[];
  }>;
  params: Promise<{
    locale: string;
  }>;
};

function pickValue(value?: string | string[]): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function toPositiveInt(value?: string): number {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : 1;
}

export default async function LocaleTutorialsPage({ params, searchParams }: Props) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const query: TutorialListQuery = {
    q: pickValue(resolvedSearchParams?.q),
    category: pickValue(resolvedSearchParams?.category),
    tag: pickValue(resolvedSearchParams?.tag),
    sort: (pickValue(resolvedSearchParams?.sort) as TutorialSort | undefined) || "latest",
    page: toPositiveInt(pickValue(resolvedSearchParams?.page)),
    pageSize: 6,
  };

  const [filters, learningPaths, weeklyHot, tutorials] = await Promise.all([
    getTutorialFilters(locale),
    getLearningPaths(locale),
    getWeeklyHotTutorials(locale),
    getTutorials(query, locale),
  ]);

  return (
    <TutorialsPage
      locale={locale}
      filters={filters}
      learningPaths={learningPaths}
      weeklyHot={weeklyHot}
      initialQuery={query}
      initialResponse={tutorials}
    />
  );
}
