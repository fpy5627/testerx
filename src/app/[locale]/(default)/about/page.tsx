/**
 * 页面：关于
 * 作用：展示应用信息、版本、功能说明等。
 */

import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/canonical";
import { generateSocialMeta } from "@/lib/social-meta";
import StructuredData from "@/components/StructuredData";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalUrl = getCanonicalUrl(locale, "about");
  const t = await getTranslations("metadata.pages.about");

  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    keywords: t("keywords"),
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

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("headings.about");
  const tMetadata = await getTranslations("metadata.pages.about");
  const canonicalUrl = getCanonicalUrl(locale, "about");
  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://bdsm-test.toolina.com";

  return (
    <>
      <StructuredData
        locale={locale}
        website={null}
        organization={null}
        webpage={{
          "@type": "WebPage",
          "@id": `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: tMetadata("title"),
          description: tMetadata("description"),
          inLanguage: locale === "zh" ? "zh-CN" : locale,
          isPartOf: {
            "@id": `${baseUrl}/#website`,
          },
        }}
      />
      <div className="container mx-auto max-w-4xl py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">{t("title")}</h1>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">{t("app_intro")}</h2>
          <p className="text-base leading-relaxed">
            {locale === "zh" 
              ? "本应用是一个科学、匿名、安全的心理倾向测试工具，帮助您了解自己的心理维度与性取向光谱。所有数据仅存储在本地，无需登录，完全保护您的隐私。"
              : "This application is a scientific, anonymous, and secure psychological test tool that helps you understand your psychological dimensions and sexual orientation spectrum. All data is stored locally only, no login required, fully protecting your privacy."}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">{t("core_features")}</h2>
          <ul className="list-disc list-inside space-y-2 mt-3 ml-4">
            <li>
              <h3 className="inline font-semibold">{t("features.security")}</h3>：{locale === "zh" 
                ? "所有数据采用 AES 加密存储，仅存储在本地设备"
                : "All data is encrypted with AES and stored only on local devices"}
            </li>
            <li>
              <h3 className="inline font-semibold">{t("features.anonymous")}</h3>：{locale === "zh"
                ? "无需登录，不收集任何个人信息"
                : "No login required, no personal information collected"}
            </li>
            <li>
              <h3 className="inline font-semibold">{t("features.scientific")}</h3>：{locale === "zh"
                ? "基于科学的心理测量方法，提供准确的分析报告"
                : "Based on scientific psychological measurement methods, providing accurate analysis reports"}
            </li>
            <li>
              <h3 className="inline font-semibold">{t("features.privacy_protection")}</h3>：{locale === "zh"
                ? "完全符合 GDPR 要求，尊重用户隐私权"
                : "Fully GDPR compliant, respecting user privacy rights"}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">{t("test_instructions")}</h2>
          <p className="text-base leading-relaxed">
            {locale === "zh"
              ? "本测试包含多个心理维度的测量，包括但不限于："
              : "This test includes measurements of multiple psychological dimensions, including but not limited to:"}
          </p>
          <ul className="list-disc list-inside space-y-2 mt-3 ml-4">
            <li>
              <h3 className="inline font-semibold">{t("test_dimensions.dominance")}</h3>
            </li>
            <li>
              <h3 className="inline font-semibold">{t("test_dimensions.submission")}</h3>
            </li>
            <li>
              <h3 className="inline font-semibold">{t("test_dimensions.switch")}</h3>
            </li>
            <li>
              <h3 className="inline font-semibold">{t("test_dimensions.orientation_spectrum")}</h3>
            </li>
          </ul>
          <p className="text-base leading-relaxed mt-3">
            {locale === "zh"
              ? "测试结果仅供参考，不构成任何医疗或心理建议。如有心理健康相关问题，请咨询专业心理医生。"
              : "Test results are for reference only and do not constitute any medical or psychological advice. If you have mental health related questions, please consult a professional psychologist."}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">{t("tech_stack")}</h2>
          <p className="text-base leading-relaxed">
            {locale === "zh"
              ? "本应用基于以下技术构建："
              : "This application is built with the following technologies:"}
          </p>
          <ul className="list-disc list-inside space-y-2 mt-3 ml-4">
            <li>
              <h3 className="inline font-semibold">{t("technologies.nextjs")}</h3> - {t("tech_descriptions.nextjs")}
            </li>
            <li>
              <h3 className="inline font-semibold">{t("technologies.typescript")}</h3> - {t("tech_descriptions.typescript")}
            </li>
            <li>
              <h3 className="inline font-semibold">{t("technologies.tailwind")}</h3> - {t("tech_descriptions.tailwind")}
            </li>
            <li>
              <h3 className="inline font-semibold">{t("technologies.recharts")}</h3> - {t("tech_descriptions.recharts")}
            </li>
            <li>
              <h3 className="inline font-semibold">{t("technologies.next_intl")}</h3> - {t("tech_descriptions.next_intl")}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">{t("version_info")}</h2>
          <p className="text-base leading-relaxed">
            {locale === "zh" ? "当前版本：v1.0.0" : "Current Version: v1.0.0"}
          </p>
          <p className="text-base leading-relaxed mt-2">
            {locale === "zh" ? "最后更新：" : "Last Updated: "}{new Date().toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">{t("disclaimer")}</h2>
          <p className="text-base leading-relaxed">
            {locale === "zh"
              ? "本应用提供的测试结果仅供参考，不构成任何医疗、心理或法律建议。测试结果不代表任何官方或专业机构的观点。使用者应自行承担使用本应用的风险。"
              : "The test results provided by this application are for reference only and do not constitute any medical, psychological, or legal advice. Test results do not represent the views of any official or professional organization. Users should bear the risk of using this application themselves."}
          </p>
        </section>
      </div>
    </div>
    </>
  );
}

