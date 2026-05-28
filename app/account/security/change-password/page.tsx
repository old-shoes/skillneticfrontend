import { redirect } from "next/navigation";
import { defaultLocale } from "@/lib/i18n";

export default function ChangePasswordPage() {
  redirect(`/${defaultLocale}/account/security/change-password`);
}
