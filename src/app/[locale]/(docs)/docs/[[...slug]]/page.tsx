import { source } from "@/lib/source";
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { getMDXComponents } from "@/mdx-components";
import StructuredData from "@/components/StructuredData";

export default async function DocsContentPage(props: {
  params: Promise<{ slug?: string[]; locale?: string }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug, params.locale);

  if (!page) notFound();

  const MDXContent = page.data.body;

  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://bdsm-test.toolina.com";
  const locale = params.locale || "en";
  const slug = params.slug || [];
  const docsPath = slug.length > 0 ? `docs/${slug.join("/")}` : "docs";
  const { getCanonicalUrl } = await import("@/lib/canonical");
  const canonicalUrl = getCanonicalUrl(locale, docsPath);

  return (
    <>
      <StructuredData
        locale={locale}
        website={null}
        organization={null}
        article={{
          "@type": "Article",
          headline: page.data.title,
          description: page.data.description || "",
          datePublished: page.data.date ? new Date(page.data.date).toISOString() : undefined,
          author: {
            "@type": "Organization",
            name: "BDSM Test",
          },
        }}
        webpage={{
          "@type": "WebPage",
          "@id": `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: page.data.title,
          description: page.data.description || "",
          inLanguage: locale === "zh" ? "zh-CN" : locale,
          isPartOf: {
            "@id": `${baseUrl}/#website`,
          },
        }}
      />
      <DocsPage
        toc={page.data.toc}
        full={page.data.full}
        tableOfContent={{
          style: "clerk",
        }}
      >
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsDescription>{page.data.description}</DocsDescription>
        <DocsBody>
          <MDXContent
            components={getMDXComponents({
              // this allows you to link to other pages with relative file paths
              a: createRelativeLink(source, page),
            })}
          />
        </DocsBody>
      </DocsPage>
    </>
  );
}

export async function generateStaticParams() {
  return source.generateParams("slug", "locale");
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[]; locale?: string }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug, params.locale);
  if (!page) notFound();

  const { getCanonicalUrl } = await import("@/lib/canonical");
  const { generateSocialMeta } = await import("@/lib/social-meta");
  const locale = params.locale || "en";
  const slug = params.slug || [];
  const docsPath = slug.length > 0 ? `docs/${slug.join("/")}` : "docs";
  const canonicalUrl = getCanonicalUrl(locale, docsPath);

  const title = page.data.title;
  const description = page.data.description || "";

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
    }),
  };
}
