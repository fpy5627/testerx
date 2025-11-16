import { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/canonical";
import { getTranslations } from "next-intl/server";
import { generateSocialMeta } from "@/lib/social-meta";

/**
 * 为服务条款页面生成 metadata
 * 
 * @param {Object} params - 路由参数
 * @param {Promise<{locale: string}>} params.params - 包含 locale 的参数
 * @returns {Promise<Metadata>} 页面元数据
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalUrl = getCanonicalUrl(locale, "terms-of-service");
  const t = await getTranslations("terms_of_service");

  const title = t("title");
  const description = t("introduction.content").replace(/\*\*/g, "").substring(0, 160);

  return {
    title,
    description,
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

/**
 * 服务条款页面布局
 * 由于页面组件是客户端组件，layout 主要用于设置 metadata
 * 
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件内容
 * @returns {React.ReactElement} 布局组件
 */
export default function TermsOfServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

