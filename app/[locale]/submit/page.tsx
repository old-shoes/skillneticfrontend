import { notFound, redirect } from "next/navigation";
import { isLocale, withLocale } from "@/lib/i18n";

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function LocaleSubmitPage({ params }: Props) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }
  redirect(withLocale(locale, "/me/submit"));
}
