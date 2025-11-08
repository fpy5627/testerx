"use client";

import React from "react";
import { useTheme } from "next-themes";
import type { TestBankPayload, TestResult } from "@/types/test";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface ExportChartProps {
  bank: TestBankPayload;
  result: TestResult;
  chartType?: "radar" | "bar";
}

/**
 * 导出专用图表组件
 * 使用固定尺寸，确保html2canvas能正确捕获
 * 支持雷达图和柱状图两种类型
 */
export default function ExportChart({ bank, result, chartType = "radar" }: ExportChartProps) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme || 'light';
  const isDark = theme === "dark";

  // 构建数据集 - 与ResultChart保持一致
  const categories = new Set<string>();
  
  // 从题库中获取所有category
  if (bank?.questions && Array.isArray(bank.questions)) {
    for (const q of bank.questions) {
      if (q?.category) {
        categories.add(q.category);
      }
    }
  }
  
  // 过滤掉Orientation（单独展示）
  const chartCategories = Array.from(categories).filter(cat => cat !== "Orientation");
  
  // 构建数据集
  const dataset = chartCategories.map(cat => {
    const categoryMeta = bank.categories?.[cat];
    const name = categoryMeta?.name || cat;
    const score = result.normalized?.[cat] ?? 0;
    return { name, score };
  });

  // 如果是柱状图，按分数排序
  const sortedDataset = chartType === "bar" 
    ? [...dataset].sort((a, b) => b.score - a.score)
    : dataset;

  return (
    <div style={{ width: '100%', height: '400px' }}>
      {chartType === "radar" ? (
        <RadarChart 
          width={800} 
          height={400} 
          data={sortedDataset}
          margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
        >
          <PolarGrid 
            stroke={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"} 
          />
          <PolarAngleAxis 
            dataKey="name" 
            tick={{ 
              fontSize: 12, 
              fill: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
              fontWeight: 500
            }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ 
              fontSize: 10, 
              fill: isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)"
            }}
          />
          <defs>
            <linearGradient id="exportRadarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDark ? "rgba(139, 92, 246, 0.95)" : "rgba(139, 92, 246, 1)"} />
              <stop offset="50%" stopColor={isDark ? "rgba(236, 72, 153, 0.95)" : "rgba(236, 72, 153, 1)"} />
              <stop offset="100%" stopColor={isDark ? "rgba(32, 224, 192, 0.95)" : "rgba(32, 224, 192, 1)"} />
            </linearGradient>
          </defs>
          <Radar
            name="Score"
            dataKey="score"
            stroke="url(#exportRadarGradient)"
            fill="url(#exportRadarGradient)"
            fillOpacity={isDark ? 0.6 : 0.75}
            strokeWidth={2.5}
          />
          <Tooltip 
            contentStyle={{
              background: isDark ? "rgba(43, 51, 62, 0.95)" : "rgba(255, 255, 255, 0.95)",
              border: `1px solid ${isDark ? "rgba(139, 92, 246, 0.3)" : "rgba(139, 92, 246, 0.2)"}`,
              borderRadius: "8px",
              color: isDark ? "white" : "black"
            }}
          />
        </RadarChart>
      ) : (
        <BarChart 
          width={800} 
          height={400} 
          data={sortedDataset}
          margin={{ top: 20, right: 30, bottom: 60, left: 30 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"} 
          />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ 
              fontSize: 11, 
              fill: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
              fontWeight: 500
            }} 
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ 
              fontSize: 11, 
              fill: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"
            }}
          />
          <defs>
            <linearGradient id="exportBarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isDark ? "rgba(32, 224, 192, 0.95)" : "rgba(32, 224, 192, 1)"} />
              <stop offset="50%" stopColor={isDark ? "rgba(139, 92, 246, 0.95)" : "rgba(139, 92, 246, 1)"} />
              <stop offset="100%" stopColor={isDark ? "rgba(236, 72, 153, 0.95)" : "rgba(236, 72, 153, 1)"} />
            </linearGradient>
          </defs>
          <Tooltip 
            contentStyle={{
              background: isDark ? "rgba(43, 51, 62, 0.95)" : "rgba(255, 255, 255, 0.95)",
              border: `1px solid ${isDark ? "rgba(139, 92, 246, 0.3)" : "rgba(139, 92, 246, 0.2)"}`,
              borderRadius: "8px",
              color: isDark ? "white" : "black"
            }}
            cursor={{ fill: 'transparent' }}
          />
          <Bar 
            dataKey="score" 
            name="得分"
            fill="url(#exportBarGradient)"
            radius={[10, 10, 0, 0]}
            activeBar={{
              fill: "url(#exportBarGradient)",
              stroke: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)",
              strokeWidth: 0.5,
              opacity: 1,
            }}
          />
        </BarChart>
      )}
    </div>
  );
}

