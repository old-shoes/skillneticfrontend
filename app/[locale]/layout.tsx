import { notFound } from "next/navigation";
import { LocaleFrame } from "@/components/LocaleFrame";
import { isLocale } from "@/lib/i18n";

type Props = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <LocaleFrame>{children}</LocaleFrame>;
}
