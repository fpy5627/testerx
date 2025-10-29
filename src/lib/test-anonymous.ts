/**
 * 模块：匿名 ID 生成工具
 * 作用：基于 IP 和 User-Agent 生成匿名标识（不存储真实个人信息，符合 GDPR）。
 */

import { headers } from "next/headers";

/**
 * 从请求中生成匿名 ID（基于 IP + User-Agent 哈希）。
 * @param request Request 对象（可选，服务端使用 headers()）
 * @returns 匿名 ID 字符串
 */
export async function getAnonymousId(request?: Request): Promise<string> {
  let ip = "127.0.0.1";
  let userAgent = "";

  if (request) {
    // 客户端或 API route
    const forwardedFor = request.headers.get("x-forwarded-for");
    ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    userAgent = request.headers.get("user-agent") || "";
  } else {
    // 服务端组件
    const h = await headers();
    ip =
      h.get("cf-connecting-ip") ||
      h.get("x-real-ip") ||
      (h.get("x-forwarded-for") || "127.0.0.1").split(",")[0].trim();
    userAgent = h.get("user-agent") || "";
  }

  const combined = `${ip}|${userAgent}`;

  // 使用简单的哈希（实际可使用 crypto.subtle.digest）
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return `anon_${Math.abs(hash).toString(36)}`;
}

/**
 * 从 localStorage 或 cookie 中读取/写入匿名 ID（客户端）。
 * @returns 匿名 ID 或 null
 */
export function getStoredAnonymousId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("test.anonymous_id");
}

/**
 * 存储匿名 ID 到 localStorage（客户端）。
 * @param id 匿名 ID
 */
export function storeAnonymousId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("test.anonymous_id", id);
}

