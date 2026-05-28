import { redirect } from "next/navigation";
import { defaultLocale } from "@/lib/i18n";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function TutorialDetailPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/${defaultLocale}/tutorials/${slug}`);
}
