/**
 * 页面：测试运行（答题）
 * 作用：分页展示题目（每页5题）、Likert 选项、进度条与页面导航。
 */

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { TestProvider, useTestContext } from "@/contexts/test";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import type { LikertValue } from "@/components/ui/Likert";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, AlertCircle, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TestSlogan from "@/components/ui/TestSlogan";

function RunInner() {
  const t = useTranslations("test.run");
  const t_labels = useTranslations("test.likert");
  const { resolvedTheme } = useTheme();
  const { bank, progress, init, answer, nextPage, prevPage, jumpToFirstUnanswered, jumpToNextUnanswered, submit, loading } = useTestContext();
  const router = useRouter();
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIncompleteDialog, setShowIncompleteDialog] = useState(false);
  const [autoAnswerMode, setAutoAnswerMode] = useState(false); // 自动答题模式：答完一题后自动跳转到下一未答题
  const [lastAnsweredQuestionId, setLastAnsweredQuestionId] = useState<number | null>(null); // 记录最后答完的题目ID
  
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

  /**
   * 自动答题模式：监听答案变化和最后答完的题目，答完一题后自动跳转到下一个未答题
   */
  useEffect(() => {
    if (!autoAnswerMode || !bank || !bank.questions || lastAnsweredQuestionId === null) return;
    
    // 延迟检查，确保答案已保存到状态
    const timer = setTimeout(() => {
      if (!bank || !bank.questions) return;
      
      // 检查当前页是否还有未答题（排除刚答完的题目）
      const currentPageHasUnanswered = currentPageQuestions.some((q) => {
        // 跳过刚答完的题目
        if (q.id === lastAnsweredQuestionId) {
          return false;
        }
        const a = progress.answers.find((a) => a.questionId === q.id);
        return !a || (a.value === undefined && !a.skipped);
      });
      
      // 如果当前页还有未答题，不跳转，等待用户继续答题
      if (currentPageHasUnanswered) {
        return;
      }
      
      // 当前页已全部答完，跳转到下一个未答题所在的页面
      const currentPageEndIndex = Math.min(startIdx + QUESTIONS_PER_PAGE, bank.questions.length);
      const nextUnansweredIndex = bank.questions.findIndex((q, idx) => {
        if (idx < currentPageEndIndex) return false; // 跳过当前页及之前的题目
        const a = progress.answers.find((a) => a.questionId === q.id);
        return !a || (a.value === undefined && !a.skipped);
      });
      
      if (nextUnansweredIndex >= 0) {
        // 找到下一个未答题，跳转到该题所在的页面
        jumpToNextUnanswered(currentPageEndIndex - 1);
        // 重置最后答完的题目ID，避免重复触发
        setLastAnsweredQuestionId(null);
      } else {
        // 所有题目都已答完，退出自动答题模式
        setAutoAnswerMode(false);
        setLastAnsweredQuestionId(null);
      }
    }, 300); // 延迟300ms，确保答案已保存到状态
    
    return () => clearTimeout(timer);
  }, [autoAnswerMode, lastAnsweredQuestionId, progress.answers, currentPageQuestions, bank, startIdx, QUESTIONS_PER_PAGE, jumpToNextUnanswered]);

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
   * 在自动答题模式下，记录答完的题目ID，触发自动跳转逻辑
   */
  const onSet = (questionId: number, value: number) => {
    answer(questionId, value);
    // 记录最后答完的题目ID，用于触发自动跳转检查
    if (autoAnswerMode) {
      setLastAnsweredQuestionId(questionId);
    }
  };

  /**
   * 实际提交测试（不检查完成度）
   */
  const doSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      console.log("开始提交测试...");
      await submit();
      console.log("测试提交成功，准备跳转...");
      // 使用国际化路由，会自动添加 locale
      await router.push("/test/result");
      console.log("跳转命令已执行");
    } catch (error) {
      console.error("提交测试失败:", error);
      // 即使提交失败，也尝试跳转到结果页（可能已经有结果）
      try {
        await router.push("/test/result");
      } catch (navError) {
        console.error("跳转失败，尝试使用 window.location:", navError);
        // 使用 window.location 作为后备方案
        window.location.href = `/${locale}/test/result`;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 提交测试
   * 如果未完成所有题目，显示提示对话框
   */
  const onSubmit = async () => {
    if (isSubmitting) return;
    
    // 检查完成度
    const completionPercentage = Math.round(progressPercentage);
    
    // 如果未完成所有题目，显示提示对话框
    if (!isAllComplete && completionPercentage < 100) {
      setShowIncompleteDialog(true);
      return;
    }
    
    // 如果已完成所有题目，直接提交
    await doSubmit();
  };

  /**
   * 处理返回继续答题（关闭对话框，跳转到第一个未答题的题目，并启用自动答题模式）
   */
  const handleContinueAnswering = () => {
    setShowIncompleteDialog(false);
    // 启用自动答题模式
    setAutoAnswerMode(true);
    // 跳转到第一个未答题的题目
    jumpToFirstUnanswered();
  };

  /**
   * 处理继续查看结果（提交并查看结果）
   */
  const handleViewResultAnyway = async () => {
    setShowIncompleteDialog(false);
    await doSubmit();
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
  const skippedCount = progress.answers.filter((a) => a.skipped === true).length;
  const completedCount = answeredCount + skippedCount; // 已完成（已回答或跳过）的题目数
  const remainingCount = total - completedCount; // 剩余未答题数
  const progressPercentage = total > 0 ? (completedCount / total) * 100 : 0;
  const progressPercentageDisplay = Math.round(progressPercentage); // 显示用的百分比（四舍五入）

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden transition-colors duration-200">
      {/* 背景 - 多层渐变和装饰 */}
      <div 
        className="absolute inset-0 dark:bg-[#2b333e] transition-colors duration-200"
        style={{
          background: resolvedTheme === "dark" 
            ? "radial-gradient(ellipse at top, #3a4550 0%, #2b333e 50%, #1f2630 100%)" 
            : "radial-gradient(ellipse at top, rgba(32, 224, 192, 0.15) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(240, 253, 250, 0.9) 100%)"
        }}
      />
      
      {/* 装饰性背景图案 */}
      <div 
        className="absolute inset-0 opacity-30 dark:opacity-10"
        style={{
          backgroundImage: resolvedTheme === "dark"
            ? "radial-gradient(circle at 20% 50%, rgba(32, 224, 192, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(32, 224, 192, 0.1) 0%, transparent 50%)"
            : "radial-gradient(circle at 20% 50%, rgba(32, 224, 192, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(32, 224, 192, 0.08) 0%, transparent 50%)"
        }}
      />
      
      <div className="relative z-10 w-full px-6 sm:px-8 md:px-12 lg:px-16 flex-1 flex flex-col items-center justify-center pt-6 sm:pt-10 md:pt-14">
        <div className="w-full max-w-4xl flex-1 flex flex-col my-3 md:my-5 relative min-h-[850px] sm:min-h-[950px] md:min-h-[1050px]">
          {/* 背景框 - 玻璃态效果 */}
          <div 
            className="absolute inset-0 rounded-3xl md:rounded-[2rem] -z-10 backdrop-blur-xl"
            style={{
              background: resolvedTheme === "dark"
                ? "rgba(43, 51, 62, 0.8)"
                : "rgba(255, 255, 255, 0.85)",
              boxShadow: resolvedTheme === "dark"
                ? "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)"
                : "0 20px 60px rgba(32, 224, 192, 0.15), 0 8px 32px rgba(32, 224, 192, 0.1), 0 0 0 1px rgba(32, 224, 192, 0.1)"
            }}
          />
          
          {/* 顶部：进度条和页面导航 */}
          <div className="pt-5 sm:pt-7 md:pt-9 pb-4 sm:pb-5 md:pb-6 flex-shrink-0 relative">
            {/* 页面导航按钮 - 美化版 */}
            <div className="absolute top-2 right-4 sm:top-4 sm:right-5 md:top-6 md:right-6 flex items-center gap-2 sm:gap-2.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevPage}
                disabled={currentPage <= 0}
                className="h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 disabled:opacity-30 rounded-full transition-all duration-200 hover:scale-110"
                style={{
                  color: resolvedTheme === "dark" 
                    ? 'rgba(32, 224, 192, 0.87)' 
                    : 'rgba(32, 224, 192, 0.9)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  boxShadow: 'none'
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
                className="h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 disabled:opacity-30 rounded-full transition-all duration-200 hover:scale-110"
                style={{
                  color: resolvedTheme === "dark" 
                    ? 'rgba(32, 224, 192, 0.87)' 
                    : 'rgba(32, 224, 192, 0.9)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  boxShadow: 'none'
                }}
                title={t("next_page")}
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:h-5" />
              </Button>
            </div>

            {/* 进度信息 - 优化版 */}
            <div className="mb-4 sm:mb-5 md:mb-6 px-4 sm:px-6 md:px-8 lg:px-10 mt-8 sm:mt-10 md:mt-12">
              {/* 进度信息头部 - 显示页面和完成情况 */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3">
                {/* 左侧：页面信息 */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <span 
                    className="text-sm sm:text-base md:text-lg font-medium"
                    style={{
                      color: 'rgba(32, 224, 192, 0.87)'
                    }}
                  >
                    {t("page")}
                  </span>
                  <span className="text-xs sm:text-sm md:text-base font-medium">
                    <span style={{ color: 'rgba(32, 224, 192, 0.87)' }}>{currentPageNum}</span>
                    <span style={{ color: 'rgba(32, 224, 192, 0.6)' }}> / {formattedTotalPages}</span>
                  </span>
                </div>
                
                {/* 右侧：答题进度信息 */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* 完成进度 */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span 
                      className="text-sm sm:text-base md:text-lg font-bold"
                      style={{
                        color: 'rgba(32, 224, 192, 0.95)'
                      }}
                    >
                      {completedCount}
                    </span>
                    <span className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground">
                      / {total}
                    </span>
                    <span 
                      className="text-xs sm:text-sm font-medium px-2 py-0.5 rounded-full"
                      style={{
                        color: 'rgba(32, 224, 192, 0.9)',
                        backgroundColor: resolvedTheme === "dark" ? "rgba(32, 224, 192, 0.15)" : "rgba(32, 224, 192, 0.1)"
                      }}
                    >
                      {progressPercentageDisplay}%
                    </span>
                  </div>
                  
                  {/* 剩余题目数 */}
                  {remainingCount > 0 && (
                    <span 
                      className="text-xs sm:text-sm font-medium"
                      style={{
                        color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)"
                      }}
                    >
                      {t("remaining")}: {remainingCount}
                    </span>
                  )}
                </div>
              </div>
              
              {/* 进度条 - 美化版 */}
              <div 
                className="w-full h-2.5 sm:h-3 md:h-3.5 rounded-full overflow-hidden relative"
                style={{
                  backgroundColor: resolvedTheme === "dark" ? "rgba(156, 163, 175, 0.2)" : "rgba(200, 230, 230, 0.5)",
                  boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.1)"
                }}
              >
                <div 
                  className="h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                  style={{
                    width: `${progressPercentage}%`,
                    background: progressPercentage === 100
                      ? "linear-gradient(90deg, rgba(34, 197, 94, 0.9) 0%, rgba(34, 197, 94, 1) 50%, rgba(22, 163, 74, 0.9) 100%)"
                      : "linear-gradient(90deg, rgba(32, 224, 192, 0.9) 0%, rgba(32, 224, 192, 1) 50%, rgba(20, 184, 166, 0.9) 100%)",
                    boxShadow: progressPercentage === 100
                      ? "0 2px 8px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
                      : "0 2px 8px rgba(32, 224, 192, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
                  }}
                >
                  {/* 进度条光泽效果 */}
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 动态标语 - 显示在进度条下方 */}
            <TestSlogan pageIndex={currentPage} updateInterval={600000} />
          </div>

          {/* 题目列表 */}
          <div className="flex-1 min-h-0 flex flex-col px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 space-y-4 sm:space-y-6 -mt-2 sm:-mt-3 md:-mt-4">
            {currentPageQuestions.map((q, questionIndex) => {
              const a = progress.answers.find((x) => x.questionId === q.id);
              const globalIndex = startIdx + questionIndex;
              
              return (
                <div key={q.id} className="space-y-3 p-4 sm:p-5 rounded-2xl transition-all duration-300 hover:shadow-lg"
                  style={{
                    background: resolvedTheme === "dark" 
                      ? "rgba(255, 255, 255, 0.02)" 
                      : "rgba(255, 255, 255, 0.4)",
                    border: `1px solid ${resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(32, 224, 192, 0.1)"}`,
                    boxShadow: resolvedTheme === "dark"
                      ? "0 2px 8px rgba(0, 0, 0, 0.2)"
                      : "0 2px 12px rgba(32, 224, 192, 0.08)"
                  }}
                >
                  {/* 题目文本 */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 
                      className="flex-1 text-base sm:text-lg md:text-xl lg:text-2xl font-semibold leading-relaxed tracking-normal"
                      style={{
                        color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.85)"
                      }}
                    >
                      <span 
                        className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-xs sm:text-sm md:text-base font-bold mr-3 rounded-full"
                        style={{ 
                          color: 'white',
                          background: "linear-gradient(135deg, rgba(32, 224, 192, 0.9) 0%, rgba(20, 184, 166, 0.9) 100%)",
                          boxShadow: "0 2px 6px rgba(32, 224, 192, 0.3)"
                        }}
                      >
                        {globalIndex + 1}
                      </span>
                      {q.question}
                    </h3>
                  </div>
                  {q.hint && (
                    <p className="mt-2 text-xs sm:text-sm text-muted-foreground pl-9 sm:pl-10 md:pl-11">{q.hint}</p>
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
                            "flex-1 px-2 sm:px-3 md:px-4 py-2.5 sm:py-3 md:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 relative backdrop-blur-sm",
                            isSelected
                              ? "shadow-lg shadow-cyan-400/40 scale-105"
                              : "hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5"
                          )}
                          style={{
                            borderWidth: '2px',
                            borderStyle: 'solid',
                            borderColor: isSelected 
                              ? 'rgba(32, 224, 192, 1)' 
                              : resolvedTheme === "dark" 
                                ? 'rgba(255, 255, 255, 0.1)' 
                                : 'rgba(32, 224, 192, 0.3)',
                            background: isSelected
                              ? "linear-gradient(135deg, rgba(32, 224, 192, 0.95) 0%, rgba(20, 184, 166, 0.95) 100%)"
                              : resolvedTheme === "dark"
                                ? "rgba(255, 255, 255, 0.05)"
                                : "rgba(255, 255, 255, 0.7)",
                            boxShadow: isSelected
                              ? "0 4px 16px rgba(32, 224, 192, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                              : "0 2px 8px rgba(0, 0, 0, 0.05)"
                          }}
                        >
                          <div className="flex flex-col items-center justify-center gap-1 sm:gap-1.5 relative">
                            {/* 字母标识 - 美化版 */}
                            <div 
                              className={cn(
                                "font-bold text-sm sm:text-base md:text-lg transition-all duration-300",
                                isSelected && "scale-110"
                              )}
                              style={{
                                color: isSelected 
                                  ? "white" 
                                  : resolvedTheme === "dark" 
                                    ? "rgba(255, 255, 255, 0.9)" 
                                    : "rgba(0, 0, 0, 0.75)"
                              }}
                            >
                              {optionLetters[value]}
                            </div>
                            
                            {/* 选项文字 */}
                            <div 
                              className="font-medium text-xs sm:text-sm text-center leading-tight"
                              style={{
                                color: isSelected 
                                  ? "rgba(255, 255, 255, 0.95)" 
                                  : resolvedTheme === "dark" 
                                    ? "rgba(255, 255, 255, 0.7)" 
                                    : "rgba(0, 0, 0, 0.65)"
                              }}
                            >
                              {labels[value]}
                            </div>
                            
                            {/* 选中图标 - 美化版 */}
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 flex-shrink-0 animate-in zoom-in duration-300">
                                <div 
                                  className="rounded-full p-1"
                                  style={{
                                    background: "rgba(255, 255, 255, 0.9)",
                                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)"
                                  }}
                                >
                                  <svg width="14" height="14" className="sm:w-4 sm:h-4 md:w-5 md:h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path 
                                      d="M16.667 5L7.5 14.167 3.333 10" 
                                      stroke="rgba(32, 224, 192, 1)" 
                                      strokeWidth="2.5" 
                                      strokeLinecap="round" 
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </div>
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

            {/* 底部提交按钮 - 美化版 */}
            {currentPage === totalPages - 1 && (
              <div className="pt-6 border-t mt-6 space-y-3" 
                style={{
                  borderColor: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(32, 224, 192, 0.2)"
                }}
              >
                {/* 返回继续答题按钮 - 当有未答题时显示在提交按钮上方 */}
                {!isAllComplete && (
                  <Button
                    onClick={handleContinueAnswering}
                    className="w-full h-12 text-base font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                    style={{
                      background: "linear-gradient(135deg, rgba(32, 224, 192, 0.95) 0%, rgba(20, 184, 166, 0.95) 100%)",
                      color: 'white',
                      boxShadow: "0 4px 16px rgba(32, 224, 192, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                    }}
                  >
                    {t("go_to_unanswered")}
                  </Button>
                )}
                <Button
                  onClick={onSubmit}
                  disabled={isSubmitting}
                  variant="outline"
                  className="w-full h-12 text-base font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg backdrop-blur-sm"
                  style={{
                    borderWidth: '2px',
                    borderColor: 'rgba(32, 224, 192, 0.5)',
                    color: 'rgba(32, 224, 192, 0.9)',
                    background: resolvedTheme === "dark" 
                      ? "rgba(255, 255, 255, 0.05)" 
                      : "rgba(255, 255, 255, 0.8)",
                    boxShadow: "0 2px 8px rgba(32, 224, 192, 0.15)"
                  }}
                >
                  {isSubmitting ? "提交中..." : t("submit")}
                </Button>
              </div>
            )}

            {/* 未完成提示对话框 */}
            <Dialog open={showIncompleteDialog} onOpenChange={setShowIncompleteDialog}>
              <DialogContent 
                className="sm:max-w-md min-h-[320px] sm:min-h-[340px] p-6 sm:p-8 relative overflow-hidden"
                style={{
                  background: resolvedTheme === "dark"
                    ? "linear-gradient(135deg, rgba(43, 51, 62, 0.98) 0%, rgba(35, 42, 52, 0.98) 100%)"
                    : "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)",
                  border: resolvedTheme === "dark"
                    ? "1px solid rgba(32, 224, 192, 0.3)"
                    : "1px solid rgba(32, 224, 192, 0.4)",
                  boxShadow: resolvedTheme === "dark"
                    ? "0 25px 70px rgba(0, 0, 0, 0.6), 0 0 50px rgba(32, 224, 192, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
                    : "0 25px 70px rgba(32, 224, 192, 0.2), 0 10px 40px rgba(32, 224, 192, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)"
                }}
              >
                {/* 装饰性背景光晕 */}
                <div 
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30 -z-0"
                  style={{
                    background: "radial-gradient(circle, rgba(32, 224, 192, 0.4) 0%, transparent 70%)"
                  }}
                />
                
                <DialogHeader className="space-y-4 relative z-10">
                  {/* 标题区域 - 带图标 */}
                  <div className="flex items-center gap-3">
                    <div 
                      className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0"
                      style={{
                        background: "linear-gradient(135deg, rgba(32, 224, 192, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)",
                        border: "1px solid rgba(32, 224, 192, 0.3)"
                      }}
                    >
                      <AlertCircle 
                        className="w-5 h-5"
                        style={{
                          color: "rgba(32, 224, 192, 0.9)"
                        }}
                      />
                    </div>
                    <DialogTitle 
                      className="text-xl sm:text-2xl font-bold flex-1"
                      style={{
                        color: resolvedTheme === "dark" 
                          ? "rgba(32, 224, 192, 0.95)" 
                          : "rgba(32, 224, 192, 0.9)"
                      }}
                    >
                      {t("incomplete_dialog_title")}
                    </DialogTitle>
                  </div>
                  
                  {/* 描述文本 - 带装饰 */}
                  <DialogDescription 
                    className="whitespace-pre-line mt-6 leading-relaxed text-base sm:text-lg relative pl-4"
                    style={{
                      color: resolvedTheme === "dark" 
                        ? "rgba(255, 255, 255, 0.85)" 
                        : "rgba(0, 0, 0, 0.75)"
                    }}
                  >
                    {/* 左侧装饰线 */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-full"
                      style={{
                        background: "linear-gradient(180deg, rgba(32, 224, 192, 0.6) 0%, rgba(32, 224, 192, 0.3) 100%)"
                      }}
                    />
                    {t("incomplete_dialog_message", { percentage: Math.round(progressPercentage) })}
                  </DialogDescription>
                </DialogHeader>
                
                <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-4 mt-10 sm:mt-12 relative z-10">
                  {/* 返回继续答题按钮 - 明显，默认焦点 */}
                  <Button
                    onClick={handleContinueAnswering}
                    className="w-full sm:w-auto sm:mr-2 h-12 text-base font-semibold order-2 sm:order-1 rounded-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group"
                    style={{
                      background: "linear-gradient(135deg, rgba(32, 224, 192, 0.95) 0%, rgba(20, 184, 166, 0.95) 100%)",
                      color: 'white',
                      boxShadow: '0 4px 20px rgba(32, 224, 192, 0.5), 0 2px 10px rgba(32, 224, 192, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                      border: 'none'
                    }}
                    autoFocus
                  >
                    {/* 按钮内部光效 */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%)"
                      }}
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {t("continue_answer")}
                    </span>
                  </Button>
                  {/* 继续查看结果按钮 - 不显眼，但可用 */}
                  <Button
                    onClick={handleViewResultAnyway}
                    variant="ghost"
                    className="w-full sm:w-auto h-10 text-sm text-muted-foreground/70 hover:text-muted-foreground order-1 sm:order-2 rounded-lg transition-all duration-200 hover:bg-muted/50 border border-transparent hover:border-muted-foreground/20"
                  >
                    {t("view_result_anyway")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
