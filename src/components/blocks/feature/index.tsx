"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { AgePrivacyModal } from "@/components/ui/ConsentModals";
import { Section as SectionType } from "@/types/blocks/section";
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
  const tHeadings = useTranslations("headings");
  const router = useRouter();
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const [open, setOpen] = React.useState(false);
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
   * 通过确认后跳转到运行页。
   */
  function handleConfirm() {
    setOpen(false);
    router.push(`/${locale}/bdsm-test/run`);
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
      <section 
        id={section.name || "feature"} 
        className="relative min-h-screen w-full overflow-hidden bg-white dark:bg-[#2b333e] transition-colors duration-200"
      >
        {/* 白天模式白色背景，夜晚模式深灰色背景 */}
        <div 
          className="absolute inset-0 bg-white dark:bg-[#2b333e] transition-colors duration-200"
        />

        {/* 背景装饰 - 渐变光晕 */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: resolvedTheme === "dark"
              ? "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(32, 224, 192, 0.08) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 50% 100%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)"
              : "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(32, 224, 192, 0.05) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 50% 100%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)",
          }}
        />

        <div className="relative z-10 container mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4">
          {/* 主标题 - 居中，深色/白色，大字体，适当字间距，向上移动 */}
          <h1 
            ref={titleRef}
            className="text-center text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl mb-6 md:mb-8 drop-shadow-lg tracking-tight sm:tracking-normal -mt-12 sm:-mt-16 md:-mt-20 lg:-mt-24"
          >
            {t("title")}
          </h1>
          
          {/* 标签部分（安全 / 匿名 / 心理倾向测试） */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-6 md:mb-8" role="list">
            {[
              { icon: Shield, key: "feature_1", color: "rgba(32, 224, 192, 0.9)" },
              { icon: EyeOff, key: "feature_2", color: "rgba(139, 92, 246, 0.9)" },
              { icon: Brain, key: "feature_3", color: "rgba(236, 72, 153, 0.9)" }
            ].map(({ icon: Icon, key, color }) => (
              <div 
                key={key}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md transition-all duration-300 hover:scale-110 hover:-translate-y-1 cursor-pointer relative overflow-hidden group"
                style={{
                  background: resolvedTheme === "dark" 
                    ? `linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, ${color.replace('0.9', '0.12')} 100%)`
                    : `linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, ${color.replace('0.9', '0.15')} 100%)`,
                  backdropFilter: 'blur(12px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                  border: `1.5px solid ${color.replace('0.9', '0.3')}`,
                  boxShadow: resolvedTheme === "dark"
                    ? `0 6px 16px rgba(0, 0, 0, 0.3), 0 0 20px ${color.replace('0.9', '0.18')}, inset 0 1px 0 rgba(255, 255, 255, 0.12)`
                    : `0 6px 16px ${color.replace('0.9', '0.15')}, 0 0 24px ${color.replace('0.9', '0.12')}, inset 0 1px 0 rgba(255, 255, 255, 0.9)`
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
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" 
                  style={{ 
                    color: color,
                    filter: `drop-shadow(0 0 3px ${color.replace('0.9', '0.5')})`
                  }} 
                />
                <span 
                  className="text-xs sm:text-sm font-semibold relative z-10 transition-all duration-300 group-hover:tracking-wide"
                  style={{
                    color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.95)" : "rgba(0, 0, 0, 0.8)"
                  }}
                >
                  {t(key)}
                </span>
              </div>
            ))}
          </div>

          {/* 描述文字 - 居中，灰色，适当字间距，增加行间距，与标题区分 */}
          <div className="text-center text-base text-gray-600 dark:text-gray-400 sm:text-lg md:text-xl max-w-2xl mb-8 md:mb-12 tracking-wide sm:tracking-normal space-y-3">
            <h2 className="sr-only">{tHeadings("test_description")}</h2>
            {t("description").split(/[。.]/).filter(line => line.trim()).map((line, index, array) => (
              <p key={index} className="leading-relaxed">
                {line.trim()}{index < array.length - 1 ? (t("description").includes('。') ? '。' : '.') : ''}
              </p>
            ))}
          </div>
          
          {/* 特性标签部分 - 使用 H2 标签 */}
          <h2 className="sr-only">{tHeadings("core_features")}</h2>

          {/* 继续按钮 - 毛玻璃效果优化 */}
          <div className="mt-4 md:mt-6">
            <Button
              className="px-16 md:px-20 lg:px-24 rounded-lg text-lg md:text-xl lg:text-2xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 border-0 text-gray-900 animate-button-glow-subtle relative overflow-hidden"
              style={{
                background: resolvedTheme === "dark"
                  ? "linear-gradient(135deg, rgba(32, 224, 192, 0.95) 0%, rgba(20, 184, 166, 0.95) 100%)"
                  : "linear-gradient(135deg, rgba(32, 224, 192, 0.98) 0%, rgba(20, 184, 166, 0.98) 100%)",
                backdropFilter: 'blur(10px) saturate(180%)',
                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                height: '64px',
                minHeight: '64px',
                boxShadow: resolvedTheme === "dark"
                  ? '0 8px 32px rgba(32, 224, 192, 0.4), 0 4px 16px rgba(32, 224, 192, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  : '0 8px 32px rgba(32, 224, 192, 0.5), 0 4px 16px rgba(32, 224, 192, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              }}
              size="lg"
              onClick={handleStart}
            >
              {t("start_button")}
            </Button>
          </div>
        </div>

        <AgePrivacyModal
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={handleConfirm}
        />
      </section>
    </>
  );
}
