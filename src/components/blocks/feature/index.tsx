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
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.02); opacity: 0.95; }
        }
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes gradientFlowHorizontal {
          0% { background-position: 0% 0%; }
          25% { background-position: 100% 0%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
          100% { background-position: 0% 0%; }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; transform: scale(1.15); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }
        @keyframes floatButton {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 32px rgba(32, 224, 192, 0.6), 0 4px 16px rgba(139, 92, 246, 0.5), 0 0 40px rgba(32, 224, 192, 0.3); }
          50% { transform: scale(1.03); box-shadow: 0 12px 48px rgba(32, 224, 192, 0.8), 0 6px 24px rgba(139, 92, 246, 0.7), 0 0 60px rgba(32, 224, 192, 0.5); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes rotateGlow {
          0% { transform: rotate(0deg) scale(1.2); }
          100% { transform: rotate(360deg) scale(1.2); }
        }
        @keyframes wave {
          0%, 100% { transform: translateX(0) scaleY(1); }
          50% { transform: translateX(10px) scaleY(1.1); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-20deg); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(200%) skewX(-20deg); opacity: 0; }
        }
        @keyframes buttonPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes buttonGlow {
          0%, 100% { box-shadow: 0 10px 40px rgba(32, 224, 192, 0.5), 0 5px 20px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 0 30px rgba(32, 224, 192, 0.3); }
          50% { box-shadow: 0 15px 50px rgba(32, 224, 192, 0.7), 0 8px 30px rgba(139, 92, 246, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 50px rgba(32, 224, 192, 0.5); }
        }
        @keyframes buttonGlowLight {
          0%, 100% { box-shadow: 0 10px 40px rgba(32, 224, 192, 0.6), 0 5px 20px rgba(139, 92, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 0 30px rgba(32, 224, 192, 0.4); }
          50% { box-shadow: 0 15px 50px rgba(32, 224, 192, 0.8), 0 8px 30px rgba(139, 92, 246, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 0 50px rgba(32, 224, 192, 0.6); }
        }
        @keyframes arrowBounce {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(3px); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.5) translate(0, 0); }
          50% { opacity: 1; transform: scale(1) translate(5px, -5px); }
        }
        @keyframes gentlePulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  /**
   * 根据主题动态设置标题、描述和按钮颜色
   * 确保标题渐变效果正确应用
   */
  React.useEffect(() => {
    if (titleRef.current) {
      // 确保渐变文字效果正确应用
      titleRef.current.style.WebkitTextFillColor = "transparent";
      titleRef.current.style.color = "transparent";
      titleRef.current.style.background = resolvedTheme === "dark"
        ? "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(32, 224, 192, 0.85) 50%, rgba(139, 92, 246, 0.85) 100%)"
        : "linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(32, 224, 192, 0.75) 50%, rgba(139, 92, 246, 0.65) 100%)";
      titleRef.current.style.WebkitBackgroundClip = "text";
      titleRef.current.style.backgroundClip = "text";
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
          <div className="w-full max-w-3xl relative min-h-[520px] sm:min-h-[580px] md:min-h-[640px]">
            {/* 卡片背景 - 精致的玻璃态效果 */}
            <div 
              className="absolute inset-0 rounded-3xl md:rounded-[2rem] -z-10 backdrop-blur-xl transition-all duration-300"
              style={{
                background: resolvedTheme === "dark"
                  ? "linear-gradient(135deg, rgba(43, 51, 62, 0.95) 0%, rgba(35, 42, 52, 0.95) 100%)"
                  : "linear-gradient(135deg, rgba(255, 255, 255, 0.99) 0%, rgba(250, 252, 255, 0.99) 100%)",
                border: `1.5px solid ${resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.15)" : "rgba(32, 224, 192, 0.3)"}`,
                boxShadow: resolvedTheme === "dark"
                  ? "0 30px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 60px rgba(32, 224, 192, 0.08)"
                  : "0 30px 80px rgba(32, 224, 192, 0.2), 0 15px 50px rgba(32, 224, 192, 0.15), 0 0 0 1px rgba(32, 224, 192, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 0 60px rgba(139, 92, 246, 0.1)"
              }}
            />
            
            {/* 精致的光晕效果 - 多层渐变 */}
            <div 
              className="absolute inset-0 rounded-3xl md:rounded-[2rem] -z-10 opacity-30 blur-3xl"
              style={{
                background: resolvedTheme === "dark"
                  ? "radial-gradient(ellipse at top left, rgba(32, 224, 192, 0.15) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(139, 92, 246, 0.12) 0%, transparent 60%)"
                  : "radial-gradient(ellipse at top left, rgba(32, 224, 192, 0.2) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(139, 92, 246, 0.15) 0%, transparent 60%)"
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
            <div className="relative z-10 p-6 sm:p-8 md:p-10 pt-10 sm:pt-12 md:pt-14 pb-8 sm:pb-10 md:pb-12">
              {/* 主标题 - 精致美观 */}
              <h1 
                ref={titleRef}
                className="text-center text-2xl sm:text-3xl md:text-4xl font-bold mb-7 sm:mb-8 md:mb-9 tracking-tight sm:tracking-normal relative"
                style={{
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
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-7 sm:mb-8 md:mb-9">
                {[
                  { icon: Shield, key: "feature_1", color: "rgba(32, 224, 192, 0.9)" },
                  { icon: EyeOff, key: "feature_2", color: "rgba(139, 92, 246, 0.9)" },
                  { icon: Brain, key: "feature_3", color: "rgba(236, 72, 153, 0.9)" }
                ].map(({ icon: Icon, key, color }, index) => (
                  <div 
                    key={key}
                    className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md transition-all duration-300 hover:scale-110 hover:-translate-y-1 cursor-pointer relative overflow-hidden group"
                    style={{
                      background: resolvedTheme === "dark" 
                        ? `linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, ${color.replace('0.9', '0.15')} 100%)`
                        : `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, ${color.replace('0.9', '0.2')} 100%)`,
                      border: `1.5px solid ${resolvedTheme === "dark" ? color.replace('0.9', '0.35') : color.replace('0.9', '0.35')}`,
                      boxShadow: resolvedTheme === "dark"
                        ? `0 6px 16px rgba(0, 0, 0, 0.3), 0 0 20px ${color.replace('0.9', '0.18')}, inset 0 1px 0 rgba(255, 255, 255, 0.12)`
                        : `0 6px 16px ${color.replace('0.9', '0.2')}, 0 0 24px ${color.replace('0.9', '0.15')}, inset 0 1px 0 rgba(255, 255, 255, 0.95)`
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
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" 
                      style={{ 
                        color: color,
                        filter: `drop-shadow(0 0 3px ${color.replace('0.9', '0.5')})`
                      }} 
                    />
                    <span 
                      className="text-[10px] sm:text-xs font-semibold relative z-10 transition-all duration-300 group-hover:tracking-wide"
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
                className="text-center text-sm sm:text-base max-w-2xl mx-auto mb-8 sm:mb-9 md:mb-10 tracking-wide sm:tracking-normal space-y-2 sm:space-y-2.5 relative"
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
                    className="leading-relaxed relative z-10"
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

              {/* 模式选择（快速 / 标准 / 深度）- 精致美观 */}
              <div className="w-full max-w-md mx-auto mb-6 sm:mb-7 md:mb-8">
                <Label 
                  className="text-sm sm:text-base md:text-lg mb-5 sm:mb-6 block text-center font-semibold relative" 
                  style={{
                    color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.95)" : "rgba(0, 0, 0, 0.85)"
                  }}
                >
                  <span className="relative z-10">{t("mode_label")}</span>
                  {/* 标签下划线装饰 */}
                  <div 
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-0.5 rounded-full opacity-70"
                    style={{
                      background: "linear-gradient(90deg, transparent 0%, rgba(32, 224, 192, 0.8) 50%, rgba(139, 92, 246, 0.8) 50%, transparent 100%)"
                    }}
                  />
                </Label>
                <div 
                  className="p-6 sm:p-7 md:p-8 rounded-2xl transition-all duration-300 relative overflow-hidden group"
                  style={{
                    background: resolvedTheme === "dark" 
                      ? "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.06) 100%)" 
                      : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)",
                    border: `1.5px solid ${resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.18)" : "rgba(32, 224, 192, 0.35)"}`,
                    boxShadow: resolvedTheme === "dark"
                      ? "0 8px 24px rgba(0, 0, 0, 0.35), 0 0 30px rgba(32, 224, 192, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                      : "0 8px 24px rgba(32, 224, 192, 0.2), 0 0 32px rgba(32, 224, 192, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.98)"
                  }}
                >
                  {/* 背景光效 */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: "radial-gradient(ellipse at center, rgba(32, 224, 192, 0.1) 0%, rgba(139, 92, 246, 0.08) 50%, transparent 75%)"
                    }}
                  />
                  <RadioGroup value={testMode} onValueChange={setTestMode} className="flex justify-center items-center gap-5 sm:gap-6 md:gap-7 relative z-10">
                    {["quick", "standard", "deep"].map((mode, index) => {
                      const colors = [
                        { 
                          primary: "rgba(32, 224, 192, 1)", 
                          secondary: "rgba(20, 184, 166, 0.95)", 
                          border: "rgba(32, 224, 192, 0.7)",
                          glow: "rgba(32, 224, 192, 0.5)"
                        },
                        { 
                          primary: "rgba(139, 92, 246, 1)", 
                          secondary: "rgba(124, 58, 237, 0.95)", 
                          border: "rgba(139, 92, 246, 0.7)",
                          glow: "rgba(139, 92, 246, 0.5)"
                        },
                        { 
                          primary: "rgba(236, 72, 153, 1)", 
                          secondary: "rgba(219, 39, 119, 0.95)", 
                          border: "rgba(236, 72, 153, 0.7)",
                          glow: "rgba(236, 72, 153, 0.5)"
                        }
                      ];
                      const colorTheme = colors[index];
                      const isSelected = testMode === mode;
                      return (
                        <div 
                          key={mode} 
                          className="flex items-center space-x-2.5 sm:space-x-3 relative group/item"
                        >
                          {/* 悬停时的背景光效 */}
                          {!isSelected && (
                            <div 
                              className="absolute -inset-1.5 rounded-full opacity-0 group-hover/item:opacity-15 blur-sm transition-opacity duration-300"
                              style={{
                                background: `radial-gradient(circle, ${colorTheme.primary} 0%, transparent 70%)`
                              }}
                            />
                          )}
                          <RadioGroupItem 
                            value={mode} 
                            id={mode}
                            className="border-2 w-6 h-6 sm:w-7 sm:h-7 relative z-10 transition-all duration-300 group-hover/item:scale-110 rounded-full overflow-hidden"
                            style={{
                              borderColor: isSelected ? colorTheme.border : "rgba(32, 224, 192, 0.35)",
                              backgroundColor: isSelected 
                                ? `linear-gradient(135deg, ${colorTheme.primary} 0%, ${colorTheme.secondary} 100%)`
                                : "transparent",
                              boxShadow: isSelected 
                                ? `inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 12px ${colorTheme.glow}`
                                : "0 0 0 1px rgba(32, 224, 192, 0.2)"
                            }}
                          >
                            {/* 选中时的内部圆点 */}
                            {isSelected && (
                              <>
                                {/* 外层光效 */}
                                <div 
                                  className="absolute inset-0 rounded-full"
                                  style={{
                                    background: `radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 60%)`
                                  }}
                                />
                                {/* 内层圆点 */}
                                <div 
                                  className="absolute inset-0 rounded-full flex items-center justify-center"
                                >
                                  <div 
                                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full relative"
                                    style={{
                                      background: resolvedTheme === "dark" 
                                        ? "rgba(255, 255, 255, 0.95)"
                                        : "rgba(255, 255, 255, 1)",
                                      boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.8)`
                                    }}
                                  >
                                    {/* 圆点内部光效 */}
                                    <div 
                                      className="absolute inset-0 rounded-full"
                                      style={{
                                        background: `radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%)`
                                      }}
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                            {/* 未选中时的内部指示 */}
                            {!isSelected && (
                              <div 
                                className="absolute inset-0 rounded-full opacity-0 group-hover/item:opacity-30 transition-opacity duration-300"
                                style={{
                                  background: `radial-gradient(circle, ${colorTheme.primary.replace('1', '0.2')} 0%, transparent 70%)`
                                }}
                              />
                            )}
                          </RadioGroupItem>
                          <Label 
                            htmlFor={mode} 
                            className="cursor-pointer text-sm sm:text-base md:text-lg font-semibold transition-all duration-300 relative z-10 group-hover/item:tracking-wide"
                            style={{
                              color: resolvedTheme === "dark" 
                                ? (isSelected ? colorTheme.primary : "rgba(255, 255, 255, 0.6)")
                                : (isSelected ? colorTheme.primary : "rgba(0, 0, 0, 0.55)"),
                              textShadow: isSelected 
                                ? `0 0 8px ${colorTheme.glow}`
                                : "none",
                              filter: "none"
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

              {/* 继续按钮 - 精致美观，动态效果 */}
              <div className="mt-6 sm:mt-7 md:mt-8 text-center relative">
                {/* 按钮外发光效果 - 多层动态 */}
                <div 
                  className="absolute inset-0 blur-3xl opacity-50"
                  style={{
                    background: resolvedTheme === "dark"
                      ? "linear-gradient(135deg, rgba(32, 224, 192, 0.5) 0%, rgba(139, 92, 246, 0.5) 100%)"
                      : "linear-gradient(135deg, rgba(32, 224, 192, 0.4) 0%, rgba(139, 92, 246, 0.4) 100%)",
                    transform: "scale(1.2)",
                    animation: "glowPulse 3s ease-in-out infinite"
                  }}
                />
                <Button
                  ref={buttonRef}
                  className="px-14 sm:px-18 md:px-24 lg:px-28 py-6 sm:py-7 md:py-8 lg:py-9 rounded-2xl text-lg sm:text-xl md:text-2xl lg:text-2xl font-bold transition-all duration-300 hover:scale-105 active:scale-100 border-0 relative overflow-hidden group"
                  style={{
                    background: resolvedTheme === "dark"
                      ? "linear-gradient(135deg, rgba(32, 224, 192, 0.98) 0%, rgba(20, 184, 166, 0.95) 50%, rgba(139, 92, 246, 0.98) 100%)"
                      : "linear-gradient(135deg, rgba(32, 224, 192, 1) 0%, rgba(20, 184, 166, 0.98) 50%, rgba(139, 92, 246, 1) 100%)",
                    backgroundSize: "200% 200%",
                    color: 'white',
                    boxShadow: resolvedTheme === "dark"
                      ? '0 10px 40px rgba(32, 224, 192, 0.5), 0 5px 20px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 0 30px rgba(32, 224, 192, 0.3)'
                      : '0 10px 40px rgba(32, 224, 192, 0.6), 0 5px 20px rgba(139, 92, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 0 30px rgba(32, 224, 192, 0.4)',
                    animation: "gradientFlow 5s ease infinite"
                  }}
                  size="lg"
                  onClick={handleStart}
                >
                  {/* 顶部高光效果 - 动态 */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-1/2 opacity-25 group-hover:opacity-40 transition-opacity duration-300"
                    style={{
                      background: "linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, transparent 100%)",
                      animation: "pulse 2s ease-in-out infinite"
                    }}
                  />
                  
                  {/* 悬停时的高光扫过效果 - 持续流动 */}
                  <div 
                    className="absolute inset-0 opacity-30 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)",
                      transform: "translateX(-100%)",
                      animation: "shimmer 2s ease-in-out infinite"
                    }}
                  />
                  
                  {/* 内部光效 - 动态 */}
                  <div 
                    className="absolute inset-0 opacity-15 group-hover:opacity-25 transition-opacity duration-300"
                    style={{
                      background: "radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.5) 0%, transparent 60%)",
                      animation: "pulse 3s ease-in-out infinite"
                    }}
                  />
                  
                  {/* 底部光效 - 动态 */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-1/3 opacity-10 group-hover:opacity-20 transition-opacity duration-300"
                    style={{
                      background: "linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.2) 100%)",
                      animation: "pulse 2.5s ease-in-out infinite"
                    }}
                  />
                  
                  <span className="relative z-10 flex items-center justify-center">
                    {t("start_button")}
                  </span>
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
