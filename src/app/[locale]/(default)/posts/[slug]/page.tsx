import { PostStatus, findPostBySlug } from "@/models/post";

import BlogDetail from "@/components/blocks/blog-detail";
import Empty from "@/components/blocks/empty";
import { Post } from "@/types/post";
import { generateSocialMeta } from "@/lib/social-meta";
import StructuredData from "@/components/StructuredData";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const post = await findPostBySlug(slug, locale);

  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://bdsm-test.toolina.com";
  let canonicalUrl = `${baseUrl}/posts/${slug}`;

  if (locale !== "en") {
    canonicalUrl = `${baseUrl}/${locale}/posts/${slug}`;
  }

  const title = post?.title || "";
  const description = post?.description || "";

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
      type: "article",
      image: post?.image, // 如果有文章图片，使用文章图片
    }),
  };
}

export default async function ({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = await findPostBySlug(slug, locale);

  if (!post || post.status !== PostStatus.Online) {
    return <Empty message="Post not found" />;
  }

  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://bdsm-test.toolina.com";
  let canonicalUrl = `${baseUrl}/posts/${slug}`;
  if (locale !== "en") {
    canonicalUrl = `${baseUrl}/${locale}/posts/${slug}`;
  }

  const articleImage = post.image 
    ? (post.image.startsWith("http") ? post.image : `${baseUrl}${post.image}`)
    : `${baseUrl}/og-image.png`;

  return (
    <>
      <StructuredData
        locale={locale}
        website={null}
        organization={null}
        article={{
          "@type": "Article",
          headline: post.title || "",
          description: post.description || "",
          image: articleImage,
          datePublished: post.created_at ? new Date(post.created_at).toISOString() : undefined,
          dateModified: post.updated_at ? new Date(post.updated_at).toISOString() : undefined,
          author: {
            "@type": "Organization",
            name: "BDSM Test",
          },
        }}
        webpage={{
          "@type": "WebPage",
          "@id": `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: post.title || "",
          description: post.description || "",
          inLanguage: locale === "zh" ? "zh-CN" : locale,
          isPartOf: {
            "@id": `${baseUrl}/#website`,
          },
        }}
      />
      <BlogDetail post={post as unknown as Post} />
    </>
  );
}
