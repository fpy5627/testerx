/**
 * API：初始化默认题库到数据库
 * 作用：将内置默认题库同步到数据库（首次运行或重置时使用）。
 */

import { NextResponse } from "next/server";
import { upsertDimension, createQuestion } from "@/models/test";
import { getDefaultDimensions, getDefaultQuestions } from "@/models/testdata";

/**
 * 处理初始化请求（POST）。
 * Body: { locale: string }
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    const locale = body.locale || "en";

    // 同步维度
    const dimensions = getDefaultDimensions();
    for (const dim of dimensions) {
      await upsertDimension(dim, locale);
    }

    // 同步题目（如果不存在）
    const questions = getDefaultQuestions();
    for (const q of questions) {
      await createQuestion(q, locale);
    }

    return NextResponse.json({
      success: true,
      message: `Initialized ${dimensions.length} dimensions and ${questions.length} questions for locale ${locale}`,
    });
  } catch (error) {
    console.error("Init error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

