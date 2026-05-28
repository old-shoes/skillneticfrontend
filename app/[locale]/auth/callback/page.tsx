import { notFound } from "next/navigation";
import { AuthCallbackPage } from "@/components/auth/AuthCallbackPage";
import { isLocale } from "@/lib/i18n";

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function LocaleAuthCallbackPage({ params }: Props) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <AuthCallbackPage locale={locale} />;
}
