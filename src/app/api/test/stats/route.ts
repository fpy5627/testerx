/**
 * API：匿名统计占位
 * 作用：接收匿名统计上报（当前不持久化，返回 204）。
 */

import { NextResponse } from "next/server";

/**
 * 处理匿名统计上报（POST）。
 * 输入：任意JSON（忽略）
 * 输出：204 No Content
 */
export async function POST(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204 });
}


