import { notFound, redirect } from "next/navigation";
import { isLocale, withLocale } from "@/lib/i18n";

type Props = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    id?: string;
  }>;
};

export default async function LocaleSubmitSkillSuccessPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { id } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  redirect(withLocale(locale, `/me/submit-success${id ? `?id=${id}` : ""}`));
}
