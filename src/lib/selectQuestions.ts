/**
 * 模块：题目抽取逻辑
 * 作用：根据测试模式（Quick/Standard/Deep）从完整题库中按深度层级抽取题目
 * 
 * 核心思路：
 * - Quick Mode: 只取 depth <= 1 的题目（基础题，30-40题）
 * - Standard Mode: 取 depth <= 2 的题目（基础+标准题，70-100题）
 * - Deep Mode: 取所有题目（depth <= 3，120-150题）
 */

import type { TestQuestion } from "@/types/test";

/**
 * 题目数量配置（每种模式的目标题量）
 */
const QUESTION_COUNTS = {
  quick: { min: 30, max: 40 },
  standard: { min: 70, max: 100 },
  deep: { min: 120, max: 150 },
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
  // 1. 确定最大深度层级
  const maxDepth = mode === "quick" ? 1 : mode === "standard" ? 2 : 3;
  
  // 2. 筛选出符合深度要求的题目（如果没有depth字段，默认为depth=1）
  const filtered = questions.filter((q) => {
    const questionDepth = q.depth ?? 1; // 默认depth为1（基础题）
    return questionDepth <= maxDepth;
  });

  // 3. 如果筛选后的题目数量已经足够，直接返回
  const { min, max } = QUESTION_COUNTS[mode];
  if (filtered.length <= max) {
    // 随机打乱顺序，保持每次抽取的随机性
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.map((q, index) => ({
      ...q,
      id: index + 1, // 重新分配连续ID
    }));
  }

  // 4. 按类别分组，确保每个类别都有代表性
  const categoryMap = new Map<string, TestQuestion[]>();
  for (const q of filtered) {
    if (!categoryMap.has(q.category)) {
      categoryMap.set(q.category, []);
    }
    categoryMap.get(q.category)!.push(q);
  }

  // 5. 从每个类别中按比例选择题目
  const selected: TestQuestion[] = [];
  const categoryCount = categoryMap.size;
  const targetCount = Math.min(max, Math.max(min, filtered.length));
  const perCategory = Math.floor(targetCount / categoryCount);
  const remainder = targetCount % categoryCount;

  let categoryIndex = 0;
  for (const [category, catQuestions] of categoryMap.entries()) {
    // 随机打乱当前类别的题目
    const shuffled = [...catQuestions].sort(() => Math.random() - 0.5);
    
    // 计算当前类别应抽取的题目数量
    const count = categoryIndex < remainder ? perCategory + 1 : perCategory;
    
    // 从打乱后的题目中选择
    const selectedFromCategory = shuffled.slice(0, count);
    selected.push(...selectedFromCategory);
    categoryIndex++;
  }

  // 6. 如果还需要更多题目，从剩余题目中随机选择
  if (selected.length < targetCount) {
    const remaining = filtered.filter((q) => !selected.some((s) => s.id === q.id));
    const shuffledRemaining = [...remaining].sort(() => Math.random() - 0.5);
    const needed = targetCount - selected.length;
    const additional = shuffledRemaining.slice(0, needed);
    selected.push(...additional);
  }

  // 7. 最终随机打乱，并重新分配连续ID
  const finalShuffled = [...selected].sort(() => Math.random() - 0.5);
  return finalShuffled.map((q, index) => ({
    ...q,
    id: index + 1,
  }));
}

/**
 * 获取指定模式的题目数量范围
 * @param mode 测试模式
 * @returns 题目数量范围 {min, max}
 */
export function getQuestionCountRange(mode: "quick" | "standard" | "deep") {
  return QUESTION_COUNTS[mode];
}

