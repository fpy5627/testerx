/**
 * 组件：Progress 进度条
 * 作用：显示 0-100 的线性进度，适配简易场景，无需外部依赖。
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps {
  /** 当前进度值（0-100） */
  value?: number;
  /** 自定义类名 */
  className?: string;
  /** 条高度（px，默认 8） */
  height?: number;
  /** 是否显示数值文本 */
  showValueText?: boolean;
}

/**
 * 渲染一个线性进度条。
 * @param props.value 当前进度（0-100），超界会被裁剪
 * @param props.className 自定义类名
 * @param props.height 条高度（px）
 * @param props.showValueText 是否在条内显示百分比文本
 * @returns JSX.Element
 */
export function Progress({ value = 0, className, height = 8, showValueText = false }: ProgressProps): JSX.Element {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-md bg-muted",
        className
      )}
      style={{ height }}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      role="progressbar"
    >
      <div
        className="h-full w-full rounded-md bg-primary/20"
        aria-hidden
      />
      <div
        className="absolute left-0 top-0 h-full rounded-md bg-primary transition-all"
        style={{ width: `${clamped}%` }}
      />
      {showValueText && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-foreground/70">
          {clamped}%
        </div>
      )}
    </div>
  );
}

export default Progress;



