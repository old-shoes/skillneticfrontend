import { redirect } from "next/navigation";
import { defaultLocale } from "@/lib/i18n";

export default function SubmitPage() {
  redirect(`/${defaultLocale}/me/submit`);
}
