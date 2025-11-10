import { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/canonical";
import { getTranslations } from "next-intl/server";
import { generateSocialMeta } from "@/lib/social-meta";

/**
 * 为隐私政策页面生成 metadata
 * 由于页面组件是客户端组件，metadata 需要在 layout 中设置
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalUrl = getCanonicalUrl(locale, "privacy");
  const t = await getTranslations("metadata.pages.privacy");

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

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

