import { notFound } from "next/navigation";
import { AuthFormPage } from "@/components/auth/AuthFormPage";
import { isLocale } from "@/lib/i18n";

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function LocaleChangePasswordPage({ params }: Props) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <AuthFormPage locale={locale} mode="change-password" />;
}
