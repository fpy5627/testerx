import { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/canonical";
import { getTranslations } from "next-intl/server";
import { generateSocialMeta } from "@/lib/social-meta";

/**
 * 为测试结果页面生成 metadata
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalUrl = getCanonicalUrl(locale, "bdsm-test/result");
  const t = await getTranslations("metadata.pages.bdsm_test_result");

  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    keywords: t("keywords"),
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

export default function ResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

