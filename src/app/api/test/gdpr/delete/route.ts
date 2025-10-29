/**
 * API：GDPR 数据删除
 * 作用：根据匿名 ID 软删除用户的测试数据（合规要求）。
 */

import { NextResponse } from "next/server";
import { deleteTestResultsByAnonymousId } from "@/models/test";
import { getAnonymousId } from "@/lib/test-anonymous";

/**
 * 处理 GDPR 数据删除请求（POST）。
 * 输入：JSON { anonymousId?: string }（可选，未提供则从请求上下文生成）
 * 输出：200 OK { success: boolean }
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    let anonymousId = body.anonymousId;

    // 如果未提供，从请求上下文生成
    if (!anonymousId) {
      anonymousId = await getAnonymousId(request);
    }

    if (!anonymousId) {
      return NextResponse.json(
        { success: false, error: "Anonymous ID required" },
        { status: 400 }
      );
    }

    await deleteTestResultsByAnonymousId(anonymousId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("GDPR delete error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

