/**
 * 模块：题库JSON模板类型定义
 * 作用：定义新的JSON模板结构，支持meta、dimensions、questions with weights
 */

/**
 * 题库元数据
 */
export interface TestBankMeta {
  version: string;
  language: string;
  mode: "quick" | "standard" | "deep";
  question_count: number;
}

/**
 * 维度定义
 */
export interface TestDimension {
  id: string;
  name: string;
  description: string;
}

/**
 * 问题权重（每个维度对应一个权重值）
 */
export interface QuestionWeights {
  [dimensionId: string]: number; // 例如: { "dominant": 1.0, "submissive": -0.8 }
}

/**
 * 问题（新格式，支持weights）
 */
export interface TestQuestionWithWeights {
  id: number;
  text: string;
  options: string[]; // Likert量表选项：["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]
  weights: QuestionWeights; // 每个维度对应的权重
}

/**
 * 题库JSON模板（新格式）
 */
export interface TestBankJSONTemplate {
  meta: TestBankMeta;
  dimensions: TestDimension[];
  questions: TestQuestionWithWeights[];
}

