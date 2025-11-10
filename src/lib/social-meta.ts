/**
 * 生成社交媒体 meta 标签的工具函数
 * 用于 Open Graph 和 Twitter Card
 * 
 * @param title - 页面标题
 * @param description - 页面描述
 * @param url - 页面 URL
 * @param image - 图片 URL（可选）
 * @param locale - 语言环境（可选）
 * @returns 社交媒体 meta 标签对象
 */

export interface SocialMetaOptions {
  title: string;
  description: string;
  url: string;
  image?: string;
  locale?: string;
  type?: "website" | "article";
  siteName?: string;
}

export function generateSocialMeta({
  title,
  description,
  url,
  image,
  locale = "en",
  type = "website",
  siteName = "BDSM Test",
}: SocialMetaOptions) {
  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://bdsm-test.toolina.com";
  const defaultImage = `${baseUrl}/og-image.png`; // 默认 OG 图片
  const ogImage = image || defaultImage;

  return {
    openGraph: {
      title,
      description,
      url,
      siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: locale === "zh" ? "zh_CN" : locale === "en" ? "en_US" : locale,
      type,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

