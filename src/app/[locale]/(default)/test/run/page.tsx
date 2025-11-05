/**
 * 页面：测试运行（答题）
 * 作用：分页展示题目（每页5题）、Likert 选项、进度条与页面导航。
 */

"use client";

import React, { useEffect, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { TestProvider, useTestContext } from "@/contexts/test";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import type { LikertValue } from "@/components/ui/Likert";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

function RunInner() {
  const t = useTranslations("test.run");
  const t_labels = useTranslations("test.likert");
  const { resolvedTheme } = useTheme();
  const { bank, progress, init, answer, nextPage, prevPage, submit, loading } = useTestContext();
  const router = useRouter();
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const QUESTIONS_PER_PAGE = 5;
  
  const labels = [
    t_labels("very_strongly_disagree"), // 0
    t_labels("strongly_disagree"),      // 1
    t_labels("disagree"),               // 2
    t_labels("neutral"),                // 3
    t_labels("agree"),                  // 4
    t_labels("strongly_agree"),         // 5
  ];
  
  /**
   * 获取分类名称
   */
  const getCategoryName = (category: string): string => {
    const categoryMap: Record<string, string> = {
      "Dominance": "role_preferences",
      "Submission": "role_preferences",
      "Switch": "role_preferences",
      "Exploration": "exploration",
      "Bondage": "interests",
      "Voyeur": "interests",
      "Exhibitionist": "interests",
      "Vanilla": "boundaries",
      "Orientation": "orientation",
    };
    const key = categoryMap[category] || "interests";
    return t(`category.${key}`) || category;
  };

  /**
   * 计算当前页相关数据（必须在所有条件返回之前调用）
   */
  const pageData = useMemo(() => {
    if (!bank || !bank.questions || bank.questions.length === 0) {
      return {
        total: 0,
        totalPages: 0,
        currentPage: 0,
        startIdx: 0,
        endIdx: 0,
        currentPageQuestions: [],
        isCurrentPageComplete: false,
        isAllComplete: false,
      };
    }
    
    const total = bank.questions.length;
    const totalPages = Math.ceil(total / QUESTIONS_PER_PAGE);
    const currentPage = Math.floor(progress.currentIndex / QUESTIONS_PER_PAGE);
    const startIdx = currentPage * QUESTIONS_PER_PAGE;
    const endIdx = Math.min(startIdx + QUESTIONS_PER_PAGE, total);
    const currentPageQuestions = bank.questions.slice(startIdx, endIdx);
    
    // 检查当前页所有题目是否已回答或跳过（已回答或跳过都算完成）
    const isCurrentPageComplete = currentPageQuestions.every((q) => {
      const answer = progress.answers.find((a) => a.questionId === q.id);
      return answer && (answer.value !== undefined || answer.skipped);
    });
    
    // 检查是否所有题目都已完成（已回答或跳过都算完成）
    const isAllComplete = bank.questions.every((q) => {
      const answer = progress.answers.find((a) => a.questionId === q.id);
      return answer && (answer.value !== undefined || answer.skipped);
    });
    
    return {
      total,
      totalPages,
      currentPage,
      startIdx,
      endIdx,
      currentPageQuestions,
      isCurrentPageComplete,
      isAllComplete,
    };
  }, [bank, progress.currentIndex, progress.answers, QUESTIONS_PER_PAGE]);

  useEffect(() => {
    void init(locale);
  }, [init, locale]);

  // 解构 pageData（必须在所有 Hooks 调用之后，但在条件返回之前）
  const { total, totalPages, currentPage, startIdx, endIdx, currentPageQuestions, isCurrentPageComplete, isAllComplete } = pageData;

  /**
   * 监听当前页完成状态，自动跳转到下一页
   * 当用户答完当前页的5道题后，延迟500ms自动跳转
   * 注意：必须在所有条件返回之前调用
   */
  useEffect(() => {
    // 如果当前页已完成，且不是最后一页，则自动跳转
    if (isCurrentPageComplete && currentPage < totalPages - 1 && totalPages > 0) {
      const timer = setTimeout(() => {
        nextPage();
      }, 500); // 延迟500ms，让用户看到答案被保存

      return () => clearTimeout(timer);
    }
  }, [isCurrentPageComplete, currentPage, totalPages, nextPage]);

  // 条件返回必须在所有 Hooks 之后
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

  /**
   * 回答某题
   */
  const onSet = (questionId: number, value: number) => {
    answer(questionId, value);
  };

  /**
   * 提交测试
   */
  const onSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      console.log("开始提交测试...");
      await submit();
      console.log("测试提交成功，准备跳转...");
      await router.push("/test/result");
      console.log("跳转命令已执行");
    } catch (error) {
      console.error("提交测试失败:", error);
      try {
        await router.push("/test/result");
      } catch (navError) {
        console.error("跳转失败，尝试使用 window.location:", navError);
        window.location.href = `/${locale}/test/result`;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 下一页
   */
  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      nextPage();
    }
  };

  /**
   * 上一页
   */
  const handlePrevPage = () => {
    if (currentPage > 0) {
      prevPage();
    }
  };

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F']; // 0-5对应A-F
  const currentPageNum = currentPage + 1;
  const formattedTotalPages = String(totalPages).padStart(2, '0');
  const answeredCount = progress.answers.filter((a) => a.value !== undefined).length;
  const progressPercentage = total > 0 ? (answeredCount / total) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden transition-colors duration-200">
      {/* 背景 */}
      <div 
        className="absolute inset-0 dark:bg-[#2b333e] transition-colors duration-200"
        style={{
          background: resolvedTheme === "dark" 
            ? "#2b333e" 
            : "linear-gradient(to bottom, rgba(32, 224, 192, 0.5) 0%, rgba(255, 255, 255, 1) 100%)"
        }}
      />
      
      <div className="relative z-10 w-full px-6 sm:px-8 md:px-12 lg:px-16 flex-1 flex flex-col items-center justify-center pt-16 sm:pt-20 md:pt-24">
        <div className="w-full max-w-4xl flex-1 flex flex-col my-6 md:my-8 relative">
          {/* 背景框 - 白色50%透明度 */}
          <div 
            className="absolute inset-0 rounded-2xl md:rounded-3xl -z-10"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.5)'
            }}
          />
          
          {/* 顶部：进度条和页面导航 */}
          <div className="pt-8 sm:pt-10 md:pt-12 pb-4 sm:pb-5 md:pb-6 flex-shrink-0 relative">
            {/* 页面导航按钮 */}
            <div className="absolute top-4 right-4 sm:top-5 sm:right-5 md:top-6 md:right-6 flex items-center gap-2 sm:gap-2.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevPage}
                disabled={currentPage <= 0}
                className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 disabled:opacity-30"
                style={{
                  color: 'rgba(32, 224, 192, 0.87)'
                }}
                title={t("prev_page")}
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages - 1}
                className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 disabled:opacity-30"
                style={{
                  color: 'rgba(32, 224, 192, 0.87)'
                }}
                title={t("next_page")}
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:h-5" />
              </Button>
            </div>

            {/* 进度信息 */}
            <div className="mb-4 sm:mb-5 md:mb-6 px-4 sm:px-6 md:px-8 lg:px-10 mt-2 sm:mt-3 md:mt-4">
              {/* 页面信息 */}
              <div className="mb-2 sm:mb-2.5 md:mb-3">
                <span 
                  className="text-sm sm:text-base md:text-lg font-medium"
                  style={{
                    color: 'rgba(32, 224, 192, 0.87)'
                  }}
                >
                  {t("page")}
                </span>
                <span className="text-xs sm:text-sm md:text-base font-medium ml-1">
                  <span style={{ color: 'rgba(32, 224, 192, 0.87)' }}>{currentPageNum}</span>
                  <span style={{ color: 'rgba(32, 224, 192, 0.87)' }}> {t("of")} </span>
                  <span style={{ color: 'rgba(32, 224, 192, 0.6)' }}>{formattedTotalPages}</span>
                </span>
                <span className="text-xs sm:text-sm md:text-base font-medium ml-2 text-muted-foreground">
                  ({answeredCount} / {total})
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
                    width: `${progressPercentage}%`,
                    backgroundColor: 'rgba(32, 224, 192, 0.87)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* 题目列表 */}
          <div className="flex-1 min-h-0 flex flex-col px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 space-y-4 sm:space-y-6 -mt-2 sm:-mt-3 md:-mt-4">
            {currentPageQuestions.map((q, questionIndex) => {
              const a = progress.answers.find((x) => x.questionId === q.id);
              const globalIndex = startIdx + questionIndex;
              
              return (
                <div key={q.id} className="space-y-3">
                  {/* 题目文本 */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 
                      className="flex-1 text-base sm:text-lg md:text-xl lg:text-2xl font-semibold leading-relaxed tracking-normal"
                      style={{
                        color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.87)" : "rgba(0, 0, 0, 0.87)"
                      }}
                    >
                      <span className="text-sm sm:text-base font-medium mr-2" style={{ color: 'rgba(32, 224, 192, 0.7)' }}>
                        {globalIndex + 1}.
                      </span>
                      {q.question}
                    </h3>
                  </div>
                  {q.hint && (
                    <p className="mt-2 text-xs sm:text-sm text-muted-foreground">{q.hint}</p>
                  )}

                  {/* 选项列表 - 一行显示（0-5 Likert量表） */}
                  <div className="flex flex-row gap-2 sm:gap-2.5 md:gap-3">
                    {[0, 1, 2, 3, 4, 5].map((value) => {
                      const isSelected = (a?.value as number) === value;
                      
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => onSet(q.id, value as LikertValue)}
                          className={cn(
                            "flex-1 px-2 sm:px-3 md:px-4 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl transition-all duration-200 relative backdrop-blur-sm",
                            isSelected
                              ? "shadow-lg shadow-cyan-400/30"
                              : "hover:shadow-md"
                          )}
                          style={{
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: isSelected ? 'rgba(32, 224, 192, 0.8)' : 'rgba(32, 224, 192, 0.5)',
                            backgroundColor: isSelected ? 'rgba(32, 224, 192, 0.3)' : 'rgba(255, 255, 255, 0.6)'
                          }}
                        >
                          <div className="flex flex-col items-center justify-center gap-1 sm:gap-1.5 relative">
                            {/* 字母标识 - 无圆圈 */}
                            <div 
                              className="font-bold text-sm sm:text-base md:text-lg"
                              style={{
                                color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.87)" : "rgba(0, 0, 0, 0.87)"
                              }}
                            >
                              {optionLetters[value]}
                            </div>
                            
                            {/* 选项文字 */}
                            <div 
                              className="font-medium text-xs sm:text-sm text-center"
                              style={{
                                color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.87)" : "rgba(0, 0, 0, 0.6)"
                              }}
                            >
                              {labels[value]}
                            </div>
                            
                            {/* 选中图标 */}
                            {isSelected && (
                              <div className="absolute top-0 right-0 flex-shrink-0">
                                <svg width="12" height="12" className="sm:w-4 sm:h-4 md:w-5 md:h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path 
                                    d="M16.667 5L7.5 14.167 3.333 10" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    style={{
                                      color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.87)" : "rgba(32, 224, 192, 0.87)"
                                    }}
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
              );
            })}

            {/* 底部提交按钮 */}
            {currentPage === totalPages - 1 && (
              <div className="pt-4 border-t mt-4">
                <Button
                  onClick={onSubmit}
                  disabled={isSubmitting}
                  className="w-full h-12 text-base font-semibold"
                  style={{
                    backgroundColor: 'rgba(32, 224, 192, 0.87)',
                    color: 'white'
                  }}
                >
                  {isSubmitting ? "提交中..." : t("submit")}
                </Button>
              </div>
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
