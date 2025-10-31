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
  submit: () => Promise<void>;
  reset: () => Promise<void>;
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
      const loaded = await loadTestBank(locale);
      if (!loaded || !loaded.questions || loaded.questions.length === 0) {
        console.error("Failed to load test bank: empty or invalid data", loaded);
        setLoading(false);
        return;
      }
      setBank(loaded);
      // 进度恢复
      const saved = await secureGetLocal<TestProgress>(STORAGE_KEY_PROGRESS, STORAGE_PASSWORD);
      if (saved && Array.isArray(saved.answers)) {
        setProgress(saved);
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
      const total = prev.answers.length;
      const nextIdx = Math.min(total - 1, prev.currentIndex + 1);
      const next: TestProgress = { ...prev, currentIndex: nextIdx };
      void persistProgress(next);
      return next;
    });
  }, [persistProgress]);

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
   * 提交测试：计算结果并写入历史（加密本地）。
   */
  const submit = useCallback(async () => {
    if (!bank) return;
    const r = computeResult(progress.answers, bank);
    // 生成文本分析
    const textAnalysis = generateResultText(
      r.normalized || {},
      r.orientation_spectrum
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
    submit,
    reset,
    deleteHistory,
    clearAllHistory,
  }), [answer, bank, clearAllHistory, deleteHistory, history, init, loading, next, prev, progress, reset, result, skip, submit]);

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


