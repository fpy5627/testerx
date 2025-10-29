/**
 * 页面：测试入口（介绍/免责声明 + 开始）
 * 作用：展示测试目的、娱乐性质声明，进入前年龄与隐私确认。
 */

"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AgePrivacyModal } from "@/components/ui/ConsentModals";

export default function TestIntroPage() {
  const t = useTranslations("test.intro");
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

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
    const segs = (pathname || "/en").split("/").filter(Boolean);
    const locale = segs[0] || "en";
    router.push(`/${locale}/test/run`);
  }

  return (
    <div className="container mx-auto max-w-3xl py-10">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="mt-4 text-muted-foreground">
        {t("description")}
      </p>
      <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        <li>{t("feature_1")}</li>
        <li>{t("feature_2")}</li>
        <li>{t("feature_3")}</li>
      </ul>
      <div className="mt-8">
        <Button onClick={handleStart}>{t("start_button")}</Button>
      </div>

      <AgePrivacyModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}


