/**
 * 结构化数据组件
 * 用于在页面中渲染 JSON-LD 结构化数据
 */

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

export default function StructuredData({
  organization,
  website,
  webpage,
  article,
  breadcrumb,
  locale = "en",
}: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://bdsm-test.toolina.com";
  
  // 默认组织信息
  const defaultOrg = organization || getDefaultOrganization(locale);
  const defaultWebsite = website || getDefaultWebSite(locale);

  const schemas: object[] = [];

  // 添加 Organization（如果未明确设置为 null）
  if (organization !== null && organization !== undefined) {
    schemas.push(generateOrganizationSchema(organization));
  } else if (organization === undefined) {
    // 如果未提供，使用默认值
    schemas.push(generateOrganizationSchema(defaultOrg));
  }

  // 添加 WebSite（如果未明确设置为 null）
  if (website !== null && website !== undefined) {
    schemas.push(generateWebSiteSchema(website));
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
    schemas.push(generateArticleSchema(article));
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

