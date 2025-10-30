/**
 * 页面：测试运行（答题）
 * 作用：展示题目、Likert 选项、进度条与跳过/前后控制。
 */

"use client";

import React, { useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { TestProvider, useTestContext } from "@/contexts/test";
import { Button } from "@/components/ui/button";
import { Likert } from "@/components/ui/Likert";
import TestProgressBar from "@/components/ui/TestProgress";
import { usePathname, useRouter } from "next/navigation";

function RunInner() {
  const t = useTranslations("test.run");
  const { bank, progress, init, answer, skip, next, prev, submit, loading } = useTestContext();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  useEffect(() => {
    void init(locale);
  }, [init, locale]);

  if (loading || !bank) {
    return <div className="container mx-auto max-w-3xl py-10">{t("loading")}</div>;
  }

  const total = bank.questions.length;
  const idx = progress.currentIndex;
  const q = bank.questions[idx];
  const a = progress.answers.find((x) => x.questionId === q.id);

  const onSet = (v: number) => {
    answer(q.id, v);
  };

  const onSkip = () => {
    skip(q.id);
    next();
  };

  const onNext = () => {
    if (idx >= total - 1) return;
    next();
  };

  const onPrev = () => {
    if (idx <= 0) return;
    prev();
  };

  const onSubmit = async () => {
    await submit();
    router.push(`/${locale}/test/result`);
  };

  return (
    <div className="container mx-auto max-w-3xl py-10 space-y-6">
      <TestProgressBar current={idx} total={total} />
      <div>
        <h2 className="text-xl font-semibold">{q.text}</h2>
        {q.hint ? <p className="mt-2 text-sm text-muted-foreground">{q.hint}</p> : null}
      </div>
      <Likert value={(a?.value as any) ?? undefined} onChange={(v) => onSet(v)} />
      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onPrev} disabled={idx <= 0}>{t("prev")}</Button>
          <Button variant="outline" onClick={onSkip} disabled={!q.skippable}>{t("skip")}</Button>
        </div>
        {idx < total - 1 ? (
          <Button onClick={onNext}>{t("next")}</Button>
        ) : (
          <Button onClick={onSubmit}>{t("submit")}</Button>
        )}
      </div>
    </div>
  );
}

export default function RunPage() {
  return (
    <TestProvider>
      <RunInner />
    </TestProvider>
  );
}


