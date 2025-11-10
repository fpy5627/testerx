/**
 * 页面：历史记录页面
 * 作用：显示用户的所有测试历史记录，支持查看、删除和清空操作
 */

"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { TestProvider, useTestContext } from "@/contexts/test";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, History, ArrowLeft, Eye, Calendar, Hash } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";

/**
 * 获取颜色主题（根据索引循环使用不同颜色）
 * @param index 索引
 * @returns 颜色主题对象
 */
function getColorTheme(index: number) {
  const themes = [
    {
      primary: "rgba(34, 197, 94, 0.9)", // 绿色
      secondary: "rgba(16, 185, 129, 0.9)",
      bg: "rgba(34, 197, 94, 0.1)",
      border: "rgba(34, 197, 94, 0.3)",
    },
    {
      primary: "rgba(59, 130, 246, 0.9)", // 蓝色
      secondary: "rgba(37, 99, 235, 0.9)",
      bg: "rgba(59, 130, 246, 0.1)",
      border: "rgba(59, 130, 246, 0.3)",
    },
    {
      primary: "rgba(168, 85, 247, 0.9)", // 紫色
      secondary: "rgba(147, 51, 234, 0.9)",
      bg: "rgba(168, 85, 247, 0.1)",
      border: "rgba(168, 85, 247, 0.3)",
    },
    {
      primary: "rgba(236, 72, 153, 0.9)", // 粉色
      secondary: "rgba(219, 39, 119, 0.9)",
      bg: "rgba(236, 72, 153, 0.1)",
      border: "rgba(236, 72, 153, 0.3)",
    },
    {
      primary: "rgba(251, 146, 60, 0.9)", // 橙色
      secondary: "rgba(249, 115, 22, 0.9)",
      bg: "rgba(251, 146, 60, 0.1)",
      border: "rgba(251, 146, 60, 0.3)",
    },
  ];
  return themes[index % themes.length];
}

/**
 * 历史记录页面内部组件
 * 使用 useTestContext 获取测试上下文数据
 */
function HistoryInner() {
  const t = useTranslations("test.result");
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const { history, restoreResult, deleteHistory, clearAllHistory, init } = useTestContext();
  const [mounted, setMounted] = useState(false);

  // 确保组件已挂载
  useEffect(() => {
    setMounted(true);
    // 初始化测试上下文
    void init();
  }, [init]);

  // 处理查看历史记录
  const handleViewHistory = (historyItem: typeof history[0]) => {
    restoreResult(historyItem);
    router.push("/bdsm-test/result");
  };

  // 处理删除历史记录
  const handleDeleteHistory = async (id: string) => {
    try {
      await deleteHistory(id);
      toast.success(t("delete_success") || "删除成功");
    } catch (error) {
      console.error("删除历史记录失败:", error);
      toast.error(t("delete_failed") || "删除失败");
    }
  };

  // 处理清空所有历史记录
  const handleClearAllHistory = async () => {
    if (window.confirm(t("clear_all_confirm") || "确定要清空所有历史记录吗？此操作不可恢复。")) {
      try {
        await clearAllHistory();
        toast.success(t("clear_all_success") || "已清空所有历史记录");
      } catch (error) {
        console.error("清空历史记录失败:", error);
        toast.error(t("clear_all_failed") || "清空失败");
      }
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 dark:from-[#2b333e] dark:via-[#2b333e] dark:to-[#1a1f2e]">
      {/* 背景装饰 */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{
          background: resolvedTheme === "dark"
            ? "radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)"
            : "radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)",
        }}
      />

      <div className="container mx-auto px-4 py-8 sm:py-12 relative z-10">
        {/* 返回按钮和标题 */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/bdsm-test/result">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <History className="h-6 w-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
              {t("history_title")}
            </h1>
          </div>
        </div>

        {/* 主要内容卡片 */}
        <Card
          className="backdrop-blur-xl border-2 shadow-2xl"
          style={{
            background: resolvedTheme === "dark"
              ? "rgba(43, 51, 62, 0.8)"
              : "rgba(255, 255, 255, 0.9)",
            borderColor: resolvedTheme === "dark"
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
          }}
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <History className="h-5 w-5" />
                {t("history_title")}
              </span>
              {history.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  {t("history_count_message", { count: history.length })}
                </span>
              )}
            </CardTitle>
            <CardDescription>
              {t("principle")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg font-medium text-muted-foreground mb-2">
                  {t("no_history")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("no_history_description") || "完成测试后，您的结果将保存在这里。"}
                </p>
                <Link href="/bdsm-test">
                  <Button className="mt-6" variant="default">
                    {t("start_test") || "开始测试"}
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {/* 历史记录列表 */}
                <div className="space-y-4">
                  {history.map((h, index) => {
                    const theme = getColorTheme(index);
                    const date = new Date(h.createdAt);
                    const formattedDate = date.toLocaleString("zh-CN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={h.id}
                        className="group rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg relative overflow-hidden"
                        style={{
                          background: resolvedTheme === "dark"
                            ? `linear-gradient(135deg, ${theme.bg.replace("0.1", "0.08")} 0%, ${theme.bg} 100%)`
                            : `linear-gradient(135deg, ${theme.bg} 0%, ${theme.bg.replace("0.1", "0.08")} 100%)`,
                          border: `1.5px solid ${theme.border}`,
                          boxShadow: `0 4px 12px ${theme.border.replace("0.3", "0.15")}`,
                        }}
                      >
                        {/* 装饰性背景元素 */}
                        <div
                          className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
                          style={{
                            background: `radial-gradient(circle at 50% 50%, ${theme.primary} 0%, transparent 70%)`,
                          }}
                        />

                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          {/* 左侧：时间和ID信息 */}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" style={{ color: theme.primary }} />
                              <span className="font-semibold" style={{ color: theme.primary }}>
                                {formattedDate}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Hash className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground font-mono">
                                {t("record_id")}: {h.id.slice(-8)}
                              </span>
                            </div>
                          </div>

                          {/* 右侧：操作按钮 */}
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleViewHistory(h)}
                              className="rounded-lg transition-all duration-300 hover:scale-105"
                              style={{
                                background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                                color: "white",
                                boxShadow: `0 2px 8px ${theme.border.replace("0.3", "0.4")}`,
                                border: "none",
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {t("view") || "查看"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteHistory(h.id)}
                              className="rounded-lg transition-all duration-300 hover:scale-105"
                              style={{
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                background: resolvedTheme === "dark"
                                  ? "rgba(239, 68, 68, 0.1)"
                                  : "rgba(239, 68, 68, 0.05)",
                                color: resolvedTheme === "dark"
                                  ? "rgba(239, 68, 68, 0.9)"
                                  : "rgba(239, 68, 68, 0.8)",
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t("delete")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 清空所有按钮 */}
                {history.length > 0 && (
                  <div className="mt-6 pt-6 border-t" style={{ borderColor: "rgba(239, 68, 68, 0.2)" }}>
                    <Button
                      variant="destructive"
                      onClick={handleClearAllHistory}
                      className="w-full sm:w-auto rounded-lg transition-all duration-300 hover:scale-105"
                      style={{
                        background: "linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)",
                        boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
                        border: "none",
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("clear_all")}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * 历史记录页面组件
 * 使用 TestProvider 包装 HistoryInner 组件
 */
export default function HistoryPage() {
  return (
    <TestProvider>
      <HistoryInner />
    </TestProvider>
  );
}

