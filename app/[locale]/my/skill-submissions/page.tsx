import { notFound } from "next/navigation";
import { MySkillSubmissionsPage } from "@/components/submit-skill/MySkillSubmissionsPage";
import { isLocale } from "@/lib/i18n";

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function LocaleMySkillSubmissionsPage({ params }: Props) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <MySkillSubmissionsPage locale={locale} />;
}
