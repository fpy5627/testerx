/**
 * 模块：分享服务
 * 作用：生成匿名UUID分享链接，存储到localStorage，支持分享结果查看。
 */

import type { TestResult } from "@/types/test";
import { secureSetLocal, secureGetLocal } from "./crypto";
import { getNonceStr } from "./hash";

/**
 * 常量：本地存储键与加密口令
 */
const STORAGE_KEY_SHARES = "test.shares.v1";
const STORAGE_PASSWORD = "anonymous-test-secret-v1";

/**
 * 分享结果接口
 */
export interface ShareResult {
  id: string;
  createdAt: string;
  result: TestResult;
}

/**
 * 生成分享链接并保存到localStorage
 * @param result 测试结果
 * @returns 分享UUID
 */
export async function createShareLink(result: TestResult): Promise<string> {
  const shareId = getNonceStr(12); // 生成12位随机ID
  const shareResult: ShareResult = {
    id: shareId,
    createdAt: new Date().toISOString(),
    result,
  };

  // 获取现有分享列表
  const existingShares = await getShareResults();
  const updatedShares = [shareResult, ...existingShares].slice(0, 100); // 最多保存100个分享

  // 加密存储
  await secureSetLocal(STORAGE_KEY_SHARES, updatedShares, STORAGE_PASSWORD);

  return shareId;
}

/**
 * 根据UUID获取分享结果
 * @param shareId 分享UUID
 * @returns 分享结果或null
 */
export async function getShareResult(shareId: string): Promise<ShareResult | null> {
  const shares = await getShareResults();
  return shares.find((s) => s.id === shareId) || null;
}

/**
 * 获取所有分享结果（从localStorage读取）
 * @returns 分享结果数组
 */
export async function getShareResults(): Promise<ShareResult[]> {
  try {
    const shares = await secureGetLocal<ShareResult[]>(
      STORAGE_KEY_SHARES,
      STORAGE_PASSWORD
    );
    return shares || [];
  } catch {
    return [];
  }
}

/**
 * 删除分享结果
 * @param shareId 分享UUID
 */
export async function deleteShareResult(shareId: string): Promise<void> {
  const shares = await getShareResults();
  const updatedShares = shares.filter((s) => s.id !== shareId);
  await secureSetLocal(STORAGE_KEY_SHARES, updatedShares, STORAGE_PASSWORD);
}

