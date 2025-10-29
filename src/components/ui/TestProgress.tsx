/**
 * 组件：测试进度条
 * 作用：显示当前题目索引与剩余数量，辅助用户感知进度。
 */

"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Progress } from "@/components/ui/progress";

interface TestProgressProps {
  current: number;
  total: number;
}

export function TestProgressBar({ current, total }: TestProgressProps) {
  const t = useTranslations("test.run");
  const clampedTotal = Math.max(1, total);
  const value = Math.round(((current + 1) / clampedTotal) * 100);
  const remaining = Math.max(0, total - current - 1);
  return (
    <div className="w-full space-y-2">
      <Progress value={value} />
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{t("progress")}：{current + 1}/{total}</span>
        <span>{t("remaining")}：{remaining}</span>
      </div>
    </div>
  );
}

export default TestProgressBar;


