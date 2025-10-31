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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 via-pink-100 to-violet-100 dark:from-indigo-950 dark:via-purple-950 dark:via-pink-950 dark:to-violet-950 flex flex-col relative overflow-hidden">
      {/* 多层渐变动画背景 */}
      <div className="absolute inset-0">
        {/* 主要渐变层 */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-200/40 via-pink-200/30 to-indigo-200/40 dark:from-purple-900/40 dark:via-pink-900/30 dark:to-indigo-900/40" />
        
        {/* 动画光晕效果 - 左上 */}
        <div className="absolute top-0 left-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] rounded-full blur-3xl animate-float-slow" 
          style={{
            background: 'radial-gradient(circle, rgba(192, 132, 252, 0.3) 0%, rgba(147, 51, 234, 0.2) 50%, transparent 100%)',
          }} />
        
        {/* 动画光晕效果 - 右下 */}
        <div className="absolute bottom-0 right-0 w-[250px] h-[250px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] rounded-full blur-3xl animate-float-reverse" 
          style={{
            background: 'radial-gradient(circle, rgba(244, 114, 182, 0.3) 0%, rgba(139, 92, 246, 0.2) 50%, transparent 100%)',
          }} />
        
        {/* 动画光晕效果 - 中间 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[300px] md:h-[300px] lg:w-[400px] lg:h-[400px] rounded-full blur-3xl animate-pulse-slow" 
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(147, 51, 234, 0.15) 50%, transparent 100%)',
          }} />
        
        {/* 粒子纹理背景 */}
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 lg:px-[52px] flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl bg-background/95 backdrop-blur-sm rounded-2xl md:rounded-3xl border border-primary/20 shadow-2xl overflow-hidden flex-1 flex flex-col my-4 md:my-6">
          {/* 顶部：进度、题目和操作按钮 */}
          <div className="px-4 sm:px-5 md:px-6 pt-4 sm:pt-5 md:pt-6 pb-3 md:pb-4 flex-shrink-0">
            <div className="flex items-start justify-between gap-2 sm:gap-3 md:gap-4 mb-3 md:mb-4">
              {/* 左侧：题号显示 - 8/30 向下对齐，使用数字时钟字体样式 */}
              <div className="flex-shrink-0 flex items-end">
                {/* 当前题号 - 等宽字体，数字时钟样式 */}
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-mono font-normal text-primary leading-none tracking-tight">
                  {currentQuestion}
                </div>
                {/* "/" 符号 - 等宽字体，数字时钟样式，与8之间保持间距 */}
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-mono font-normal text-primary leading-none tracking-tight ml-0.5 md:ml-1">
                  /
                </div>
                {/* 总数 - 等宽字体，数字时钟样式，与/之间缩小间距 */}
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-mono font-normal text-primary/80 leading-none tracking-tight -ml-0.5">
                  {formattedTotal}
                </div>
              </div>
            </div>
            
            {/* 题目文本 */}
            <div>
              {/* 题目文本 - 浅蓝色背景框 */}
              <div className="bg-blue-100 dark:bg-blue-950/30 rounded-xl p-4 sm:p-6 md:p-8 lg:p-10">
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-foreground leading-relaxed">
                  {q.question}
                </h2>
                {q.hint && (
                  <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-muted-foreground">{q.hint}</p>
                )}
              </div>
            </div>
          </div>

          {/* 选项列表 - 文字居中显示 */}
          <div className="flex-1 min-h-0 flex flex-col px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 space-y-2 sm:space-y-3">
            {[1, 2, 3, 4, 5].map((value) => {
              const isSelected = (a?.value as number) === value;
              
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onSet(value as LikertValue)}
                  className={cn(
                    "w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl transition-all duration-200 relative",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]"
                      : "bg-primary/90 dark:bg-primary/80 text-primary-foreground hover:bg-primary/95 dark:hover:bg-primary/85 hover:shadow-md"
                  )}
                >
                  <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 relative">
                    {/* 左侧字母标识 */}
                    <div className={cn(
                      "absolute left-0 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm",
                      isSelected 
                        ? "bg-primary-foreground/20 text-primary-foreground border-2 border-primary-foreground/30" 
                        : "bg-primary-foreground/10 text-primary-foreground"
                    )}>
                      {optionLetters[value - 1]}
                    </div>
                    
                    {/* 选项文字 - 居中 */}
                    <div className="text-center">
                      <div className="font-medium text-xs sm:text-sm md:text-base">
                        {labels[value - 1]}
                      </div>
                    </div>
                    
                    {/* 右侧选中图标 */}
                    {isSelected && (
                      <div className="absolute right-0 flex-shrink-0">
                        <svg width="16" height="16" className="sm:w-5 sm:h-5 md:w-5 md:h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          <div className="flex items-center justify-between gap-2 sm:gap-3 px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 flex-shrink-0">
            <div className="flex gap-1.5 sm:gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onPrev} 
                disabled={idx <= 0}
                className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm text-foreground/80 hover:text-foreground px-2 sm:px-3"
              >
                {t("prev")}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onSkip}
                className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 px-2 sm:px-3 border border-border/50"
              >
                {t("skip")}
              </Button>
            </div>
            {idx < total - 1 ? (
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 sm:h-10 md:h-11 px-4 sm:px-5 md:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base"
                size="lg"
                onClick={onNext}
              >
                {t("next")}
              </Button>
            ) : (
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 sm:h-10 md:h-11 px-4 sm:px-5 md:px-6 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base"
                size="lg"
                onClick={onSubmit}
              >
                {t("submit")}
              </Button>
            )}
          </div>
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


