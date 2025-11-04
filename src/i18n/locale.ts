import { Pathnames } from "next-intl/routing";

export const locales = ["en", "zh", "fr", "de", "es"];

export const localeNames: any = {
  en: "English",
  zh: "中文",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
};

export const defaultLocale = "en";

export const localePrefix = "as-needed";

export const localeDetection =
  process.env.NEXT_PUBLIC_LOCALE_DETECTION === "true";
