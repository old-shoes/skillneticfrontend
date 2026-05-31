import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SkillDetailPage } from "@/components/SkillDetailPage";
import { getSkillDetail } from "@/lib/api/skills";
import { isLocale } from "@/lib/i18n";

type Props = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const skill = await getSkillDetail(slug);
  if (!skill) {
    return {};
  }

  return {
    title: skill.title,
    description: skill.summary,
  };
}

export default async function LocaleSkillDetailPage({ params }: Props) {
  const { locale, slug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const headerStore = await headers();
  const cookie = headerStore.get("cookie") || "";
  const skill = await getSkillDetail(slug, cookie ? { headers: { cookie } } : undefined, { trackView: true });
  if (!skill) {
    notFound();
  }

  return <SkillDetailPage locale={locale} skill={skill} />;
}
