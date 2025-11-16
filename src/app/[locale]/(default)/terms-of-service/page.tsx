/**
 * 页面：服务条款
 * 作用：展示服务条款内容，支持多语言
 */

"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Markdown from "@/components/markdown";

/**
 * 服务条款页面组件
 * 从翻译文件中获取内容并渲染为 Markdown
 * 
 * @returns {React.ReactElement} 服务条款页面
 */
export default function TermsOfServicePage() {
  const t = useTranslations("terms_of_service");

  return (
    <div className="container mx-auto max-w-3xl px-8 py-8">
      <div className="space-y-8">
        <h1 className="text-4xl font-bold">{t("title")}</h1>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("introduction.title")}</h2>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <Markdown content={t("introduction.content")} />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("use_of_service.title")}</h2>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <Markdown content={t("use_of_service.content")} />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("user_accounts.title")}</h2>
          <ol className="list-decimal list-inside space-y-3">
            <li>
              <strong>{t("user_accounts.account_creation.label")}</strong>: {t("user_accounts.account_creation.text")}
            </li>
            <li>
              <strong>{t("user_accounts.account_security.label")}</strong>: {t("user_accounts.account_security.text")}
            </li>
            <li>
              <strong>{t("user_accounts.user_responsibilities.label")}</strong>: {t("user_accounts.user_responsibilities.text")}
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("intellectual_property.title")}</h2>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <Markdown content={t("intellectual_property.content")} />
          </div>
          <ul className="list-disc list-inside space-y-2">
            {t.raw("intellectual_property.items").map((item: string, index: number) => (
              <li key={index}>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <Markdown content={item} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("prohibited_activities.title")}</h2>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <Markdown content={t("prohibited_activities.content")} />
          </div>
          <ul className="list-disc list-inside space-y-2">
            {t.raw("prohibited_activities.items").map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("privacy_data.title")}</h2>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <Markdown content={t("privacy_data.content")} />
          </div>
          <ul className="list-disc list-inside space-y-2">
            {t.raw("privacy_data.items").map((item: string, index: number) => (
              <li key={index}>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <Markdown content={item} />
                </div>
              </li>
            ))}
          </ul>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <Markdown content={t("privacy_data.privacy_policy_link")} />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("pricing_payments.title")}</h2>
          <ul className="list-disc list-inside space-y-2">
            {t.raw("pricing_payments.items").map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("termination.title")}</h2>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <Markdown content={t("termination.content")} />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("disclaimer.title")}</h2>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <Markdown content={t("disclaimer.content")} />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("limitation_liability.title")}</h2>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <Markdown content={t("limitation_liability.content")} />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("indemnification.title")}</h2>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <Markdown content={t("indemnification.content")} />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("governing_law.title")}</h2>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <Markdown content={t("governing_law.content")} />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("changes_to_terms.title")}</h2>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <Markdown content={t("changes_to_terms.content")} />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t("contact.title")}</h2>
          <p>
            {t("contact.content")}{" "}
            <a 
              href={`mailto:${t("contact.email")}`}
              className="text-primary hover:underline"
            >
              {t("contact.email")}
            </a>
          </p>
          <p>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <Markdown content={t("contact.consent")} />
            </div>
          </p>
        </section>
      </div>
    </div>
  );
}

