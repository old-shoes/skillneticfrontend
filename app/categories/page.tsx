import { redirect } from "next/navigation";
import { defaultLocale } from "@/lib/i18n";

type PageProps = {
  searchParams?: Promise<{
    q?: string | string[];
    group?: string | string[];
    scene?: string | string[];
    sort?: string | string[];
  }>;
};

export default async function CategoriesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const params = new URLSearchParams();

  Object.entries(resolvedSearchParams || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      return;
    }

    if (value) {
      params.set(key, value);
    }
  });

  const qs = params.toString();
  redirect(`/${defaultLocale}/categories${qs ? `?${qs}` : ""}`);
}
