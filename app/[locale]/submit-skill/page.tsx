import { notFound, redirect } from "next/navigation";
import { isLocale, withLocale } from "@/lib/i18n";

type Props = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function buildQueryString(searchParams: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === "string") {
      query.set(key, value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
    }
  });

  return query.toString();
}

export default async function LocaleSubmitSkillPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const queryString = buildQueryString(resolvedSearchParams);
  redirect(withLocale(locale, `/me/submit${queryString ? `?${queryString}` : ""}`));
}
