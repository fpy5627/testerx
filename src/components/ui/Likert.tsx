/**
 * 组件：Likert 量表
 * 作用：提供 1-5 的同意度选择（可自定义标签），支持禁用与受控值。
 */

"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export type LikertValue = 1 | 2 | 3 | 4 | 5;

interface LikertProps {
  value?: LikertValue;
  onChange?: (v: LikertValue) => void;
  labels?: [string, string, string, string, string];
  disabled?: boolean;
  className?: string;
}

/**
 * 渲染单个选项按钮。
 * @param i 索引(1-5)
 * @param current 当前值
 * @param onChange 改变回调
 * @param disabled 是否禁用
 */
function LikertOption({
  i,
  current,
  onChange,
  disabled,
  label,
}: { i: LikertValue; current?: LikertValue; onChange?: (v: LikertValue) => void; disabled?: boolean; label?: string }) {
  const active = current === i;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange?.(i)}
      className={cn(
        "flex flex-col items-center justify-center rounded-md border px-3 py-2 text-sm",
        active ? "border-primary bg-primary/10 text-primary" : "border-muted-foreground/20 hover:bg-muted",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      aria-pressed={active}
    >
      <span className="font-medium">{i}</span>
      {label ? <span className="mt-1 text-xs text-muted-foreground">{label}</span> : null}
    </button>
  );
}

export function Likert({ value, onChange, labels, disabled, className }: LikertProps) {
  const t = useTranslations("test.likert");
  const all: LikertValue[] = [1, 2, 3, 4, 5];
  const defaultLabels: [string, string, string, string, string] = [
    t("strongly_disagree"),
    t("disagree"),
    t("neutral"),
    t("agree"),
    t("strongly_agree"),
  ];
  const finalLabels = labels || defaultLabels;
  return (
    <div className={cn("grid grid-cols-5 gap-2", className)}>
      {all.map((i, idx) => (
        <LikertOption
          key={i}
          i={i}
          current={value}
          onChange={onChange}
          disabled={disabled}
          label={finalLabels[idx]}
        />
      ))}
    </div>
  );
}

export default Likert;


