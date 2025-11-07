/**
 * 组件：年龄与隐私声明弹窗
 * 作用：在开始测试前进行 18+ 年龄确认与隐私政策同意。
 */

"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Lock, AlertCircle, UserCheck, Calendar } from "lucide-react";

interface AgePrivacyModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AgePrivacyModal({ open, onClose, onConfirm }: AgePrivacyModalProps) {
  const t = useTranslations("test.consent");
  const { resolvedTheme } = useTheme();
  const [agreeAge, setAgreeAge] = React.useState(false);
  const [agreePrivacy, setAgreePrivacy] = React.useState(false);
  const canSubmit = agreeAge && agreePrivacy;

  /**
   * 添加动画样式
   */
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const styleId = 'consent-modal-animations';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          @keyframes shimmer {
            0% { transform: translateX(-100%) skewX(-15deg); }
            100% { transform: translateX(200%) skewX(-15deg); }
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : undefined)}>
      <DialogContent 
        className="sm:max-w-lg p-0 overflow-hidden rounded-2xl"
        style={{
          background: resolvedTheme === "dark"
            ? "linear-gradient(135deg, rgba(43, 51, 62, 0.98) 0%, rgba(35, 42, 52, 0.98) 100%)"
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.99) 0%, rgba(248, 250, 252, 0.99) 100%)",
          border: resolvedTheme === "dark"
            ? "1.5px solid rgba(32, 224, 192, 0.35)"
            : "1.5px solid rgba(32, 224, 192, 0.4)",
          boxShadow: resolvedTheme === "dark"
            ? "0 30px 80px rgba(0, 0, 0, 0.7), 0 0 60px rgba(32, 224, 192, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 0 1px rgba(32, 224, 192, 0.1)"
            : "0 30px 80px rgba(32, 224, 192, 0.25), 0 15px 50px rgba(32, 224, 192, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 0 0 1px rgba(32, 224, 192, 0.15)"
        }}
      >
        {/* 装饰性背景光晕 - 多层 */}
        <div 
          className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-35 -z-0"
          style={{
            background: "radial-gradient(circle, rgba(32, 224, 192, 0.5) 0%, transparent 70%)"
          }}
        />
        <div 
          className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-25 -z-0"
          style={{
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)"
          }}
        />
        
        <div className="p-6 sm:p-8 relative z-10 min-h-[500px] sm:min-h-[550px]">
          <DialogHeader className="space-y-4 pt-6 sm:pt-8">
            {/* 标题区域 - 带图标 */}
            <div className="flex items-center justify-center gap-3 mb-2 -mt-4 sm:-mt-4">
              <div 
                className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full flex-shrink-0 relative group/icon transition-all duration-300 hover:scale-110"
                style={{
                  background: "linear-gradient(135deg, rgba(32, 224, 192, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)",
                  border: "1.5px solid rgba(32, 224, 192, 0.35)",
                  boxShadow: "0 3px 12px rgba(32, 224, 192, 0.25), 0 0 16px rgba(32, 224, 192, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                }}
              >
                {/* 图标光效 */}
                <div 
                  className="absolute inset-0 rounded-full opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300"
                  style={{
                    background: "radial-gradient(circle, rgba(32, 224, 192, 0.3) 0%, transparent 70%)"
                  }}
                />
                <UserCheck 
                  className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 transition-all duration-300 group-hover/icon:scale-110"
                  style={{
                    color: "rgba(32, 224, 192, 0.95)",
                    filter: "drop-shadow(0 0 6px rgba(32, 224, 192, 0.4))"
                  }}
                />
              </div>
              <DialogTitle 
                className="text-xl sm:text-2xl font-bold text-center"
                style={{
                  color: resolvedTheme === "dark" 
                    ? "rgba(255, 255, 255, 0.98)" 
                    : "rgba(0, 0, 0, 0.95)",
                  textShadow: resolvedTheme === "dark"
                    ? "0 2px 8px rgba(32, 224, 192, 0.2)"
                    : "0 1px 3px rgba(32, 224, 192, 0.1)"
                }}
              >
                {t("title")}
              </DialogTitle>
            </div>
            
            {/* 描述文本 */}
            <DialogDescription 
              className="text-left text-sm sm:text-base leading-relaxed mt-8 sm:mt-10 mb-4 sm:mb-5"
              style={{
                color: resolvedTheme === "dark" 
                  ? "rgba(255, 255, 255, 0.75)" 
                  : "rgba(0, 0, 0, 0.7)"
              }}
            >
              {t("description")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 sm:space-y-7 py-4">
            <div 
              className="flex items-start gap-3 p-5 rounded-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group relative overflow-hidden"
              style={{
                background: resolvedTheme === "dark"
                  ? agreeAge 
                    ? "linear-gradient(135deg, rgba(32, 224, 192, 0.12) 0%, rgba(20, 184, 166, 0.08) 100%)"
                    : "rgba(255, 255, 255, 0.05)"
                  : agreeAge
                    ? "linear-gradient(135deg, rgba(32, 224, 192, 0.12) 0%, rgba(20, 184, 166, 0.08) 100%)"
                    : "rgba(32, 224, 192, 0.05)",
                border: agreeAge
                  ? "2px solid rgba(32, 224, 192, 0.4)"
                  : "1.5px solid rgba(32, 224, 192, 0.25)",
                boxShadow: agreeAge
                  ? resolvedTheme === "dark"
                    ? "0 4px 16px rgba(32, 224, 192, 0.2), 0 0 20px rgba(32, 224, 192, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
                    : "0 4px 16px rgba(32, 224, 192, 0.25), 0 0 20px rgba(32, 224, 192, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)"
                  : "none"
              }}
              onClick={() => setAgreeAge(!agreeAge)}
            >
              {/* 选中时的背景光效 */}
              {agreeAge && (
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: "radial-gradient(circle at center, rgba(32, 224, 192, 0.15) 0%, transparent 70%)"
                  }}
                />
              )}
              <Checkbox 
                id="age-check"
                checked={agreeAge} 
                onCheckedChange={(checked) => {
                  setAgreeAge(checked === true);
                }}
                className="mt-0.5 relative z-10 data-[state=checked]:bg-[#20E0C0] data-[state=checked]:border-[#20E0C0] data-[state=checked]:text-white transition-all duration-300"
                style={{
                  boxShadow: agreeAge ? "0 0 12px rgba(32, 224, 192, 0.5), 0 0 20px rgba(32, 224, 192, 0.3)" : "none"
                }}
              />
              <div className="flex-1 relative z-10">
                <div className="flex items-center gap-2.5 mb-1">
                  <Shield 
                    className="w-5 h-5 transition-all duration-300"
                    style={{
                      color: agreeAge ? "rgba(32, 224, 192, 0.95)" : "rgba(32, 224, 192, 0.5)",
                      filter: agreeAge ? "drop-shadow(0 0 6px rgba(32, 224, 192, 0.6))" : "none",
                      transform: agreeAge ? "scale(1.1)" : "scale(1)"
                    }}
                  />
                  <label 
                    htmlFor="age-check" 
                    className="cursor-pointer text-sm sm:text-base font-semibold leading-relaxed transition-all duration-300"
                    style={{
                      color: resolvedTheme === "dark" 
                        ? (agreeAge ? "rgba(255, 255, 255, 0.98)" : "rgba(255, 255, 255, 0.7)")
                        : (agreeAge ? "rgba(0, 0, 0, 0.95)" : "rgba(0, 0, 0, 0.65)"),
                      textShadow: agreeAge && resolvedTheme === "dark"
                        ? "0 0 8px rgba(32, 224, 192, 0.3)"
                        : "none"
                    }}
                  >
                    {t("age_check")}
                  </label>
                </div>
              </div>
            </div>
            
            <div 
              className="flex items-start gap-3 p-5 rounded-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group relative overflow-hidden"
              style={{
                background: resolvedTheme === "dark"
                  ? agreePrivacy 
                    ? "linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(124, 58, 237, 0.08) 100%)"
                    : "rgba(255, 255, 255, 0.05)"
                  : agreePrivacy
                    ? "linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(124, 58, 237, 0.08) 100%)"
                    : "rgba(139, 92, 246, 0.05)",
                border: agreePrivacy
                  ? "2px solid rgba(139, 92, 246, 0.4)"
                  : "1.5px solid rgba(139, 92, 246, 0.25)",
                boxShadow: agreePrivacy
                  ? resolvedTheme === "dark"
                    ? "0 4px 16px rgba(139, 92, 246, 0.2), 0 0 20px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
                    : "0 4px 16px rgba(139, 92, 246, 0.25), 0 0 20px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)"
                  : "none"
              }}
              onClick={() => setAgreePrivacy(!agreePrivacy)}
            >
              {/* 选中时的背景光效 */}
              {agreePrivacy && (
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: "radial-gradient(circle at center, rgba(139, 92, 246, 0.15) 0%, transparent 70%)"
                  }}
                />
              )}
              <Checkbox 
                id="privacy-check"
                checked={agreePrivacy} 
                onCheckedChange={(checked) => {
                  setAgreePrivacy(checked === true);
                }}
                className="mt-0.5 relative z-10 data-[state=checked]:bg-[#8B5CF6] data-[state=checked]:border-[#8B5CF6] data-[state=checked]:text-white transition-all duration-300"
                style={{
                  boxShadow: agreePrivacy ? "0 0 12px rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)" : "none"
                }}
              />
              <div className="flex-1 relative z-10">
                <div className="flex items-center gap-2.5 mb-1">
                  <Lock 
                    className="w-5 h-5 transition-all duration-300"
                    style={{
                      color: agreePrivacy ? "rgba(139, 92, 246, 0.95)" : "rgba(139, 92, 246, 0.5)",
                      filter: agreePrivacy ? "drop-shadow(0 0 6px rgba(139, 92, 246, 0.6))" : "none",
                      transform: agreePrivacy ? "scale(1.1)" : "scale(1)"
                    }}
                  />
                  <label 
                    htmlFor="privacy-check" 
                    className="cursor-pointer text-sm sm:text-base font-semibold leading-relaxed transition-all duration-300"
                    style={{
                      color: resolvedTheme === "dark" 
                        ? (agreePrivacy ? "rgba(255, 255, 255, 0.98)" : "rgba(255, 255, 255, 0.7)")
                        : (agreePrivacy ? "rgba(0, 0, 0, 0.95)" : "rgba(0, 0, 0, 0.65)"),
                      textShadow: agreePrivacy && resolvedTheme === "dark"
                        ? "0 0 8px rgba(139, 92, 246, 0.3)"
                        : "none"
                    }}
                  >
                    {t("privacy_check")}
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="w-full sm:w-auto h-11 rounded-xl transition-all duration-300 hover:scale-105"
              style={{
                color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.65)",
                border: "1px solid rgba(32, 224, 192, 0.2)"
              }}
            >
              {t("cancel")}
            </Button>
            <Button 
              onClick={onConfirm} 
              disabled={!canSubmit}
              className="w-full sm:w-auto h-12 rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              style={{
                background: canSubmit
                  ? "linear-gradient(135deg, rgba(32, 224, 192, 0.98) 0%, rgba(20, 184, 166, 0.98) 100%)"
                  : "linear-gradient(135deg, rgba(32, 224, 192, 0.4) 0%, rgba(20, 184, 166, 0.4) 100%)",
                color: 'white',
                boxShadow: canSubmit
                  ? '0 6px 24px rgba(32, 224, 192, 0.6), 0 3px 12px rgba(32, 224, 192, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 0 30px rgba(32, 224, 192, 0.3)'
                  : 'none',
                border: 'none'
              }}
            >
              {/* 按钮内部光效 */}
              {canSubmit && (
                <>
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, transparent 100%)"
                    }}
                  />
                  {/* 按钮流光效果 */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)",
                      transform: "translateX(-100%)",
                      animation: "shimmer 2s ease-in-out infinite"
                    }}
                  />
                </>
              )}
              <span className="relative z-10 flex items-center justify-center">
                {t("confirm")}
              </span>
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}


