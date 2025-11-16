/**
 * 组件：测试介绍区块
 * 作用：在首页展示测试入口，包含介绍和开始按钮。
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { AgePrivacyModal } from "@/components/ui/ConsentModals";

export default function TestIntro() {
  const t = useTranslations("test.intro");
  const router = useRouter();
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const titleRef = React.useRef<HTMLHeadingElement>(null);

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
    router.push(`/${locale}/bdsm-test/run`);
  }

  /**
   * 根据主题动态设置标题颜色
   */
  React.useEffect(() => {
    if (titleRef.current) {
      if (resolvedTheme === "dark") {
        titleRef.current.style.color = "rgba(255, 255, 255, 0.87)";
      } else {
        titleRef.current.style.color = "rgb(17, 24, 39)";
      }
    }
  }, [resolvedTheme]);

  return (
    <>
      <section className="relative min-h-screen w-full overflow-hidden bg-white dark:bg-[#2b333e] transition-colors duration-200">
        {/* 白天模式白色背景，夜晚模式深灰色背景 */}
        <div 
          className="absolute inset-0 bg-white dark:bg-[#2b333e] transition-colors duration-200"
        />

        <div className="relative z-10 container mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4">
          {/* 主标题 - 居中，深色/白色，大字体，适当字间距，向上移动 */}
          <h1 
            ref={titleRef}
            className="text-center text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl mb-6 md:mb-8 drop-shadow-lg tracking-tight sm:tracking-normal -mt-12 sm:-mt-16 md:-mt-20 lg:-mt-24"
          >
            {t("title")}
          </h1>
          
          {/* 描述文字 - 优化可读性和美化 */}
          <div 
            className="text-center text-xl sm:text-2xl md:text-3xl max-w-4xl mb-12 md:mb-16 space-y-6 relative px-4"
          >
            {/* 描述文字背景装饰卡片 */}
            <div 
              className="absolute inset-0 -mx-4 -my-2 rounded-3xl -z-10"
              style={{
                background: resolvedTheme === "dark"
                  ? "linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(32, 224, 192, 0.05) 50%, rgba(139, 92, 246, 0.03) 100%)"
                  : "linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(240, 253, 250, 0.8) 50%, rgba(255, 255, 255, 0.6) 100%)",
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: resolvedTheme === "dark"
                  ? "1px solid rgba(255, 255, 255, 0.08)"
                  : "1px solid rgba(32, 224, 192, 0.15)",
                boxShadow: resolvedTheme === "dark"
                  ? "0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
                  : "0 8px 32px rgba(32, 224, 192, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
              }}
            />
            {t("description").split(/[。.]/).filter(line => line.trim()).map((line, index, array) => (
              <p 
                key={index} 
                className="leading-relaxed transition-all duration-300 relative z-10 py-2"
                style={{
                  color: resolvedTheme === "dark" 
                    ? "rgba(255, 255, 255, 0.95)" 
                    : "rgba(17, 24, 39, 0.95)",
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                  textShadow: resolvedTheme === "dark"
                    ? "0 2px 10px rgba(0, 0, 0, 0.6), 0 1px 4px rgba(0, 0, 0, 0.4), 0 0 2px rgba(255, 255, 255, 0.15)"
                    : "0 1px 4px rgba(255, 255, 255, 0.9), 0 0 2px rgba(0, 0, 0, 0.15)",
                }}
              >
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

