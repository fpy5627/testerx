/**
 * 生成结构化数据（JSON-LD）的工具函数
 * 用于帮助搜索引擎更好地理解页面内容
 */

export interface OrganizationData {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[]; // 社交媒体链接
}

export interface WebSiteData {
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    "@type": "SearchAction";
    target: {
      "@type": "EntryPoint";
      urlTemplate: string;
    };
    "query-input": string;
  };
}

export interface WebPageData {
  "@type": "WebPage";
  "@id": string;
  url: string;
  name: string;
  description?: string;
  inLanguage?: string;
  isPartOf?: {
    "@id": string;
  };
  breadcrumb?: {
    "@id": string;
  };
}

export interface ArticleData {
  "@type": "Article";
  headline: string;
  description?: string;
  image?: string | string[];
  datePublished?: string;
  dateModified?: string;
  author?: {
    "@type": "Person" | "Organization";
    name: string;
  };
  publisher?: {
    "@type": "Organization";
    name: string;
    logo?: {
      "@type": "ImageObject";
      url: string;
    };
  };
}

export interface BreadcrumbListData {
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item?: string;
  }>;
}

/**
 * 生成 Organization 结构化数据
 */
export function generateOrganizationSchema(data: OrganizationData) {
  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://bdsm-test.toolina.com";
  
  // 确保 URL 使用正确的域名
  // 如果传入的 URL 是空字符串、相对路径或不是正确的域名，使用默认值
  const url = data.url && data.url.trim() && (
    data.url.startsWith("https://bdsm-test.toolina.com") || 
    data.url.startsWith("http://bdsm-test.toolina.com")
  )
    ? data.url 
    : baseUrl;
  
  // 确保 logo URL 使用正确的域名
  const logo = data.logo 
    ? (data.logo.startsWith("https://bdsm-test.toolina.com") || data.logo.startsWith("http://bdsm-test.toolina.com")
        ? data.logo
        : (data.logo.startsWith("http") 
            ? `${baseUrl}/logo.png`  // 如果是其他域名的图片，使用默认 logo
            : `${baseUrl}${data.logo.startsWith("/") ? data.logo : `/${data.logo}`}`))
    : `${baseUrl}/logo.png`;
  
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: data.name,
    url,
    logo,
    description: data.description,
    ...(data.sameAs && data.sameAs.length > 0 && { sameAs: data.sameAs }),
  };
}

/**
 * 生成 WebSite 结构化数据
 */
export function generateWebSiteSchema(data: WebSiteData) {
  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://bdsm-test.toolina.com";
  
  // 确保 URL 使用正确的域名
  // 如果传入的 URL 是空字符串、相对路径或不是正确的域名，使用默认值
  const url = data.url && data.url.trim() && (
    data.url.startsWith("https://bdsm-test.toolina.com") || 
    data.url.startsWith("http://bdsm-test.toolina.com")
  )
    ? data.url 
    : baseUrl;
  
  // 确保 potentialAction 中的 URL 也使用正确的域名
  const potentialAction = data.potentialAction ? {
    ...data.potentialAction,
    target: {
      ...data.potentialAction.target,
      urlTemplate: data.potentialAction.target.urlTemplate && (
        data.potentialAction.target.urlTemplate.startsWith("https://bdsm-test.toolina.com") ||
        data.potentialAction.target.urlTemplate.startsWith("http://bdsm-test.toolina.com")
      )
        ? data.potentialAction.target.urlTemplate
        : data.potentialAction.target.urlTemplate.replace(/https?:\/\/[^\/]+/, baseUrl),
    },
  } : undefined;
  
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: data.name,
    url,
    description: data.description,
    ...(potentialAction && { potentialAction }),
  };
}

/**
 * 生成 WebPage 结构化数据
 */
export function generateWebPageSchema(data: WebPageData) {
  return {
    "@context": "https://schema.org",
    ...data,
  };
}

/**
 * 生成 Article 结构化数据
 */
export function generateArticleSchema(data: ArticleData) {
  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://bdsm-test.toolina.com";
  
  // 确保图片 URL 使用正确的域名
  const image = data.image 
    ? (Array.isArray(data.image) 
        ? data.image.map(img => {
            if (img.startsWith("https://bdsm-test.toolina.com") || img.startsWith("http://bdsm-test.toolina.com")) {
              return img;
            }
            return img.startsWith("http") ? `${baseUrl}/og-image.png` : `${baseUrl}${img.startsWith("/") ? img : `/${img}`}`;
          })
        : (data.image.startsWith("https://bdsm-test.toolina.com") || data.image.startsWith("http://bdsm-test.toolina.com")
            ? data.image
            : (data.image.startsWith("http") ? `${baseUrl}/og-image.png` : `${baseUrl}${data.image.startsWith("/") ? data.image : `/${data.image}`}`)))
    : undefined;
  
  // 确保 publisher logo URL 使用正确的域名
  const publisher = data.publisher || {
    "@type": "Organization" as const,
    name: "BDSM Test",
    logo: {
      "@type": "ImageObject" as const,
      url: `${baseUrl}/logo.png`,
    },
  };
  
  if (publisher.logo && !publisher.logo.url.startsWith("https://bdsm-test.toolina.com")) {
    publisher.logo.url = `${baseUrl}/logo.png`;
  }
  
  return {
    "@context": "https://schema.org",
    ...data,
    ...(image && { image }),
    publisher,
  };
}

/**
 * 生成 BreadcrumbList 结构化数据
 */
export function generateBreadcrumbListSchema(data: BreadcrumbListData) {
  return {
    "@context": "https://schema.org",
    ...data,
  };
}

/**
 * 生成默认的 Organization 数据
 */
export function getDefaultOrganization(locale: string = "en"): OrganizationData {
  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://bdsm-test.toolina.com";
  
  return {
    name: "BDSM Test",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: locale === "zh" 
      ? "免费、匿名、安全的 BDSM 心理倾向测试工具"
      : "Free, anonymous, and secure BDSM psychological test tool",
  };
}

/**
 * 生成默认的 WebSite 数据
 */
export function getDefaultWebSite(locale: string = "en"): WebSiteData {
  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://bdsm-test.toolina.com";
  
  return {
    name: "BDSM Test",
    url: baseUrl,
    description: locale === "zh"
      ? "免费、匿名、安全的 BDSM 心理倾向测试工具。了解自己的心理维度与性取向光谱。"
      : "Free, anonymous, and secure BDSM psychological test tool. Understand your psychological dimensions and sexual orientation spectrum.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

