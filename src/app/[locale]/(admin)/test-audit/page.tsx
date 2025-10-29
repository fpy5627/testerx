/**
 * 后台页面：题目审核管理
 * 作用：审核待审核题目，查看审核历史。
 */

"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import type { TestQuestionRow, TestQuestionAuditRow } from "@/models/test";

export default function TestAuditPage() {
  const [pendingQuestions, setPendingQuestions] = useState<TestQuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    void loadPending();
  }, [pathname]);

  /**
   * 加载待审核题目。
   */
  async function loadPending() {
    setLoading(true);
    try {
      const segs = (pathname || "/en").split("/").filter(Boolean);
      const locale = segs[0] || "en";
      const res = await fetch(`/api/test/admin/questions?locale=${locale}&status=pending`);
      const data = await res.json();
      setPendingQuestions(data.questions || []);
    } catch (error) {
      console.error("Load pending error:", error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * 审核题目。
   */
  async function auditQuestion(questionId: number, status: "approved" | "rejected", reason?: string) {
    try {
      await fetch("/api/test/admin/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, status, reason }),
      });
      await loadPending();
    } catch (error) {
      console.error("Audit error:", error);
      alert("审核失败");
    }
  }

  if (loading) {
    return <div className="container mx-auto max-w-5xl py-10">加载中…</div>;
  }

  return (
    <div className="container mx-auto max-w-5xl py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">题目审核管理</h1>
        <Button variant="outline" onClick={loadPending}>刷新</Button>
      </div>

      {pendingQuestions.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">暂无待审核题目</div>
      ) : (
        <div className="space-y-4">
          {pendingQuestions.map((q) => (
            <div key={q.id} className="rounded-lg border p-4 space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">ID: {q.question_id}</div>
                <div className="font-medium mt-1">{q.text}</div>
                {q.hint && <div className="text-sm text-muted-foreground mt-1">提示：{q.hint}</div>}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => auditQuestion(q.id, "approved")}
                >
                  通过
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    const reason = prompt("请输入拒绝原因（可选）：");
                    void auditQuestion(q.id, "rejected", reason || undefined);
                  }}
                >
                  拒绝
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

