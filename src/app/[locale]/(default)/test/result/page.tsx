/**
 * 页面：测试结果
 * 作用：展示维度得分与解释，提供重测与历史查看入口。
 */

"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { TestProvider, useTestContext } from "@/contexts/test";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import ResultText from "@/components/ResultText";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { createShareLink } from "@/lib/share";
import { Copy, Download, Share2 as ShareIcon, FileJson } from "lucide-react";
import { toast } from "sonner";

// 动态导入 ResultChart 组件，确保只在客户端加载
const ResultChart = dynamic(
  () => import("@/components/ui/ResultChart").then((mod) => ({ default: mod.default || mod.ResultChart })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 flex items-center justify-center bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4">
        <p className="text-muted-foreground">加载图表中...</p>
      </div>
    ),
  }
);

function ResultInner() {
  const t = useTranslations("test.result");
  const { resolvedTheme } = useTheme();
  const { bank, result, progress, history, reset, init, deleteHistory, clearAllHistory } = useTestContext();
  const router = useRouter();
  const locale = useLocale();
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 获取所有categories（排除Orientation，单独处理）
   * 使用 useMemo 避免每次渲染都重新创建 Set
   * 必须在所有条件返回之前调用
   */
  const categories = useMemo(() => {
    if (!bank?.questions || bank.questions.length === 0) {
      return [];
    }
    const categorySet = new Set<string>();
    for (const q of bank.questions) {
      if (q.category !== "Orientation") {
        categorySet.add(q.category);
      }
    }
    return Array.from(categorySet);
  }, [bank]);

  // 获取当前要显示的结果（优先使用result，如果没有则使用history中最新的一条）
  const currentResult = useMemo(() => {
    if (result) return result;
    if (history && history.length > 0) {
      return history[0].result;
    }
    return null;
  }, [result, history]);

  /**
   * 计算 Top 3 Traits（按分数排序，取前3个）
   * 必须在所有条件返回之前调用
   */
  const getTopTraits = useMemo(() => {
    const displayResult = currentResult;
    if (!displayResult || !displayResult.normalized) return [];
    const categoryScores = categories
      .map((cat) => {
        const categoryMeta = bank?.categories?.[cat];
        const score = displayResult.normalized?.[cat] ?? 0;
        return {
          id: cat,
          name: categoryMeta?.name || cat,
          score,
          description: categoryMeta?.description,
        };
      })
      .filter((item) => item.score > 0) // 过滤掉分数为0的类别
      .sort((a, b) => b.score - a.score) // 按分数降序排序
      .slice(0, 3); // 取前3个
    return categoryScores;
  }, [currentResult, bank, categories]);

  useEffect(() => {
    /**
     * 初始化题库，添加错误处理
     */
    async function initialize() {
      try {
        await init(locale);
      } catch (err) {
        console.error("初始化失败:", err);
        setError("初始化失败，请刷新页面重试");
      }
    }
    void initialize();
  }, [init, locale]);

  /**
   * 生成分享链接
   */
  const handleShare = async () => {
    const displayResult = currentResult;
    if (!displayResult) {
      toast.error("没有可分享的结果");
      return;
    }
    setIsGeneratingShare(true);
    try {
      const shareId = await createShareLink(displayResult);
      const url = `${window.location.origin}/${locale}/share/${shareId}`;
      setShareLink(url);
      await navigator.clipboard.writeText(url);
      toast.success(t("share_link_copied"));
    } catch (error) {
      console.error("Failed to create share link:", error);
      toast.error(t("share_link_failed"));
    } finally {
      setIsGeneratingShare(false);
    }
  };

  /**
   * 复制分享链接
   */
  const handleCopyShareLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success(t("share_link_copied"));
    } catch (error) {
      console.error("Failed to copy share link:", error);
      toast.error(t("share_link_failed"));
    }
  };

  /**
   * 导出PDF（使用浏览器打印功能）
   * 用户可以保存为PDF或打印
   */
  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      // 使用浏览器打印功能生成PDF
      // 用户可以选择"另存为PDF"或直接打印
      window.print();
      toast.success(t("download_pdf_hint"));
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("PDF生成失败");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  /**
   * 清除所有数据（GDPR合规）
   * 清除localStorage中的所有测试数据
   */
  const handleClearAllData = async () => {
    if (!confirm(t("clear_all_data_confirm"))) {
      return;
    }
    
    try {
      // 清除所有历史记录
      await clearAllHistory();
      // 清除当前结果
      await reset();
      // 清除localStorage中的其他测试相关数据
      if (typeof window !== "undefined") {
        localStorage.removeItem("test.progress.v1");
        localStorage.removeItem("test.history.v1");
        localStorage.removeItem("test.shares.v1");
        sessionStorage.removeItem("testMode");
      }
      toast.success(t("clear_all_data_success"));
      // 刷新页面
      window.location.reload();
    } catch (error) {
      console.error("清除数据失败:", error);
      toast.error("清除数据失败");
    }
  };

  /**
   * 导出答题结果JSON
   * 包含完整的答题结果、答案、题目信息等
   */
  const handleExportJSON = () => {
    const displayResult = currentResult;
    if (!displayResult || !bank || !progress) {
      toast.error("无法导出：数据不完整");
      return;
    }

    try {
      // 构建导出数据
      const exportData = {
        // 元数据
        metadata: {
          version: bank.version || "v2.0",
          locale: bank.locale || "zh",
          exportedAt: new Date().toISOString(),
          testMode: typeof window !== "undefined" ? sessionStorage.getItem("testMode") || "standard" : "standard",
        },
        // 测试结果
        result: {
          scores: displayResult.scores || {},
          normalized: displayResult.normalized || {},
          orientation_spectrum: displayResult.orientation_spectrum,
          text_analysis: displayResult.text_analysis,
        },
        // 答题记录
        answers: progress.answers.map((answer) => {
          const question = bank.questions.find((q) => q.id === answer.questionId);
          return {
            questionId: answer.questionId,
            question: question?.question || "",
            category: question?.category || "",
            value: answer.value,
            skipped: answer.skipped || false,
            answeredAt: new Date().toISOString(), // 实际应该从进度中获取时间戳
          };
        }),
        // 题目信息（用于参考）
        questions: bank.questions.map((q) => ({
          id: q.id,
          category: q.category,
          question: q.question,
          type: q.type,
          scale: q.scale,
          weight: q.weight,
          depth: q.depth,
          hint: q.hint,
        })),
      };

      // 创建JSON字符串并下载
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `test-result-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(t("export_json_success"));
    } catch (error) {
      console.error("Failed to export JSON:", error);
      toast.error(t("export_json_failed"));
    }
  };

  // 错误状态显示
  if (error) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden transition-colors duration-200">
        <div 
          className="absolute inset-0 dark:bg-[#2b333e] transition-colors duration-200"
          style={{
            background: resolvedTheme === "dark" 
              ? "#2b333e" 
              : "linear-gradient(to bottom, rgba(32, 224, 192, 0.5) 0%, rgba(255, 255, 255, 1) 100%)"
          }}
        />
        <div className="relative z-10 w-full px-6 sm:px-8 md:px-12 lg:px-16 flex-1 flex flex-col items-center justify-center pt-16 sm:pt-20 md:pt-24">
          <div className="w-full max-w-4xl">
            <div 
              className="rounded-2xl md:rounded-3xl p-6 relative backdrop-blur-sm"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.5)'
              }}
            >
              <h2 className="text-xl font-semibold text-red-500 mb-2">错误</h2>
              <p className="text-muted-foreground">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
                style={{
                  backgroundColor: 'rgba(32, 224, 192, 0.87)',
                  color: 'white'
                }}
              >
                刷新页面
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!bank || !bank.questions || bank.questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden transition-colors duration-200">
        <div 
          className="absolute inset-0 dark:bg-[#2b333e] transition-colors duration-200"
          style={{
            background: resolvedTheme === "dark" 
              ? "#2b333e" 
              : "linear-gradient(to bottom, rgba(32, 224, 192, 0.5) 0%, rgba(255, 255, 255, 1) 100%)"
          }}
        />
        <div className="relative z-10 w-full px-6 sm:px-8 md:px-12 lg:px-16 flex-1 flex flex-col items-center justify-center pt-16 sm:pt-20 md:pt-24">
          <div className="w-full max-w-4xl text-center">
            <p className="text-muted-foreground">加载中…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden transition-colors duration-200">
      {/* 背景 - 与答题界面保持一致 */}
      <div 
        className="absolute inset-0 dark:bg-[#2b333e] transition-colors duration-200"
        style={{
          background: resolvedTheme === "dark" 
            ? "radial-gradient(ellipse at top, #3a4550 0%, #2b333e 50%, #1f2630 100%)" 
            : "radial-gradient(ellipse at top, rgba(32, 224, 192, 0.15) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(240, 253, 250, 0.9) 100%)"
        }}
      />
      
      {/* 装饰性背景图案 */}
      <div 
        className="absolute inset-0 opacity-30 dark:opacity-10"
        style={{
          backgroundImage: resolvedTheme === "dark"
            ? "radial-gradient(circle at 20% 50%, rgba(32, 224, 192, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(32, 224, 192, 0.1) 0%, transparent 50%)"
            : "radial-gradient(circle at 20% 50%, rgba(32, 224, 192, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(32, 224, 192, 0.08) 0%, transparent 50%)"
        }}
      />
      
      <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 lg:px-12 flex-1 flex flex-col items-center justify-center pt-8 sm:pt-10 md:pt-12 pb-8 sm:pb-10 md:pb-12">
        <div className="w-full max-w-6xl flex-1 flex flex-col space-y-4 md:space-y-6">
          {/* 标题区域 - 紧凑布局 */}
          <div className="text-center mb-4 md:mb-6">
            <h1 
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2"
              style={{
                color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.87)" : "rgba(0, 0, 0, 0.87)"
              }}
            >
              {t("title")}
            </h1>
            <p 
              className="text-xs sm:text-sm text-muted-foreground"
              style={{
                color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"
              }}
            >
              {t("disclaimer")}
            </p>
          </div>

          {/* 如果没有结果，显示提示 */}
          {!currentResult ? (
            <div 
              className="rounded-xl sm:rounded-2xl p-6 md:p-8 text-center mx-4 sm:mx-6 md:mx-8 lg:mx-10 backdrop-blur-sm"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                border: '1px solid rgba(32, 224, 192, 0.3)'
              }}
            >
              <p 
                className="text-muted-foreground mb-4"
                style={{
                  color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"
                }}
              >
                暂无测试结果
              </p>
              <Button 
                onClick={() => router.push(`/${locale}/test`)}
                style={{
                  backgroundColor: 'rgba(32, 224, 192, 0.87)',
                  color: 'white'
                }}
              >
                {t("retest")}
              </Button>
            </div>
          ) : (
            <div className="px-4 sm:px-6 md:px-8 lg:px-10 space-y-6 md:space-y-8 pb-8 sm:pb-10 md:pb-12">
              {/* 分数概览与图表 - 美化版 */}
              <div 
                className="rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 transition-all duration-300 hover:shadow-xl"
                style={{
                  background: resolvedTheme === "dark" 
                    ? "rgba(255, 255, 255, 0.05)" 
                    : "rgba(255, 255, 255, 0.7)",
                  border: `1px solid ${resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(32, 224, 192, 0.2)"}`,
                  boxShadow: resolvedTheme === "dark"
                    ? "0 4px 16px rgba(0, 0, 0, 0.3)"
                    : "0 4px 20px rgba(32, 224, 192, 0.15), 0 2px 8px rgba(32, 224, 192, 0.1)"
                }}
              >
                <ResultChart bank={bank} result={currentResult} variant="radar" />
              </div>

              {/* Top 3 Traits 标签 - 美化版 */}
              {getTopTraits.length > 0 && (
                <div 
                  className="rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 transition-all duration-300 hover:shadow-xl"
                  style={{
                    background: resolvedTheme === "dark" 
                      ? "rgba(255, 255, 255, 0.05)" 
                      : "rgba(255, 255, 255, 0.7)",
                    border: `1px solid ${resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(32, 224, 192, 0.2)"}`,
                    boxShadow: resolvedTheme === "dark"
                      ? "0 4px 16px rgba(0, 0, 0, 0.3)"
                      : "0 4px 20px rgba(32, 224, 192, 0.15), 0 2px 8px rgba(32, 224, 192, 0.1)"
                  }}
                >
                  <h2 
                    className="text-xl sm:text-2xl md:text-3xl font-bold mb-6"
                    style={{
                      color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.85)",
                      textShadow: resolvedTheme === "dark" 
                        ? "0 2px 8px rgba(0, 0, 0, 0.3)" 
                        : "0 2px 12px rgba(32, 224, 192, 0.15)"
                    }}
                  >
                    {t("top_traits")}
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    {getTopTraits.map((trait, index) => (
                      <div
                        key={trait.id}
                        className="flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 hover:scale-105"
                        style={{
                          background: "linear-gradient(135deg, rgba(32, 224, 192, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)",
                          border: '2px solid rgba(32, 224, 192, 0.5)',
                          boxShadow: "0 2px 8px rgba(32, 224, 192, 0.3)"
                        }}
                      >
                        {/* 排名徽章 */}
                        <div 
                          className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm text-white"
                          style={{
                            background: "linear-gradient(135deg, rgba(32, 224, 192, 0.9) 0%, rgba(20, 184, 166, 0.9) 100%)",
                            boxShadow: "0 2px 6px rgba(32, 224, 192, 0.4)"
                          }}
                        >
                          {index + 1}
                        </div>
                        <span 
                          className="text-sm md:text-base font-semibold"
                          style={{
                            color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.85)"
                          }}
                        >
                          {trait.name}
                        </span>
                        <span 
                          className="text-xs md:text-sm font-medium px-2 py-1 rounded-full"
                          style={{
                            color: 'rgba(32, 224, 192, 0.9)',
                            backgroundColor: resolvedTheme === "dark" ? "rgba(32, 224, 192, 0.15)" : "rgba(32, 224, 192, 0.1)"
                          }}
                        >
                          {trait.score}/100
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

                {/* 文本分析 */}
                {currentResult.text_analysis || currentResult.normalized ? (
                  <div 
                    className="rounded-xl p-4 md:p-6 backdrop-blur-sm"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.6)',
                      border: '1px solid rgba(32, 224, 192, 0.3)'
                    }}
                  >
                    <h2 
                      className="text-lg md:text-xl font-semibold mb-3"
                      style={{
                        color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.87)" : "rgba(0, 0, 0, 0.87)"
                      }}
                    >
                      分析结果
                    </h2>
                    <div className="text-sm leading-relaxed">
                      <ResultText result={currentResult} />
                    </div>
                  </div>
                ) : null}
              </div>

              {/* 右侧：类别分数卡片和操作按钮 */}
              <div className="space-y-4 md:space-y-6">

                {/* 类别分数卡片 */}
                {categories.length > 0 && (
                  <div className="grid gap-3 md:grid-cols-1">
                    {categories.map((cat) => {
                      const categoryMeta = bank.categories?.[cat];
                      const score = currentResult.normalized?.[cat] ?? 0;
                      return (
                        <div 
                          key={cat} 
                          className="rounded-xl p-3 md:p-4 backdrop-blur-sm"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.6)',
                            border: '1px solid rgba(32, 224, 192, 0.3)'
                          }}
                        >
                          <div 
                            className="text-xs mb-1.5"
                            style={{
                              color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"
                            }}
                          >
                            {categoryMeta?.name || cat}
                          </div>
                          <div 
                            className="text-xl md:text-2xl font-semibold"
                            style={{
                              color: 'rgba(32, 224, 192, 0.87)'
                            }}
                          >
                            {score}
                            <span 
                              className="text-xs ml-1"
                              style={{
                                color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"
                              }}
                            >
                              /100
                            </span>
                          </div>
                          {categoryMeta?.description ? (
                            <p 
                              className="mt-1.5 text-xs leading-tight"
                              style={{
                                color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"
                              }}
                            >
                              {categoryMeta.description}
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Kinsey光谱展示（如果有Orientation结果） */}
                {currentResult.orientation_spectrum !== undefined ? (
                  <div 
                    className="rounded-xl p-3 md:p-4 backdrop-blur-sm"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.6)',
                      border: '1px solid rgba(32, 224, 192, 0.3)'
                    }}
                  >
                    <h3 
                      className="text-sm md:text-base font-semibold mb-2"
                      style={{
                        color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.87)" : "rgba(0, 0, 0, 0.87)"
                      }}
                    >
                      性取向光谱
                    </h3>
                    <div className="space-y-2">
                      <div 
                        className="h-6 rounded-full relative overflow-hidden backdrop-blur-sm"
                        style={{
                          backgroundColor: resolvedTheme === "dark" ? "rgba(156, 163, 175, 0.3)" : "rgba(156, 163, 175, 0.3)"
                        }}
                      >
                        <div
                          className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(currentResult.orientation_spectrum / 7) * 100}%`,
                            backgroundColor: 'rgba(32, 224, 192, 0.87)'
                          }}
                        />
                        <div
                          className="absolute top-0 left-0 h-full w-full flex items-center justify-center text-xs font-medium"
                          style={{ zIndex: 1 }}
                        >
                          {currentResult.orientation_spectrum.toFixed(1)} / 7
                        </div>
                      </div>
                      <div 
                        className="text-xs text-center"
                        style={{
                          color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"
                        }}
                      >
                        {currentResult.orientation_spectrum <= 1 ? "Heterosexual" :
                         currentResult.orientation_spectrum <= 3 ? "Bisexual/Fluid" :
                         currentResult.orientation_spectrum <= 5 ? "Homosexual" :
                         "Asexual/Aromantic"}
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* 分享和下载按钮 */}
                <div 
                  className="rounded-xl p-3 md:p-4 backdrop-blur-sm"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(32, 224, 192, 0.3)'
                  }}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={handleShare}
                      disabled={isGeneratingShare}
                      size="sm"
                      className="flex items-center gap-1.5 text-xs"
                      style={{
                        backgroundColor: 'rgba(32, 224, 192, 0.87)',
                        color: 'white'
                      }}
                    >
                      <ShareIcon className="w-3 h-3" />
                      {isGeneratingShare ? "..." : t("share_button")}
                    </Button>
                    {shareLink && (
                      <Button
                        variant="outline"
                        onClick={handleCopyShareLink}
                        size="sm"
                        className="flex items-center gap-1.5 text-xs"
                        style={{
                          borderColor: 'rgba(32, 224, 192, 0.5)',
                          color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.87)" : "rgba(0, 0, 0, 0.87)"
                        }}
                      >
                        <Copy className="w-3 h-3" />
                        复制链接
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={handleDownloadPdf}
                      disabled={isGeneratingPdf}
                      size="sm"
                      className="flex items-center gap-1.5 text-xs"
                      style={{
                        borderColor: 'rgba(32, 224, 192, 0.5)',
                        color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.87)" : "rgba(0, 0, 0, 0.87)"
                      }}
                    >
                      <Download className="w-3 h-3" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleExportJSON}
                      size="sm"
                      className="flex items-center gap-1.5 text-xs"
                      style={{
                        borderColor: 'rgba(32, 224, 192, 0.5)',
                        color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.87)" : "rgba(0, 0, 0, 0.87)"
                      }}
                    >
                      <FileJson className="w-3 h-3" />
                      JSON
                    </Button>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => reset()}
                    size="sm"
                    className="flex-1 text-xs"
                    style={{
                      backgroundColor: 'rgba(32, 224, 192, 0.87)',
                      color: 'white'
                    }}
                  >
                    {t("retest")}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => router.back()}
                    size="sm"
                    className="flex-1 text-xs"
                    style={{
                      borderColor: 'rgba(32, 224, 192, 0.5)',
                      color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.87)" : "rgba(0, 0, 0, 0.87)"
                    }}
                  >
                    {t("back")}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 历史记录和隐私说明 - 底部紧凑布局 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* 历史记录 */}
            <div 
              className="rounded-xl p-4 backdrop-blur-sm"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                border: '1px solid rgba(32, 224, 192, 0.3)'
              }}
            >
              <h2 
                className="text-base md:text-lg font-semibold mb-3"
                style={{
                  color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.87)" : "rgba(0, 0, 0, 0.87)"
                }}
              >
                {t("history_title")}
              </h2>
              {history.length === 0 ? (
                <p 
                  className="text-xs"
                  style={{
                    color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"
                  }}
                >
                  {t("no_history")}
                </p>
              ) : (
                <>
                  <ul className="space-y-2 text-xs max-h-32 overflow-y-auto">
                    {history.slice(0, 3).map((h) => (
                      <li 
                        key={h.id} 
                        className="rounded-lg p-2 flex items-center justify-between gap-2 backdrop-blur-sm"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.4)',
                          border: '1px solid rgba(32, 224, 192, 0.2)'
                        }}
                      >
                        <div className="flex flex-col flex-1 min-w-0">
                          <span 
                            className="truncate text-xs"
                            style={{
                              color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.87)" : "rgba(0, 0, 0, 0.87)"
                            }}
                          >
                            {new Date(h.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <Button 
                          size="sm"
                          variant="outline" 
                          onClick={() => deleteHistory(h.id)}
                          className="h-6 px-2 text-xs"
                          style={{
                            borderColor: 'rgba(32, 224, 192, 0.5)',
                            color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.87)" : "rgba(0, 0, 0, 0.87)"
                          }}
                        >
                          删除
                        </Button>
                      </li>
                    ))}
                  </ul>
                  {history.length > 3 && (
                    <p className="text-xs mt-2" style={{ color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)" }}>
                      还有 {history.length - 3} 条记录...
                    </p>
                  )}
                  {history.length > 0 && (
                    <div className="pt-2 mt-2 border-t" style={{ borderColor: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(32, 224, 192, 0.2)" }}>
                      <Button 
                        size="sm"
                        variant="destructive" 
                        onClick={() => clearAllHistory()}
                        className="w-full text-xs h-7"
                      >
                        {t("clear_all")}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 隐私说明 */}
            <div 
              className="rounded-xl p-4 backdrop-blur-sm"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                border: '1px solid rgba(32, 224, 192, 0.3)'
              }}
            >
              <p 
                className="text-xs mb-3 leading-relaxed"
                style={{
                  color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"
                }}
              >
                {t("principle")}
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearAllData}
                className="w-full text-xs h-7"
              >
                {t("clear_all_data")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 结果页面组件
 * 使用 TestProvider 包装 ResultInner 组件
 */
export default function ResultPage() {
  return (
    <TestProvider>
      <ResultInner />
    </TestProvider>
  );
}


