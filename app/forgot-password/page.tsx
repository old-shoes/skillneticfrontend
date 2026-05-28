import { redirect } from "next/navigation";
import { defaultLocale } from "@/lib/i18n";

export default function ForgotPasswordPage() {
  redirect(`/${defaultLocale}/forgot-password`);
}
