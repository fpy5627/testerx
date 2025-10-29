/**
 * 后台页面：题库管理（导入/导出 JSON）
 * 作用：预览维度与题目，支持下载当前题库JSON与从文件导入（临时替换运行时题库）。
 * 说明：当前为前端内存替换，不持久化；正式环境建议接入数据库与审核流程。
 */

"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { TestBankPayload } from "@/types/test";
import { loadTestBank } from "@/services/test-bank";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export default function AdminTestBankPage() {
  const t = useTranslations("test.admin");
  const [bank, setBank] = useState<TestBankPayload | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const segs = (pathname || "/en").split("/").filter(Boolean);
    const locale = segs[0] || "en";
    loadTestBank(locale).then(setBank);
  }, [pathname]);

  /**
   * 导出当前题库 JSON 文件。
   */
  function handleExport() {
    if (!bank) return;
    const blob = new Blob([JSON.stringify(bank, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `test-bank-${bank.locale || "default"}-${bank.version}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * 导入 JSON 文件并替换内存中的 bank（仅当前页面生效）。
   * @param file 选择的文件
   */
  async function handleImport(file: File) {
    const text = await file.text();
    try {
      const next: TestBankPayload = JSON.parse(text);
      setBank(next);
      alert("已载入导入的题库（仅本次运行有效）");
    } catch (e) {
      alert("导入失败：JSON 解析错误");
    }
  }

  return (
    <div className="container mx-auto max-w-5xl py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} disabled={!bank}>{t("export")}</Button>
          <label className="inline-flex items-center gap-2">
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleImport(f);
              }}
            />
            <span className="inline-flex">
              <Button>{t("import")}</Button>
            </span>
          </label>
        </div>
      </div>

      {!bank ? (
        <div>{t("loading")}</div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold">{t("info")}</h2>
            <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-muted-foreground md:grid-cols-3">
              <div>{t("version")}：{bank.version}</div>
              <div>{t("locale")}：{bank.locale || "默认"}</div>
              <div>{t("dimension_count")}：{bank.dimensions.length}</div>
              <div>{t("question_count")}：{bank.questions.length}</div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold">{t("dimensions_title")}</h2>
            <ul className="mt-2 grid gap-3 md:grid-cols-3">
              {bank.dimensions.map((d) => (
                <li key={d.id} className="rounded border p-3">
                  <div className="text-sm text-muted-foreground">{d.id}</div>
                  <div className="font-medium">{d.name}</div>
                  {d.description ? (
                    <div className="mt-1 text-xs text-muted-foreground">{d.description}</div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold">{t("questions_title")}</h2>
            <ul className="mt-2 space-y-3">
              {bank.questions.map((q) => (
                <li key={q.id} className="rounded border p-3">
                  <div className="text-sm text-muted-foreground">{q.id}</div>
                  <div className="font-medium">{q.text}</div>
                  {q.hint ? (
                    <div className="mt-1 text-xs text-muted-foreground">{t("hint")}：{q.hint}</div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}


