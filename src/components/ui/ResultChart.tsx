/**
 * 组件：结果图表（雷达图/条形图，基于 Recharts）
 * 作用：以可视化形式展示各维度分数，支持动态切换雷达图和柱状图。
 * 依赖已在项目中（recharts）。
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import type { TestBankPayload, TestResult } from "@/types/test";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

// 添加 CSS 动画样式
if (typeof document !== 'undefined') {
  const styleId = 'result-chart-shimmer-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `;
    document.head.appendChild(style);
  }
}

interface ResultChartProps {
  bank: TestBankPayload;
  result: TestResult;
  variant?: "radar" | "bar"; // 默认显示类型，但可以通过切换按钮改变
}

/**
 * 构建图表数据集（基于category结构）。
 * @param bank 题库
 * @param result 结果
 * @returns { labels: string[], data: number[], categories: string[], categoryData: Array<{category: string, name: string, score: number, description?: string}> }
 */
function buildDataset(bank: TestBankPayload, result: TestResult) {
  // 从categories或result.scores中获取所有category
  const categories = new Set<string>();
  
  // 从题库中获取所有category（添加空值检查）
  if (bank?.questions && Array.isArray(bank.questions)) {
    for (const q of bank.questions) {
      if (q?.category) {
        categories.add(q.category);
      }
    }
  }
  
  // 过滤掉Orientation（单独展示）
  const chartCategories = Array.from(categories).filter(cat => cat !== "Orientation");
  
  // 构建标签和数据
  const labels: string[] = [];
  const data: number[] = [];
  const categoryData: Array<{category: string, name: string, score: number, description?: string}> = [];
  
  for (const cat of chartCategories) {
    const categoryMeta = bank.categories?.[cat];
    const name = categoryMeta?.name || cat;
    const score = result.normalized?.[cat] ?? 0;
    labels.push(name);
    data.push(score);
    categoryData.push({
      category: cat,
      name,
      score,
      description: categoryMeta?.description,
    });
  }
  
  return { labels, data, categories: chartCategories, categoryData };
}

/**
 * 结果图表组件
 * 支持动态切换雷达图和柱状图两种展示方式
 * @param bank 题库数据
 * @param result 测试结果
 * @param variant 默认显示类型（可选，可通过按钮切换）
 */
