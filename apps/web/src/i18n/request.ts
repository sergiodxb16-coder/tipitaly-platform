import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

const VALID_LOCALES = [
  "it", "en", "de", "fr",
  "es", "pt", "ja", "nl", "zh",
  "ru", "ar", "cs", "hu", "sl",
  "hr", "sq", "pl",
] as const;
export type Locale = (typeof VALID_LOCALES)[number];

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get("TIPITALY_LOCALE")?.value ?? "it";
  const locale: Locale = VALID_LOCALES.includes(raw as Locale)
    ? (raw as Locale)
    : "it";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
