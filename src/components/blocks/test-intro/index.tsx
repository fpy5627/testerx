/**
 * 组件：测试介绍区块
 * 作用：在首页展示测试入口，包含介绍和开始按钮。
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { AgePrivacyModal } from "@/components/ui/ConsentModals";

export default function TestIntro() {
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
    <>
      <section className="relative min-h-screen w-full overflow-hidden bg-gray-950">
        {/* 黑灰色背景，向边缘渐变为黑色 */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center left, rgba(42, 42, 42, 0.6) 0%, rgba(26, 26, 26, 0.8) 25%, rgba(17, 17, 17, 0.95) 60%, rgba(10, 10, 10, 1) 100%)'
          }}
        />
        
        {/* 中心左侧柔和光效 - 浅蓝/紫色光晕 */}
        <div 
          className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full blur-3xl opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(147, 197, 253, 0.25) 0%, rgba(167, 139, 250, 0.2) 40%, transparent 70%)',
          }}
        />

        <div className="relative z-10 container mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4">
          {/* 主标题 - 居中，白色，大字体，适当字间距，向上移动 */}
          <h1 className="text-center text-3xl font-bold text-white sm:text-4xl md:text-5xl lg:text-6xl mb-6 md:mb-8 drop-shadow-lg tracking-tight sm:tracking-normal -mt-12 sm:-mt-16 md:-mt-20 lg:-mt-24">
            {t("title")}
          </h1>

          {/* 描述文字 - 居中，灰色，适当字间距，增加行间距，与标题区分 */}
          <div className="text-center text-base text-gray-400 sm:text-lg md:text-xl max-w-2xl mb-8 md:mb-12 tracking-wide sm:tracking-normal space-y-3">
            {t("description").split(/[。.]/).filter(line => line.trim()).map((line, index, array) => (
              <p key={index} className="leading-relaxed">
                {line.trim()}{index < array.length - 1 ? (t("description").includes('。') ? '。' : '.') : ''}
              </p>
            ))}
          </div>

          {/* 继续按钮 - 从深色到浅色的渐变，增大尺寸，增加宽度 */}
          <div className="mt-4 md:mt-6">
            <Button
              className="px-16 md:px-20 lg:px-24 rounded-lg text-lg md:text-xl lg:text-2xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl border-0 text-gray-900"
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
        </div>
      </section>

      <AgePrivacyModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}

