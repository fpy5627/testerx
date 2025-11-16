"use client";

import React from "react";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import type { TestBankPayload, TestResult } from "@/types/test";
import ExportChart from "@/components/ExportChart";
import ResultText from "@/components/ResultText";
import { getCategoryMetadata } from "@/services/test-bank";

interface ExportImageLayoutProps {
  bank: TestBankPayload;
  result: TestResult;
  isSimplified: boolean;
  chartType?: "radar" | "bar";
  getTopTraits: Array<{ id: string; name: string; score: number }>;
}

/**
 * 精美的导出图片布局组件
 * 包含水印和优化的布局设计
 */
export default function ExportImageLayout({
  bank,
  result,
  isSimplified,
  chartType = "radar",
  getTopTraits,
}: ExportImageLayoutProps) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme || 'light';
  const isDark = theme === "dark";
  const locale = useLocale();
  const t = useTranslations("test.result");

  // 网站URL（可以从环境变量获取）
  const siteUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://bdsm-test.toolina.com';

  // 网站名称（可以从环境变量获取）
  const siteName = typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_PROJECT_NAME || window.location.hostname.replace(/^www\./, ''))
    : 'BDSM Test';

  // 获取类别元数据
  const categoryMetadata = getCategoryMetadata(locale);

  return (
    <div
      id="export-image-layout"
      className="relative w-full p-8"
      style={{
        background: isDark
          ? "#0f172a" // 深色模式：使用纯色背景，更干净
          : "#ffffff", // 浅色模式：使用纯白色背景，更干净
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
        minWidth: '800px', // 确保最小宽度
        width: '100%',
        position: 'relative',
        visibility: 'visible',
        opacity: 1,
        display: 'block',
        paddingTop: '3rem', // 增加顶部间距
        paddingBottom: '3rem',
        marginTop: '0',
        marginBottom: '0',
        overflow: 'hidden', // 隐藏装饰元素的溢出
      }}
    >
      {/* 背景装饰 - 光晕效果（更轻微） */}
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(32, 224, 192, 0.05) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 50% 100%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)"
            : "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(32, 224, 192, 0.03) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 50% 100%, rgba(139, 92, 246, 0.03) 0%, transparent 50%)",
          zIndex: 0,
        }}
      />

      {/* 灰色水印背景 - 30%透明度，不遮盖内容区 */}
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{
          zIndex: 1, // 在背景之上，但在内容区（zIndex: 10）之下
          opacity: 0.3, // 30%透明度
        }}
      >
        {/* 重复的灰色水印图案 */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 150px,
              ${isDark ? 'rgba(128, 128, 128, 0.3)' : 'rgba(128, 128, 128, 0.3)'} 150px,
              ${isDark ? 'rgba(128, 128, 128, 0.3)' : 'rgba(128, 128, 128, 0.3)'} 151px
            ),
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 150px,
              ${isDark ? 'rgba(128, 128, 128, 0.3)' : 'rgba(128, 128, 128, 0.3)'} 150px,
              ${isDark ? 'rgba(128, 128, 128, 0.3)' : 'rgba(128, 128, 128, 0.3)'} 151px
            )`,
          }}
        />
        
        {/* 文字水印 - 重复显示产品名称和URL */}
        {Array.from({ length: 20 }).map((_, i) => {
          const row = Math.floor(i / 5);
          const col = i % 5;
          const top = 10 + row * 20; // 从上到下分布
          const left = 8 + col * 20; // 从左到右分布
          const rotation = (i % 3 - 1) * 12; // 交替旋转角度
          
          return (
            <div
              key={`gray-watermark-${i}`}
              className="absolute"
              style={{
                top: `${top}%`,
                left: `${left}%`,
                transform: `rotate(${rotation}deg)`,
              }}
            >
              <span
                className="text-sm font-medium whitespace-nowrap"
                style={{
                  color: isDark ? 'rgba(128, 128, 128, 0.4)' : 'rgba(128, 128, 128, 0.4)',
                }}
              >
                {i % 2 === 0 ? siteName : siteUrl}
              </span>
            </div>
          );
        })}
      </div>
      {/* 右下角蓝色水印已移除 */}

      {/* 内容区域水印已移除 - 不再在内容区域显示水印 */}

      {/* 主要内容容器 */}
      <div className="max-w-4xl mx-auto space-y-8 relative" style={{ marginTop: '0', paddingTop: '0', zIndex: 10, position: 'relative' }}>
        {/* 标题区域 - 更吸引人的设计 */}
        <div className="text-center mb-10 relative">
          <h1
            className="text-5xl font-extrabold mb-4 relative z-10"
            style={{
              background: "linear-gradient(135deg, #20E0C0 0%, #8B5CF6 50%, #EC4899 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.02em",
            }}
          >
            {t("title")}
          </h1>
          
          {/* 副标题装饰线 */}
          <div className="flex items-center justify-center gap-4 mb-4 relative z-10">
            <div
              className="h-px flex-1 max-w-24"
              style={{
                background: "linear-gradient(90deg, transparent 0%, #20E0C0 50%, transparent 100%)",
              }}
            />
            <p
              className="text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, rgba(32, 224, 192, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)"
                  : "linear-gradient(135deg, rgba(32, 224, 192, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)",
                border: `1px solid ${isDark ? "rgba(32, 224, 192, 0.3)" : "rgba(32, 224, 192, 0.2)"}`,
                color: isDark ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.7)",
                whiteSpace: 'nowrap', // 确保日期不换行
              }}
            >
              {new Date().toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <div
              className="h-px flex-1 max-w-24"
              style={{
                background: "linear-gradient(90deg, transparent 0%, #8B5CF6 50%, transparent 100%)",
              }}
            />
          </div>
        </div>

        {/* 图表区域 - 更立体的设计 */}
        <div
          className="rounded-3xl p-8 relative overflow-hidden"
          style={{
            background: isDark
              ? "rgba(30, 41, 59, 0.98)" // 深色模式：使用更纯的背景色
              : "#ffffff", // 浅色模式：使用纯白色背景
            border: `2px solid ${isDark ? "rgba(139, 92, 246, 0.3)" : "rgba(139, 92, 246, 0.2)"}`,
            boxShadow: isDark
              ? "0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
              : "0 20px 60px rgba(139, 92, 246, 0.15), 0 8px 32px rgba(32, 224, 192, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
          }}
        >
          {/* 卡片内部光晕（更轻微） */}
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-8 pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-2xl opacity-8 pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(32, 224, 192, 0.3) 0%, transparent 70%)",
            }}
          />
          
          <div className="relative z-10">
            <ExportChart bank={bank} result={result} chartType={chartType} />
          </div>
        </div>

        {/* Top 3 Traits - 精简版和完整版都显示 */}
        {getTopTraits.length > 0 && (
          <div
            className="rounded-3xl p-8 relative overflow-hidden"
            style={{
              background: isDark
                ? "rgba(30, 41, 59, 0.98)" // 深色模式：使用更纯的背景色
                : "#ffffff", // 浅色模式：使用纯白色背景
              border: `2px solid ${isDark ? "rgba(236, 72, 153, 0.3)" : "rgba(236, 72, 153, 0.2)"}`,
              boxShadow: isDark
                ? "0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(236, 72, 153, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                : "0 20px 60px rgba(236, 72, 153, 0.15), 0 8px 32px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
            }}
          >
            {/* 卡片内部光晕（更轻微） */}
            <div
              className="absolute top-0 left-0 w-56 h-56 rounded-full blur-3xl opacity-8 pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)",
              }}
            />
            
            <div className="relative z-10">
              <h2
                className="text-2xl font-extrabold mb-8"
                style={{
                  background: "linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow: isDark
                    ? "0 0 30px rgba(236, 72, 153, 0.3)"
                    : "0 0 15px rgba(236, 72, 153, 0.2)",
                }}
              >
                {t("top_traits")}
              </h2>
              <div className="flex flex-wrap gap-4 relative z-10">
                {getTopTraits.map((trait, index) => {
                  // 使用与测试结果页面相同的颜色主题
                  const colorThemes = [
                    { primary: "rgba(32, 224, 192, 0.9)", secondary: "rgba(20, 184, 166, 0.9)", bg: "rgba(32, 224, 192, 0.1)", border: "rgba(32, 224, 192, 0.3)" }, // 青色
                    { primary: "rgba(139, 92, 246, 0.9)", secondary: "rgba(124, 58, 237, 0.9)", bg: "rgba(139, 92, 246, 0.1)", border: "rgba(139, 92, 246, 0.3)" }, // 紫色
                    { primary: "rgba(236, 72, 153, 0.9)", secondary: "rgba(219, 39, 119, 0.9)", bg: "rgba(236, 72, 153, 0.1)", border: "rgba(236, 72, 153, 0.3)" }, // 粉色
                    { primary: "rgba(59, 130, 246, 0.9)", secondary: "rgba(37, 99, 235, 0.9)", bg: "rgba(59, 130, 246, 0.1)", border: "rgba(59, 130, 246, 0.3)" }, // 蓝色
                    { primary: "rgba(251, 146, 60, 0.9)", secondary: "rgba(249, 115, 22, 0.9)", bg: "rgba(251, 146, 60, 0.1)", border: "rgba(251, 146, 60, 0.3)" }, // 橙色
                    { primary: "rgba(34, 197, 94, 0.9)", secondary: "rgba(22, 163, 74, 0.9)", bg: "rgba(34, 197, 94, 0.1)", border: "rgba(34, 197, 94, 0.3)" }, // 绿色
                    { primary: "rgba(168, 85, 247, 0.9)", secondary: "rgba(147, 51, 234, 0.9)", bg: "rgba(168, 85, 247, 0.1)", border: "rgba(168, 85, 247, 0.3)" }, // 紫罗兰
                  ];
                  const theme = colorThemes[index % colorThemes.length];
                  return (
                    <div
                      key={trait.id}
                      className="flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300"
                      style={{
                        background: isDark
                          ? `linear-gradient(135deg, ${theme.bg} 0%, ${theme.bg.replace('0.1', '0.15')} 100%)`
                          : `linear-gradient(135deg, ${theme.bg} 0%, ${theme.bg.replace('0.1', '0.15')} 100%)`,
                        border: `1.5px solid ${theme.border}`,
                        boxShadow: `0 2px 8px ${theme.border.replace('0.3', '0.1')}, 0 1px 4px ${theme.border.replace('0.3', '0.08')}`
                      }}
                    >
                      <span 
                        className="text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0"
                        style={{ 
                          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                          color: 'white',
                          boxShadow: `0 1px 4px ${theme.border.replace('0.3', '0.2')}, inset 0 1px 0 rgba(255, 255, 255, 0.3)`
                        }}
                      >
                        {index + 1}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold" style={{ color: theme.primary }}>
                          {trait.name}
                        </span>
                        <span 
                          className="text-xs font-medium" 
                          style={{ 
                            color: isDark 
                              ? "rgba(255, 255, 255, 0.6)" 
                              : "rgba(0, 0, 0, 0.5)"
                          }}
                        >
                          {trait.score}/100
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* 描述文字 - 在百分比列表下面 */}
              <div className="mt-8 space-y-5">
                {getTopTraits.map((trait, index) => {
                  const categoryMeta = bank.categories?.[trait.id];
                  const metadata = categoryMetadata[trait.id] || categoryMeta;
                  const description = metadata?.description || '';
                  
                  if (!description) return null;
                  
                  const colors = [
                    { primary: "#20E0C0", bg: "rgba(32, 224, 192, 0.15)", border: "rgba(32, 224, 192, 0.4)", glow: "rgba(32, 224, 192, 0.25)" },
                    { primary: "#8B5CF6", bg: "rgba(139, 92, 246, 0.15)", border: "rgba(139, 92, 246, 0.4)", glow: "rgba(139, 92, 246, 0.25)" },
                    { primary: "#EC4899", bg: "rgba(236, 72, 153, 0.15)", border: "rgba(236, 72, 153, 0.4)", glow: "rgba(236, 72, 153, 0.25)" },
                  ];
                  const colorTheme = colors[index % colors.length];
                  
                  return (
                    <div
                      key={trait.id}
                      className="rounded-2xl p-6 relative overflow-hidden"
                      style={{
                        background: isDark
                          ? `linear-gradient(135deg, ${colorTheme.bg} 0%, ${colorTheme.bg.replace('0.15', '0.08')} 50%, ${colorTheme.bg.replace('0.15', '0.05')} 100%)`
                          : `linear-gradient(135deg, ${colorTheme.bg} 0%, ${colorTheme.bg.replace('0.15', '0.12')} 50%, ${colorTheme.bg.replace('0.15', '0.1')} 100%)`,
                        border: `2px solid ${colorTheme.border}`,
                        boxShadow: isDark
                          ? `0 8px 32px ${colorTheme.glow}, 0 4px 16px ${colorTheme.border.replace('0.4', '0.2')}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                          : `0 8px 32px ${colorTheme.glow}, 0 4px 16px ${colorTheme.border.replace('0.4', '0.15')}, inset 0 1px 0 rgba(255, 255, 255, 0.5)`,
                      }}
                    >
                      {/* 背景光晕（更轻微） */}
                      <div
                        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-8 pointer-events-none"
                        style={{
                          background: `radial-gradient(circle, ${colorTheme.primary} 0%, transparent 70%)`,
                        }}
                      />
                      
                      {/* 标题 */}
                      <div className="flex items-center gap-4 mb-4 relative z-10">
                        <h3
                          className="text-xl font-extrabold"
                          style={{
                            background: `linear-gradient(135deg, ${colorTheme.primary} 0%, ${colorTheme.primary}dd 100%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                          }}
                        >
                          {trait.name}
                        </h3>
                        <span
                          className="text-sm font-extrabold px-4 py-1.5 rounded-xl"
                          style={{
                            background: `linear-gradient(135deg, ${colorTheme.bg} 0%, ${colorTheme.bg.replace('0.15', '0.25')} 100%)`,
                            color: colorTheme.primary,
                            border: `1.5px solid ${colorTheme.border}`,
                            boxShadow: `0 2px 8px ${colorTheme.glow}`,
                          }}
                        >
                          {trait.score}%
                        </span>
                      </div>
                      
                      {/* 描述文字 */}
                      <p
                        className="text-sm leading-relaxed relative z-10"
                        style={{
                          color: isDark ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.8)",
                          lineHeight: "1.9",
                          fontSize: "0.95rem",
                        }}
                      >
                        {description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 文本分析 - 完整版显示，精简版显示简要版本 */}
        {!isSimplified && (
          <div
            className="rounded-3xl p-8 relative overflow-hidden"
            style={{
              background: isDark
                ? "rgba(30, 41, 59, 0.98)" // 深色模式：使用更纯的背景色
                : "#ffffff", // 浅色模式：使用纯白色背景
              border: `2px solid ${isDark ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.2)"}`,
              boxShadow: isDark
                ? "0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                : "0 20px 60px rgba(59, 130, 246, 0.15), 0 8px 32px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
            }}
          >
            {/* 卡片内部光晕（更轻微） */}
            <div
              className="absolute top-0 right-0 w-56 h-56 rounded-full blur-3xl opacity-8 pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)",
              }}
            />
            
            <div className="relative z-10">
              <h2
                className="text-2xl font-extrabold mb-6"
                style={{
                  background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow: isDark
                    ? "0 0 30px rgba(59, 130, 246, 0.3)"
                    : "0 0 15px rgba(59, 130, 246, 0.2)",
                }}
              >
                {t("analysis_result")}
              </h2>
              <ResultText result={result} />
            </div>
          </div>
        )}

        {/* 精简版简要说明 */}
        {isSimplified && (
          <div
            className="rounded-3xl p-8 relative overflow-hidden"
            style={{
              background: isDark
                ? "rgba(30, 41, 59, 0.98)" // 深色模式：使用更纯的背景色
                : "#ffffff", // 浅色模式：使用纯白色背景
              border: `2px solid ${isDark ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.2)"}`,
            }}
          >
            <p
              className="text-sm text-center italic font-medium"
              style={{
                color: isDark ? "rgba(255, 255, 255, 0.75)" : "rgba(0, 0, 0, 0.7)",
              }}
            >
              {t("export_simplified_message", { siteUrl })}
            </p>
          </div>
        )}

        {/* 底部装饰 - 更精美的设计 */}
        <div className="text-center pt-8 pb-4 relative z-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div
              className="h-px flex-1 max-w-32"
              style={{
                background: "linear-gradient(90deg, transparent 0%, #20E0C0 50%, transparent 100%)",
              }}
            />
            <div
              className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, rgba(32, 224, 192, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)"
                  : "linear-gradient(135deg, rgba(32, 224, 192, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
                border: `2px solid ${isDark ? "rgba(32, 224, 192, 0.3)" : "rgba(32, 224, 192, 0.25)"}`,
                boxShadow: isDark
                  ? "0 8px 24px rgba(32, 224, 192, 0.2), 0 4px 12px rgba(139, 92, 246, 0.15)"
                  : "0 8px 24px rgba(32, 224, 192, 0.15), 0 4px 12px rgba(139, 92, 246, 0.1)",
              }}
            >
              <span
                className="text-xs font-extrabold"
                style={{
                  background: "linear-gradient(135deg, #20E0C0 0%, #8B5CF6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {t("export_generated_by", { siteName })}
              </span>
            </div>
            <div
              className="h-px flex-1 max-w-32"
              style={{
                background: "linear-gradient(90deg, transparent 0%, #8B5CF6 50%, transparent 100%)",
              }}
            />
          </div>
        </div>

        {/* 软件产品水印 - 底部区域，降低明显度 */}
        <div 
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            zIndex: 100,
            padding: '1.5rem',
            background: isDark
              ? 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.85) 50%, transparent 100%)'
              : 'linear-gradient(to top, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 50%, transparent 100%)',
          }}
        >
          {/* 重复的产品名称水印 - 降低明显度 */}
          <div className="relative w-full h-16 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => {
              const left = 20 + i * 30; // 从左到右分布，间距更大
              const rotation = (i % 2) * 8 - 4; // 减少旋转角度
              
              return (
                <div
                  key={`product-watermark-${i}`}
                  className="absolute"
                  style={{
                    left: `${left}%`,
                    top: '50%',
                    transform: `translateY(-50%) rotate(${rotation}deg)`,
                    opacity: isDark ? 0.08 : 0.06, // 降低透明度
                  }}
                >
                  <span
                    className="text-lg font-extrabold whitespace-nowrap"
                    style={{
                      background: isDark
                        ? "linear-gradient(135deg, rgba(32, 224, 192, 0.4) 0%, rgba(139, 92, 246, 0.4) 100%)"
                        : "linear-gradient(135deg, rgba(32, 224, 192, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      textShadow: isDark
                        ? "0 0 10px rgba(32, 224, 192, 0.15)"
                        : "0 0 8px rgba(32, 224, 192, 0.1)",
                    }}
                  >
                    {siteName}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* 居中的产品名称和URL水印 - 降低明显度 */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center">
            <div
              className="inline-flex flex-col items-center gap-1.5 px-5 py-2.5 rounded-xl backdrop-blur-sm"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, rgba(32, 224, 192, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)"
                  : "linear-gradient(135deg, rgba(32, 224, 192, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
                border: `1.5px solid ${isDark ? "rgba(32, 224, 192, 0.25)" : "rgba(32, 224, 192, 0.2)"}`,
                boxShadow: isDark
                  ? "0 2px 8px rgba(32, 224, 192, 0.15), 0 1px 4px rgba(139, 92, 246, 0.12)"
                  : "0 2px 8px rgba(32, 224, 192, 0.12), 0 1px 4px rgba(139, 92, 246, 0.1)",
                opacity: 0.7, // 降低整体透明度
              }}
            >
              <span
                className="text-sm font-extrabold"
                style={{
                  background: isDark
                    ? "linear-gradient(135deg, rgba(32, 224, 192, 0.7) 0%, rgba(139, 92, 246, 0.7) 100%)"
                    : "linear-gradient(135deg, rgba(32, 224, 192, 0.6) 0%, rgba(139, 92, 246, 0.6) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {siteName}
              </span>
              <span
                className="text-xs font-medium"
                style={{
                  color: isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.45)",
                }}
              >
                {siteUrl}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

