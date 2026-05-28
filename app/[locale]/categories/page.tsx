import { notFound } from "next/navigation";
import { CategoriesPage } from "@/components/CategoriesPage";
import { getCategories, getCategoriesOverview } from "@/lib/api/categories";
import { isLocale } from "@/lib/i18n";
import type { CategoryListQuery, CategorySort } from "@/lib/types/categories";

type Props = {
  params: Promise<{
    locale: string;
  }>;
  searchParams?: Promise<{
    q?: string | string[];
    group?: string | string[];
    scene?: string | string[];
    sort?: string | string[];
  }>;
};

function pickValue(value?: string | string[]): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export default async function LocaleCategoriesPage({ params, searchParams }: Props) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const query: CategoryListQuery = {
    q: pickValue(resolvedSearchParams?.q),
    group: pickValue(resolvedSearchParams?.group),
    scene: pickValue(resolvedSearchParams?.scene),
    sort: (pickValue(resolvedSearchParams?.sort) as CategorySort | undefined) || "default",
  };

  const [overview, categories] = await Promise.all([
    getCategoriesOverview(locale),
    getCategories(query, locale),
  ]);

  return (
    <CategoriesPage
      locale={locale}
      overview={overview}
      initialQuery={query}
      initialResponse={categories}
    />
  );
}
