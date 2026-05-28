import { notFound } from "next/navigation";
import { PlaceholderPage } from "@/components/PlaceholderPage";
import { getStaticPageProps } from "@/lib/placeholder-pages";
import { isLocale } from "@/lib/i18n";

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function LocaleContactPage({ params }: Props) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const copy = getStaticPageProps(locale, "contact");
  if (!copy) {
    notFound();
  }

  return <PlaceholderPage {...copy} />;
}
