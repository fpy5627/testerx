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
    <div className="min-h-screen bg-white dark:bg-[#2b333e] flex flex-col relative overflow-hidden transition-colors duration-200">
      {/* 白天模式白色背景，夜晚模式深灰色背景 */}
      <div 
        className="absolute inset-0 bg-white dark:bg-[#2b333e] transition-colors duration-200"
      />
      
      <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 lg:px-[52px] flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl backdrop-blur-md rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex-1 flex flex-col my-4 md:my-6 border"
          style={{
            background: '#05293f',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(5, 41, 63, 0.2)'
          }}
        >
          {/* 顶部矩形框 - 按钮主体色 */}
          <div 
            className="w-full h-2 sm:h-2.5 md:h-3"
            style={{
              background: '#56a1bf'
            }}
          />
          
          {/* 顶部：进度、题目和操作按钮 */}
          <div className="px-4 sm:px-5 md:px-6 pt-4 sm:pt-5 md:pt-6 pb-3 md:pb-4 flex-shrink-0">
            <div className="flex items-start justify-between gap-2 sm:gap-3 md:gap-4 mb-3 md:mb-4">
              {/* 左侧：题号显示 - 8/30 向下对齐，使用数字时钟字体样式 */}
              <div className="flex-shrink-0 flex items-end">
                {/* 当前题号 - 等宽字体，数字时钟样式 */}
                <div 
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-mono font-normal leading-none tracking-tight"
                  style={{ color: 'rgba(156, 163, 175, 0.6)' }}
                >
                  {currentQuestion}
                </div>
                {/* "/" 符号 - 等宽字体，数字时钟样式，与8之间保持间距 */}
                <div 
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-mono font-normal leading-none tracking-tight ml-0.5 md:ml-1"
                  style={{ color: 'rgba(156, 163, 175, 0.6)' }}
                >
                  /
                </div>
                {/* 总数 - 等宽字体，数字时钟样式，与/之间缩小间距 */}
                <div 
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-mono font-normal leading-none tracking-tight -ml-0.5"
                  style={{ color: 'rgba(156, 163, 175, 0.6)' }}
                >
                  {formattedTotal}
                </div>
              </div>
            </div>
            
            {/* 题目文本 */}
      <div>
              {/* 题目文本 - 深色半透明背景框 */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 md:p-8 lg:p-10 border border-white/10">
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white/87 leading-relaxed tracking-normal">
                  {q.question}
                </h2>
                {q.hint && (
                  <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-white/87 tracking-wide">{q.hint}</p>
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
                      ? "bg-gradient-to-r from-cyan-400/40 to-green-400/40 border-cyan-300/60 shadow-lg scale-[1.02] shadow-cyan-400/30"
                      : "bg-white/10 backdrop-blur-sm border-gray-300/20 hover:bg-white/15 hover:border-gray-400/30 hover:shadow-md"
                  )}
                  style={isSelected ? {
                    borderWidth: '1px',
                    borderStyle: 'solid',
                  } : {
                    borderWidth: '1px',
                    borderStyle: 'solid',
                  }}
                >
                  <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 relative">
                    {/* 左侧字母标识 */}
                    <div className={cn(
                      "absolute left-0 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm",
                      isSelected 
                        ? "bg-cyan-400/30 text-white/87 border-2 border-cyan-300/50" 
                        : "bg-white/10 text-white/87 border border-white/20"
                    )}>
                      {optionLetters[value - 1]}
                    </div>
                    
                    {/* 选项文字 - 居中 */}
                    <div className="text-center">
                      <div className="font-medium text-xs sm:text-sm md:text-base text-white/87">
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
                            className="text-white/87"
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
                className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm text-white/87 hover:text-white/87 px-2 sm:px-3 disabled:opacity-30"
              >
                {t("prev")}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onSkip}
                className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm text-white/87 hover:text-white/87 hover:bg-white/10 px-2 sm:px-3 border border-white/20"
              >
                {t("skip")}
              </Button>
        </div>
        {idx < total - 1 ? (
              <Button 
                className="h-11 sm:h-12 md:h-14 px-6 sm:px-8 md:px-10 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg font-semibold text-gray-900 border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 hover:opacity-90"
                style={{
                  background: '#20E0C0',
                }}
                size="lg"
                onClick={onNext}
              >
                {t("next")}
              </Button>
        ) : (
              <Button 
                className="h-11 sm:h-12 md:h-14 px-6 sm:px-8 md:px-10 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg font-semibold text-gray-900 border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 hover:opacity-90"
                style={{
                  background: '#20E0C0',
                }}
                size="lg"
                onClick={onSubmit}
              >
                {t("submit")}
              </Button>
        )}
          </div>

          {/* 底部矩形框 - 按钮主体色，比顶部更细 */}
          <div 
            className="w-full h-2 sm:h-2.5 md:h-3"
            style={{
              background: '#56a1bf'
            }}
          />
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


