import Blog from "@/components/blocks/blog";
import { BlogItem, Blog as BlogType } from "@/types/blocks/blog";
import { getPostsByLocale } from "@/models/post";
import { getTranslations } from "next-intl/server";
import { generateSocialMeta } from "@/lib/social-meta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();

  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://bdsm-test.toolina.com";
  let canonicalUrl = `${baseUrl}/posts`;

  if (locale !== "en") {
    canonicalUrl = `${baseUrl}/${locale}/posts`;
  }

  const blogTitle = t("blog.title");
  const tMetadata = await getTranslations("metadata.pages.posts");
  // 如果翻译的标题太短，添加后缀使其达到 40-60 字符
  const optimizedTitle = blogTitle.length < 40 
    ? `${blogTitle}${tMetadata("title_suffix")}`
    : blogTitle;

  const description = t("blog.description");

  return {
    title: optimizedTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    ...generateSocialMeta({
      title: optimizedTitle,
      description,
      url: canonicalUrl,
      locale,
    }),
  };
}

export default async function PostsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();

  const posts = await getPostsByLocale(locale);

  const blog: BlogType = {
    title: t("blog.title"),
    description: t("blog.description"),
    items: posts as unknown as BlogItem[],
    read_more_text: t("blog.read_more_text"),
  };

  return <Blog blog={blog} />;
}
