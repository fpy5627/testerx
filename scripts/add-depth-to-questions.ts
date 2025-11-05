/**
 * 脚本：为题库JSON文件添加depth字段
 * 作用：为现有题目批量添加depth字段（默认值为1，表示基础题）
 * 
 * 使用方法：
 * npx tsx scripts/add-depth-to-questions.ts
 */

import * as fs from "fs";
import * as path from "path";

interface Question {
  id: number;
  category: string;
  question: string;
  type: string;
  scale: number;
  weight: number;
  depth?: number;
  hint?: string;
  skippable?: boolean;
}

/**
 * 为题目添加depth字段
 * @param questions 题目数组
 * @param defaultDepth 默认深度值（默认1）
 * @returns 添加了depth字段的题目数组
 */
function addDepthToQuestions(questions: Question[], defaultDepth: number = 1): Question[] {
  return questions.map((q) => ({
    ...q,
    depth: q.depth ?? defaultDepth, // 如果已有depth字段，保持不变；否则使用默认值
  }));
}

/**
 * 处理单个JSON文件
 * @param filePath 文件路径
 * @param defaultDepth 默认深度值
 */
function processFile(filePath: string, defaultDepth: number = 1) {
  try {
    console.log(`处理文件: ${filePath}`);
    
    // 读取文件
    const content = fs.readFileSync(filePath, "utf-8");
    const questions: Question[] = JSON.parse(content);
    
    // 检查是否已经有depth字段
    const hasDepth = questions.some((q) => "depth" in q);
    if (hasDepth) {
      console.log(`  ⚠️  文件已包含depth字段，跳过处理`);
      return;
    }
    
    // 添加depth字段
    const updatedQuestions = addDepthToQuestions(questions, defaultDepth);
    
    // 写回文件（格式化JSON）
    const updatedContent = JSON.stringify(updatedQuestions, null, 2);
    fs.writeFileSync(filePath, updatedContent, "utf-8");
    
    console.log(`  ✅ 成功为 ${updatedQuestions.length} 道题目添加depth字段（默认值: ${defaultDepth}）`);
  } catch (error) {
    console.error(`  ❌ 处理文件失败: ${error}`);
  }
}

// 主函数
function main() {
  const projectRoot = path.resolve(__dirname, "..");
  const dataDir = path.join(projectRoot, "src", "data");
  
  // 处理的文件列表
  const files = [
    path.join(dataDir, "questions_zh.json"),
    path.join(dataDir, "questions_en.json"),
  ];
  
  console.log("开始为题库JSON文件添加depth字段...\n");
  
  for (const file of files) {
    if (fs.existsSync(file)) {
      processFile(file, 1); // 默认depth为1（基础题）
    } else {
      console.log(`  ⚠️  文件不存在: ${file}`);
    }
  }
  
  console.log("\n✅ 处理完成！");
  console.log("\n说明：");
  console.log("  - depth=1: 基础题（Quick Mode使用）");
  console.log("  - depth=2: 标准题（Standard Mode使用）");
  console.log("  - depth=3: 高级题（Deep Mode使用）");
  console.log("\n可以根据需要手动调整题目的depth值。");
}

main();

