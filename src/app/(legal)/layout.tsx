import "@/app/globals.css";

import { Metadata } from "next";
import React from "react";
import { getTranslations, getLocale, getMessages, setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import ScrollToTop from "@/components/ScrollToTop";
import Footer from "@/components/blocks/footer";
import Header from "@/components/blocks/header";
import { getLandingPage } from "@/services/page";
import { AppContextProvider } from "@/contexts/app";
import { NextAuthSessionProvider } from "@/auth/session";
import { ThemeProvider } from "@/providers/theme";

/**
 * 生成页面的 metadata
 * @returns {Promise<Metadata>} 页面元数据
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: {
      template: `%s | ${t("metadata.title")}`,
      default: t("metadata.title"),
    },
    description: t("metadata.description"),
    keywords: t("metadata.keywords"),
  };
}

/**
 * Legal 页面布局组件
 * 用于显示隐私政策、服务条款等法律页面
 * 包含 Header、Footer 和主要内容区域
 * 
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件内容
 * @returns {Promise<React.ReactElement>} 布局组件
 */
export default async function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  setRequestLocale(locale);
  
  const messages = await getMessages();
  const page = await getLandingPage(locale);

  return (
    <NextIntlClientProvider messages={messages}>
      <NextAuthSessionProvider>
        <AppContextProvider>
          <ThemeProvider>
            {page.header && <Header header={page.header} />}
            <main className="overflow-x-hidden bg-white dark:bg-[#2b333e] min-h-screen transition-colors duration-200">
              <div className="text-md max-w-3xl mx-auto leading-loose pt-4 pb-8 px-8 prose prose-slate dark:prose-invert prose-headings:font-semibold prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-foreground prose-code:text-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md">
                {children}
              </div>
              <ScrollToTop />
            </main>
            {page.footer && <Footer footer={page.footer} />}
          </ThemeProvider>
        </AppContextProvider>
      </NextAuthSessionProvider>
    </NextIntlClientProvider>
  );
}
