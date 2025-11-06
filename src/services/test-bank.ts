/**
 * 模块：题库服务（基于PRD规范）
 * 作用：从JSON文件加载题库，计算测试结果（category-based算法）
 */

import type { TestAnswerItem, TestBankPayload, TestQuestion, TestResult } from "@/types/test";
import { selectQuestions } from "@/lib/selectQuestions";

// JSON题库导入（动态导入，避免客户端打包）
async function loadQuestionsFromJSON(locale: string): Promise<TestQuestion[]> {
  if (typeof window !== "undefined") {
    // 客户端不应该直接导入JSON
    return [];
  }
  
  try {
    let questions: TestQuestion[];
    if (locale === "zh" || locale === "zh-CN" || locale === "zh-TW") {
      const module = await import("@/data/questions_zh.json");
      questions = (module.default || module) as TestQuestion[];
    } else {
      const module = await import("@/data/questions_en.json");
      questions = (module.default || module) as TestQuestion[];
    }
    return Array.isArray(questions) ? questions : [];
  } catch (error) {
    console.error(`Failed to load questions for locale ${locale}:`, error);
    return [];
  }
}

/**
 * 类别元数据定义
 */
const categoryMetadata: Record<string, { name: string; description?: string }> = {
  Dominance: {
    name: "Dominance",
    description: "Preference for taking control and leadership in relationships",
  },
  Submission: {
    name: "Submission",
    description: "Comfort with yielding control and trusting partner's decisions",
  },
  Switch: {
    name: "Switch",
    description: "Flexibility to adapt between dominant and submissive roles",
  },
  Sadistic: {
    name: "Sadistic",
    description: "Satisfaction from exercising authority in controlled contexts",
  },
  Masochistic: {
    name: "Masochistic",
    description: "Satisfaction from giving up control to a trusted partner",
  },
  Vanilla: {
    name: "Vanilla",
    description: "Preference for traditional, straightforward forms of connection",
  },
  Exploration: {
    name: "Exploration",
    description: "Openness to trying new forms of intimacy and expression",
  },
  Orientation: {
    name: "Orientation",
    description: "Sexual orientation spectrum (Kinsey-like 0-7)",
  },
};

/**
 * 根据测试模式筛选题目（基于depth深度层级）
 * @param questions 全部题目
 * @param mode 测试模式（"quick" | "standard" | "deep"）
 * @returns 筛选后的题目
 * 
 * 说明：
 * - Quick Mode: 只取 depth <= 1 的题目（基础题，30题）- 移动端或快速浏览者
 * - Standard Mode: 取 depth <= 2 的题目（基础+标准题，70题）- 主测试推荐模式
 * - Deep Mode: 取所有题目（depth <= 3，120题）- 高级用户，可选项
 * 
 * 使用统一的selectQuestions函数实现按depth筛选逻辑
 */
function filterQuestionsByMode(questions: TestQuestion[], mode: "quick" | "standard" | "deep" = "standard"): TestQuestion[] {
  return selectQuestions(questions, mode);
}

/**
 * 加载题库（从JSON文件或API）
 * @param locale 语言（"en" | "zh"）
 * @param mode 测试模式（"quick" | "standard" | "deep"）
 * @returns TestBankPayload
 */
export async function loadTestBank(locale = "en", mode: "quick" | "standard" | "deep" = "quick"): Promise<TestBankPayload> {
  // 客户端：通过API调用获取
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/test/bank?locale=${encodeURIComponent(locale)}&mode=${encodeURIComponent(mode)}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = (await res.json()) as TestBankPayload;
        if (data && data.questions?.length) {
          // API 已经根据模式筛选了题目，直接返回
          return data;
        }
      }
    } catch (err) {
      console.error("Failed to load test bank from API:", err);
      // 继续使用fallback
    }
  }

  // 服务端：动态导入JSON
  const questions = await loadQuestionsFromJSON(locale);

  // 如果服务端也没有数据，返回空题库
  if (questions.length === 0) {
    console.warn(`No questions loaded for locale: ${locale}`);
    return {
      questions: [],
      categories: {},
      version: "v2.0",
      locale,
    };
  }

  // 根据模式筛选题目
  const filteredQuestions = filterQuestionsByMode(questions, mode);

  // 构建类别元数据
  const categories: Record<string, { name: string; description?: string; i18nKey?: string }> = {};
  for (const [key, meta] of Object.entries(categoryMetadata)) {
    categories[key] = meta;
  }

  return {
    questions: filteredQuestions,
    categories,
    version: "v2.0",
    locale,
  };
}

/**
 * 计算测试结果（基于PRD算法）
 * 算法：(score * weight) / (total_questions_in_category * scale_max) * 100
 * - 跳过题目不计分
 * - 未作答题目不计分
 * - 为每个category计算加权平均分
 * - 实现Kinsey光谱计算（基于Orientation类别）
 * 
 * @param answers 作答记录
 * @param bank 题库
 * @returns TestResult
 */
export function computeResult(
  answers: TestAnswerItem[],
  bank: TestBankPayload
): TestResult {
  // 构建答案映射
  const answerMap = new Map<number, TestAnswerItem>();
  for (const a of answers) {
    answerMap.set(a.questionId, a);
  }

  // 按category分组统计
  const categoryStats: Record<
    string,
    { totalWeightedScore: number; totalWeight: number; questionCount: number; scaleMax: number }
  > = {};

  // 初始化所有类别
  const allCategories = new Set<string>();
  for (const q of bank.questions) {
    allCategories.add(q.category);
  }

  for (const cat of allCategories) {
    categoryStats[cat] = {
      totalWeightedScore: 0,
      totalWeight: 0,
      questionCount: 0,
      scaleMax: 5, // 默认值
    };
  }

  // 计算每个category的加权得分
  for (const q of bank.questions) {
    const answer = answerMap.get(q.id);
    if (!answer || answer.skipped || answer.value == null) continue;

    const category = q.category;
    if (!categoryStats[category]) {
      categoryStats[category] = {
        totalWeightedScore: 0,
        totalWeight: 0,
        questionCount: 0,
        scaleMax: q.scale,
      };
    }

    const stats = categoryStats[category];
    stats.totalWeightedScore += answer.value * q.weight;
    stats.totalWeight += q.weight;
    stats.questionCount += 1;
    stats.scaleMax = Math.max(stats.scaleMax, q.scale);
  }

  // 计算原始分数和归一化分数
  const scores: Record<string, number> = {};
  const normalized: Record<string, number> = {};
  let orientationSpectrum: number | undefined;

  for (const [category, stats] of Object.entries(categoryStats)) {
    if (stats.questionCount === 0) {
      scores[category] = 0;
      normalized[category] = 0;
      continue;
    }

    // 按照PRD算法：(score * weight) / (total_questions * scale_max) * 100
    const rawScore = stats.totalWeightedScore / (stats.questionCount * stats.scaleMax);
    scores[category] = Math.round(rawScore * 100 * 100) / 100; // 保留两位小数

    // 归一化到0-100
    normalized[category] = Math.round(rawScore * 100);

    // 计算Kinsey光谱（Orientation类别）
    if (category === "Orientation") {
      // Orientation类别的问题使用1-7量表，直接映射到0-7光谱
      orientationSpectrum = Math.round((rawScore * stats.scaleMax) * 10) / 10;
      // 限制在0-7范围内
      orientationSpectrum = Math.max(0, Math.min(7, orientationSpectrum));
    }
  }

  return {
    scores,
    normalized,
    orientation_spectrum: orientationSpectrum,
  };
}


