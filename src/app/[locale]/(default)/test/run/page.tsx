/**
 * 页面：测试运行（答题）
 * 作用：展示题目、Likert 选项、进度条与跳过/前后控制。
 */

"use client";

import React, { useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { TestProvider, useTestContext } from "@/contexts/test";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import type { LikertValue } from "@/components/ui/Likert";
import { cn } from "@/lib/utils";

function RunInner() {
  const t = useTranslations("test.run");
  const t_labels = useTranslations("test.likert");
  const { bank, progress, init, answer, skip, next, prev, submit, loading } = useTestContext();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  
  const labels = [
    t_labels("strongly_disagree"),
    t_labels("disagree"),
    t_labels("neutral"),
    t_labels("agree"),
    t_labels("strongly_agree"),
  ];

  useEffect(() => {
    void init(locale);
  }, [init, locale]);

  if (loading || !bank) {
    return <div className="container mx-auto max-w-3xl py-10">{t("loading")}</div>;
  }

  if (!bank.questions || bank.questions.length === 0) {
    return (
      <div className="container mx-auto max-w-3xl py-10">
        <p className="text-red-500">错误：题库为空，请检查API路由或刷新页面。</p>
      </div>
    );
  }

  const total = bank.questions.length;
  const idx = progress.currentIndex;
  if (idx >= total || idx < 0) {
    return (
      <div className="container mx-auto max-w-3xl py-10">
        <p className="text-red-500">错误：题目索引超出范围。</p>
      </div>
    );
  }

  const q = bank.questions[idx];
  if (!q) {
    return (
      <div className="container mx-auto max-w-3xl py-10">
        <p className="text-red-500">错误：无法加载当前题目。</p>
      </div>
    );
  }

  const a = progress.answers.find((x) => x.questionId === q.id);

  const onSet = (v: number) => {
    answer(q.id, v);
  };

  const onSkip = () => {
    skip(q.id);
    next();
  };

  const onNext = () => {
    if (idx >= total - 1) return;
    next();
  };

  const onPrev = () => {
    if (idx <= 0) return;
    prev();
  };

  const onSubmit = async () => {
    await submit();
    router.push(`/${locale}/test/result`);
  };

  const optionLetters = ['A', 'B', 'C', 'D', 'E'];
  const currentQuestion = idx + 1;
  const formattedTotal = String(total).padStart(2, '0'); // 格式化为带前导零，如 08

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-200 via-purple-100 to-blue-100 dark:from-purple-950 dark:via-purple-900 dark:to-blue-950 flex flex-col relative overflow-hidden">
      {/* 纹理背景 */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      
      <div className="relative z-10 container mx-auto max-w-2xl px-4 py-8 flex-1 flex flex-col">
        {/* 题号和题目区域 */}
        <div className="mb-8 flex-shrink-0">
          <div className="flex items-start gap-6">
            {/* 左侧：题号显示 - 8/30 向下对齐，使用数字时钟字体样式 */}
            <div className="flex-shrink-0 flex items-end">
              {/* 当前题号 - 等宽字体，数字时钟样式 */}
              <div className="text-6xl md:text-7xl font-mono font-normal text-white leading-none tracking-tight">
                {currentQuestion}
              </div>
              {/* "/" 符号 - 等宽字体，数字时钟样式，与8之间保持间距 */}
              <div className="text-6xl md:text-7xl font-mono font-normal text-white leading-none tracking-tight ml-1">
                /
              </div>
              {/* 总数 - 等宽字体，数字时钟样式，与/之间缩小间距 */}
              <div className="text-2xl md:text-3xl font-mono font-normal text-white/95 leading-none tracking-tight -ml-0.5">
                {formattedTotal}
              </div>
            </div>
            
            {/* 右侧：题目文本 */}
            <div className="flex-1 pt-2">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground leading-tight">
                {q.question}
              </h2>
              {q.hint && (
                <p className="mt-3 text-sm md:text-base text-muted-foreground">{q.hint}</p>
              )}
            </div>
          </div>
        </div>

        {/* 选项列表 - 参考图片的深蓝色按钮样式 */}
        <div className="space-y-3 mb-8 flex-1 min-h-0 flex flex-col">
          {[1, 2, 3, 4, 5].map((value) => {
            const isSelected = (a?.value as number) === value;
            
            return (
              <button
                key={value}
                type="button"
                onClick={() => onSet(value as LikertValue)}
                className={cn(
                  "w-full text-left px-5 py-4 rounded-xl transition-all duration-200",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]"
                    : "bg-primary/90 dark:bg-primary/80 text-primary-foreground hover:bg-primary/95 dark:hover:bg-primary/85 hover:shadow-md"
                )}
              >
                <div className="flex items-center gap-4">
                  {/* 左侧字母标识 */}
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                    isSelected 
                      ? "bg-primary-foreground/20 text-primary-foreground border-2 border-primary-foreground/30" 
                      : "bg-primary-foreground/10 text-primary-foreground"
                  )}>
                    {optionLetters[value - 1]}
                  </div>
                  
                  {/* 选项文字 */}
                  <div className="flex-1">
                    <div className="font-medium text-base md:text-lg">
                      {labels[value - 1]}
                    </div>
                  </div>
                  
                  {/* 右侧选中图标 */}
                  {isSelected && (
                    <div className="flex-shrink-0">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path 
                          d="M16.667 5L7.5 14.167 3.333 10" 
                          stroke="currentColor" 
                          strokeWidth="2.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          className="text-primary-foreground"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* 底部操作按钮 */}
        <div className="flex items-center justify-between gap-3 mt-auto flex-shrink-0">
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onPrev} 
              disabled={idx <= 0}
              className="h-10 text-foreground/80 hover:text-foreground"
            >
              {t("prev")}
            </Button>
            {q.skippable && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onSkip}
                className="h-10 text-foreground/80 hover:text-foreground"
              >
                {t("skip")}
              </Button>
            )}
          </div>
          {idx < total - 1 ? (
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-6 rounded-xl"
              size="lg"
              onClick={onNext}
            >
              {t("next")}
            </Button>
          ) : (
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-6 rounded-xl"
              size="lg"
              onClick={onSubmit}
            >
              {t("submit")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RunPage() {
  return (
    <TestProvider>
      <RunInner />
    </TestProvider>
  );
}


