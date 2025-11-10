import { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/canonical";
import { getTranslations } from "next-intl/server";
import { generateSocialMeta } from "@/lib/social-meta";

/**
 * 为 BDSM 测试页面生成 metadata
 * 由于页面组件是客户端组件，metadata 需要在 layout 中设置
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalUrl = getCanonicalUrl(locale, "bdsm-test");
  const t = await getTranslations("metadata.pages.bdsm_test");

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

export default function BDSMTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

