/**
 * 组件：结果图表（雷达图/条形图，基于 Recharts）
 * 作用：以可视化形式展示各维度分数，支持动态切换雷达图和柱状图。
 * 依赖已在项目中（recharts）。
 */

"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
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
  
  // 从题库中获取所有category
  for (const q of bank.questions) {
    categories.add(q.category);
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
  const [chartType, setChartType] = useState<"radar" | "bar">(initialVariant);
  const { labels, data } = React.useMemo(() => buildDataset(bank, result), [bank, result]);

  const dataset = labels.map((name, i) => ({ name, score: data[i] }));

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      {/* 切换按钮 */}
      <div className="flex space-x-4">
        <button
          onClick={() => setChartType("radar")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            chartType === "radar"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          {t("chart_radar")}
        </button>
        <button
          onClick={() => setChartType("bar")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            chartType === "bar"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          {t("chart_bar")}
        </button>
      </div>

      {/* 图表容器 */}
      <div className="w-full h-96 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4">
        {chartType === "radar" ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={dataset}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                name={t("chart_score")}
                dataKey="score"
                stroke="#4f46e5"
                fill="#6366f1"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataset} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="score" name={`${t("chart_score")}(0-100)`} fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default ResultChart;


