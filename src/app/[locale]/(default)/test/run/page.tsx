/**
 * 页面：测试运行（答题）
 * 作用：展示题目、Likert 选项、进度条与跳过/前后控制。
 */

"use client";

import React, { useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { TestProvider, useTestContext } from "@/contexts/test";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import type { LikertValue } from "@/components/ui/Likert";
import { cn } from "@/lib/utils";
import { ChevronLeft, SkipForward, ChevronRight } from "lucide-react";

function RunInner() {
  const t = useTranslations("test.run");
  const t_labels = useTranslations("test.likert");
  const { resolvedTheme } = useTheme();
  const { bank, progress, init, answer, skip, next, prev, submit, loading } = useTestContext();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const questionRef = React.useRef<HTMLHeadingElement>(null);
  
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

  /**
   * 根据主题动态设置题目颜色
   */
  useEffect(() => {
    if (questionRef.current) {
      if (resolvedTheme === "dark") {
        questionRef.current.style.color = "rgba(255, 255, 255, 0.87)";
      } else {
        questionRef.current.style.color = "rgba(0, 0, 0, 0.87)";
      }
    }
  }, [resolvedTheme]);

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

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const onSubmit = async () => {
    if (isSubmitting) return; // 防止重复提交
    setIsSubmitting(true);
    try {
      console.log("开始提交测试...");
      await submit();
      console.log("测试提交成功，准备跳转...");
      // 确保提交成功后跳转
      await router.push("/test/result");
      console.log("跳转命令已执行");
    } catch (error) {
      console.error("提交测试失败:", error);
      // 即使提交失败，也尝试跳转到结果页（可能已经有结果了）
      try {
        await router.push("/test/result");
      } catch (navError) {
        console.error("跳转失败，尝试使用 window.location:", navError);
        // 备选方案：直接使用 window.location
        window.location.href = `/${locale}/test/result`;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const optionLetters = ['A', 'B', 'C', 'D', 'E'];
  const currentQuestion = idx + 1;
  const formattedTotal = String(total).padStart(2, '0'); // 格式化为带前导零，如 08

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden transition-colors duration-200">
      {/* 白天模式线性渐变背景（50%青色到白色，从上到下），夜晚模式深灰色背景 */}
      <div 
        className="absolute inset-0 dark:bg-[#2b333e] transition-colors duration-200"
        style={{
          background: resolvedTheme === "dark" 
            ? "#2b333e" 
            : "linear-gradient(to bottom, rgba(32, 224, 192, 0.5) 0%, rgba(255, 255, 255, 1) 100%)"
        }}
      />
      
      <div className="relative z-10 w-full px-6 sm:px-8 md:px-12 lg:px-16 flex-1 flex flex-col items-center justify-center pt-16 sm:pt-20 md:pt-24">
        <div className="w-full max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl backdrop-blur-md rounded-2xl md:rounded-3xl overflow-visible flex-1 flex flex-col my-6 md:my-8 relative"
          style={{
            boxShadow: 'none'
          }}
        >
          {/* 顶部：进度、题目和操作按钮 */}
          <div className="pt-12 sm:pt-14 md:pt-16 pb-3 md:pb-4 flex-shrink-0 rounded-t-2xl md:rounded-t-3xl relative"
            style={{
              background: 'rgba(255, 255, 255, 0.6)'
            }}
          >
            {/* 右上角操作图标 */}
            <div className="absolute top-4 right-4 sm:top-5 sm:right-5 md:top-6 md:right-6 flex items-center gap-2 sm:gap-2.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={onPrev}
                disabled={idx <= 0}
                className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 disabled:opacity-30"
                style={{
                  color: 'rgba(32, 224, 192, 0.87)'
                }}
                title={t("prev")}
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSkip}
                className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
                style={{
                  color: 'rgba(32, 224, 192, 0.87)'
                }}
                title={t("skip")}
              >
                <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={idx < total - 1 ? onNext : onSubmit}
                disabled={isSubmitting}
                className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 disabled:opacity-50"
                style={{
                  color: 'rgba(32, 224, 192, 0.87)'
                }}
                title={idx < total - 1 ? t("next") : (isSubmitting ? "提交中..." : t("submit"))}
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
            {/* 答题进度条 */}
            <div className="mb-4 sm:mb-5 md:mb-6 px-4 sm:px-6 md:px-8 lg:px-10 mt-2 sm:mt-3 md:mt-4">
              {/* 进度文本 */}
              <div className="mb-2 sm:mb-2.5 md:mb-3">
                <span 
                  className="text-sm sm:text-base md:text-lg font-medium"
                  style={{
                    color: 'rgba(32, 224, 192, 0.87)'
                  }}
                >
                  问题
                </span>
                <span className="text-xs sm:text-sm md:text-base font-medium ml-1">
                  <span style={{ color: 'rgba(32, 224, 192, 0.87)' }}>{currentQuestion}</span>
                  <span style={{ color: 'rgba(32, 224, 192, 0.87)' }}>/</span>
                  <span style={{ color: 'rgba(32, 224, 192, 0.6)' }}>{formattedTotal}</span>
                </span>
              </div>
              {/* 进度条 */}
              <div 
                className="w-full h-1 sm:h-1.5 md:h-2 rounded-full overflow-hidden"
                style={{
                  backgroundColor: resolvedTheme === "dark" ? "rgba(156, 163, 175, 0.3)" : "rgba(156, 163, 175, 0.3)"
                }}
              >
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(currentQuestion / total) * 100}%`,
                    backgroundColor: 'rgba(32, 224, 192, 0.87)'
                  }}
                />
              </div>
            </div>
            
            {/* 题目文本 */}
      <div className="relative -mt-2 sm:-mt-3 md:-mt-4">
              {/* 题目文本 - 透明背景，无边框 */}
              <div className="rounded-xl p-4 sm:p-6 md:p-8 lg:p-10">
                <h2 
                  ref={questionRef}
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold leading-relaxed tracking-normal"
                >
                  {q.question}
                </h2>
                {q.hint && (
                  <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-white/87 tracking-wide">{q.hint}</p>
                )}
              </div>
            </div>
          </div>

          {/* 选项列表 - 文字居中显示 */}
          <div className="flex-1 min-h-0 flex flex-col px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 space-y-2 sm:space-y-3 rounded-b-2xl md:rounded-b-3xl -mt-2 sm:-mt-3 md:-mt-4"
            style={{
              background: 'rgba(255, 255, 255, 0.6)'
            }}
          >
            {[1, 2, 3, 4, 5].map((value) => {
              const isSelected = (a?.value as number) === value;
              
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onSet(value as LikertValue)}
                  className={cn(
                    "w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl transition-all duration-200 relative backdrop-blur-sm",
                    isSelected
                      ? "shadow-lg shadow-cyan-400/30"
                      : "hover:shadow-md"
                  )}
                  style={{
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'rgba(32, 224, 192, 0.5)',
                    backgroundColor: isSelected ? 'rgba(32, 224, 192, 0.3)' : 'rgba(255, 255, 255, 0.6)'
                  }}
                >
                  <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 relative">
                    {/* 左侧字母标识 */}
                    <div 
                      className={cn(
                        "absolute left-0 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm",
                        isSelected 
                          ? "bg-transparent border-2" 
                          : "bg-transparent border"
                      )}
                      style={{
                        color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.87)" : "rgba(0, 0, 0, 0.6)",
                        borderColor: "rgba(32, 224, 192, 0.5)"
                      }}
                    >
                      {optionLetters[value - 1]}
                    </div>
                    
                    {/* 选项文字 - 居中 */}
                    <div className="text-center">
                      <div 
                        className="font-medium text-xs sm:text-sm md:text-base"
                        style={{
                          color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.87)" : "rgba(0, 0, 0, 0.6)"
                        }}
                      >
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


