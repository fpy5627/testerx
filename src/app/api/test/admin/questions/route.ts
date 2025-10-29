/**
 * API：管理员题目查询
 * 作用：查询题目列表（支持筛选审核状态）。
 */

import { NextResponse } from "next/server";
import { getAllQuestionsByLocale } from "@/models/test";

/**
 * 处理题目查询请求（GET）。
 * Query: ?locale=xx&status=pending|approved|rejected
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const locale = url.searchParams.get("locale") || "en";
    const status = url.searchParams.get("status");

    const questions = await getAllQuestionsByLocale(locale, status || undefined);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Get questions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

