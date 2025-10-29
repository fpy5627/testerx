/**
 * 组件：结果图表（雷达图/条形图，基于 Recharts）
 * 作用：以可视化形式展示各维度分数。依赖已在项目中（recharts）。
 */

"use client";

import React from "react";
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
} from "recharts";

interface ResultChartProps {
  bank: TestBankPayload;
  result: TestResult;
  variant?: "radar" | "bar";
}

/**
 * 构建图表数据集。
 * @param bank 题库
 * @param result 结果
 * @returns { labels: string[], data: number[] }
 */
function buildDataset(bank: TestBankPayload, result: TestResult) {
  const labels = bank.dimensions.map((d) => d.name);
  const data = bank.dimensions.map((d) => result.normalized?.[d.id] ?? 0);
  return { labels, data };
}

export function ResultChart({ bank, result, variant = "radar" }: ResultChartProps) {
  const { labels, data } = React.useMemo(() => buildDataset(bank, result), [bank, result]);

  const dataset = labels.map((name, i) => ({ name, score: data[i] }));

  if (variant === "bar") {
    return (
      <div className="w-full h-[320px]">
        <ResponsiveContainer>
          <BarChart data={dataset} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="score" name="得分(0-100)" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full h-[360px]">
      <ResponsiveContainer>
        <RadarChart data={dataset} outerRadius={120}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis domain={[0, 100]} />
          <Radar dataKey="score" name="得分(0-100)" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ResultChart;


