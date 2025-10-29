/**
 * 模块：测试数据库模型操作
 * 作用：提供维度、题目、结果等数据库的 CRUD 操作。
 */

import { db } from "@/db";
import { eq, and, isNull } from "drizzle-orm";
import {
  testDimensions,
  testQuestions,
  testResults,
  testAnswerItems,
  testQuestionAudits,
} from "@/db/schema";
import type { TestDimension, TestQuestion, TestResult } from "@/types/test";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

export type TestDimensionRow = InferSelectModel<typeof testDimensions>;
export type TestQuestionRow = InferSelectModel<typeof testQuestions>;
export type TestResultRow = InferSelectModel<typeof testResults>;
export type TestAnswerItemRow = InferSelectModel<typeof testAnswerItems>;
export type TestQuestionAuditRow = InferSelectModel<typeof testQuestionAudits>;

/**
 * 获取指定语言的所有维度。
 * @param locale 语言
 * @returns TestDimension[]
 */
export async function getDimensionsByLocale(locale: string): Promise<TestDimension[]> {
  const rows = await db
    .select()
    .from(testDimensions)
    .where(eq(testDimensions.locale, locale));

  return rows.map((r) => ({
    id: r.dimension_id,
    key: r.key,
    name: r.name,
    description: r.description || undefined,
    min: r.min_score,
    max: r.max_score,
  }));
}

/**
 * 获取指定语言的已审核通过的题目。
 * @param locale 语言
 * @returns TestQuestion[]
 */
export async function getApprovedQuestionsByLocale(locale: string): Promise<TestQuestion[]> {
  const rows = await db
    .select()
    .from(testQuestions)
    .where(
      and(
        eq(testQuestions.locale, locale),
        eq(testQuestions.audit_status, "approved")
      )
    );

  return rows.map((r) => ({
    id: r.question_id,
    textKey: r.text_key || undefined,
    text: r.text,
    hintKey: r.hint_key || undefined,
    hint: r.hint || undefined,
    weights: r.weights,
    skippable: r.skippable,
  }));
}

/**
 * 获取所有题目（包括待审核）。
 * @param locale 语言
 * @param auditStatus 审核状态（可选）
 * @returns TestQuestionRow[]
 */
export async function getAllQuestionsByLocale(
  locale: string,
  auditStatus?: string
): Promise<TestQuestionRow[]> {
  const conditions = [eq(testQuestions.locale, locale)];
  if (auditStatus) {
    conditions.push(eq(testQuestions.audit_status, auditStatus));
  }
  return await db.select().from(testQuestions).where(and(...conditions));
}

/**
 * 创建或更新维度。
 * @param dim 维度数据
 * @param locale 语言
 * @returns void
 */
export async function upsertDimension(dim: TestDimension, locale: string): Promise<void> {
  await db
    .insert(testDimensions)
    .values({
      dimension_id: dim.id,
      key: dim.key,
      name: dim.name,
      description: dim.description,
      min_score: dim.min,
      max_score: dim.max,
      locale,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .onConflictDoUpdate({
      target: [testDimensions.dimension_id, testDimensions.locale],
      set: {
        key: dim.key,
        name: dim.name,
        description: dim.description,
        min_score: dim.min,
        max_score: dim.max,
        updated_at: new Date(),
      },
    });
}

/**
 * 创建题目（待审核状态）。
 * @param q 题目数据
 * @param locale 语言
 * @param createdBy 创建者 UUID（可选）
 * @returns TestQuestionRow
 */
export async function createQuestion(
  q: TestQuestion,
  locale: string,
  createdBy?: string
): Promise<TestQuestionRow> {
  const [row] = await db
    .insert(testQuestions)
    .values({
      question_id: q.id,
      text_key: q.textKey,
      text: q.text,
      hint_key: q.hintKey,
      hint: q.hint,
      weights: q.weights,
      skippable: q.skippable ?? true,
      locale,
      audit_status: "pending",
      created_by: createdBy,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returning();

  return row;
}

/**
 * 更新题目审核状态。
 * @param questionId 题目 ID（数据库主键）
 * @param status 审核状态
 * @param reason 审核原因（可选）
 * @param auditorUuid 审核者 UUID（可选）
 * @returns void
 */
export async function updateQuestionAuditStatus(
  questionId: number,
  status: "pending" | "approved" | "rejected",
  reason?: string,
  auditorUuid?: string
): Promise<void> {
  await db
    .update(testQuestions)
    .set({
      audit_status: status,
      updated_at: new Date(),
    })
    .where(eq(testQuestions.id, questionId));

  await db.insert(testQuestionAudits).values({
    question_id: questionId,
    audit_status: status,
    audit_reason: reason,
    auditor_uuid: auditorUuid,
    created_at: new Date(),
  });
}

/**
 * 保存测试结果（匿名）。
 * @param anonymousId 匿名 ID
 * @param result 测试结果
 * @param locale 语言
 * @returns TestResultRow
 */
export async function saveTestResult(
  anonymousId: string,
  result: TestResult,
  locale?: string
): Promise<TestResultRow> {
  const [row] = await db
    .insert(testResults)
    .values({
      anonymous_id: anonymousId,
      scores: result.scores,
      normalized_scores: result.normalized,
      locale,
      created_at: new Date(),
    })
    .returning();

  return row;
}

/**
 * 保存答案项。
 * @param resultId 结果 ID
 * @param answerItems 答案项数组
 * @returns void
 */
export async function saveAnswerItems(
  resultId: number,
  answerItems: Array<{ questionId: string; value?: number; skipped?: boolean }>
): Promise<void> {
  await db.insert(testAnswerItems).values(
    answerItems.map((item) => ({
      result_id: resultId,
      question_id: item.questionId,
      value: item.value ?? null,
      skipped: item.skipped ?? false,
      created_at: new Date(),
    }))
  );
}

/**
 * 软删除测试结果（GDPR 合规）。
 * @param anonymousId 匿名 ID
 * @returns void
 */
export async function deleteTestResultsByAnonymousId(anonymousId: string): Promise<void> {
  await db
    .update(testResults)
    .set({ deleted_at: new Date() })
    .where(
      and(
        eq(testResults.anonymous_id, anonymousId),
        isNull(testResults.deleted_at)
      )
    );
}

/**
 * 导出用户数据（GDPR 合规）。
 * @param anonymousId 匿名 ID
 * @returns 测试结果数据（JSON 格式）
 */
export async function exportUserData(anonymousId: string): Promise<any> {
  const results = await db
    .select()
    .from(testResults)
    .where(
      and(
        eq(testResults.anonymous_id, anonymousId),
        isNull(testResults.deleted_at)
      )
    );

  const data = await Promise.all(
    results.map(async (r) => {
      const answers = await db
        .select()
        .from(testAnswerItems)
        .where(eq(testAnswerItems.result_id, r.id));
      return { result: r, answers };
    })
  );

  return data;
}

/**
 * 获取审核日志。
 * @param questionId 题目 ID（数据库主键）
 * @returns TestQuestionAuditRow[]
 */
export async function getAuditLogs(questionId: number): Promise<TestQuestionAuditRow[]> {
  return await db
    .select()
    .from(testQuestionAudits)
    .where(eq(testQuestionAudits.question_id, questionId))
    .orderBy(testQuestionAudits.created_at);
}

