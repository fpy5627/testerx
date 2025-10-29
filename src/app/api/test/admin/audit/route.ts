/**
 * API：题目审核
 * 作用：更新题目审核状态并记录审核日志。
 */

import { NextResponse } from "next/server";
import { updateQuestionAuditStatus } from "@/models/test";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/config";

/**
 * 处理审核请求（POST）。
 * Body: { questionId: number, status: "approved" | "rejected", reason?: string }
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { questionId, status, reason } = body;

    if (!questionId || !status) {
      return NextResponse.json(
        { error: "questionId and status required" },
        { status: 400 }
      );
    }

    await updateQuestionAuditStatus(
      questionId,
      status,
      reason,
      session.user.uuid
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Audit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

