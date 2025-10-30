/**
 * 组件：测试介绍区块
 * 作用：在首页展示测试入口，包含介绍和开始按钮。
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { AgePrivacyModal } from "@/components/ui/ConsentModals";

export default function TestIntro() {
  const t = useTranslations("test.intro");
  const router = useRouter();
  const locale = useLocale();
  const [open, setOpen] = React.useState(false);

  /**
   * 打开年龄与隐私确认弹窗。
   */
  function handleStart() {
    setOpen(true);
  }

  /**
   * 通过确认后跳转到运行页。
   */
  function handleConfirm() {
    setOpen(false);
    router.push(`/${locale}/test/run`);
  }

  return (
    <>
      <section className="relative overflow-hidden py-16 md:py-24">
        {/* Premium gradient background for landing block */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_800px_at_0%_0%,theme(colors.accent/0.15),transparent_60%),radial-gradient(1000px_600px_at_100%_0%,theme(colors.primary/0.10),transparent_60%),radial-gradient(1000px_600px_at_100%_100%,theme(colors.accent/0.12),transparent_60%)]"
        />
        <div className="relative z-10 container mx-auto max-w-5xl px-4">
          {/* 标题 居中 */}
          <h1 className="w-full text-center text-3xl font-bold md:text-4xl">{t("title")}</h1>
          <div className="mt-3 h-px w-full bg-foreground/10" />

          {/* 内容框 */}
          <div className="mt-16 mb-10 rounded-2xl border bg-primary/5 p-8 pb-12 pl-12 md:pl-16 shadow-sm backdrop-blur-sm">
            <div className="text-left">
              <p className="mb-6 max-w-2xl text-xl text-muted-foreground lg:text-2xl">
                {t("description")}
              </p>
              <ul className="mb-8 max-w-xl space-y-2 text-base text-muted-foreground lg:text-lg">
                <li>• {t("feature_1")}</li>
                <li>• {t("feature_2")}</li>
                <li>• {t("feature_3")}</li>
              </ul>
              <div className="mt-10 relative inline-flex">
                <span aria-hidden className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-primary/40 animate-pulse" />
                <span aria-hidden className="pointer-events-none absolute -inset-2 rounded-lg bg-primary/20 blur-xl opacity-40 animate-pulse" />
                <Button
                  className="relative w-[260px] h-14 rounded-lg text-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-xl hover:shadow-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/30"
                  size="lg"
                  onClick={handleStart}
                >
                  {t("start_button")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AgePrivacyModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}

