/**
 * 页面：隐私政策
 * 作用：展示隐私政策内容，说明数据存储和处理方式。
 */

"use client";

import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { Shield, Lock, Database, FileCheck, Users, Mail, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  const t = useTranslations("privacy");
  const locale = useLocale();
  const { resolvedTheme } = useTheme();

  // 根据语言环境格式化日期
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const sections = [
    {
      icon: Database,
      title: t("sections.data_storage.title"),
      content: t("sections.data_storage.content"),
      color: "rgba(34, 197, 94, 0.9)",
    },
    {
      icon: Users,
      title: t("sections.anonymous_testing.title"),
      content: t("sections.anonymous_testing.content"),
      color: "rgba(59, 130, 246, 0.9)",
    },
    {
      icon: Lock,
      title: t("sections.data_security.title"),
      content: t("sections.data_security.content"),
      color: "rgba(168, 85, 247, 0.9)",
    },
    {
      icon: FileCheck,
      title: t("sections.gdpr_compliance.title"),
      content: t("sections.gdpr_compliance.content"),
      color: "rgba(236, 72, 153, 0.9)",
      list: [
        {
          label: t("sections.gdpr_compliance.list.data_minimization.label"),
          text: t("sections.gdpr_compliance.list.data_minimization.text"),
        },
        {
          label: t("sections.gdpr_compliance.list.data_subject_rights.label"),
          text: t("sections.gdpr_compliance.list.data_subject_rights.text"),
        },
        {
          label: t("sections.gdpr_compliance.list.data_portability.label"),
          text: t("sections.gdpr_compliance.list.data_portability.text"),
        },
        {
          label: t("sections.gdpr_compliance.list.right_to_erasure.label"),
          text: t("sections.gdpr_compliance.list.right_to_erasure.text"),
        },
        {
          label: t("sections.gdpr_compliance.list.data_protection.label"),
          text: t("sections.gdpr_compliance.list.data_protection.text"),
        },
        {
          label: t("sections.gdpr_compliance.list.anonymity.label"),
          text: t("sections.gdpr_compliance.list.anonymity.text"),
        },
      ],
      extra: [
        {
          label: t("sections.gdpr_compliance.extra.how_to_clear.label"),
          text: t("sections.gdpr_compliance.extra.how_to_clear.text"),
        },
        {
          label: t("sections.gdpr_compliance.extra.how_to_export.label"),
          text: t("sections.gdpr_compliance.extra.how_to_export.text"),
        },
      ],
    },
    {
      icon: Shield,
      title: t("sections.third_party_services.title"),
      content: t("sections.third_party_services.content"),
      color: "rgba(251, 146, 60, 0.9)",
    },
    {
      icon: Mail,
      title: t("sections.contact_us.title"),
      content: t("sections.contact_us.content"),
      color: "rgba(34, 197, 94, 0.9)",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 dark:from-[#2b333e] dark:via-[#2b333e] dark:to-[#1a1f2e]">
      {/* 背景装饰 */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{
          background: resolvedTheme === "dark"
            ? "radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)"
            : "radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)",
        }}
      />

      <div className="container mx-auto px-4 py-8 sm:py-12 relative z-10">
        {/* 标题区域 */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
              {t("title")}
            </h1>
          </div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <p className="text-sm sm:text-base">
              {t("last_updated")}：{formatDate(new Date())}
            </p>
          </div>
        </div>

        {/* 主要内容卡片 */}
        <div className="max-w-4xl mx-auto space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const isContactUs = section.title === t("sections.contact_us.title");
            return (
              <Card
                key={index}
                className="backdrop-blur-xl border-2 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
                style={{
                  background: resolvedTheme === "dark"
                    ? "rgba(43, 51, 62, 0.8)"
                    : "rgba(255, 255, 255, 0.9)",
                  borderColor: resolvedTheme === "dark"
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.1)",
                }}
              >
                <CardHeader>
                  <h2 className="flex items-center gap-3 text-xl sm:text-2xl font-semibold leading-none">
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-lg"
                      style={{
                        background: `linear-gradient(135deg, ${section.color}20 0%, ${section.color}10 100%)`,
                        border: `1.5px solid ${section.color}40`,
                      }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{
                          color: section.color,
                        }}
                      />
                    </div>
                    <span>{section.title}</span>
                  </h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                    {section.content}
                  </p>
                  
                  {/* 联系我们部分添加邮箱信息 */}
                  {isContactUs && (
                    <div className="mt-4 p-4 rounded-lg border" style={{
                      background: resolvedTheme === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.03)",
                      borderColor: resolvedTheme === "dark"
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.1)",
                    }}>
                      <p className="mb-2">
                        <strong className="text-foreground">{t("sections.contact_us.copyright_owner") || "版权所有者"}</strong>:{" "}
                        <span className="text-muted-foreground">{t("sections.contact_us.copyright_owner_link") || "BDSM Test Toolina"}</span>
                      </p>
                      <p>
                        <strong className="text-foreground">{t("sections.contact_us.email") || "电子邮件"}</strong>:{" "}
                        <a 
                          href={`mailto:${t("sections.contact_us.email_address") || "service@toolina.com"}`}
                          className="text-primary hover:underline transition-all duration-300"
                          style={{
                            color: resolvedTheme === "dark"
                              ? "rgba(139, 92, 246, 0.95)"
                              : "rgba(139, 92, 246, 0.9)",
                          }}
                        >
                          {t("sections.contact_us.email_address") || "service@toolina.com"}
                        </a>
                      </p>
                    </div>
                  )}
                  
                  {section.list && (
                    <ul className="space-y-3 mt-4">
                      {section.list.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-lg"
                          style={{
                            background: resolvedTheme === "dark"
                              ? "rgba(255, 255, 255, 0.03)"
                              : "rgba(0, 0, 0, 0.02)",
                          }}
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                            style={{
                              background: section.color,
                            }}
                          />
                          <div>
                            <h3 className="inline font-semibold text-foreground">{item.label}</h3>
                            <span className="text-muted-foreground">：{item.text}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {section.extra && (
                    <div className="space-y-3 mt-4">
                      {section.extra.map((item, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-lg border"
                          style={{
                            background: resolvedTheme === "dark"
                              ? "rgba(255, 255, 255, 0.05)"
                              : "rgba(0, 0, 0, 0.03)",
                            borderColor: resolvedTheme === "dark"
                              ? "rgba(255, 255, 255, 0.1)"
                              : "rgba(0, 0, 0, 0.1)",
                          }}
                        >
                          <h3 className="inline font-semibold text-foreground">{item.label}：</h3>
                          <span className="text-muted-foreground">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

