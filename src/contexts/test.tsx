/**
 * 模块：测试上下文（React Context）
 * 作用：管理题库、作答进度、加密本地存储、结果计算与重测。
 */

"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { TestAnswerItem, TestBankPayload, TestHistoryItem, TestProgress, TestResult } from "@/types/test";
import { loadTestBank, computeResult } from "@/services/test-bank";
import { generateResultText } from "@/utils/resultText";
import { secureGetLocal, secureRemoveLocal, secureSetLocal } from "@/lib/crypto";

/**
 * 常量：本地存储键与匿名口令（可改为环境变量）。
 */
const STORAGE_KEY_PROGRESS = "test.progress.v1";
const STORAGE_KEY_HISTORY = "test.history.v1";
const STORAGE_PASSWORD = "anonymous-test-secret-v1";

interface TestContextValue {
  bank?: TestBankPayload;
  progress: TestProgress;
  loading: boolean;
  result?: TestResult;
  history: TestHistoryItem[];
  init: (locale?: string) => Promise<void>;
  answer: (questionId: number, value: number) => void;
  skip: (questionId: number) => void;
  next: () => void;
  prev: () => void;
  nextPage: () => void;
  prevPage: () => void;
  jumpToFirstUnanswered: () => void;
  jumpToNextUnanswered: (fromIndex?: number) => void;
  submit: () => Promise<void>;
  reset: () => Promise<void>;
  restoreResult: (historyItem: TestHistoryItem) => void;
  deleteHistory: (id: string) => Promise<void>;
  clearAllHistory: () => Promise<void>;
}

const TestContext = createContext<TestContextValue | undefined>(undefined);

/**
 * 生成空进度对象。
 * @param total 总题数（用于预留 answers 容器）
 * @returns TestProgress
 */
function createEmptyProgress(total: number): TestProgress {
  return {
    currentIndex: 0,
    answers: [], // 初始为空数组，后续根据实际question id填充
  };
}

/**
 * Provider 组件：封装测试逻辑。
 * @param children React 节点
 * @returns JSX.Element
 */
