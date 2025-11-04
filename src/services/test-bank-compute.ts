/**
 * 模块：测试结果计算服务（新权重系统）
 * 作用：基于新的权重系统计算测试结果
 * 算法：score[dimension] += (answer_value - 3) * weight，然后归一化到0-100
 */

import type { TestAnswerItem } from "@/types/test";
import type { TestBankJSONTemplate, QuestionWeights } from "@/types/test-bank";
import type { TestResult } from "@/types/test";

/**
 * 计算测试结果（新权重系统）
 * 算法：score[dimension] += (answer_value - 3) * weight
 * 然后归一化到0-100分
 * 
 * @param answers 作答记录
 * @param bank 题库（新格式）
 * @returns TestResult
 */
export function computeResultWithWeights(
  answers: TestAnswerItem[],
  bank: TestBankJSONTemplate
): TestResult {
  // 构建答案映射
  const answerMap = new Map<number, TestAnswerItem>();
  for (const a of answers) {
    answerMap.set(a.questionId, a);
  }

  // 初始化所有维度的得分累加器
  const dimensionScores: Record<string, number> = {};
  const dimensionCounts: Record<string, number> = {};
  
  // 初始化所有维度
  for (const dim of bank.dimensions) {
    dimensionScores[dim.id] = 0;
    dimensionCounts[dim.id] = 0;
  }

  // 遍历所有问题，计算每个维度的得分
  for (const question of bank.questions) {
    const answer = answerMap.get(question.id);
    if (!answer || answer.skipped || answer.value == null) continue;

    // Likert值：1=Strongly disagree, 2=Disagree, 3=Neutral, 4=Agree, 5=Strongly agree
    const answerValue = answer.value;
    // 计算偏移值：(answer_value - 3)，使得3（Neutral）为0点
    const offset = answerValue - 3;

    // 应用权重到每个维度
    for (const [dimensionId, weight] of Object.entries(question.weights)) {
      if (dimensionScores.hasOwnProperty(dimensionId)) {
        const scoreContribution = offset * weight;
        dimensionScores[dimensionId] += scoreContribution;
        dimensionCounts[dimensionId] += 1;
      }
    }
  }

  // 计算原始分数和归一化分数
  const scores: Record<string, number> = {};
  const normalized: Record<string, number> = {};

  // 确定每个维度的最小和最大可能得分（用于归一化）
  // 对于每个维度，计算所有相关问题的最大和最小权重
  const dimensionMinMax: Record<string, { min: number; max: number }> = {};
  
  for (const dim of bank.dimensions) {
    let minScore = 0;
    let maxScore = 0;
    
    // 遍历所有问题，找到该维度的最大和最小可能得分
    for (const question of bank.questions) {
      const weight = question.weights[dim.id];
      if (weight !== undefined) {
        // 最小可能得分：answer_value = 1 (Strongly disagree), offset = -2
        // 最大可能得分：answer_value = 5 (Strongly agree), offset = 2
        if (weight > 0) {
          minScore += -2 * weight; // 最小
          maxScore += 2 * weight; // 最大
        } else if (weight < 0) {
          minScore += 2 * weight; // 当weight为负时，-2*weight为最大
          maxScore += -2 * weight; // 当weight为负时，2*weight为最小
        }
      }
    }
    
    dimensionMinMax[dim.id] = { min: minScore, max: maxScore };
  }

  // 归一化每个维度的得分到0-100
  for (const dim of bank.dimensions) {
    const rawScore = dimensionScores[dim.id];
    const { min, max } = dimensionMinMax[dim.id];
    const range = max - min;
    
    if (range === 0) {
      scores[dim.id] = 0;
      normalized[dim.id] = 50; // 如果范围为0，设为中性值50
    } else {
      // 归一化到0-100：(rawScore - min) / (max - min) * 100
      const normalizedScore = ((rawScore - min) / range) * 100;
      scores[dim.id] = Math.round(rawScore * 100) / 100; // 保留两位小数
      normalized[dim.id] = Math.max(0, Math.min(100, Math.round(normalizedScore)));
    }
  }

  return {
    scores,
    normalized,
  };
}

/**
 * 将新格式的题库转换为旧格式（兼容性）
 * @param bank 新格式题库
 * @returns 旧格式题库
 */
export function convertBankToLegacyFormat(
  bank: TestBankJSONTemplate
): {
  questions: Array<{
    id: number;
    category: string;
    question: string;
    type: "scale";
    scale: number;
    weight: number;
  }>;
  categories: Record<string, { name: string; description?: string }>;
} {
  const questions: Array<{
    id: number;
    category: string;
    question: string;
    type: "scale";
    scale: number;
    weight: number;
  }> = [];
  
  const categories: Record<string, { name: string; description?: string }> = {};

  // 构建categories
  for (const dim of bank.dimensions) {
    categories[dim.id] = {
      name: dim.name,
      description: dim.description,
    };
  }

  // 转换questions：每个问题需要为每个有正权重的维度创建一条记录
  for (const question of bank.questions) {
    // 找到权重最大的维度作为主要category
    let maxWeight = 0;
    let primaryDimension = "";
    
    for (const [dimId, weight] of Object.entries(question.weights)) {
      if (Math.abs(weight) > Math.abs(maxWeight)) {
        maxWeight = weight;
        primaryDimension = dimId;
      }
    }

    if (primaryDimension) {
      questions.push({
        id: question.id,
        category: primaryDimension,
        question: question.text,
        type: "scale",
        scale: 5, // Likert 1-5
        weight: Math.abs(maxWeight), // 使用绝对权重值
      });
    }
  }

  return { questions, categories };
}

