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
 * 类别元数据定义（英文）
 */
const categoryMetadataEn: Record<string, { name: string; description?: string }> = {
  Dominance: {
    name: "Dominance",
    description: "You find profound satisfaction in guiding the rhythm and flow of intimate connections. Taking the lead feels natural and empowering, allowing you to create meaningful experiences through thoughtful direction and confident decision-making. This preference reflects a deep understanding of your own desires and a willingness to shape the dynamics of connection with clarity and intention.",
  },
  Submission: {
    name: "Submission",
    description: "There is a unique beauty in surrendering control to someone you trust deeply. You discover freedom within structure, finding peace and fulfillment in letting go and allowing your partner to guide the journey. This willingness to yield reflects profound trust, emotional intelligence, and an appreciation for the vulnerability that creates the deepest bonds.",
  },
  Switch: {
    name: "Switch",
    description: "Your emotional landscape is beautifully fluid, allowing you to move gracefully between different roles depending on the moment, the partner, and the connection you're building. This adaptability reflects emotional maturity and a deep understanding that intimacy is not fixed but dynamic—a dance where both partners can lead and follow, creating harmony through balance.",
  },
  Sadistic: {
    name: "Sadistic",
    description: "Within carefully negotiated boundaries, you find fulfillment in exercising authority and control. This preference is not about harm, but about the psychological depth that comes from structured power dynamics. It reflects a sophisticated understanding of consent, trust, and the complex ways in which power can be shared and experienced in intimate contexts.",
  },
  Masochistic: {
    name: "Masochistic",
    description: "You discover profound satisfaction in relinquishing control to someone who has earned your complete trust. This preference speaks to the deep psychological rewards of vulnerability and surrender—not as weakness, but as a conscious choice to experience intimacy through a different lens. It reflects courage, trust, and an appreciation for the transformative power of letting go.",
  },
  Vanilla: {
    name: "Vanilla",
    description: "You cherish the beauty of simplicity and authenticity in intimate connections. Traditional forms of expression resonate deeply with you, not because they are limited, but because they offer clarity, comfort, and genuine connection. This preference reflects an appreciation for the timeless ways humans connect—through tenderness, communication, and the profound simplicity of being truly present with another person.",
  },
  Exploration: {
    name: "Exploration",
    description: "Your curiosity about the vast landscape of human intimacy and expression knows few bounds. You approach new experiences with an open heart and mind, seeing each encounter as an opportunity to discover more about yourself, your partner, and the infinite ways connection can be expressed. This openness reflects intellectual curiosity, emotional courage, and a deep appreciation for the richness of human experience.",
  },
  Orientation: {
    name: "Orientation",
    description: "Sexual orientation spectrum (Kinsey-like 0-7)",
  },
};

/**
 * 类别元数据定义（中文）
 */
const categoryMetadataZh: Record<string, { name: string; description?: string }> = {
  Dominance: {
    name: "主导",
    description: "你在引导亲密关系的节奏与流动中找到了深层的满足感。掌控主导权对你而言自然而有力，让你能够通过深思熟虑的引导和自信的决策来创造有意义的体验。这种偏好反映了你对自身欲望的深刻理解，以及以清晰和意图塑造连接动态的意愿。",
  },
  Submission: {
    name: "顺从",
    description: "向深爱的人交出控制权，有着独特的美感。你在结构中发现自由，在放手与让伴侣引导旅程的过程中找到平静与满足。这种愿意屈服的意愿反映了深刻的信任、情感智慧，以及对创造最深纽带的那种脆弱性的欣赏。",
  },
  Switch: {
    name: "转换",
    description: "你的情感图景如流水般优美，让你能够优雅地在不同角色间移动，取决于当下的时刻、伴侣以及你正在建立的连接。这种适应性反映了情感成熟度，以及对亲密关系并非固定而是动态的深刻理解——这是一支双方都可以引领和跟随的舞蹈，通过平衡创造和谐。",
  },
  Sadistic: {
    name: "施虐",
    description: "在精心协商的边界内，你在行使权威和控制中找到了满足感。这种偏好并非关于伤害，而是关于来自结构化权力动态的心理深度。它反映了对同意、信任以及权力在亲密语境中可以被分享和体验的复杂方式的深刻理解。",
  },
  Masochistic: {
    name: "受虐",
    description: "你在向赢得你完全信任的人交出控制权中发现了深层的满足感。这种偏好诉说着脆弱和屈服的深层心理回报——不是作为弱点，而是作为通过不同视角体验亲密关系的自觉选择。它反映了勇气、信任，以及对放手转化力量的欣赏。",
  },
  Vanilla: {
    name: "传统",
    description: "你珍视亲密连接中简单与真实的美丽。传统的表达形式与你产生深刻共鸣，不是因为它们有限，而是因为它们提供了清晰、舒适和真正的连接。这种偏好反映了对人类连接永恒方式的欣赏——通过温柔、沟通，以及真正与另一个人同在的深刻简单。",
  },
  Exploration: {
    name: "探索",
    description: "你对人类亲密与表达的广阔图景的好奇心几乎没有边界。你以开放的心灵和思想接近新体验，将每一次相遇视为发现更多关于自己、伴侣以及连接可以被表达的无限方式的机会。这种开放反映了智力好奇心、情感勇气，以及对人类体验丰富性的深刻欣赏。",
  },
  Orientation: {
    name: "性取向",
    description: "性取向光谱（类似金赛量表 0-7）",
  },
};

/**
 * 根据语言环境获取类别元数据
 */
export function getCategoryMetadata(locale: string): Record<string, { name: string; description?: string }> {
  const isZh = locale === 'zh' || locale.startsWith('zh');
  return isZh ? categoryMetadataZh : categoryMetadataEn;
}

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

  // 构建类别元数据（根据语言环境）
  const categoryMetadata = getCategoryMetadata(locale);
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


