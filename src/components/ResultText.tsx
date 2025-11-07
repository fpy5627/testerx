"use client";

import React from "react";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { generateResultText } from "@/utils/resultText";
import type { TestResult } from "@/types/test";
import { 
  Crown, Handshake, RefreshCw, Zap, Gem, 
  Flower2, Search, Sparkles, Star, Theater,
  Heart, Sparkles as Sparkles2, Waves, Flame,
  Moon, Sun, Target, Rainbow, Lightbulb
} from "lucide-react";

interface ResultTextProps {
  result: TestResult;
}

/**
 * 结果文本分析组件
 * 显示测试结果的文本分析，包含美化样式和装饰元素
 */
export default function ResultText({ result }: ResultTextProps) {
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme || 'light';
  
  // 始终根据当前语言重新生成文本，确保语言切换时文本也会更新
  const text = generateResultText(
      result.normalized || {},
      result.orientation_spectrum,
      locale
    );
  
  // 分割文本为段落，并识别"请记住"部分
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  const rememberIndex = paragraphs.findIndex(p => p.includes('请记住') || p.includes('Remember'));
  const mainContent = rememberIndex >= 0 ? paragraphs.slice(0, rememberIndex) : paragraphs;
  const rememberText = rememberIndex >= 0 ? paragraphs[rememberIndex] : null;
  
  return (
    <div 
      className="relative p-6 rounded-2xl overflow-hidden"
      style={{
        background: theme === "dark"
          ? "linear-gradient(135deg, rgba(43, 51, 62, 0.95) 0%, rgba(35, 42, 52, 0.95) 100%)"
          : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)",
        border: theme === "dark"
          ? "1px solid rgba(255, 255, 255, 0.1)"
          : "1px solid rgba(0, 0, 0, 0.08)",
        boxShadow: theme === "dark"
          ? "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(139, 92, 246, 0.1)"
          : "0 8px 32px rgba(139, 92, 246, 0.15), 0 4px 16px rgba(139, 92, 246, 0.1)"
      }}
    >
      {/* 装饰性背景光晕 */}
      <div 
        className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 -z-0"
        style={{
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)"
        }}
      />
      
      {/* 装饰性流动线条 */}
      <svg 
        className="absolute top-4 left-4 w-32 h-32 opacity-5 -z-0"
        viewBox="0 0 100 100"
        style={{
          fill: "none",
          stroke: theme === "dark" ? "rgba(139, 92, 246, 0.3)" : "rgba(139, 92, 246, 0.2)",
          strokeWidth: "1.5"
        }}
      >
        <path d="M0,50 Q25,30 50,50 T100,50" />
        <path d="M0,60 Q25,40 50,60 T100,60" />
        <path d="M0,70 Q25,50 50,70 T100,70" />
      </svg>

      {/* 主要内容 */}
      <div className="relative z-10 space-y-6">
        {(() => {
          // 图标池 - 使用lucide-react的SVG图标，确保每段话都有不同的图标
          const iconPool: Array<{component: React.ComponentType<any>, color: string, gradient: string}> = [
            { component: Crown, color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }, // 主导/权力 - 金色
            { component: Handshake, color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }, // 顺从/信任 - 蓝色
            { component: RefreshCw, color: '#10B981', gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }, // 转换/流动 - 绿色
            { component: Zap, color: '#F97316', gradient: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' }, // 施虐/权威 - 橙色
            { component: Gem, color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }, // 受虐/脆弱 - 紫色
            { component: Flower2, color: '#EC4899', gradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)' }, // 传统/简单 - 粉色
            { component: Search, color: '#06B6D4', gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)' }, // 探索/好奇 - 青色
            { component: Sparkles, color: '#A855F7', gradient: 'linear-gradient(135deg, #A855F7 0%, #9333EA 100%)' }, // 性取向/吸引 - 紫罗兰
            { component: Star, color: '#FBBF24', gradient: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)' }, // 平衡/和谐 - 黄色
            { component: Theater, color: '#6366F1', gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' }, // 角色/表演 - 靛蓝
            { component: Heart, color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }, // 情感/连接 - 红色
            { component: Sparkles2, color: '#14B8A6', gradient: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)' }, // 神秘/深度 - 青绿
            { component: Waves, color: '#0EA5E9', gradient: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)' }, // 流动/变化 - 天蓝
            { component: Flame, color: '#F43F5E', gradient: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)' }, // 激情/强度 - 玫瑰红
            { component: Moon, color: '#64748B', gradient: 'linear-gradient(135deg, #64748B 0%, #475569 100%)' }, // 温柔/夜晚 - 灰色
            { component: Sun, color: '#FCD34D', gradient: 'linear-gradient(135deg, #FCD34D 0%, #FBBF24 100%)' }, // 光明/积极 - 亮黄
            { component: Target, color: '#22C55E', gradient: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)' }, // 目标/专注 - 绿色
            { component: Rainbow, color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F59E0B 100%)' }, // 多样性/包容 - 彩虹
          ];

          // 为每个段落分配图标的映射表
          const iconMap: Record<number, {component: React.ComponentType<any>, color: string, gradient: string}> = {};
          const usedIcons = new Set<number>();

          // 根据段落内容智能匹配图标，确保每段话都有不同的图标
          const getParagraphIcon = (text: string, idx: number): {component: React.ComponentType<any>, color: string, gradient: string} => {
            const lowerText = text.toLowerCase();
            
            // 定义关键词到图标的映射（按优先级排序）
            const keywordMap: Array<{keywords: string[], iconIndex: number}> = [
              { keywords: ['主导', 'dominance', '控制', 'control', '引导', 'guide', '决策', 'decision'], iconIndex: 0 },
              { keywords: ['顺从', 'submission', '屈服', 'yield', '交出', 'surrender', '放手', 'let go'], iconIndex: 1 },
              { keywords: ['转换', 'switch', '流动', 'fluid', '适应', 'adapt', '角色', 'role'], iconIndex: 2 },
              { keywords: ['施虐', 'sadistic', '权威', 'authority', '权力', 'power', '边界', 'boundary'], iconIndex: 3 },
              { keywords: ['受虐', 'masochistic', '脆弱', 'vulnerability', '信任', 'trust', '深度', 'depth'], iconIndex: 4 },
              { keywords: ['传统', 'vanilla', '简单', 'simple', '真实', 'authentic', '温柔', 'tender'], iconIndex: 5 },
              { keywords: ['探索', 'exploration', '好奇', 'curiosity', '开放', 'open', '发现', 'discover'], iconIndex: 6 },
              { keywords: ['性取向', 'orientation', '吸引', 'attraction', '同性', 'same-gender', '异性', 'opposite-gender', '双性', 'bisexual'], iconIndex: 7 },
              { keywords: ['平衡', 'balance', '和谐', 'harmony', '平等', 'equal'], iconIndex: 8 },
              { keywords: ['情感', 'emotional', '连接', 'connection', '纽带', 'bond'], iconIndex: 10 },
              { keywords: ['流动', 'flow', '变化', 'change', '动态', 'dynamic'], iconIndex: 12 },
              { keywords: ['激情', 'passion', '强度', 'intensity', '满足', 'satisfaction'], iconIndex: 13 },
            ];

            // 查找匹配的关键词
            for (const { keywords, iconIndex } of keywordMap) {
              if (keywords.some(keyword => lowerText.includes(keyword))) {
                // 如果这个图标还没被使用，直接使用它
                if (!usedIcons.has(iconIndex)) {
                  usedIcons.add(iconIndex);
                  return iconPool[iconIndex];
                }
                // 如果图标已被使用，从图标池中选择一个未使用的
                for (let i = 0; i < iconPool.length; i++) {
                  if (!usedIcons.has(i)) {
                    usedIcons.add(i);
                    return iconPool[i];
                  }
                }
              }
            }
            
            // 如果没有匹配到关键词，从图标池中选择一个未使用的图标
            for (let i = 0; i < iconPool.length; i++) {
              if (!usedIcons.has(i)) {
                usedIcons.add(i);
                return iconPool[i];
              }
            }
            
            // 如果所有图标都用完了，根据索引循环使用
            return iconPool[idx % iconPool.length];
          };

          // 为所有段落预分配图标
          mainContent.forEach((paragraph, index) => {
            iconMap[index] = getParagraphIcon(paragraph, index);
          });

          // 渲染段落
          return mainContent.map((paragraph, index) => {
            const iconConfig = iconMap[index];
            const IconComponent = iconConfig.component;

            return (
              <div key={index} className="flex gap-4 items-start">
                {/* 装饰性图标 - 使用SVG图标 */}
                <div 
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden group transition-all duration-300 hover:scale-110"
                  style={{
                    background: theme === "dark"
                      ? `linear-gradient(135deg, ${iconConfig.color}20 0%, ${iconConfig.color}10 100%)`
                      : `linear-gradient(135deg, ${iconConfig.color}15 0%, ${iconConfig.color}08 100%)`,
                    border: theme === "dark"
                      ? `1.5px solid ${iconConfig.color}40`
                      : `1.5px solid ${iconConfig.color}30`,
                    boxShadow: theme === "dark"
                      ? `0 4px 16px ${iconConfig.color}20, inset 0 1px 0 ${iconConfig.color}30`
                      : `0 4px 16px ${iconConfig.color}15, inset 0 1px 0 ${iconConfig.color}20`
                  }}
                >
                  {/* 渐变背景光晕 */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle, ${iconConfig.color}30 0%, transparent 70%)`
                    }}
                  />
                  <IconComponent 
                    size={20} 
                    className="relative z-10 transition-all duration-300"
                    style={{
                      color: iconConfig.color,
                      filter: theme === "dark" 
                        ? `drop-shadow(0 2px 4px ${iconConfig.color}40)`
                        : `drop-shadow(0 2px 4px ${iconConfig.color}30)`
                    }}
                  />
                </div>
                
                {/* 段落内容 */}
                <div className="flex-1">
                  <p
                    className="text-base leading-relaxed"
                    style={{
                      color: theme === "dark" 
                        ? "rgba(255, 255, 255, 0.85)" 
                        : "rgba(0, 0, 0, 0.8)",
                      lineHeight: "1.9"
                    }}
                  >
                    {paragraph.trim()}
                  </p>
                </div>
              </div>
            );
          });
        })()}
      </div>

      {/* "请记住"部分 - 特殊样式 */}
      {rememberText && (
        <div 
          className="relative z-10 mt-8 pt-6 border-t"
          style={{
            borderColor: theme === "dark" 
              ? "rgba(255, 255, 255, 0.1)" 
              : "rgba(0, 0, 0, 0.1)"
          }}
        >
          <div className="flex gap-4 items-start">
            {/* 装饰性图标 - 使用SVG图标 */}
            <div 
              className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden group transition-all duration-300 hover:scale-110"
              style={{
                background: theme === "dark"
                  ? "linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0.1) 100%)"
                  : "linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.08) 100%)",
                border: theme === "dark"
                  ? "1.5px solid rgba(251, 191, 36, 0.4)"
                  : "1.5px solid rgba(251, 191, 36, 0.3)",
                boxShadow: theme === "dark"
                  ? "0 4px 16px rgba(251, 191, 36, 0.2), inset 0 1px 0 rgba(251, 191, 36, 0.3)"
                  : "0 4px 16px rgba(251, 191, 36, 0.15), inset 0 1px 0 rgba(251, 191, 36, 0.2)"
              }}
            >
              {/* 渐变背景光晕 */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: "radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)"
                }}
              />
              <Lightbulb 
                size={20} 
                className="relative z-10 transition-all duration-300"
                style={{
                  color: "#FBBF24",
                  filter: theme === "dark" 
                    ? "drop-shadow(0 2px 4px rgba(251, 191, 36, 0.4))"
                    : "drop-shadow(0 2px 4px rgba(251, 191, 36, 0.3))"
                }}
              />
            </div>
            
            {/* 提示文本 */}
            <div className="flex-1">
              <p
                className="text-sm leading-relaxed italic"
                style={{
                  color: theme === "dark" 
                    ? "rgba(255, 255, 255, 0.7)" 
                    : "rgba(0, 0, 0, 0.7)",
                  lineHeight: "1.9"
                }}
              >
                {rememberText.trim()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