export function ResultChart({ bank, result, variant: initialVariant = "radar" }: ResultChartProps) {
  const t = useTranslations("test.result");
  const { resolvedTheme } = useTheme();
  // 确保主题值始终有效，避免切换时出现 undefined
  const theme = resolvedTheme || 'light';
  const [chartType, setChartType] = useState<"radar" | "bar">(initialVariant);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  
  const { labels, data, categoryData } = React.useMemo(() => {
    if (!bank || !result) {
      return { labels: [], data: [], categoryData: [] };
    }
    return buildDataset(bank, result);
  }, [bank, result]);

  // 确保数据顺序一致：左侧列表和雷达图使用相同的数据源和顺序
  const dataset = labels.map((name, i) => ({ name, score: data[i] }));


  // 获取当前选中的维度数据
  const selectedCategory = categoryData[selectedIndex] || categoryData[0];

  // 获取选中维度的颜色（用于右侧解释面板）
  const getSelectedDimensionColor = React.useCallback((categoryName: string, index: number) => {
    const colorPalette = [
      { name: "Exploration", color: resolvedTheme === "dark" ? "rgba(59, 130, 246, 0.9)" : "rgba(59, 130, 246, 1)" },
      { name: "Submission", color: resolvedTheme === "dark" ? "rgba(34, 197, 94, 0.9)" : "rgba(34, 197, 94, 1)" },
      { name: "Dominance", color: resolvedTheme === "dark" ? "rgba(168, 85, 247, 0.9)" : "rgba(168, 85, 247, 1)" },
      { name: "Sadistic", color: resolvedTheme === "dark" ? "rgba(239, 68, 68, 0.9)" : "rgba(239, 68, 68, 1)" },
      { name: "Masochistic", color: resolvedTheme === "dark" ? "rgba(236, 72, 153, 0.9)" : "rgba(236, 72, 153, 1)" },
      { name: "Vanilla", color: resolvedTheme === "dark" ? "rgba(251, 191, 36, 0.9)" : "rgba(251, 191, 36, 1)" },
      { name: "Switch", color: resolvedTheme === "dark" ? "rgba(20, 184, 166, 0.9)" : "rgba(20, 184, 166, 1)" },
      { name: "Bondage", color: resolvedTheme === "dark" ? "rgba(139, 92, 246, 0.9)" : "rgba(139, 92, 246, 1)" },
      { name: "Voyeur", color: resolvedTheme === "dark" ? "rgba(249, 115, 22, 0.9)" : "rgba(249, 115, 22, 1)" },
      { name: "Exhibitionist", color: resolvedTheme === "dark" ? "rgba(236, 72, 153, 0.9)" : "rgba(236, 72, 153, 1)" },
    ];
    
    const matchedColor = colorPalette.find(c => 
      categoryName.toLowerCase().includes(c.name.toLowerCase()) ||
      c.name.toLowerCase().includes(categoryName.toLowerCase())
    );
    
    if (matchedColor) {
      return matchedColor.color;
    }
    
    const fallbackColors = [
      "rgba(59, 130, 246, 1)", "rgba(34, 197, 94, 1)", "rgba(168, 85, 247, 1)",
      "rgba(239, 68, 68, 1)", "rgba(236, 72, 153, 1)", "rgba(251, 191, 36, 1)",
      "rgba(20, 184, 166, 1)", "rgba(139, 92, 246, 1)", "rgba(249, 115, 22, 1)",
      "rgba(14, 165, 233, 1)",
    ];
    
    const color = fallbackColors[index % fallbackColors.length];
    return resolvedTheme === "dark" ? color.replace("1)", "0.9)") : color;
  }, [resolvedTheme]);

  const selectedColor = selectedCategory 
    ? getSelectedDimensionColor(selectedCategory.name, selectedIndex)
    : "rgba(139, 92, 246, 1)";

  // 如果数据为空，显示提示信息
  if (!labels.length || !data.length) {
    return (
      <div className="w-full flex flex-col items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4">
        <p className="text-muted-foreground">暂无数据</p>
      </div>
    );
  }
  
  return (
    <div className="w-full flex flex-col space-y-6 sm:space-y-8">
      {/* 切换按钮 - 美化版 */}
      <div className="flex space-x-4 sm:space-x-5 relative justify-center">
        {/* 背景装饰 - 增强版 */}
        <div 
          className="absolute inset-0 rounded-2xl blur-2xl opacity-40 -z-0"
          style={{
            background: resolvedTheme === "dark"
              ? "linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(236, 72, 153, 0.4) 100%)"
              : "linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(236, 72, 153, 0.25) 100%)"
          }}
        />
        
        <button
          onClick={() => setChartType("radar")}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden group ${
            chartType === "radar"
              ? "text-white shadow-lg scale-105"
              : "text-gray-600 dark:text-gray-300 hover:scale-105"
          }`}
          style={chartType === "radar" ? {
            background: resolvedTheme === "dark"
              ? "linear-gradient(135deg, rgba(139, 92, 246, 0.98) 0%, rgba(124, 58, 237, 0.98) 100%)"
              : "linear-gradient(135deg, rgba(139, 92, 246, 1) 0%, rgba(124, 58, 237, 1) 100%)",
            boxShadow: resolvedTheme === "dark"
              ? "0 8px 24px rgba(139, 92, 246, 0.5), 0 4px 12px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
              : "0 8px 24px rgba(139, 92, 246, 0.4), 0 4px 12px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
            border: "none"
          } : {
            background: resolvedTheme === "dark"
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.03)",
            border: resolvedTheme === "dark"
              ? "1.5px solid rgba(139, 92, 246, 0.3)"
              : "1.5px solid rgba(139, 92, 246, 0.25)"
          }}
        >
          {/* 选中状态的高光效果 */}
          {chartType === "radar" && (
            <>
              <div 
                className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-300"
                style={{
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%)"
                }}
              />
              <div 
                className="absolute top-0 left-0 right-0 h-1/2 opacity-20"
                style={{
                  background: "linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%)"
                }}
              />
            </>
          )}
          <span className="relative z-10">{t("chart_radar")}</span>
        </button>
        
        <button
          onClick={() => setChartType("bar")}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden group ${
            chartType === "bar"
              ? "text-white shadow-lg scale-105"
              : "text-gray-600 dark:text-gray-300 hover:scale-105"
          }`}
          style={chartType === "bar" ? {
            background: resolvedTheme === "dark"
              ? "linear-gradient(135deg, rgba(236, 72, 153, 0.98) 0%, rgba(219, 39, 119, 0.98) 100%)"
              : "linear-gradient(135deg, rgba(236, 72, 153, 1) 0%, rgba(219, 39, 119, 1) 100%)",
            boxShadow: resolvedTheme === "dark"
              ? "0 8px 24px rgba(236, 72, 153, 0.5), 0 4px 12px rgba(236, 72, 153, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
              : "0 8px 24px rgba(236, 72, 153, 0.4), 0 4px 12px rgba(236, 72, 153, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
            border: "none"
          } : {
            background: resolvedTheme === "dark"
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.03)",
            border: resolvedTheme === "dark"
              ? "1.5px solid rgba(236, 72, 153, 0.3)"
              : "1.5px solid rgba(236, 72, 153, 0.25)"
          }}
        >
          {/* 选中状态的高光效果 */}
          {chartType === "bar" && (
            <>
              <div 
                className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-300"
                style={{
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%)"
                }}
              />
              <div 
                className="absolute top-0 left-0 right-0 h-1/2 opacity-20"
                style={{
                  background: "linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%)"
                }}
              />
            </>
          )}
          <span className="relative z-10">{t("chart_bar")}</span>
        </button>
      </div>

      {/* 主要内容区域：左侧图表 + 中间维度列表 + 右侧解释 */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左侧：雷达图 */}
        <div className="flex-1">
          <div 
            className="w-full h-96 p-6 sm:p-8 rounded-2xl relative overflow-hidden"
            style={{
              background: resolvedTheme === "dark"
                ? "linear-gradient(135deg, rgba(43, 51, 62, 0.5) 0%, rgba(35, 42, 52, 0.5) 100%)"
                : "linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(248, 250, 252, 0.7) 100%)",
              border: resolvedTheme === "dark"
                ? "1.5px solid rgba(139, 92, 246, 0.2)"
                : "1.5px solid rgba(139, 92, 246, 0.15)",
              boxShadow: resolvedTheme === "dark"
                ? "inset 0 2px 12px rgba(0, 0, 0, 0.25), 0 8px 32px rgba(139, 92, 246, 0.15), 0 4px 16px rgba(139, 92, 246, 0.1)"
                : "inset 0 2px 12px rgba(255, 255, 255, 0.9), 0 8px 32px rgba(139, 92, 246, 0.12), 0 4px 16px rgba(139, 92, 246, 0.08)"
            }}
          >
            {/* 装饰性背景光晕 - 增强版 */}
            <div 
              className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-15 -z-0"
              style={{
                background: chartType === "radar"
                  ? "radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, rgba(139, 92, 246, 0.2) 50%, transparent 70%)"
                  : "radial-gradient(circle, rgba(236, 72, 153, 0.5) 0%, rgba(236, 72, 153, 0.2) 50%, transparent 70%)"
              }}
            />
            <div 
              className="absolute bottom-0 left-0 w-56 h-56 rounded-full blur-2xl opacity-15 -z-0"
              style={{
                background: chartType === "radar"
                  ? "radial-gradient(circle, rgba(32, 224, 192, 0.4) 0%, rgba(32, 224, 192, 0.15) 50%, transparent 70%)"
                  : "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.15) 50%, transparent 70%)"
              }}
            />
            {/* 额外的装饰光晕 */}
            <div 
              className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl opacity-5 -z-0 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                background: chartType === "radar"
                  ? "radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 60%)"
                  : "radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 60%)"
              }}
            />
            <div className="relative z-10 w-full h-full">
              {chartType === "radar" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={dataset}>
                    <PolarGrid 
                      stroke={resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"} 
                    />
                    <PolarAngleAxis 
                      dataKey="name" 
                      tick={{ 
                        fontSize: 12, 
                        fill: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
                        fontWeight: 500
                      }} 
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      tick={{ 
                        fontSize: 10, 
                        fill: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)"
                      }}
                    />
                    <defs>
                      <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={resolvedTheme === "dark" ? "rgba(139, 92, 246, 0.95)" : "rgba(139, 92, 246, 1)"} />
                        <stop offset="50%" stopColor={resolvedTheme === "dark" ? "rgba(236, 72, 153, 0.95)" : "rgba(236, 72, 153, 1)"} />
                        <stop offset="100%" stopColor={resolvedTheme === "dark" ? "rgba(32, 224, 192, 0.95)" : "rgba(32, 224, 192, 1)"} />
                      </linearGradient>
                    </defs>
                    <Radar
                      name={t("chart_score")}
                      dataKey="score"
                      stroke="url(#radarGradient)"
                      fill="url(#radarGradient)"
                      fillOpacity={resolvedTheme === "dark" ? 0.6 : 0.75}
                      strokeWidth={2.5}
                    />
                    <Tooltip 
                      contentStyle={{
                        background: "rgba(43, 51, 62, 0.95)",
                        border: "1px solid rgba(139, 92, 246, 0.3)",
                        borderRadius: "8px",
                        color: "white"
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataset} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={resolvedTheme === "dark" ? "rgba(236, 72, 153, 0.95)" : "rgba(236, 72, 153, 1)"} />
                        <stop offset="50%" stopColor={resolvedTheme === "dark" ? "rgba(139, 92, 246, 0.95)" : "rgba(139, 92, 246, 1)"} />
                        <stop offset="100%" stopColor={resolvedTheme === "dark" ? "rgba(59, 130, 246, 0.95)" : "rgba(59, 130, 246, 1)"} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"} 
                    />
                    <XAxis 
                      dataKey="name" 
                      tick={{ 
                        fontSize: 12, 
                        fill: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
                        fontWeight: 500
                      }} 
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ 
                        fontSize: 12, 
                        fill: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"
                      }} 
                    />
                    <Tooltip 
                      contentStyle={{
                        background: "rgba(43, 51, 62, 0.95)",
                        border: "1px solid rgba(236, 72, 153, 0.3)",
                        borderRadius: "8px",
                        color: "white"
                      }}
                    />
                    <Bar 
                      dataKey="score" 
                      name={`${t("chart_score")}(0-100)`} 
                      fill="url(#barGradient)"
                      radius={[10, 10, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* 中间：维度百分比滑块列表 */}
        <div 
          ref={leftPanelRef}
          className="w-full lg:w-72 flex-shrink-0 py-2 space-y-3"
        >
          {categoryData.map((item, index) => {
            const isSelected = index === selectedIndex;
            const percentage = Math.round(item.score);
            
            // 为每个维度分配独特的颜色
            const getDimensionColor = (categoryName: string, index: number) => {
              // 定义丰富的颜色调色板
              const colorPalette = [
                { name: "Exploration", color: resolvedTheme === "dark" ? "rgba(59, 130, 246, 0.9)" : "rgba(59, 130, 246, 1)" }, // 蓝色
                { name: "Submission", color: resolvedTheme === "dark" ? "rgba(34, 197, 94, 0.9)" : "rgba(34, 197, 94, 1)" }, // 绿色
                { name: "Dominance", color: resolvedTheme === "dark" ? "rgba(168, 85, 247, 0.9)" : "rgba(168, 85, 247, 1)" }, // 紫色
                { name: "Sadistic", color: resolvedTheme === "dark" ? "rgba(239, 68, 68, 0.9)" : "rgba(239, 68, 68, 1)" }, // 红色
                { name: "Masochistic", color: resolvedTheme === "dark" ? "rgba(236, 72, 153, 0.9)" : "rgba(236, 72, 153, 1)" }, // 粉色
                { name: "Vanilla", color: resolvedTheme === "dark" ? "rgba(251, 191, 36, 0.9)" : "rgba(251, 191, 36, 1)" }, // 黄色
                { name: "Switch", color: resolvedTheme === "dark" ? "rgba(20, 184, 166, 0.9)" : "rgba(20, 184, 166, 1)" }, // 青色
                { name: "Bondage", color: resolvedTheme === "dark" ? "rgba(139, 92, 246, 0.9)" : "rgba(139, 92, 246, 1)" }, // 靛蓝
                { name: "Voyeur", color: resolvedTheme === "dark" ? "rgba(249, 115, 22, 0.9)" : "rgba(249, 115, 22, 1)" }, // 橙色
                { name: "Exhibitionist", color: resolvedTheme === "dark" ? "rgba(236, 72, 153, 0.9)" : "rgba(236, 72, 153, 1)" }, // 粉红
              ];
              
              // 尝试根据名称匹配
              const matchedColor = colorPalette.find(c => 
                categoryName.toLowerCase().includes(c.name.toLowerCase()) ||
                c.name.toLowerCase().includes(categoryName.toLowerCase())
              );
              
              if (matchedColor) {
                return matchedColor.color;
              }
              
              // 如果没有匹配，使用索引循环分配颜色
              const fallbackColors = [
                "rgba(59, 130, 246, 1)",    // 蓝色
                "rgba(34, 197, 94, 1)",     // 绿色
                "rgba(168, 85, 247, 1)",    // 紫色
                "rgba(239, 68, 68, 1)",     // 红色
                "rgba(236, 72, 153, 1)",    // 粉色
                "rgba(251, 191, 36, 1)",    // 黄色
                "rgba(20, 184, 166, 1)",    // 青色
                "rgba(139, 92, 246, 1)",    // 靛蓝
                "rgba(249, 115, 22, 1)",    // 橙色
                "rgba(14, 165, 233, 1)",    // 天蓝
              ];
              
              const color = fallbackColors[index % fallbackColors.length];
              return resolvedTheme === "dark" 
                ? color.replace("1)", "0.9)") 
                : color;
            };
            
            const dimensionColor = getDimensionColor(item.name, index);

            return (
              <div
                key={item.category}
                onClick={() => setSelectedIndex(index)}
                className={`relative rounded-xl cursor-pointer transition-all duration-300 ${
                  isSelected 
                    ? "p-5" 
                    : "p-4 hover:scale-[1.005]"
                }`}
                style={{
                  background: isSelected
                    ? resolvedTheme === "dark"
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(255, 255, 255, 1)"
                    : resolvedTheme === "dark"
                      ? "rgba(255, 255, 255, 0.03)"
                      : "rgba(255, 255, 255, 0.95)",
                  border: isSelected
                    ? `2px solid ${dimensionColor}`
                    : resolvedTheme === "dark"
                      ? "1px solid rgba(255, 255, 255, 0.08)"
                      : "1px solid rgba(0, 0, 0, 0.08)",
                  boxShadow: isSelected
                    ? resolvedTheme === "dark"
                      ? `0 4px 16px ${dimensionColor.replace("0.9)", "0.3)")}, 0 0 0 1px ${dimensionColor.replace("0.9)", "0.2)")}`
                      : `0 4px 16px ${dimensionColor.replace("1)", "0.25)")}, 0 0 0 1px ${dimensionColor.replace("1)", "0.15)")}`
                    : resolvedTheme === "dark"
                      ? "0 1px 3px rgba(0, 0, 0, 0.2)"
                      : "0 1px 3px rgba(0, 0, 0, 0.05)",
                }}
              >
                
                {/* 维度名称 */}
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span 
                    className="text-sm font-semibold tracking-tight"
                    style={{
                      color: isSelected 
                        ? dimensionColor
                        : resolvedTheme === "dark"
                          ? "rgba(255, 255, 255, 0.95)"
                          : "rgba(0, 0, 0, 0.9)"
                    }}
                  >
                    {item.name}
                  </span>
                  <div className="flex items-baseline gap-0.5">
                    <span 
                      className={`font-bold ${
                        isSelected ? "text-xl" : "text-base"
                      }`}
                      style={{
                        color: dimensionColor,
                        textShadow: isSelected ? `0 1px 3px ${dimensionColor.replace("0.9)", "0.4)").replace("1)", "0.4)")}` : "none",
                        lineHeight: "1.2"
                      }}
                    >
                      {percentage}
                    </span>
                    <span 
                      className={`font-medium ${
                        isSelected ? "text-sm" : "text-xs"
                      }`}
                      style={{
                        color: isSelected
                          ? dimensionColor.replace("0.9)", "0.7)").replace("1)", "0.8)")
                          : resolvedTheme === "dark" 
                            ? "rgba(255, 255, 255, 0.6)" 
                            : "rgba(0, 0, 0, 0.5)",
                        lineHeight: "1.2"
                      }}
                    >
                      %
                    </span>
                  </div>
                </div>
                
                {/* 滑块条 */}
                <div 
                  className="w-full h-3 rounded-full overflow-hidden relative"
                  style={{
                    background: resolvedTheme === "dark"
                      ? "rgba(255, 255, 255, 0.15)"
                      : "rgba(0, 0, 0, 0.08)",
                    boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.1)"
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                    style={{
                      width: `${percentage}%`,
                      background: dimensionColor,
                      boxShadow: `0 2px 6px ${dimensionColor.replace("0.9)", "0.6)").replace("1)", "0.6)")}, inset 0 1px 0 rgba(255, 255, 255, 0.3)`
                    }}
                  >
                    {/* 进度条光泽效果 */}
                    {isSelected && (
                      <div 
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.5) 50%, transparent 100%)",
                          animation: "shimmer 2s infinite"
                        }}
                      />
                    )}
                    {/* 滑块手柄 */}
                    <div
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full border-2 transition-all duration-300"
                      style={{
                        background: "rgba(255, 255, 255, 1)",
                        borderColor: dimensionColor,
                        borderWidth: "2px",
                        boxShadow: `0 2px 8px ${dimensionColor.replace("0.9)", "0.8)").replace("1)", "0.8)")}, 0 0 0 1px ${dimensionColor.replace("0.9)", "0.4)").replace("1)", "0.4)")}`
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 右侧：选中维度的详细解释 */}
        {selectedCategory && (
          <div className="w-full lg:w-80 flex-shrink-0">
            <div 
              className="h-full p-6 rounded-2xl relative overflow-hidden"
              style={{
                background: resolvedTheme === "dark"
                  ? "linear-gradient(135deg, rgba(43, 51, 62, 0.7) 0%, rgba(35, 42, 52, 0.7) 100%)"
                  : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)",
                border: resolvedTheme === "dark"
                  ? `1.5px solid ${selectedColor.replace("0.9)", "0.3)").replace("1)", "0.3)")}`
                  : `1.5px solid ${selectedColor.replace("0.9)", "0.2)").replace("1)", "0.2)")}`,
                boxShadow: resolvedTheme === "dark"
                  ? `0 12px 40px ${selectedColor.replace("0.9)", "0.2)").replace("1)", "0.2)")}, 0 6px 20px ${selectedColor.replace("0.9)", "0.15)").replace("1)", "0.15)")}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                  : `0 12px 40px ${selectedColor.replace("0.9)", "0.15)").replace("1)", "0.15)")}, 0 6px 20px ${selectedColor.replace("0.9)", "0.1)").replace("1)", "0.1)")}, inset 0 1px 0 rgba(255, 255, 255, 0.8)`
              }}
            >
              {/* 背景装饰光晕 */}
              <div 
                className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20 -z-0"
                style={{
                  background: `radial-gradient(circle, ${selectedColor.replace("0.9)", "0.4)").replace("1)", "0.4)")} 0%, transparent 70%)`
                }}
              />

              {/* 装饰性流动波浪 - 左上角 */}
              <svg 
                className="absolute top-4 left-4 w-32 h-32 -z-0"
                viewBox="0 0 100 100"
                style={{
                  fill: "none",
                  stroke: selectedColor.replace("0.9)", "0.3)").replace("1)", "0.3)"),
                  strokeWidth: "1.5",
                  opacity: 0.08
                }}
              >
                <path d="M0,50 Q25,30 50,50 T100,50" />
                <path d="M0,60 Q25,40 50,60 T100,60" />
                <path d="M0,70 Q25,50 50,70 T100,70" />
              </svg>

              {/* 装饰性柔和光晕 - 右下角 */}
              <div 
                className="absolute bottom-8 right-8 w-40 h-40 rounded-full blur-2xl -z-0"
                style={{
                  background: `radial-gradient(circle, ${selectedColor.replace("0.9)", "0.3)").replace("1)", "0.3)")} 0%, transparent 70%)`,
                  opacity: 0.06
                }}
              />

              {/* 装饰性流动曲线 - 左下角 */}
              <svg 
                className="absolute bottom-4 left-4 w-28 h-28 -z-0"
                viewBox="0 0 100 100"
                style={{
                  fill: "none",
                  stroke: selectedColor.replace("0.9)", "0.25)").replace("1)", "0.25)"),
                  strokeWidth: "2",
                  opacity: 0.06
                }}
              >
                <path d="M20,80 Q40,20 60,50 Q80,80 100,30" strokeLinecap="round" />
              </svg>

              {/* 装饰性柔和渐变纹理 - 背景 */}
              <div 
                className="absolute inset-0 -z-0"
                style={{
                  background: `radial-gradient(ellipse at top left, ${selectedColor.replace("0.9)", "0.08)").replace("1)", "0.08)")} 0%, transparent 50%), radial-gradient(ellipse at bottom right, ${selectedColor.replace("0.9)", "0.06)").replace("1)", "0.06)")} 0%, transparent 50%)`
                }}
              />
              
              {/* 标题区域 */}
              <div className="relative z-10 mb-4 pb-4 border-b"
                style={{
                  borderColor: resolvedTheme === "dark" 
                    ? "rgba(255, 255, 255, 0.1)" 
                    : selectedColor.replace("0.9)", "0.15)").replace("1)", "0.15)")
                }}
              >
                <h3 
                  className="text-2xl font-extrabold mb-2 tracking-tight"
                  style={{
                    color: theme === "dark" ? "rgba(255, 255, 255, 0.95)" : "rgba(0, 0, 0, 0.95)",
                  }}
                >
                  {selectedCategory?.name || ''}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span 
                    className="text-4xl font-extrabold"
                    style={{
                      color: selectedColor,
                      textShadow: `0 2px 8px ${selectedColor.replace("0.9)", "0.3)").replace("1)", "0.3)")}`
                    }}
                  >
                    {Math.round(selectedCategory.score)}
                  </span>
                  <span 
                    className="text-xl font-bold"
                    style={{
                      color: selectedColor.replace("0.9)", "0.8)").replace("1)", "0.9)")
                    }}
                  >
                    %
                  </span>
                </div>
              </div>
            
            {/* 描述内容 */}
            <div className="relative z-10 mb-6">
              {selectedCategory.description && (
                <p 
                  className="text-sm leading-relaxed whitespace-pre-wrap mb-6"
                  style={{
                    color: resolvedTheme === "dark" 
                      ? "rgba(255, 255, 255, 0.75)" 
                      : "rgba(0, 0, 0, 0.75)",
                    lineHeight: "1.8"
                  }}
                >
                  {selectedCategory.description}
                </p>
              )}
              {!selectedCategory.description && (
                <p 
                  className="text-sm italic mb-6"
                  style={{
                    color: resolvedTheme === "dark" 
                      ? "rgba(255, 255, 255, 0.5)" 
                      : "rgba(0, 0, 0, 0.5)"
                  }}
                >
                  暂无详细描述
                </p>
              )}

              {/* 装饰性情感元素区域 */}
              <div className="relative mt-8 pt-6 border-t"
                style={{
                  borderColor: resolvedTheme === "dark" 
                    ? "rgba(255, 255, 255, 0.08)" 
                    : selectedColor.replace("0.9)", "0.1)").replace("1)", "0.1)")
                }}
              >
                {/* 装饰性流动图案网格 */}
                <div className="grid grid-cols-3 gap-6 opacity-25">
                  {/* 流动波浪 */}
                  <div className="flex items-center justify-center">
                    <svg 
                      width="40" 
                      height="40" 
                      viewBox="0 0 40 40"
                      style={{
                        fill: "none",
                        stroke: selectedColor.replace("0.9)", "0.4)").replace("1)", "0.4)"),
                        strokeWidth: "1.5"
                      }}
                    >
                      <path d="M5,20 Q10,10 15,20 T25,20 T35,20" strokeLinecap="round" />
                    </svg>
                  </div>
                  
                  {/* 柔和心形 */}
                  <div className="flex items-center justify-center">
                    <svg 
                      width="40" 
                      height="40" 
                      viewBox="0 0 40 40"
                      style={{
                        fill: selectedColor.replace("0.9)", "0.15)").replace("1)", "0.15)"),
                        stroke: selectedColor.replace("0.9)", "0.3)").replace("1)", "0.3)"),
                        strokeWidth: "1"
                      }}
                    >
                      <path d="M20,30 C20,30 10,20 10,15 C10,10 15,10 20,15 C25,10 30,10 30,15 C30,20 20,30 20,30 Z" />
                    </svg>
                  </div>
                  
                  {/* 流动曲线 */}
                  <div className="flex items-center justify-center">
                    <svg 
                      width="40" 
                      height="40" 
                      viewBox="0 0 40 40"
                      style={{
                        fill: "none",
                        stroke: selectedColor.replace("0.9)", "0.4)").replace("1)", "0.4)"),
                        strokeWidth: "1.5"
                      }}
                    >
                      <path d="M5,30 Q15,10 25,20 Q35,30 35,20" strokeLinecap="round" />
                    </svg>
                  </div>
                  
                  {/* 柔和圆形 */}
                  <div className="flex items-center justify-center">
                    <div 
                      className="w-10 h-10 rounded-full"
                      style={{
                        background: `radial-gradient(circle, ${selectedColor.replace("0.9)", "0.2)").replace("1)", "0.2)")}, transparent)`,
                        border: `1.5px solid ${selectedColor.replace("0.9)", "0.25)").replace("1)", "0.25)")}`
                      }}
                    />
                  </div>
                  
                  {/* 流动线条 */}
                  <div className="flex items-center justify-center">
                    <svg 
                      width="40" 
                      height="40" 
                      viewBox="0 0 40 40"
                      style={{
                        fill: "none",
                        stroke: selectedColor.replace("0.9)", "0.4)").replace("1)", "0.4)"),
                        strokeWidth: "1.5"
                      }}
                    >
                      <path d="M10,20 Q20,10 30,20" strokeLinecap="round" />
                      <path d="M10,25 Q20,15 30,25" strokeLinecap="round" />
                    </svg>
                  </div>
                  
                  {/* 柔和椭圆 */}
                  <div className="flex items-center justify-center">
                    <div 
                      className="w-12 h-8 rounded-full"
                      style={{
                        background: `radial-gradient(ellipse, ${selectedColor.replace("0.9)", "0.2)").replace("1)", "0.2)")}, transparent)`,
                        border: `1.5px solid ${selectedColor.replace("0.9)", "0.25)").replace("1)", "0.25)")}`
                      }}
                    />
                  </div>
                </div>

                {/* 装饰性流动波浪线 */}
                <div className="mt-6 flex items-center justify-center">
                  <svg 
                    width="140" 
                    height="24" 
                    viewBox="0 0 140 24"
                    style={{
                      fill: "none",
                      stroke: selectedColor.replace("0.9)", "0.2)").replace("1)", "0.2)"),
                      strokeWidth: "1.5"
                    }}
                  >
                    <path d="M0,12 Q20,4 40,12 T80,12 T120,12" strokeLinecap="round" />
                    <path d="M0,16 Q20,8 40,16 T80,16 T120,16" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

export default ResultChart;




