/**
 * 模块：题库服务
 * 作用：提供题库加载与结果计算函数，前端页面与后台管理复用。
 */

import type { TestAnswerItem, TestBankPayload, TestResult } from "@/types/test";
import { buildDefaultBank } from "@/models/testdata";
import { getDimensionsByLocale, getApprovedQuestionsByLocale } from "@/models/test";

/**
 * 加载题库（优先从数据库，若无则返回内置默认）。
 * @param locale 语言
 * @returns TestBankPayload
 */
export async function loadTestBank(locale = "en"): Promise<TestBankPayload> {
  try {
    const dimensions = await getDimensionsByLocale(locale);
    const questions = await getApprovedQuestionsByLocale(locale);

    // 如果数据库有数据，使用数据库数据
    if (dimensions.length > 0 && questions.length > 0) {
      return {
        dimensions,
        questions,
        version: "v1",
        locale,
      };
    }
  } catch (error) {
    console.error("Failed to load from database, using default:", error);
  }

  // 回退到内置默认
  return buildDefaultBank(locale);
}

/**
 * 计算测试结果：根据每题 Likert 值与维度权重累加。
 * - 跳过题目不计分
 * - 未作答题目不计分
 * @param answers 作答记录
 * @param bank 题库（含维度与问题）
 * @returns TestResult
 */
export function computeResult(
  answers: TestAnswerItem[],
  bank: TestBankPayload
): TestResult {
  const totals: Record<string, number> = {};
  for (const dim of bank.dimensions) totals[dim.id] = 0;

  const answerMap = new Map<string, TestAnswerItem>();
  for (const a of answers) answerMap.set(a.questionId, a);

  for (const q of bank.questions) {
    const a = answerMap.get(q.id);
    if (!a || a.skipped || a.value == null) continue;
    for (const [dimId, weight] of Object.entries(q.weights)) {
      if (totals[dimId] == null) totals[dimId] = 0;
      totals[dimId] += a.value * weight;
    }
  }

  // 归一化到 0-100（线性映射，基于维度 min/max 区间）
  const normalized: Record<string, number> = {};
  for (const dim of bank.dimensions) {
    const raw = totals[dim.id] ?? 0;
    const clamped = Math.max(dim.min, Math.min(dim.max, raw));
    const range = dim.max - dim.min || 1;
    const norm = ((clamped - dim.min) / range) * 100;
    normalized[dim.id] = Math.round(norm);
  }

  return { scores: totals, normalized };
}


