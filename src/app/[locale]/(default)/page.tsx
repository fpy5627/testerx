import Feature from "@/components/blocks/feature";
import { getLandingPage } from "@/services/page";
import { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/canonical";
import { getTranslations } from "next-intl/server";
import { generateSocialMeta } from "@/lib/social-meta";
import StructuredData from "@/components/StructuredData";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalUrl = getCanonicalUrl(locale, "");
  const t = await getTranslations("metadata.pages.home");

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

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  try {
  const { locale } = await params;
  const page = await getLandingPage(locale);

    // 安全检查：确保 page 和 page.feature 存在
    if (!page) {
      console.error("Landing page data not found");
      return (
        <div className="container mx-auto py-10">
          <p className="text-center text-muted-foreground">页面数据加载失败</p>
        </div>
      );
    }

    if (!page.feature) {
      console.error("Feature section not found in landing page data", page);
      return (
        <div className="container mx-auto py-10">
          <p className="text-center text-muted-foreground">Feature section not found</p>
        </div>
      );
    }

    // 如果 feature 被禁用，返回提示信息而不是 null
    if (page.feature.disabled) {
      return (
        <div className="container mx-auto py-10">
          <p className="text-center text-muted-foreground">Feature section is disabled</p>
        </div>
      );
    }

    const canonicalUrl = getCanonicalUrl(locale, "");
    const t = await getTranslations("metadata.pages.home");
    const title = t("title");
    const description = t("description");
    const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://bdsm-test.toolina.com";

    return (
      <>
        <StructuredData
          locale={locale}
          website={null} // 已在根 layout 中添加
          organization={null} // 已在根 layout 中添加
          webpage={{
            "@type": "WebPage",
            "@id": `${canonicalUrl}#webpage`,
            url: canonicalUrl,
            name: title,
            description,
            inLanguage: locale === "zh" ? "zh-CN" : locale,
            isPartOf: {
              "@id": `${baseUrl}/#website`,
            },
          }}
        />
        <Feature section={page.feature} />
      </>
    );
  } catch (error) {
    console.error("Error loading landing page:", error);
    return (
      <div className="container mx-auto py-10">
        <p className="text-center text-muted-foreground">页面加载出错: {error instanceof Error ? error.message : String(error)}</p>
      </div>
    );
  }
}
