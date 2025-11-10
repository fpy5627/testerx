/**
 * 生成 canonical URL 的工具函数
 * 用于确保所有页面都有正确的 canonical URL，避免重复内容问题
 * 
 * @param locale - 当前语言环境
 * @param path - 页面路径（不包含语言前缀）
 * @returns 完整的 canonical URL
 */
export function getCanonicalUrl(locale: string, path: string = ""): string {
  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://bdsm-test.toolina.com";
  
  // 移除路径开头的斜杠（如果有）
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  
  // 根据 localePrefix 配置决定是否添加语言前缀
  // 默认语言（en）可能不需要前缀（as-needed 模式）
  const localePrefix = locale === "en" ? "" : `/${locale}`;
  
  // 构建完整的 URL
  const url = cleanPath 
    ? `${baseUrl}${localePrefix}/${cleanPath}` 
    : `${baseUrl}${localePrefix}`;
  
  // 移除末尾的斜杠（除了根路径）
  return url.replace(/\/$/, "") || baseUrl;
}

