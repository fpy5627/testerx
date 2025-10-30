import type { Answer } from "@/contexts/TestStore";

export function computeResults(
  answers: Answer[],
  questions: any[]
): Record<string, number> {
  const categoryScores: Record<string, number[]> = {};
  answers.forEach((ans) => {
    const q = questions.find((q) => q.id === ans.id);
    if (!q) return;
    if (!categoryScores[q.category]) categoryScores[q.category] = [];
    categoryScores[q.category].push(ans.score * q.weight);
  });
  const result: Record<string, number> = {};
  Object.keys(categoryScores).forEach((cat) => {
    const total = categoryScores[cat].reduce((a, b) => a + b, 0);
    result[cat] = Math.round(
      (total / (categoryScores[cat].length * 5)) * 100
    );
  });
  return result;
}
