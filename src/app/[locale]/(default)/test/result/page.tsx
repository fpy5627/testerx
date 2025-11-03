/**
 * 页面：测试结果
 * 作用：展示维度得分与解释，提供重测与历史查看入口。
 */

"use client";

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { TestProvider, useTestContext } from "@/contexts/test";
import { Button } from "@/components/ui/button";
import ResultChart from "@/components/ui/ResultChart";
import ResultText from "@/components/ResultText";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

function ResultInner() {
  const t = useTranslations("test.result");
  const { bank, result, history, reset, init, deleteHistory, clearAllHistory } = useTestContext();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    void init(locale);
  }, [init, locale]);

  if (!bank) return <div className="container mx-auto max-w-3xl py-10">加载中…</div>;
  
  // 获取所有categories（排除Orientation，单独处理）
  const categories = new Set<string>();
  for (const q of bank.questions) {
    if (q.category !== "Orientation") {
      categories.add(q.category);
    }
  }

  return (
    <div className="container mx-auto max-w-3xl py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("disclaimer")}
        </p>
      </div>

      {/* 分数概览与图表 */}
      {result ? (
        <>
        <div className="rounded-lg border p-4">
          <ResultChart bank={bank} result={result} variant="radar" />
          </div>

          {/* 文本分析 */}
          {result.text_analysis ? (
            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">分析结果</h2>
              <ResultText result={result} />
        </div>
      ) : null}

          {/* 类别分数卡片 */}
      <div className="grid gap-4 md:grid-cols-3">
            {Array.from(categories).map((cat) => {
              const categoryMeta = bank.categories?.[cat];
              const score = result.normalized?.[cat] ?? 0;
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
          {result.orientation_spectrum !== undefined ? (
            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-semibold mb-2">性取向光谱 (Kinsey-like)</h3>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-8 bg-muted rounded-full relative overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-primary rounded-full"
                    style={{ width: `${(result.orientation_spectrum / 7) * 100}%` }}
                  />
                  <div
                    className="absolute top-0 left-0 h-full w-full flex items-center justify-center text-xs font-medium"
                    style={{ zIndex: 1 }}
                  >
                    {result.orientation_spectrum.toFixed(1)} / 7
                  </div>
                </div>
                <div className="text-sm text-muted-foreground min-w-[120px]">
                  {result.orientation_spectrum <= 1 ? "Heterosexual" :
                   result.orientation_spectrum <= 3 ? "Bisexual/Fluid" :
                   result.orientation_spectrum <= 5 ? "Homosexual" :
                   "Asexual/Aromantic"}
                </div>
              </div>
      </div>
          ) : null}
        </>
      ) : null}

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">{t("history_title")}</h2>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("no_history")}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {history.map((h) => (
              <li key={h.id} className="rounded border p-3 flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span>{t("time")}：{new Date(h.createdAt).toLocaleString()}</span>
                  <span className="text-muted-foreground">{t("record_id")}：{h.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => deleteHistory(h.id)}>{t("delete")}</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {history.length > 0 ? (
          <div className="pt-2">
            <Button size="sm" variant="destructive" onClick={() => clearAllHistory()}>{t("clear_all")}</Button>
          </div>
        ) : null}
      </div>

      <div className="flex gap-2">
        <Button onClick={() => reset()}>{t("retest")}</Button>
        <Button variant="outline" onClick={() => router.back()}>{t("back")}</Button>
      </div>

      <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
        {t("principle")}
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <TestProvider>
      <ResultInner />
    </TestProvider>
  );
}


