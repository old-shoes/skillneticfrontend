import { notFound } from "next/navigation";
import { SkillsLibraryPage } from "@/components/SkillsLibraryPage";
import { getSkillFilters, getSkills } from "@/lib/api/skills";
import { isLocale } from "@/lib/i18n";
import type { SkillListQuery, SkillSort } from "@/lib/types/skills";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams?: Promise<{
    q?: string | string[];
    category?: string | string[];
    scene?: string | string[];
    type?: string | string[];
    sort?: string | string[];
    page?: string | string[];
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

export default async function LocaleSkillsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const query: SkillListQuery = {
    q: pickValue(resolvedSearchParams?.q),
    category: pickValue(resolvedSearchParams?.category),
    scene: pickValue(resolvedSearchParams?.scene),
    type: pickValue(resolvedSearchParams?.type),
    sort: (pickValue(resolvedSearchParams?.sort) as SkillSort | undefined) || "latest",
    page: toPositiveInt(pickValue(resolvedSearchParams?.page)),
    pageSize: 9,
  };

  const [filters, skills] = await Promise.all([getSkillFilters(), getSkills(query)]);

  return (
    <SkillsLibraryPage
      filters={filters}
      initialQuery={query}
      initialResponse={skills}
      queryKey={JSON.stringify(query)}
      locale={locale}
    />
  );
}
