import { notFound } from "next/navigation";
import { ProfileCenterPage } from "@/components/profile/ProfileCenterPage";
import { isLocale } from "@/lib/i18n";

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function LocaleMePage({ params }: Props) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <ProfileCenterPage locale={locale} />;
}

