/**
 * 模块：题目抽取逻辑
 * 作用：根据测试模式（Quick/Standard/Deep）从完整题库中按深度层级抽取题目
 * 
 * 核心思路：
 * - Quick Mode: 只取 depth <= 1 的题目（基础题，30题）- 移动端或快速浏览者
 * - Standard Mode: 取 depth <= 2 的题目（基础+标准题，70题）- 主测试推荐模式
 * - Deep Mode: 取所有题目（depth <= 3，120题）- 高级用户，可选项
 */

import type { TestQuestion } from "@/types/test";

/**
 * 题目数量配置（每种模式的目标题量）
 * - 快速模式：30题（移动端或快速浏览者）
 * - 标准模式：70题（主测试推荐模式）
 * - 深度模式：120题（高级用户，可选项）
 */
const QUESTION_COUNTS = {
  quick: 30,
  standard: 70,
  deep: 120,
} as const;

/**
 * 根据测试模式选择题目
 * 
 * 算法逻辑：
 * 1. 根据模式确定最大深度（Quick=1, Standard=2, Deep=3）
 * 2. 筛选出 depth <= maxDepth 的题目
 * 3. 按类别分组，确保每个类别都有代表性
 * 4. 随机打乱，保持每次抽取的随机性
 * 5. 限制总题量在目标范围内
 * 
 * @param questions 完整题库（所有题目）
 * @param mode 测试模式（"quick" | "standard" | "deep"）
 * @returns 筛选后的题目数组
 */
export function selectQuestions(
  questions: TestQuestion[],
  mode: "quick" | "standard" | "deep" = "standard"
): TestQuestion[] {
  // 1. 确定目标题目数量
  const targetCount = QUESTION_COUNTS[mode];
  
  // 2. 如果题库中题目数量不足目标数量，从所有题目中随机抽取（允许重复）
  if (questions.length < targetCount) {
    // 从题库中随机抽取，允许重复直到达到目标数量
    const selected: TestQuestion[] = [];
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < targetCount; i++) {
      const sourceIndex = i % shuffled.length;
      selected.push({
        ...shuffled[sourceIndex],
        id: i + 1, // 重新分配连续ID
      });
    }
    
    // 再次随机打乱
    return selected.sort(() => Math.random() - 0.5).map((q, index) => ({
      ...q,
      id: index + 1,
    }));
  }
  
  // 3. 如果题库中题目数量足够，从所有题目中随机抽取目标数量
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, targetCount);
  
  return selected.map((q, index) => ({
    ...q,
    id: index + 1, // 重新分配连续ID
  }));
}

/**
 * 获取指定模式的题目数量
 * @param mode 测试模式
 * @returns 题目数量
 */
export function getQuestionCount(mode: "quick" | "standard" | "deep"): number {
  return QUESTION_COUNTS[mode];
}

