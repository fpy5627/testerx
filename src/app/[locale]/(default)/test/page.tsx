/**
 * 页面：测试入口（介绍/免责声明 + 开始）
 * 作用：展示测试目的、娱乐性质声明，进入前年龄与隐私确认。
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { AgePrivacyModal } from "@/components/ui/ConsentModals";

export default function TestIntroPage() {
  const t = useTranslations("test.intro");
  const router = useRouter();
  const locale = useLocale();
  const [open, setOpen] = React.useState(false);

  /**
   * 打开年龄与隐私确认弹窗。
   */
  function handleStart() {
    setOpen(true);
  }

  /**
   * 通过确认后跳转到运行页。
   */
  function handleConfirm() {
    setOpen(false);
    router.push(`/${locale}/test/run`);
  }

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-white dark:bg-[#2b333e] transition-colors duration-200">
      {/* 白天模式白色背景，夜晚模式深灰色背景 */}
      <div 
        className="absolute inset-0 bg-white dark:bg-[#2b333e] transition-colors duration-200"
      />

      <div className="relative z-10 container mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4">
        {/* 主标题 - 居中，深色/白色，大字体，适当字间距，向上移动 */}
        <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl mb-6 md:mb-8 drop-shadow-lg tracking-tight sm:tracking-normal -mt-12 sm:-mt-16 md:-mt-20 lg:-mt-24">
          {t("title")}
        </h1>
        
        {/* 描述文字 - 居中，灰色，适当字间距，增加行间距，与标题区分 */}
        <div className="text-center text-base text-gray-600 dark:text-gray-400 sm:text-lg md:text-xl max-w-2xl mb-8 md:mb-12 tracking-wide sm:tracking-normal space-y-3">
          {t("description").split(/[。.]/).filter(line => line.trim()).map((line, index, array) => (
            <p key={index} className="leading-relaxed">
              {line.trim()}{index < array.length - 1 ? (t("description").includes('。') ? '。' : '.') : ''}
            </p>
          ))}
        </div>

        {/* 继续按钮 - 简洁优雅的动态效果 */}
        <div className="mt-4 md:mt-6">
          <Button
            className="px-16 md:px-20 lg:px-24 rounded-lg text-lg md:text-xl lg:text-2xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 border-0 text-gray-900 animate-button-glow-subtle"
            style={{
              background: '#20E0C0',
              height: '64px',
              minHeight: '64px',
            }}
            size="lg"
            onClick={handleStart}
          >
            {t("start_button")}
          </Button>
      </div>

      <AgePrivacyModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </div>
    </section>
  );
}


