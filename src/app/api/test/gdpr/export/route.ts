/**
 * API：GDPR 数据导出
 * 作用：导出用户的测试数据（合规要求）。
 */

import { NextResponse } from "next/server";
import { exportUserData } from "@/models/test";
import { getAnonymousId } from "@/lib/test-anonymous";

/**
 * 处理 GDPR 数据导出请求（GET 或 POST）。
 * 输入：Query/JSON { anonymousId?: string }
 * 输出：200 OK（JSON 数据）
 */
export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  let anonymousId = url.searchParams.get("anonymousId");

  if (!anonymousId) {
    anonymousId = await getAnonymousId(request);
  }

  if (!anonymousId) {
    return NextResponse.json(
      { error: "Anonymous ID required" },
      { status: 400 }
    );
  }

  try {
    const data = await exportUserData(anonymousId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("GDPR export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    let anonymousId = body.anonymousId;

    if (!anonymousId) {
      anonymousId = await getAnonymousId(request);
    }

    if (!anonymousId) {
      return NextResponse.json(
        { error: "Anonymous ID required" },
        { status: 400 }
      );
    }

    const data = await exportUserData(anonymousId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("GDPR export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

