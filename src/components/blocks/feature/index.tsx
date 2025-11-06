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
  // 安全检查：如果 section 不存在或已禁用，返回错误提示
  if (!section) {
    console.error("Feature component: section is missing");
    return (
      <div className="container mx-auto py-10">
        <p className="text-center text-muted-foreground">Section data is missing</p>
      </div>
    );
  }

  if (section.disabled) {
    console.warn("Feature component: section is disabled", section);
    return (
      <div className="container mx-auto py-10">
        <p className="text-center text-muted-foreground">This section is currently disabled</p>
      </div>
    );
  }

  const t = useTranslations("test.intro");
  const router = useRouter();
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const [testMode, setTestMode] = React.useState("quick");
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
   * 添加动画样式
   */
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const styleId = 'feature-animations';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -30px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

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
      <section 
        id={section.name || "feature"} 
        className="relative min-h-screen w-full overflow-hidden transition-colors duration-200 bg-white dark:bg-[#2b333e]"
        style={{
          backgroundColor: resolvedTheme === "dark" ? "#2b333e" : "#ffffff"
        }}
      >
        {/* 背景 - 多层渐变和装饰 */}
        <div 
          className="absolute inset-0 transition-colors duration-200"
          style={{
            background: resolvedTheme === "dark" 
              ? "radial-gradient(ellipse at top, #3a4550 0%, #2b333e 50%, #1f2630 100%)" 
              : "linear-gradient(180deg, #ffffff 0%, #f0f4f8 100%)"
          }}
        />
        
        {/* 动态背景光效 - 仅在深色模式下显示，更柔和 */}
        {resolvedTheme === "dark" && (
          <>
            <div 
              className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-8"
              style={{
                background: "radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)",
                animation: "float 12s ease-in-out infinite"
              }}
            />
            <div 
              className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-8"
              style={{
                background: "radial-gradient(circle, rgba(32, 224, 192, 0.25) 0%, transparent 70%)",
                animation: "float 15s ease-in-out infinite reverse"
              }}
            />
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-3xl opacity-6"
              style={{
                background: "radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)",
                animation: "float 18s ease-in-out infinite"
              }}
            />
          </>
        )}
        
        {/* 浅色模式下的微妙渐变 */}
        {resolvedTheme !== "dark" && (
          <>
            <div 
              className="absolute inset-0 transition-opacity duration-200"
              style={{
                background: "radial-gradient(ellipse at top left, rgba(32, 224, 192, 0.06) 0%, transparent 50%)",
                opacity: 1
              }}
            />
            <div 
              className="absolute inset-0 transition-opacity duration-200"
              style={{
                background: "radial-gradient(ellipse at bottom right, rgba(139, 92, 246, 0.04) 0%, transparent 50%)",
                opacity: 1
              }}
            />
          </>
        )}
        
        {/* 装饰性网格图案 - 极低透明度 */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-200"
          style={{
            backgroundImage: `linear-gradient(to right, ${resolvedTheme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"} 1px, transparent 1px), linear-gradient(to bottom, ${resolvedTheme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"} 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
            opacity: 1
          }}
        />

        <div className="relative z-10 container mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-8 sm:py-10 md:py-12 min-h-screen">
          {/* 主内容卡片 - 增强玻璃态效果 */}
          <div className="w-full max-w-3xl relative min-h-[500px] sm:min-h-[550px] md:min-h-[600px]">
            {/* 卡片背景 - 精致的玻璃态效果 */}
            <div 
              className="absolute inset-0 rounded-3xl md:rounded-[2rem] -z-10 backdrop-blur-xl transition-all duration-300"
              style={{
                background: resolvedTheme === "dark"
                  ? "linear-gradient(135deg, rgba(43, 51, 62, 0.92) 0%, rgba(35, 42, 52, 0.92) 100%)"
                  : "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)",
                border: `1px solid ${resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.12)" : "rgba(32, 224, 192, 0.25)"}`,
                boxShadow: resolvedTheme === "dark"
                  ? "0 25px 70px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                  : "0 25px 70px rgba(32, 224, 192, 0.18), 0 10px 40px rgba(32, 224, 192, 0.12), 0 0 0 1px rgba(32, 224, 192, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.8)"
              }}
            />
            
            {/* 精致的光晕效果 */}
            <div 
              className="absolute inset-0 rounded-3xl md:rounded-[2rem] -z-10 opacity-25 blur-3xl"
              style={{
                background: resolvedTheme === "dark"
                  ? "radial-gradient(circle at 50% 50%, rgba(32, 224, 192, 0.12) 0%, transparent 70%)"
                  : "radial-gradient(circle at 50% 50%, rgba(32, 224, 192, 0.18) 0%, transparent 70%)"
              }}
            />
            
            {/* 边框光效 */}
            <div 
              className="absolute inset-0 rounded-3xl md:rounded-[2rem] -z-10 opacity-30"
              style={{
                background: resolvedTheme === "dark"
                  ? "linear-gradient(135deg, rgba(32, 224, 192, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)"
                  : "linear-gradient(135deg, rgba(32, 224, 192, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
                padding: "1px",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor"
              }}
            />
            
            {/* 内容区域 */}
            <div className="relative z-10 p-6 sm:p-8 md:p-10 pt-8 sm:pt-10 md:pt-12 pb-6 sm:pb-8 md:pb-10">
              {/* 主标题 - 精致美观 */}
              <h1 
                ref={titleRef}
                className="text-center text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-9 md:mb-10 tracking-tight sm:tracking-normal relative"
                style={{
                  background: resolvedTheme === "dark"
                    ? "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(32, 224, 192, 0.85) 50%, rgba(139, 92, 246, 0.85) 100%)"
                    : "linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(32, 224, 192, 0.75) 50%, rgba(139, 92, 246, 0.65) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 2px 8px rgba(32, 224, 192, 0.2))"
                }}
              >
                {t("title")}
                {/* 标题装饰线 - 精致 */}
                <div 
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-0.5 rounded-full opacity-70"
                  style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(32, 224, 192, 0.7) 50%, rgba(139, 92, 246, 0.7) 50%, transparent 100%)"
                  }}
                />
              </h1>

              {/* 简介部分（安全 / 匿名 / 心理倾向测试）- 增强视觉效果 */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-9 md:mb-10">
                {[
                  { icon: Shield, key: "feature_1", color: "rgba(32, 224, 192, 0.9)" },
                  { icon: EyeOff, key: "feature_2", color: "rgba(139, 92, 246, 0.9)" },
                  { icon: Brain, key: "feature_3", color: "rgba(236, 72, 153, 0.9)" }
                ].map(({ icon: Icon, key, color }, index) => (
                  <div 
                    key={key}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 cursor-pointer relative overflow-hidden group"
                    style={{
                      background: resolvedTheme === "dark" 
                        ? `linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, ${color.replace('0.9', '0.12')} 100%)`
                        : `linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, ${color.replace('0.9', '0.18')} 100%)`,
                      border: `1.5px solid ${resolvedTheme === "dark" ? color.replace('0.9', '0.3') : color.replace('0.9', '0.3')}`,
                      boxShadow: resolvedTheme === "dark"
                        ? `0 4px 12px rgba(0, 0, 0, 0.25), 0 0 16px ${color.replace('0.9', '0.15')}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                        : `0 4px 12px ${color.replace('0.9', '0.18')}, 0 0 20px ${color.replace('0.9', '0.12')}, inset 0 1px 0 rgba(255, 255, 255, 0.9)`
                    }}
                  >
                    {/* 悬停光效 */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(circle at center, ${color.replace('0.9', '0.2')} 0%, transparent 70%)`
                      }}
                    />
                    <Icon 
                      className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" 
                      style={{ 
                        color: color,
                        filter: `drop-shadow(0 0 4px ${color.replace('0.9', '0.5')})`
                      }} 
                    />
                    <span 
                      className="text-xs sm:text-sm md:text-base font-semibold relative z-10 transition-all duration-300 group-hover:tracking-wide"
                      style={{
                        color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.95)" : "rgba(0, 0, 0, 0.8)"
                      }}
                    >
                      {t(key)}
                    </span>
                  </div>
                ))}
              </div>
          
              {/* 描述文字 - 精致美观 */}
              <div 
                ref={descriptionRef}
                className="text-center text-sm sm:text-base max-w-2xl mx-auto mb-8 sm:mb-9 md:mb-10 tracking-wide sm:tracking-normal space-y-2.5 sm:space-y-3 relative"
                style={{
                  color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.8)"
                }}
              >
                {/* 装饰性引号 - 精致 */}
                <div 
                  className="absolute -top-1 -left-1 text-3xl sm:text-4xl opacity-15 font-serif"
                  style={{
                    color: resolvedTheme === "dark" ? "rgba(32, 224, 192, 0.4)" : "rgba(32, 224, 192, 0.25)"
                  }}
                >
                  "
                </div>
                {t("description").split(/[。.]/).filter(line => line.trim()).map((line, index, array) => (
                  <p 
                    key={index} 
                    className="leading-loose relative z-10"
                    style={{
                      textShadow: resolvedTheme === "dark" 
                        ? "0 1px 2px rgba(0, 0, 0, 0.2)" 
                        : "0 1px 2px rgba(255, 255, 255, 0.8)"
                    }}
                  >
                    {line.trim()}{index < array.length - 1 ? (t("description").includes('。') ? '。' : '.') : ''}
                  </p>
                ))}
                <div 
                  className="absolute -bottom-1 -right-1 text-3xl sm:text-4xl opacity-15 font-serif"
                  style={{
                    color: resolvedTheme === "dark" ? "rgba(139, 92, 246, 0.4)" : "rgba(139, 92, 246, 0.25)"
                  }}
                >
                  "
                </div>
              </div>

              {/* 模式选择（快速 / 标准 / 深度）- 增强视觉效果 */}
              <div className="w-full max-w-md mx-auto mb-8 sm:mb-9 md:mb-10">
                <Label 
                  className="text-xs sm:text-sm md:text-base mb-3 sm:mb-4 block text-center font-semibold relative" 
                  style={{
                    color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.95)" : "rgba(0, 0, 0, 0.8)"
                  }}
                >
                  <span className="relative z-10">{t("mode_label")}</span>
                  {/* 标签下划线装饰 */}
                  <div 
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 rounded-full opacity-50"
                    style={{
                      background: "linear-gradient(90deg, transparent 0%, rgba(32, 224, 192, 0.6) 50%, transparent 100%)"
                    }}
                  />
                </Label>
                <div 
                  className="p-4 sm:p-5 rounded-2xl transition-all duration-300 relative overflow-hidden group"
                  style={{
                    background: resolvedTheme === "dark" 
                      ? "linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.04) 100%)" 
                      : "linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(248, 250, 252, 0.85) 100%)",
                    border: `1.5px solid ${resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.12)" : "rgba(32, 224, 192, 0.25)"}`,
                    boxShadow: resolvedTheme === "dark"
                      ? "0 4px 12px rgba(0, 0, 0, 0.25), 0 0 20px rgba(32, 224, 192, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
                      : "0 4px 12px rgba(32, 224, 192, 0.15), 0 0 24px rgba(32, 224, 192, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)"
                  }}
                >
                  {/* 背景光效 */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: "radial-gradient(circle at center, rgba(32, 224, 192, 0.08) 0%, transparent 70%)"
                    }}
                  />
                  <RadioGroup value={testMode} onValueChange={setTestMode} className="flex justify-center gap-4 sm:gap-5 relative z-10">
                    {["quick", "standard", "deep"].map((mode, index) => {
                      const colors = [
                        "rgba(32, 224, 192, 0.9)",
                        "rgba(139, 92, 246, 0.9)",
                        "rgba(236, 72, 153, 0.9)"
                      ];
                      const color = colors[index];
                      return (
                        <div 
                          key={mode} 
                          className="flex items-center space-x-2 sm:space-x-2.5 relative group/item"
                        >
                          {/* 选中时的背景光效 */}
                          {testMode === mode && (
                            <div 
                              className="absolute -inset-1.5 rounded-full opacity-20 blur-sm"
                              style={{
                                background: `radial-gradient(circle, ${color} 0%, transparent 70%)`
                              }}
                            />
                          )}
                          <RadioGroupItem 
                            value={mode} 
                            id={mode}
                            className="border-2 w-4 h-4 sm:w-5 sm:h-5 relative z-10 transition-all duration-300 group-hover/item:scale-110"
                            style={{
                              borderColor: testMode === mode ? color : "rgba(32, 224, 192, 0.5)",
                              backgroundColor: testMode === mode ? color : "transparent",
                              boxShadow: testMode === mode 
                                ? `0 0 10px ${color.replace('0.9', '0.5')}, 0 0 20px ${color.replace('0.9', '0.25')}`
                                : "none"
                            }}
                          />
                          <Label 
                            htmlFor={mode} 
                            className="cursor-pointer text-xs sm:text-sm md:text-base font-semibold transition-all duration-300 relative z-10 group-hover/item:tracking-wide"
                            style={{
                              color: resolvedTheme === "dark" 
                                ? (testMode === mode ? color : "rgba(255, 255, 255, 0.7)")
                                : (testMode === mode ? color : "rgba(0, 0, 0, 0.65)"),
                              textShadow: testMode === mode 
                                ? `0 0 6px ${color.replace('0.9', '0.3')}`
                                : "none"
                            }}
                          >
                            {t(`mode_${mode}`)}
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>
              </div>

              {/* 继续按钮 - 精致美观 */}
              <div className="mt-6 sm:mt-7 md:mt-8 text-center relative">
                {/* 按钮外发光效果 */}
                <div 
                  className="absolute inset-0 blur-xl opacity-40"
                  style={{
                    background: "linear-gradient(135deg, rgba(32, 224, 192, 0.5) 0%, rgba(139, 92, 246, 0.5) 100%)",
                    transform: "scale(1.1)"
                  }}
                />
                <Button
                  ref={buttonRef}
                  className="px-12 sm:px-16 md:px-20 lg:px-24 rounded-xl text-base sm:text-lg md:text-xl lg:text-2xl font-bold transition-all duration-300 hover:scale-105 active:scale-100 border-0 relative overflow-hidden group"
                  style={{
                    background: "linear-gradient(135deg, rgba(32, 224, 192, 1) 0%, rgba(139, 92, 246, 0.95) 50%, rgba(236, 72, 153, 0.9) 100%)",
                    color: 'white',
                    height: '56px',
                    minHeight: '56px',
                    boxShadow: "0 8px 32px rgba(32, 224, 192, 0.5), 0 0 40px rgba(32, 224, 192, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.15)"
                  }}
                  size="lg"
                  onClick={handleStart}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {t("start_button")}
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 transition-transform duration-300 group-hover:translate-x-2 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 0 3px rgba(255, 255, 255, 0.5))" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  {/* 按钮内部光效 */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: "radial-gradient(circle at center, rgba(255, 255, 255, 0.3) 0%, transparent 70%)"
                    }}
                  />
                  {/* 按钮流光效果 */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100%)",
                      transform: "translateX(-100%)",
                      animation: "shimmer 2s ease-in-out infinite"
                    }}
                  />
                </Button>
              </div>
            </div>
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
