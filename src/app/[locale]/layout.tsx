import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { AppContextProvider } from "@/contexts/app";
import { Metadata } from "next";
import { NextAuthSessionProvider } from "@/auth/session";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "@/providers/theme";
import ScrollToTop from "@/components/ScrollToTop";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const { getCanonicalUrl } = await import("@/lib/canonical");
  const { generateSocialMeta } = await import("@/lib/social-meta");
  
  // 获取当前路径的 canonical URL（如果没有子页面设置，使用默认）
  const canonicalUrl = getCanonicalUrl(locale, "");

  const title = t("metadata.title");
  const description = t("metadata.description");

  return {
    title: {
      template: `%s`,
      default: title,
    },
    description,
    keywords: t("metadata.keywords"),
    alternates: {
      canonical: canonicalUrl,
    },
    ...generateSocialMeta({
      title,
      description,
      url: canonicalUrl,
      locale,
    }),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <NextAuthSessionProvider>
        <AppContextProvider>
          <ThemeProvider>
            {children}
            <ScrollToTop />
          </ThemeProvider>
        </AppContextProvider>
      </NextAuthSessionProvider>
    </NextIntlClientProvider>
  );
}
