"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { AgePrivacyModal } from "@/components/ui/ConsentModals";
import { Section as SectionType } from "@/types/blocks/section";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Shield, EyeOff, Brain } from "lucide-react";

export default function Feature({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null;
  }

  const t = useTranslations("test.intro");
  const router = useRouter();
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const [testMode, setTestMode] = React.useState("standard");
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const descriptionRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  /**
   * 打开年龄与隐私确认弹窗。
   */
  function handleStart() {
    setOpen(true);
  }

  /**
   * 通过确认后跳转到运行页，并传递测试模式。
   */
  function handleConfirm() {
    setOpen(false);
    // 将测试模式保存到 sessionStorage，以便测试页面读取
    if (typeof window !== "undefined") {
      sessionStorage.setItem("testMode", testMode);
    }
    router.push(`/${locale}/test/run`);
  }

  /**
   * 根据主题动态设置标题、描述和按钮颜色
   */
  React.useEffect(() => {
    if (titleRef.current) {
      if (resolvedTheme === "dark") {
        titleRef.current.style.color = "rgba(255, 255, 255, 0.87)";
      } else {
        titleRef.current.style.color = "rgb(17, 24, 39)";
      }
    }
    if (descriptionRef.current) {
      if (resolvedTheme === "dark") {
        descriptionRef.current.style.color = "rgba(255, 255, 255, 0.6)";
      } else {
        descriptionRef.current.style.color = "rgb(75, 85, 99)";
      }
    }
    if (buttonRef.current) {
      if (resolvedTheme === "dark") {
        buttonRef.current.style.color = "rgba(0, 0, 0, 0.6)";
      } else {
        buttonRef.current.style.color = "rgb(17, 24, 39)";
      }
    }
  }, [resolvedTheme]);

  return (
    <>
      <section id={section.name} className="relative min-h-screen w-full overflow-hidden bg-white dark:bg-[#2b333e] transition-colors duration-200">
        {/* 白天模式白色背景，夜晚模式深灰色背景 */}
        <div 
          className="absolute inset-0 bg-white dark:bg-[#2b333e] transition-colors duration-200"
        />

        <div className="relative z-10 container mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4">
          {/* 主标题 - 居中，深色/白色，大字体，适当字间距，向上移动 */}
          <h1 
            ref={titleRef}
            className="text-center text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl mb-6 md:mb-8 drop-shadow-lg tracking-tight sm:tracking-normal -mt-20 sm:-mt-24 md:-mt-28 lg:-mt-32"
          >
            {t("title")}
          </h1>

          {/* 简介部分（安全 / 匿名 / 心理倾向测试） */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-8 md:mb-10">
            <div className="flex items-center gap-2 text-sm md:text-base">
              <Shield className="w-5 h-5 text-[#20E0C0]" />
              <span className={resolvedTheme === "dark" ? "text-white/87" : "text-gray-700"}>
                {t("feature_1")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm md:text-base">
              <EyeOff className="w-5 h-5 text-[#20E0C0]" />
              <span className={resolvedTheme === "dark" ? "text-white/87" : "text-gray-700"}>
                {t("feature_2")}
              </span>
        </div>
            <div className="flex items-center gap-2 text-sm md:text-base">
              <Brain className="w-5 h-5 text-[#20E0C0]" />
              <span className={resolvedTheme === "dark" ? "text-white/87" : "text-gray-700"}>
                {t("feature_3")}
              </span>
                </div>
            </div>
          
          {/* 描述文字 - 居中，灰色，适当字间距，增加行间距，与标题区分 */}
          <div 
            ref={descriptionRef}
            className="text-center text-base text-gray-600 sm:text-lg md:text-xl max-w-2xl mb-8 md:mb-12 tracking-wide sm:tracking-normal space-y-3"
          >
            {t("description").split(/[。.]/).filter(line => line.trim()).map((line, index, array) => (
              <p key={index} className="leading-relaxed">
                {line.trim()}{index < array.length - 1 ? (t("description").includes('。') ? '。' : '.') : ''}
              </p>
          ))}
        </div>

          {/* 模式选择（快速 / 标准 / 深度） */}
          <div className="w-full max-w-md mb-6 md:mb-8">
            <Label className="text-sm md:text-base mb-3 block text-center" style={{
              color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.87)" : "rgb(75, 85, 99)"
            }}>
              {t("mode_label")}
            </Label>
            <RadioGroup value={testMode} onValueChange={setTestMode} className="flex justify-center gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="quick" id="quick" />
                <Label htmlFor="quick" className="cursor-pointer text-sm md:text-base" style={{
                  color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.87)" : "rgb(75, 85, 99)"
                }}>
                  {t("mode_quick")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="standard" id="standard" />
                <Label htmlFor="standard" className="cursor-pointer text-sm md:text-base" style={{
                  color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.87)" : "rgb(75, 85, 99)"
                }}>
                  {t("mode_standard")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="deep" id="deep" />
                <Label htmlFor="deep" className="cursor-pointer text-sm md:text-base" style={{
                  color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.87)" : "rgb(75, 85, 99)"
                }}>
                  {t("mode_deep")}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 继续按钮 - 青绿色，简洁优雅的动态效果 */}
          <div className="mt-4 md:mt-6">
            <Button
              ref={buttonRef}
              className="px-16 md:px-20 lg:px-24 rounded-lg text-lg md:text-xl lg:text-2xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 border-0 animate-button-glow-subtle"
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