export function TestProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [bank, setBank] = useState<TestBankPayload | undefined>(undefined);
  const [progress, setProgress] = useState<TestProgress>({ currentIndex: 0, answers: [] });
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<TestResult | undefined>(undefined);
  const [history, setHistory] = useState<TestHistoryItem[]>([]);

  /**
   * 初始化题库与本地进度。
   * @param locale 语言
   */
  const init = useCallback(async (locale?: string) => {
    setLoading(true);
    try {
      // 从 sessionStorage 读取测试模式
      let mode: "quick" | "standard" | "deep" = "quick";
      if (typeof window !== "undefined") {
        const savedMode = sessionStorage.getItem("testMode");
        if (savedMode === "quick" || savedMode === "standard" || savedMode === "deep") {
          mode = savedMode;
        }
      }
      
      const loaded = await loadTestBank(locale, mode);
      if (!loaded || !loaded.questions || loaded.questions.length === 0) {
        console.error("Failed to load test bank: empty or invalid data", loaded);
        setLoading(false);
        return;
      }
      setBank(loaded);
      // 进度恢复
      const saved = await secureGetLocal<TestProgress>(STORAGE_KEY_PROGRESS, STORAGE_PASSWORD);
      if (saved && Array.isArray(saved.answers)) {
        // 检查进度是否与当前题目数量匹配
        if (saved.answers.length === loaded.questions.length) {
          setProgress(saved);
        } else {
          // 如果不匹配，重新初始化进度
          const p = createEmptyProgress(loaded.questions.length);
          p.answers = loaded.questions.map((q) => ({ questionId: q.id }));
          setProgress(p);
        }
      } else {
        const p = createEmptyProgress(loaded.questions.length);
        // 使用真实 questionId 替换占位 id
        p.answers = loaded.questions.map((q) => ({ questionId: q.id }));
        setProgress(p);
      }
      const his = (await secureGetLocal<TestHistoryItem[]>(STORAGE_KEY_HISTORY, STORAGE_PASSWORD)) || [];
      setHistory(his);
    } catch (error) {
      console.error("Error initializing test bank:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 保存当前进度到本地（加密）。
   */
  const persistProgress = useCallback(async (p: TestProgress) => {
    await secureSetLocal(STORAGE_KEY_PROGRESS, p, STORAGE_PASSWORD);
  }, []);

  /**
   * 回答某题。
   * @param questionId 问题ID（number类型）
   * @param value Likert 值
   */
  const answer = useCallback((questionId: number, value: number) => {
    setProgress((prev) => {
      const existingIndex = prev.answers.findIndex((a) => a.questionId === questionId);
      let nextAnswers: TestAnswerItem[];
      if (existingIndex >= 0) {
        nextAnswers = prev.answers.map((a) =>
          a.questionId === questionId ? { questionId, value, skipped: false } : a
        );
      } else {
        nextAnswers = [...prev.answers, { questionId, value, skipped: false }];
      }
      const next: TestProgress = { ...prev, answers: nextAnswers };
      void persistProgress(next);
      return next;
    });
  }, [persistProgress]);

  /**
   * 跳过某题。
   * @param questionId 问题ID（number类型）
   */
  const skip = useCallback((questionId: number) => {
    setProgress((prev) => {
      const existingIndex = prev.answers.findIndex((a) => a.questionId === questionId);
      let nextAnswers: TestAnswerItem[];
      if (existingIndex >= 0) {
        nextAnswers = prev.answers.map((a) =>
          a.questionId === questionId ? { questionId, skipped: true } : a
        );
      } else {
        nextAnswers = [...prev.answers, { questionId, skipped: true }];
      }
      const next: TestProgress = { ...prev, answers: nextAnswers };
      void persistProgress(next);
      return next;
    });
  }, [persistProgress]);

  /**
   * 下一题。
   */
  const next = useCallback(() => {
    setProgress((prev) => {
      if (!bank || !bank.questions) {
        return prev;
      }
      const total = bank.questions.length;
      const nextIdx = Math.min(total - 1, prev.currentIndex + 1);
      const next: TestProgress = { ...prev, currentIndex: nextIdx };
      void persistProgress(next);
      return next;
    });
  }, [bank, persistProgress]);

  /**
   * 上一题。
   */
  const prev = useCallback(() => {
    setProgress((prev) => {
      const nextIdx = Math.max(0, prev.currentIndex - 1);
      const next: TestProgress = { ...prev, currentIndex: nextIdx };
      void persistProgress(next);
      return next;
    });
  }, [persistProgress]);

  /**
   * 下一页（每页5题）。
   */
  const nextPage = useCallback(() => {
    setProgress((prev) => {
      if (!bank || !bank.questions) {
        return prev;
      }
      const total = bank.questions.length;
      const QUESTIONS_PER_PAGE = 5;
      const currentPage = Math.floor(prev.currentIndex / QUESTIONS_PER_PAGE);
      const totalPages = Math.ceil(total / QUESTIONS_PER_PAGE);
      if (currentPage >= totalPages - 1) {
        return prev; // 已经是最后一页
      }
      const nextPageIdx = (currentPage + 1) * QUESTIONS_PER_PAGE;
      const nextIdx = Math.min(total - 1, nextPageIdx);
      const next: TestProgress = { ...prev, currentIndex: nextIdx };
      void persistProgress(next);
      return next;
    });
  }, [bank, persistProgress]);

  /**
   * 上一页（每页5题）。
   */
  const prevPage = useCallback(() => {
    setProgress((prev) => {
      if (!bank || !bank.questions) {
        return prev;
      }
      const QUESTIONS_PER_PAGE = 5;
      const currentPage = Math.floor(prev.currentIndex / QUESTIONS_PER_PAGE);
      if (currentPage <= 0) {
        return prev; // 已经是第一页
      }
      const prevPageIdx = (currentPage - 1) * QUESTIONS_PER_PAGE;
      const next: TestProgress = { ...prev, currentIndex: prevPageIdx };
      void persistProgress(next);
      return next;
    });
  }, [bank, persistProgress]);

  /**
   * 跳转到第一个未答题的题目。
   * 找到第一个未回答或未跳过的题目，并跳转到该题目所在的页面。
   */
  const jumpToFirstUnanswered = useCallback(() => {
    setProgress((prev) => {
      if (!bank || !bank.questions) {
        return prev;
      }
      const QUESTIONS_PER_PAGE = 5;
      // 查找第一个未答题的题目（既没有答案也没有跳过）
      const firstUnansweredIndex = bank.questions.findIndex((q) => {
        const answer = prev.answers.find((a) => a.questionId === q.id);
        return !answer || (answer.value === undefined && !answer.skipped);
      });
      
      // 如果所有题目都已答完，返回当前进度
      if (firstUnansweredIndex === -1) {
        return prev;
      }
      
      // 计算该题目所在的页面，并跳转到该页面的第一题
      const targetPage = Math.floor(firstUnansweredIndex / QUESTIONS_PER_PAGE);
      const targetIndex = targetPage * QUESTIONS_PER_PAGE;
      const next: TestProgress = { ...prev, currentIndex: targetIndex };
      void persistProgress(next);
      return next;
    });
  }, [bank, persistProgress]);

  /**
   * 跳转到下一个未答题的题目。
   * 从指定索引开始查找下一个未回答或未跳过的题目，并跳转到该题目所在的页面。
   * @param fromIndex 开始查找的索引（可选，默认为当前索引）
   */
  const jumpToNextUnanswered = useCallback((fromIndex?: number) => {
    setProgress((prev) => {
      if (!bank || !bank.questions) {
        return prev;
      }
      const QUESTIONS_PER_PAGE = 5;
      const startIndex = fromIndex !== undefined ? fromIndex : prev.currentIndex;
      
      // 查找下一个未答题的题目（从startIndex之后开始）
      const nextUnansweredIndex = bank.questions.findIndex((q, idx) => {
        if (idx <= startIndex) return false; // 跳过startIndex及之前的题目
        const answer = prev.answers.find((a) => a.questionId === q.id);
        return !answer || (answer.value === undefined && !answer.skipped);
      });
      
      // 如果所有题目都已答完，返回当前进度
      if (nextUnansweredIndex === -1) {
        return prev;
      }
      
      // 计算该题目所在的页面，并跳转到该页面的第一题
      const targetPage = Math.floor(nextUnansweredIndex / QUESTIONS_PER_PAGE);
      const targetIndex = targetPage * QUESTIONS_PER_PAGE;
      const next: TestProgress = { ...prev, currentIndex: targetIndex };
      void persistProgress(next);
      return next;
    });
  }, [bank, persistProgress]);

  /**
   * 提交测试：计算结果并写入历史（加密本地）。
   */
  const submit = useCallback(async () => {
    if (!bank) {
      console.error("提交失败：题库未加载");
      throw new Error("题库未加载");
    }
    try {
      const r = computeResult(progress.answers, bank);
      // 生成文本分析（使用当前语言环境）
      const currentLocale = typeof window !== 'undefined' 
        ? window.location.pathname.split('/')[1] || 'en'
        : 'en';
      const textAnalysis = generateResultText(
        r.normalized || {},
        r.orientation_spectrum,
        currentLocale
      );
      r.text_analysis = textAnalysis;
      setResult(r);
      const newItem: TestHistoryItem = {
        id: `${Date.now()}`,
        createdAt: new Date().toISOString(),
        result: r,
        progressSnapshot: progress,
      };
      const nextHistory = [newItem, ...history].slice(0, 50);
      setHistory(nextHistory);
      await secureSetLocal(STORAGE_KEY_HISTORY, nextHistory, STORAGE_PASSWORD);
      // 清空进度，表示测试已完成
      await secureRemoveLocal(STORAGE_KEY_PROGRESS);
      console.log("测试提交成功，结果已保存");
    } catch (error) {
      console.error("提交测试时出错:", error);
      throw error;
    }
  }, [bank, history, progress]);

  /**
   * 重置测试进度（不清空历史）。
   */
  const reset = useCallback(async () => {
    if (!bank) return;
    const p = createEmptyProgress(bank.questions.length);
    p.answers = bank.questions.map((q) => ({ questionId: q.id }));
    setProgress(p);
    setResult(undefined);
    await secureSetLocal(STORAGE_KEY_PROGRESS, p, STORAGE_PASSWORD);
  }, [bank]);

  /**
   * 从历史记录恢复结果。
   * @param historyItem 历史记录项
   */
  const restoreResult = useCallback((historyItem: TestHistoryItem) => {
    if (historyItem.result) {
      setResult(historyItem.result);
    }
    // 同时恢复进度快照，用于计算答题进度
    if (historyItem.progressSnapshot) {
      setProgress(historyItem.progressSnapshot);
    }
  }, []);

  /**
   * 删除指定历史项。
   * @param id 历史ID
   */
  const deleteHistory = useCallback(async (id: string) => {
    const next = history.filter((h) => h.id !== id);
    setHistory(next);
    await secureSetLocal(STORAGE_KEY_HISTORY, next, STORAGE_PASSWORD);
  }, [history]);

  /**
   * 清空全部历史记录。
   */
  const clearAllHistory = useCallback(async () => {
    setHistory([]);
    secureRemoveLocal(STORAGE_KEY_HISTORY);
  }, []);

  // 初始加载（默认语言交由页面传入 init）
  useEffect(() => {
    // 由使用方显式调用 init(locale)
  }, []);

  const value = useMemo<TestContextValue>(() => ({
    bank,
    progress,
    loading,
    result,
    history,
    init,
    answer,
    skip,
    next,
    prev,
    nextPage,
    prevPage,
    jumpToFirstUnanswered,
    jumpToNextUnanswered,
    submit,
    reset,
    restoreResult,
    deleteHistory,
    clearAllHistory,
  }), [answer, bank, clearAllHistory, deleteHistory, history, init, loading, next, nextPage, prev, prevPage, progress, reset, restoreResult, result, skip, submit, jumpToFirstUnanswered, jumpToNextUnanswered]);

  return <TestContext.Provider value={value}>{children}</TestContext.Provider>;
}

/**
 * Hook：使用测试上下文。
 * @returns TestContextValue
 */
export function useTestContext(): TestContextValue {
  const ctx = useContext(TestContext);
  if (!ctx) throw new Error("useTestContext must be used within TestProvider");
  return ctx;
}


