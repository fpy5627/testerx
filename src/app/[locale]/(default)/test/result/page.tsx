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
import { usePathname, useRouter } from "next/navigation";

function ResultInner() {
  const t = useTranslations("test.result");
  const { bank, result, history, reset, init, deleteHistory, clearAllHistory } = useTestContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const segs = (pathname || "/en").split("/").filter(Boolean);
    const locale = segs[0] || "en";
    void init(locale);
  }, [init, pathname]);

  if (!bank) return <div className="container mx-auto max-w-3xl py-10">加载中…</div>;

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
        <div className="rounded-lg border p-4">
          <ResultChart bank={bank} result={result} variant="radar" />
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {bank.dimensions.map((d) => (
          <div key={d.id} className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">{d.name}</div>
            <div className="text-2xl font-semibold">
              {result?.normalized?.[d.id] ?? 0}
              <span className="text-sm text-muted-foreground ml-1">/100</span>
            </div>
            {d.description ? (
              <p className="mt-2 text-xs text-muted-foreground">{d.description}</p>
            ) : null}
          </div>
        ))}
      </div>

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


