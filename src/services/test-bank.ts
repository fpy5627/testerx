/**
 * 模块：题库服务
 * 作用：提供题库加载与结果计算函数，前端页面与后台管理复用。
 */

import type { TestAnswerItem, TestBankPayload, TestResult } from "@/types/test";
import { buildDefaultBank } from "@/models/testdata";
// 注意：仅在服务端才会解析到数据库模型，避免把 postgres 打进客户端
let getDimensionsByLocale: ((locale: string) => Promise<any[]>) | undefined;
let getApprovedQuestionsByLocale: ((locale: string) => Promise<any[]>) | undefined;
if (typeof window === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const models = require("@/models/test");
  getDimensionsByLocale = models.getDimensionsByLocale as typeof getDimensionsByLocale;
  getApprovedQuestionsByLocale = models.getApprovedQuestionsByLocale as typeof getApprovedQuestionsByLocale;
}

/**
 * 加载题库（优先从数据库，若无则返回内置默认）。
 * @param locale 语言
 * @returns TestBankPayload
 */
export async function loadTestBank(locale = "en"): Promise<TestBankPayload> {
  // 浏览器环境：通过 API Route 获取，避免打包服务器端依赖
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/test/bank?locale=${encodeURIComponent(locale)}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = (await res.json()) as TestBankPayload;
        if (data && data.dimensions?.length && data.questions?.length) return data;
      }
    } catch (err) {
      // 忽略，走回退
    }
    return buildDefaultBank(locale);
  }

  // 服务端环境：直接读取模型（不会进入客户端包）
  try {
    const dimensions = (await getDimensionsByLocale?.(locale)) || [];
    const questions = (await getApprovedQuestionsByLocale?.(locale)) || [];
    if (dimensions.length > 0 && questions.length > 0) {
      return { dimensions, questions, version: "v1", locale };
    }
  } catch (error) {
    // 服务端失败时记录但回退默认
    console.error("Failed to load test bank on server, using default:", error);
  }
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


