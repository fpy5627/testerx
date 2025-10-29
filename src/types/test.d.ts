/**
 * 模块：测试类型定义（题库、维度、答案、结果）
 * 作用：规范测试功能模块的数据结构，供前端组件、上下文与服务层复用。
 */

export type LikertOptionValue = 1 | 2 | 3 | 4 | 5;

/**
 * 维度定义，如“主导倾向/服从倾向/切换倾向”。
 * - id: 唯一标识
 * - key: i18n 文案键
 * - name: 默认展示名称（回退）
 * - description: 维度说明（回退）
 * - min/max: 评分区间
 */
export interface TestDimension {
  id: string;
  key: string;
  name: string;
  description?: string;
  min: number;
  max: number;
}

/**
 * 问题与权重：可关联多个维度及各自权重。
 * - id: 唯一标识
 * - textKey: i18n 文案键
 * - text: 展示文案（回退）
 * - hintKey/hint: 题目提示
 * - weights: (维度id -> 权重)，Likert数值将与权重相乘累加
 * - skippable: 是否允许跳过
 */
export interface TestQuestion {
  id: string;
  textKey?: string;
  text: string;
  hintKey?: string;
  hint?: string;
  weights: Record<string, number>;
  skippable?: boolean;
}

/**
 * 单题回答
 * - questionId: 问题ID
 * - value: Likert 1-5
 * - skipped: 是否跳过
 */
export interface TestAnswerItem {
  questionId: string;
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
 * 维度评分结果
 * - scores: (维度id -> 分数)
 * - normalized: 归一化分数 0-100（可选）
 */
export interface TestResult {
  scores: Record<string, number>;
  normalized?: Record<string, number>;
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
 * 题库载荷
 * - dimensions: 全部维度
 * - questions: 全部题目
 * - version: 数据版本
 * - locale: 语言
 */
export interface TestBankPayload {
  dimensions: TestDimension[];
  questions: TestQuestion[];
  version: string;
  locale?: string;
}


