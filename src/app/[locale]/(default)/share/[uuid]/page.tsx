/**
 * 页面：分享结果页
 * 作用：根据UUID显示分享的测试结果，提供"我也要测试"按钮。
 */

"use client";

import React, { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import ResultChart from "@/components/ui/ResultChart";
import ResultText from "@/components/ResultText";
import { getShareResult } from "@/lib/share";
import type { TestResult, TestBankPayload } from "@/types/test";
import { loadTestBank } from "@/services/test-bank";
import { TestProvider } from "@/contexts/test";
import { Play } from "lucide-react";

function ShareInner() {
  const t = useTranslations("test.result");
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const uuid = params.uuid as string;
  const [shareResult, setShareResult] = useState<TestResult | null>(null);
  const [bank, setBank] = useState<TestBankPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * 加载分享结果和题库
     */
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        // 加载分享结果
        const share = await getShareResult(uuid);
        if (!share) {
          setError("分享链接不存在或已过期");
          setLoading(false);
          return;
        }

        setShareResult(share.result);

        // 加载题库
        const loadedBank = await loadTestBank(locale);
        if (!loadedBank || !loadedBank.questions || loadedBank.questions.length === 0) {
          setError("题库加载失败");
          setLoading(false);
          return;
        }

        setBank(loadedBank);
      } catch (err) {
        console.error("Failed to load share data:", err);
        setError("加载失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    }

    if (uuid) {
      void loadData();
    }
  }, [uuid, locale]);

  /**
   * 跳转到首页（用户可以在首页开始测试）
   */
  const handleStartTest = () => {
    // 使用国际化路由，跳转到首页
    // 首页会显示测试入口，用户可以点击开始测试
    router.push("/");
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl py-10 text-center">
        <p>加载中…</p>
      </div>
    );
  }

  if (error || !shareResult || !bank) {
    return (
      <div className="container mx-auto max-w-3xl py-10 text-center space-y-4">
        <p className="text-red-500">{error || "数据加载失败"}</p>
        <Button onClick={handleStartTest}>
          <Play className="w-4 h-4 mr-2" />
          我也要测试
        </Button>
      </div>
    );
  }

  // 获取所有categories（排除Orientation，单独处理）
  const categories = new Set<string>();
  for (const q of bank.questions) {
    if (q.category !== "Orientation") {
      categories.add(q.category);
    }
  }

  // 计算 Top 3 Traits
  const getTopTraits = Array.from(categories)
    .map((cat) => {
      const categoryMeta = bank.categories?.[cat];
      const score = shareResult.normalized?.[cat] ?? 0;
      return {
        id: cat,
        name: categoryMeta?.name || cat,
        score,
        description: categoryMeta?.description,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <div className="container mx-auto max-w-3xl py-10 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">{t("share_title") || "分享的测试结果"}</h1>
        <p className="text-muted-foreground">{t("disclaimer") || "这是一个匿名分享的测试结果"}</p>
      </div>

      {/* 分数概览与图表 */}
      <div className="rounded-lg border p-4">
        <ResultChart bank={bank} result={shareResult} variant="radar" />
      </div>

      {/* Top 3 Traits 标签 */}
      {getTopTraits.length > 0 && (
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">{t("top_traits") || "Top 3 特征"}</h2>
          <div className="flex flex-wrap gap-3">
            {getTopTraits.map((trait, index) => (
              <div
                key={trait.id}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20"
              >
                <span className="text-sm font-semibold text-primary">
                  #{index + 1}
                </span>
                <span className="text-sm font-medium">{trait.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({trait.score}/100)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 文本分析 */}
      {shareResult.text_analysis ? (
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">分析结果</h2>
          <ResultText result={shareResult} />
        </div>
      ) : null}

      {/* 类别分数卡片 */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from(categories).map((cat) => {
          const categoryMeta = bank.categories?.[cat];
          const score = shareResult.normalized?.[cat] ?? 0;
          return (
            <div key={cat} className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">{categoryMeta?.name || cat}</div>
              <div className="text-2xl font-semibold">
                {score}
                <span className="text-sm text-muted-foreground ml-1">/100</span>
              </div>
              {categoryMeta?.description ? (
                <p className="mt-2 text-xs text-muted-foreground">{categoryMeta.description}</p>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Kinsey光谱展示（如果有Orientation结果） */}
      {shareResult.orientation_spectrum !== undefined ? (
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-semibold mb-2">性取向光谱 (Kinsey-like)</h3>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-8 bg-muted rounded-full relative overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-primary rounded-full"
                style={{ width: `${(shareResult.orientation_spectrum / 7) * 100}%` }}
              />
              <div
                className="absolute top-0 left-0 h-full w-full flex items-center justify-center text-xs font-medium"
                style={{ zIndex: 1 }}
              >
                {shareResult.orientation_spectrum.toFixed(1)} / 7
              </div>
            </div>
            <div className="text-sm text-muted-foreground min-w-[120px]">
              {shareResult.orientation_spectrum <= 1 ? "Heterosexual" :
               shareResult.orientation_spectrum <= 3 ? "Bisexual/Fluid" :
               shareResult.orientation_spectrum <= 5 ? "Homosexual" :
               "Asexual/Aromantic"}
            </div>
          </div>
        </div>
      ) : null}

      {/* CTA按钮 */}
      <div className="flex justify-center pt-6">
        <Button size="lg" onClick={handleStartTest} className="flex items-center gap-2">
          <Play className="w-5 h-5" />
          {t("retest") || "我也要测试"}
        </Button>
      </div>

      <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground text-center">
        {t("principle")}
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <TestProvider>
      <ShareInner />
    </TestProvider>
  );
}

