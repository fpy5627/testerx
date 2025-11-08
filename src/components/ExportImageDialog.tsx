"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileImage, Sparkles } from "lucide-react";

interface ExportImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (isSimplified: boolean, chartType: "radar" | "bar") => void;
}

/**
 * 导出图片对话框组件
 * 让用户选择导出精简版或完整版
 */
export default function ExportImageDialog({
  open,
  onOpenChange,
  onExport,
}: ExportImageDialogProps) {
  const t = useTranslations("test.result");
  const { resolvedTheme } = useTheme();
  const [selectedOption, setSelectedOption] = React.useState<"simplified" | "full">("simplified");
  const [chartType, setChartType] = React.useState<"radar" | "bar">("radar");

  const handleExport = () => {
    onExport(selectedOption === "simplified", chartType);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden rounded-2xl"
        style={{
          background: resolvedTheme === "dark"
            ? "linear-gradient(135deg, rgba(43, 51, 62, 0.98) 0%, rgba(35, 42, 52, 0.98) 100%)"
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.99) 0%, rgba(248, 250, 252, 0.99) 100%)",
          border: resolvedTheme === "dark"
            ? "1.5px solid rgba(32, 224, 192, 0.35)"
            : "1.5px solid rgba(32, 224, 192, 0.4)",
        }}
      >
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <FileImage className="w-5 h-5" style={{ color: "#20E0C0" }} />
            选择导出内容
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground pt-2">
            请选择要导出的内容版本和图表类型
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* 图表类型选择 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">图表类型</label>
            <div className="grid grid-cols-2 gap-3">
              {/* 雷达图选项 */}
              <button
                onClick={() => setChartType("radar")}
                className={`p-3 rounded-xl border-2 transition-all duration-300 text-left ${
                  chartType === "radar"
                    ? "border-[#20E0C0] bg-[#20E0C0]/10"
                    : "border-transparent bg-muted/50 hover:bg-muted"
                }`}
                style={{
                  borderColor: chartType === "radar" ? "#20E0C0" : undefined,
                  background: chartType === "radar"
                    ? resolvedTheme === "dark"
                      ? "rgba(32, 224, 192, 0.15)"
                      : "rgba(32, 224, 192, 0.1)"
                    : undefined,
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      chartType === "radar" ? "border-[#20E0C0]" : "border-muted-foreground"
                    }`}
                  >
                    {chartType === "radar" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#20E0C0]" />
                    )}
                  </div>
                  <span className="text-sm font-medium">雷达图</span>
                </div>
              </button>

              {/* 柱状图选项 */}
              <button
                onClick={() => setChartType("bar")}
                className={`p-3 rounded-xl border-2 transition-all duration-300 text-left ${
                  chartType === "bar"
                    ? "border-[#20E0C0] bg-[#20E0C0]/10"
                    : "border-transparent bg-muted/50 hover:bg-muted"
                }`}
                style={{
                  borderColor: chartType === "bar" ? "#20E0C0" : undefined,
                  background: chartType === "bar"
                    ? resolvedTheme === "dark"
                      ? "rgba(32, 224, 192, 0.15)"
                      : "rgba(32, 224, 192, 0.1)"
                    : undefined,
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      chartType === "bar" ? "border-[#20E0C0]" : "border-muted-foreground"
                    }`}
                  >
                    {chartType === "bar" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#20E0C0]" />
                    )}
                  </div>
                  <span className="text-sm font-medium">柱状图</span>
                </div>
              </button>
            </div>
          </div>

          {/* 内容版本选择 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">内容版本</label>
            {/* 精简版选项 */}
            <button
            onClick={() => setSelectedOption("simplified")}
            className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
              selectedOption === "simplified"
                ? "border-[#20E0C0] bg-[#20E0C0]/10"
                : "border-transparent bg-muted/50 hover:bg-muted"
            }`}
            style={{
              borderColor: selectedOption === "simplified" ? "#20E0C0" : undefined,
              background: selectedOption === "simplified"
                ? resolvedTheme === "dark"
                  ? "rgba(32, 224, 192, 0.15)"
                  : "rgba(32, 224, 192, 0.1)"
                : undefined,
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  selectedOption === "simplified" ? "border-[#20E0C0]" : "border-muted-foreground"
                }`}
              >
                {selectedOption === "simplified" && (
                  <div className="w-3 h-3 rounded-full bg-[#20E0C0]" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4" style={{ color: "#20E0C0" }} />
                  <span className="font-semibold">精简版（推荐）</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  包含图表、Top 3 特征和简要分析，适合快速分享
                </p>
              </div>
            </div>
          </button>

          {/* 完整版选项 */}
          <button
            onClick={() => setSelectedOption("full")}
            className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
              selectedOption === "full"
                ? "border-[#20E0C0] bg-[#20E0C0]/10"
                : "border-transparent bg-muted/50 hover:bg-muted"
            }`}
            style={{
              borderColor: selectedOption === "full" ? "#20E0C0" : undefined,
              background: selectedOption === "full"
                ? resolvedTheme === "dark"
                  ? "rgba(32, 224, 192, 0.15)"
                  : "rgba(32, 224, 192, 0.1)"
                : undefined,
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  selectedOption === "full" ? "border-[#20E0C0]" : "border-muted-foreground"
                }`}
              >
                {selectedOption === "full" && (
                  <div className="w-3 h-3 rounded-full bg-[#20E0C0]" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileImage className="w-4 h-4" style={{ color: "#20E0C0" }} />
                  <span className="font-semibold">完整版</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  包含所有内容：图表、详细分析和完整文本，适合完整报告
                </p>
              </div>
            </div>
          </button>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-lg"
          >
            取消
          </Button>
          <Button
            onClick={handleExport}
            className="rounded-lg"
            style={{
              background: "linear-gradient(135deg, rgba(32, 224, 192, 0.95) 0%, rgba(20, 184, 166, 0.95) 100%)",
              color: 'white',
              border: 'none',
            }}
          >
            导出图片
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

