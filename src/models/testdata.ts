/**
 * 模块：默认题库与维度（简体中文/英文占位）
 * 作用：提供内置的维度与题目，便于初期运行。可在后台导入/导出替换。
 */

import type { TestBankPayload, TestDimension, TestQuestion } from "@/types/test";

/**
 * 获取默认维度定义。
 * @returns TestDimension[]
 */
export function getDefaultDimensions(): TestDimension[] {
  return [
    {
      id: "dominance",
      key: "test.dimension.dominance",
      name: "主导倾向 Dominance",
      description: "对主导角色的偏好与舒适度",
      min: 0,
      max: 100,
    },
    {
      id: "submission",
      key: "test.dimension.submission",
      name: "服从倾向 Submission",
      description: "对服从角色的偏好与舒适度",
      min: 0,
      max: 100,
    },
    {
      id: "switch",
      key: "test.dimension.switch",
      name: "切换倾向 Switch",
      description: "在不同情境中切换角色的意愿",
      min: 0,
      max: 100,
    },
  ];
}

/**
 * 获取默认题库（Likert 1-5）。
 * @returns TestQuestion[]
 */
export function getDefaultQuestions(): TestQuestion[] {
  return [
    {
      id: "q1",
      textKey: "test.q1",
      text: "在亲密互动中，我更乐于掌控节奏与决定。",
      hint: "主导相关",
      weights: { dominance: 1.0, submission: -0.5 },
      skippable: true,
    },
    {
      id: "q2",
      textKey: "test.q2",
      text: "被明确的引导和指令会让我更放松、更投入。",
      hint: "服从相关",
      weights: { submission: 1.0, dominance: -0.5 },
      skippable: true,
    },
    {
      id: "q3",
      textKey: "test.q3",
      text: "根据情境与对象，我可能会在主导与服从之间切换。",
      hint: "切换相关",
      weights: { switch: 1.0 },
      skippable: true,
    },
    {
      id: "q4",
      textKey: "test.q4",
      text: "我喜欢设定规则与边界，并让对方遵守。",
      hint: "主导相关",
      weights: { dominance: 1.0 },
      skippable: true,
    },
    {
      id: "q5",
      textKey: "test.q5",
      text: "遵循对方的安排能让我更有安全感。",
      hint: "服从相关",
      weights: { submission: 1.0 },
      skippable: true,
    },
  ];
}

/**
 * 构建默认题库载荷。
 * @param locale 语言（可选）
 * @returns TestBankPayload
 */
export function buildDefaultBank(locale?: string): TestBankPayload {
  return {
    dimensions: getDefaultDimensions(),
    questions: getDefaultQuestions(),
    version: "v1",
    locale,
  };
}


