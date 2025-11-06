/**
 * 组件：结果图表（雷达图/条形图，基于 Recharts）
 * 作用：以可视化形式展示各维度分数，支持动态切换雷达图和柱状图。
 * 依赖已在项目中（recharts）。
 */

"use client";

import React, { useState } from "react";
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

interface ResultChartProps {
  bank: TestBankPayload;
  result: TestResult;
  variant?: "radar" | "bar"; // 默认显示类型，但可以通过切换按钮改变
}

/**
 * 构建图表数据集（基于category结构）。
 * @param bank 题库
 * @param result 结果
 * @returns { labels: string[], data: number[] }
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
  
  for (const cat of chartCategories) {
    const categoryMeta = bank.categories?.[cat];
    labels.push(categoryMeta?.name || cat);
    data.push(result.normalized?.[cat] ?? 0);
  }
  
  return { labels, data };
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
  const [chartType, setChartType] = useState<"radar" | "bar">(initialVariant);
  const { labels, data } = React.useMemo(() => {
    if (!bank || !result) {
      return { labels: [], data: [] };
    }
    return buildDataset(bank, result);
  }, [bank, result]);

  const dataset = labels.map((name, i) => ({ name, score: data[i] }));

  // 如果数据为空，显示提示信息
  if (!labels.length || !data.length) {
    return (
      <div className="w-full flex flex-col items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4">
        <p className="text-muted-foreground">暂无数据</p>
      </div>
    );
  }
  
  return (
    <div className="w-full flex flex-col items-center space-y-4">
      {/* 切换按钮 */}
      <div className="flex space-x-3">
        <button
          onClick={() => setChartType("radar")}
          className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
            chartType === "radar"
              ? "text-white shadow-lg scale-105"
              : "text-gray-600 dark:text-gray-400 hover:scale-105"
          }`}
          style={chartType === "radar" ? {
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.95) 0%, rgba(124, 58, 237, 0.95) 100%)",
            boxShadow: "0 4px 16px rgba(139, 92, 246, 0.4), 0 2px 8px rgba(139, 92, 246, 0.3)"
          } : {
            background: "rgba(0, 0, 0, 0.05)",
            border: "1px solid rgba(139, 92, 246, 0.2)"
          }}
        >
          {t("chart_radar")}
        </button>
        <button
          onClick={() => setChartType("bar")}
          className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
            chartType === "bar"
              ? "text-white shadow-lg scale-105"
              : "text-gray-600 dark:text-gray-400 hover:scale-105"
          }`}
          style={chartType === "bar" ? {
            background: "linear-gradient(135deg, rgba(236, 72, 153, 0.95) 0%, rgba(219, 39, 119, 0.95) 100%)",
            boxShadow: "0 4px 16px rgba(236, 72, 153, 0.4), 0 2px 8px rgba(236, 72, 153, 0.3)"
          } : {
            background: "rgba(0, 0, 0, 0.05)",
            border: "1px solid rgba(236, 72, 153, 0.2)"
          }}
        >
          {t("chart_bar")}
        </button>
      </div>

      {/* 图表容器 */}
      <div className="w-full h-96 bg-transparent p-4">
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
              <Radar
                name={t("chart_score")}
                dataKey="score"
                stroke="url(#radarGradient)"
                fill="url(#radarGradient)"
                fillOpacity={0.7}
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(139, 92, 246, 0.9)" />
                  <stop offset="50%" stopColor="rgba(236, 72, 153, 0.9)" />
                  <stop offset="100%" stopColor="rgba(32, 224, 192, 0.9)" />
                </linearGradient>
              </defs>
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
                  <stop offset="0%" stopColor="rgba(236, 72, 153, 0.9)" />
                  <stop offset="50%" stopColor="rgba(139, 92, 246, 0.9)" />
                  <stop offset="100%" stopColor="rgba(59, 130, 246, 0.9)" />
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
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default ResultChart;


