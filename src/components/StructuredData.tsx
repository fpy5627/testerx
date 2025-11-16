/**
 * 结构化数据组件
 * 用于在页面中渲染 JSON-LD 结构化数据
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import { generateOrganizationSchema, generateWebSiteSchema, generateWebPageSchema, generateArticleSchema, generateBreadcrumbListSchema, getDefaultOrganization, getDefaultWebSite } from "@/lib/structured-data";
import type { OrganizationData, WebSiteData, WebPageData, ArticleData, BreadcrumbListData } from "@/lib/structured-data";

interface StructuredDataProps {
  organization?: OrganizationData | null;
  website?: WebSiteData | null;
  webpage?: WebPageData;
  article?: ArticleData;
  breadcrumb?: BreadcrumbListData;
  locale?: string;
}

export default async function StructuredData({
  organization,
  website,
  webpage,
  article,
  breadcrumb,
  locale = "en",
}: StructuredDataProps) {
  // 设置请求的 locale，确保翻译使用正确的语言
  setRequestLocale(locale);
  
  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://bdsm-test.toolina.com";
  
  // 获取翻译
  const t = await getTranslations("metadata.structured_data");
  
  // 将 locale 转换为标准的语言代码（zh -> zh-CN）
  const languageCode = locale === "zh" ? "zh-CN" : locale;
  
  // 默认组织信息（如果未提供，使用翻译后的默认值）
  const defaultOrg = organization || {
    ...getDefaultOrganization(
      t("organization.name"),
      t("organization.description")
    ),
    inLanguage: languageCode,
  };
  
  // 默认网站信息（如果未提供，使用翻译后的默认值）
  const defaultWebsite = website || {
    ...getDefaultWebSite(
      t("website.name"),
      t("website.description")
    ),
    inLanguage: languageCode,
  };

  const schemas: object[] = [];

  // 添加 Organization（如果未明确设置为 null）
  if (organization !== null && organization !== undefined) {
    // 如果传入的 organization 没有 inLanguage，添加它
    const orgWithLanguage = organization.inLanguage 
      ? organization 
      : { ...organization, inLanguage: languageCode };
    schemas.push(generateOrganizationSchema(orgWithLanguage));
  } else if (organization === undefined) {
    // 如果未提供，使用默认值
    schemas.push(generateOrganizationSchema(defaultOrg));
  }

  // 添加 WebSite（如果未明确设置为 null）
  if (website !== null && website !== undefined) {
    // 如果传入的 website 没有 inLanguage，添加它
    const websiteWithLanguage = website.inLanguage 
      ? website 
      : { ...website, inLanguage: languageCode };
    schemas.push(generateWebSiteSchema(websiteWithLanguage));
  } else if (website === undefined) {
    // 如果未提供，使用默认值
    schemas.push(generateWebSiteSchema(defaultWebsite));
  }

  // 添加 WebPage
  if (webpage) {
    const webpageSchema = generateWebPageSchema({
      ...webpage,
      isPartOf: webpage.isPartOf || {
        "@id": `${baseUrl}/#website`,
      },
    });
    schemas.push(webpageSchema);
  }

  // 添加 Article
  if (article) {
    // 如果传入的 article 没有 inLanguage，添加它
    const articleWithLanguage = article.inLanguage 
      ? article 
      : { ...article, inLanguage: languageCode };
    schemas.push(generateArticleSchema(articleWithLanguage));
  }

  // 添加 BreadcrumbList
  if (breadcrumb) {
    schemas.push(generateBreadcrumbListSchema(breadcrumb));
  }

  if (schemas.length === 0) {
    return null;
  }

  // 如果只有一个 schema，直接返回；否则返回数组
  const jsonLd = schemas.length === 1 ? schemas[0] : schemas;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

