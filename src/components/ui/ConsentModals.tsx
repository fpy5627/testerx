/**
 * 组件：年龄与隐私声明弹窗
 * 作用：在开始测试前进行 18+ 年龄确认与隐私政策同意。
 */

"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface AgePrivacyModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AgePrivacyModal({ open, onClose, onConfirm }: AgePrivacyModalProps) {
  const t = useTranslations("test.consent");
  const [agreeAge, setAgreeAge] = React.useState(false);
  const [agreePrivacy, setAgreePrivacy] = React.useState(false);
  const canSubmit = agreeAge && agreePrivacy;

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <label className="flex items-center gap-2">
            <Checkbox 
              checked={agreeAge} 
              onCheckedChange={(v) => setAgreeAge(Boolean(v))}
              className="data-[state=checked]:bg-white data-[state=checked]:border-[#20E0C0] [&[data-state=checked]>div>svg]:text-[#20E0C0]"
            />
            <span>{t("age_check")}</span>
          </label>
          <label className="flex items-center gap-2">
            <Checkbox 
              checked={agreePrivacy} 
              onCheckedChange={(v) => setAgreePrivacy(Boolean(v))}
              className="data-[state=checked]:bg-white data-[state=checked]:border-[#20E0C0] [&[data-state=checked]>div>svg]:text-[#20E0C0]"
            />
            <span>{t("privacy_check")}</span>
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>{t("cancel")}</Button>
          <Button 
            onClick={onConfirm} 
            disabled={!canSubmit}
            className="text-gray-900 border-0 hover:opacity-90 disabled:opacity-50"
            style={{
              background: '#20E0C0',
            }}
          >
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


