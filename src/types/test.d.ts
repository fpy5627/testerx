/**
 * 模块：测试类型定义（题库、类别、答案、结果）
 * 作用：规范测试功能模块的数据结构，供前端组件、上下文与服务层复用。
 * 基于PRD规范：使用category-based结构替代dimension-based结构
 */

export type LikertOptionValue = 1 | 2 | 3 | 4 | 5;

/**
 * 问题类型
 */
export type QuestionType = "scale" | "single" | "multi";

/**
 * 题库类别元数据
 * - name: 类别名称（如 "Dominance", "Submission"）
 * - description: 类别描述（心理学解释）
 * - i18nKey: 国际化键（可选）
 */
export interface TestBankCategory {
  name: string;
  description?: string;
  i18nKey?: string;
}

/**
 * 测试问题（基于PRD格式）
 * - id: 唯一标识
 * - category: 所属类别（如 "Dominance", "Submission", "Orientation"）
 * - question: 问题文本
 * - type: 问题类型（scale/single/multi）
 * - scale: Likert量表最大值（通常为5）
 * - weight: 权重（用于计算加权平均分）
 * - hint: 可选提示文本
 * - skippable: 是否允许跳过
 */
export interface TestQuestion {
  id: number;
  category: string;
  question: string;
  type: QuestionType;
  scale: number; // Likert 1-5 or 1-7
  weight: number; // 权重值
  hint?: string;
  skippable?: boolean;
}

/**
 * 单题回答
 * - questionId: 问题ID（number，对应TestQuestion.id）
 * - value: Likert 1-5
 * - skipped: 是否跳过
 */
export interface TestAnswerItem {
  questionId: number;
  value?: LikertOptionValue;
  skipped?: boolean;
}

/**
 * 测试会话进度
 * - currentIndex: 当前题目索引
 * - answers: 全部作答/跳过记录
 */
export interface TestProgress {
  currentIndex: number;
  answers: TestAnswerItem[];
}

/**
 * 测试结果（基于PRD格式）
 * - scores: (category -> 分数) 原始加权得分
 * - normalized: 归一化分数 0-100（可选）
 * - orientation_spectrum: Kinsey-like 性取向光谱值（0-7，可选）
 * - text_analysis: 心理学解释文本（可选）
 */
export interface TestResult {
  scores: Record<string, number>;
  normalized?: Record<string, number>;
  orientation_spectrum?: number; // Kinsey-like 0-7
  text_analysis?: string;
}

/**
 * 历史测试记录（用于本地存储）
 * - id: 唯一记录ID
 * - createdAt: 记录时间
 * - result: 测试结果
 * - progressSnapshot: 可选进度快照
 */
export interface TestHistoryItem {
  id: string;
  createdAt: string;
  result: TestResult;
  progressSnapshot?: TestProgress;
}

/**
 * 题库载荷（基于PRD格式）
 * - questions: 全部题目数组（JSON格式）
 * - categories: 类别元数据（可选，用于展示）
 * - version: 数据版本
 * - locale: 语言
 */
export interface TestBankPayload {
  questions: TestQuestion[];
  categories?: Record<string, TestBankCategory>; // category name -> metadata
  version: string;
  locale?: string;
}


