import { MetadataRoute } from "next";
import { locales } from "@/i18n/locale";
import { getPostsByLocale, PostStatus } from "@/models/post";
import { source } from "@/lib/source";

/**
 * 生成网站的 sitemap
 * 包含所有静态页面、动态文章页面和文档页面
 * 支持多语言国际化
 * 
 * @returns {Promise<MetadataRoute.Sitemap>} sitemap 数据
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://bdsm-test.toolina.com";
  const currentDate = new Date().toISOString();

  // 静态页面路由列表
  const staticRoutes = [
    "", // 首页
    "/about", // 关于页面
    "/privacy", // 隐私政策
    "/posts", // 文章列表
    "/bdsm-test", // 测试页面
    "/bdsm-test/run", // 测试运行页面
    "/bdsm-test/history", // 测试历史
    "/docs", // 文档首页
  ];

  // 初始化 sitemap 数组
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // 添加静态页面（支持多语言）
  for (const locale of locales) {
    for (const route of staticRoutes) {
      // 根据 localePrefix 配置决定是否添加语言前缀
      // 默认语言可能不需要前缀（as-needed 模式）
      const localePrefix = locale === "en" ? "" : `/${locale}`;
      const url = `${baseUrl}${localePrefix}${route}`;

      sitemapEntries.push({
        url,
        lastModified: currentDate,
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1.0 : 0.8,
      });
    }
  }

  // 添加动态文章页面
  try {
    for (const locale of locales) {
      // 获取该语言的所有在线文章
      const posts = await getPostsByLocale(locale, 1, 1000); // 获取最多1000篇文章

      if (posts && posts.length > 0) {
        for (const post of posts) {
          if (post.slug && post.status === PostStatus.Online) {
            const localePrefix = locale === "en" ? "" : `/${locale}`;
            const url = `${baseUrl}${localePrefix}/posts/${post.slug}`;
            const lastModified = post.updated_at 
              ? new Date(post.updated_at).toISOString() 
              : post.created_at 
              ? new Date(post.created_at).toISOString() 
              : currentDate;

            sitemapEntries.push({
              url,
              lastModified,
              changeFrequency: "weekly",
              priority: 0.7,
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("Error fetching posts for sitemap:", error);
    // 如果获取文章失败，继续生成其他页面的 sitemap
  }

  // 添加文档页面
  try {
    // 获取所有文档页面的参数
    const docsParams = source.generateParams("slug", "locale");

    if (docsParams && docsParams.length > 0) {
      for (const param of docsParams) {
        const slug = param.slug || [];
        const locale = param.locale || "en";
        const localePrefix = locale === "en" ? "" : `/${locale}`;
        const docsPath = slug.length > 0 ? `/${slug.join("/")}` : "";
        const url = `${baseUrl}${localePrefix}/docs${docsPath}`;

        sitemapEntries.push({
          url,
          lastModified: currentDate,
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }
  } catch (error) {
    console.error("Error fetching docs for sitemap:", error);
    // 如果获取文档失败，继续生成其他页面的 sitemap
  }

  // 去重：使用 Set 来确保 URL 唯一
  const uniqueUrls = new Set<string>();
  const deduplicatedEntries: MetadataRoute.Sitemap = [];

  for (const entry of sitemapEntries) {
    if (!uniqueUrls.has(entry.url)) {
      uniqueUrls.add(entry.url);
      deduplicatedEntries.push(entry);
    }
  }

  return deduplicatedEntries;
}
