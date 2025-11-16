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
import ExportImageDialog from "@/components/ExportImageDialog";
import ExportImageLayout from "@/components/ExportImageLayout";

// 动态导入 ResultChart 组件，确保只在客户端加载
const ResultChart = dynamic(
  () => import("@/components/ui/ResultChart").then((mod) => ({ default: mod.default || mod.ResultChart })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 flex items-center justify-center bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    ),
  }
);

function ResultInner() {
  const t = useTranslations("test.result");
  const tHeadings = useTranslations("headings");
  const { resolvedTheme } = useTheme();
  const { bank, result, progress, history, reset, init, restoreResult, deleteHistory, clearAllHistory } = useTestContext();
  const router = useRouter();
  const locale = useLocale();
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportLayoutVisible, setExportLayoutVisible] = useState(false);
  const [exportIsSimplified, setExportIsSimplified] = useState(true);
  const [exportChartType, setExportChartType] = useState<"radar" | "bar">("radar");

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

  /**
   * 计算答题进度百分比（与答题页面保持一致）
   * 使用与答题页面完全相同的计算逻辑
   */
  const progressPercentage = useMemo(() => {
    if (!bank || !bank.questions || !progress || !progress.answers) {
      return 0;
    }
    const total = bank.questions.length;
    if (total === 0) return 0;
    
    // 使用与答题页面完全相同的计算逻辑
    const answeredCount = progress.answers.filter((a) => a.value !== undefined).length;
    const skippedCount = progress.answers.filter((a) => a.skipped === true).length;
    const completedCount = answeredCount + skippedCount; // 已完成（已回答或跳过）的题目数
    
    const progressPercentage = total > 0 ? (completedCount / total) * 100 : 0;
    return Math.round(progressPercentage); // 四舍五入，与答题页面保持一致
  }, [bank, progress]);

  /**
   * 检查是否有实际答题数据
   * 1. 检查答题进度是否达到10%（优先检查）
   * 2. 检查 result.normalized 是否有非零分数（说明是从历史记录恢复的有效结果）
   * 3. 检查 progress.answers 中是否有实际答案
   */
  const hasAnsweredQuestions = useMemo(() => {
    // 优先检查答题进度是否达到10%
    if (progressPercentage >= 10) {
      return true;
    }
    
    // 如果 result 存在且有 normalized 数据，检查是否有非零分数
    if (result && result.normalized) {
      const hasNonZeroScore = Object.values(result.normalized).some(score => score > 0);
      if (hasNonZeroScore) {
        return true; // 有有效分数，说明是有效结果（可能是从历史记录恢复的）
      }
    }
    
    // 检查 progress.answers 中是否有实际答案
    if (!progress || !progress.answers || progress.answers.length === 0) {
      return false;
    }
    // 检查是否有至少一道题有实际答案（有 value 且不是 skipped）
    return progress.answers.some(answer => answer.value !== undefined && !answer.skipped);
  }, [progress, result, progressPercentage]);

  /**
   * 计算 Top 3 Traits（按分数排序，取前3个）
   * 必须在所有条件返回之前调用
   */
  const getTopTraits = useMemo(() => {
    if (!result || !result.normalized || !hasAnsweredQuestions) return [];
    const categoryScores = categories
      .map((cat) => {
        const categoryMeta = bank?.categories?.[cat];
        const score = result.normalized?.[cat] ?? 0;
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
  }, [result, bank, categories, hasAnsweredQuestions]);

  /**
   * 从历史记录恢复最后一次结果
   */
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
   * 如果没有结果但有历史记录，自动加载最后一次结果
   */
  useEffect(() => {
    if (!result && history.length > 0 && bank) {
      // 从历史记录中自动恢复最后一次结果
      const lastHistoryItem = history[0];
      if (lastHistoryItem && lastHistoryItem.result) {
        restoreResult(lastHistoryItem);
      }
    }
  }, [result, history, bank, restoreResult]);

  /**
   * 如果 result 存在但 progress 为空或进度为0，尝试从历史记录中恢复对应的 progressSnapshot
   */
  useEffect(() => {
    if (result && bank && history.length > 0) {
      // 检查当前 progress 是否有效
      const currentProgress = progressPercentage;
      
      // 如果进度为0或很小，尝试从历史记录中恢复进度快照
      if (currentProgress === 0 || (!progress || !progress.answers || progress.answers.length === 0)) {
        // 查找与当前 result 匹配的历史记录（通过 normalized 数据匹配）
        const matchingHistory = history.find((item) => {
          if (!item.result || !item.progressSnapshot) return false;
          // 简单匹配：检查 normalized 数据是否相似
          const resultNormalized = JSON.stringify(result.normalized || {});
          const itemNormalized = JSON.stringify(item.result.normalized || {});
          return resultNormalized === itemNormalized;
        });
        
        if (matchingHistory && matchingHistory.progressSnapshot) {
          // 恢复进度快照
          restoreResult(matchingHistory);
        }
      }
    }
  }, [result, progress, history, bank, progressPercentage, restoreResult]);

  /**
   * 生成分享链接
   */
  const handleShare = async () => {
    if (!result) return;
    setIsGeneratingShare(true);
    try {
      const shareId = await createShareLink(result);
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
   * 用户可以选择"另存为PDF"或直接打印
   */
  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      // 使用浏览器打印功能生成PDF
      // 用户可以选择"另存为PDF"或直接打印
      window.print();
      toast.success(t("download_pdf_hint") || "请使用浏览器的打印功能保存为PDF");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("PDF生成失败");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  /**
   * 打开导出图片对话框
   */
  const handleOpenExportDialog = () => {
    if (!result || !bank) {
      toast.error("无法导出：数据不完整");
      return;
    }
    setShowExportDialog(true);
  };

  /**
   * 导出图片（PNG格式）
   * 将结果页面内容转换为图片并下载
   * 使用 html2canvas 库将 DOM 元素转换为图片
   * @param isSimplified 是否导出精简版
   */
  const handleDownloadImage = async (isSimplified: boolean, chartType: "radar" | "bar" = "radar") => {
    if (!result || !bank) {
      toast.error("无法导出：数据不完整");
      return;
    }

    setIsGeneratingImage(true);
    setExportIsSimplified(isSimplified);
    setExportChartType(chartType);
    
    try {
      // 动态导入 html2canvas（如果库不存在，会抛出错误）
      let html2canvas;
      try {
        html2canvas = (await import("html2canvas")).default;
      } catch (importError) {
        console.error("html2canvas not available:", importError);
        toast.error(t("export_image_failed") || "图片导出功能需要安装 html2canvas 库。请使用打印功能保存为PDF。");
        setIsGeneratingImage(false);
        return;
      }
      
      // 显示导出布局
      setExportLayoutVisible(true);
      
      // 等待布局渲染 - 增加等待时间确保所有内容加载完成
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 获取要导出的内容区域
      let element = document.getElementById("export-image-layout");
      if (!element) {
        // 如果找不到，再等待一下
        await new Promise(resolve => setTimeout(resolve, 1000));
        element = document.getElementById("export-image-layout");
      }
      
      if (!element) {
        toast.error("无法找到导出内容");
        setIsGeneratingImage(false);
        setExportLayoutVisible(false);
        return;
      }

      // 确保元素样式正确
      const el = element as HTMLElement;
      el.style.position = 'relative';
      el.style.visibility = 'visible';
      el.style.opacity = '1';
      el.style.display = 'block';
      el.style.width = '100%';
      el.style.height = 'auto';
      el.style.left = '0';
      el.style.top = '0';
      el.style.marginTop = '0';
      el.style.marginBottom = '0';
      el.style.paddingTop = '3rem';
      el.style.paddingBottom = '3rem';
      el.style.zIndex = '10';
      
      // 滚动到顶部，确保内容从顶部开始显示
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      
      // 获取导出布局的父容器（固定定位的容器）
      const exportContainer = el.parentElement;
      if (exportContainer) {
        exportContainer.scrollTop = 0;
        (exportContainer as HTMLElement).style.overflow = 'visible';
      }
      
      // 等待滚动完成
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 再次确保滚动到顶部
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (exportContainer) {
        exportContainer.scrollTop = 0;
      }
      
      // 等待内容渲染 - 增加等待时间
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 确保所有图片都已加载
      const images = element.querySelectorAll('img');
      const imagePromises = Array.from(images).map((img: HTMLImageElement) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve; // 即使失败也继续
          setTimeout(resolve, 3000); // 超时保护
        });
      });
      await Promise.all(imagePromises);
      
      // 等待SVG和Recharts图表渲染完成
      // Recharts需要额外时间渲染SVG
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // 检查是否有Recharts的SVG元素
      const svgElements = element.querySelectorAll('svg');
      console.log('找到SVG元素数量:', svgElements.length);
      if (svgElements.length > 0) {
        // 等待SVG完全渲染
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 检查SVG是否有内容
        svgElements.forEach((svg, index) => {
          console.log(`SVG ${index} 尺寸:`, svg.clientWidth, svg.clientHeight);
          console.log(`SVG ${index} 内容:`, svg.innerHTML.substring(0, 100));
          // 确保SVG可见
          const svgEl = svg as unknown as HTMLElement;
          if (svgEl && svgEl.style) {
            svgEl.style.display = 'block';
            svgEl.style.visibility = 'visible';
            svgEl.style.opacity = '1';
          }
        });
      }
      
      // 检查元素尺寸和内容
      console.log('导出元素尺寸:', el.scrollWidth, el.scrollHeight, el.clientWidth, el.clientHeight);
      console.log('导出元素内容长度:', el.innerHTML.length);
      console.log('导出元素位置:', el.offsetTop, el.offsetLeft, el.getBoundingClientRect());
      
      // 如果元素尺寸为0，抛出错误
      if (el.scrollWidth === 0 || el.scrollHeight === 0) {
        console.error('元素尺寸为0，尝试强制设置尺寸');
        el.style.minHeight = '1000px';
        el.style.minWidth = '800px';
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (el.scrollWidth === 0 || el.scrollHeight === 0) {
          throw new Error(`元素尺寸为0: ${el.scrollWidth}x${el.scrollHeight}`);
        }
      }
      
      // 确保元素在视口中可见
      el.scrollIntoView({ behavior: 'auto', block: 'start' });
      await new Promise(resolve => setTimeout(resolve, 500));

      // 转换为canvas，使用更兼容的配置
      // 计算实际内容高度，确保捕获完整内容
      const contentHeight = Math.max(
        el.scrollHeight,
        el.offsetHeight,
        el.clientHeight
      );
      const contentWidth = Math.max(
        el.scrollWidth,
        el.offsetWidth,
        el.clientWidth
      );
      
      console.log('内容尺寸:', contentWidth, contentHeight);
      console.log('元素位置:', el.offsetTop, el.offsetLeft);
      
      // 确保元素在视口中
      const rect = el.getBoundingClientRect();
      console.log('元素位置信息:', rect);
      
      // 如果元素不在视口中，滚动到可见位置
      if (rect.top < 0 || rect.left < 0) {
        el.scrollIntoView({ behavior: 'auto', block: 'start', inline: 'start' });
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // 注意：保持 isGeneratingImage 为 true，确保 ExportImageLayout 在 html2canvas 执行期间保持隐藏
      // 不要在这里设置 setIsGeneratingImage(false)，否则 ExportImageLayout 会显示出来
      
      const canvas = await html2canvas(element, {
        backgroundColor: resolvedTheme === "dark" ? "#0f172a" : "#ffffff",
        scale: 2, // 提高图片质量
        logging: true, // 开启日志以便调试
        useCORS: true,
        allowTaint: true, // 允许跨域图片
        foreignObjectRendering: true, // 支持SVG和foreignObject
        removeContainer: false,
        imageTimeout: 30000, // 增加图片加载超时时间
        scrollX: 0, // 确保从左侧开始
        scrollY: 0, // 确保从顶部开始
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById("export-image-layout");
          if (clonedElement) {
            const clonedEl = clonedElement as HTMLElement;
            clonedEl.style.backgroundColor = resolvedTheme === "dark" ? "#0f172a" : "#ffffff";
            clonedEl.style.position = 'relative';
            clonedEl.style.visibility = 'visible';
            clonedEl.style.opacity = '1';
            clonedEl.style.display = 'block';
            clonedEl.style.width = '100%';
            clonedEl.style.height = 'auto';
            clonedEl.style.left = '0';
            clonedEl.style.top = '0';
            
            const allChildren = clonedEl.querySelectorAll('*');
            allChildren.forEach((child) => {
              const el = child as HTMLElement;
              el.style.visibility = 'visible';
              el.style.opacity = '1';
              el.style.display = el.style.display || 'block';
              if (el.tagName === 'svg') {
                el.style.display = 'block';
                el.style.visibility = 'visible';
                el.style.opacity = '1';
              }
              if (el.classList.contains('relative') || el.classList.contains('z-10')) {
                el.style.zIndex = '10';
                el.style.position = 'relative';
              }
            });
            
            const clonedSvgs = clonedEl.querySelectorAll('svg');
            clonedSvgs.forEach((svg) => {
              const svgEl = svg as unknown as HTMLElement;
              if (svgEl && svgEl.style) {
                svgEl.style.display = 'block';
                svgEl.style.visibility = 'visible';
                svgEl.style.opacity = '1';
                const width = svg.getAttribute('width') || '800px';
                const height = svg.getAttribute('height') || '400px';
                svgEl.style.width = width;
                svgEl.style.height = height;
              }
            });
          }
        }
      });

      // 检查canvas是否成功创建
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error("Canvas创建失败：尺寸为0");
      }

      // Canvas创建成功后立即隐藏整个布局，避免显示中间页面
      // 先直接操作DOM确保立即隐藏，不等待React状态更新
      const exportOverlay = document.getElementById('export-layout-overlay');
      if (exportOverlay) {
        // 使用多种CSS属性强制隐藏，确保立即生效
        exportOverlay.style.display = 'none';
        exportOverlay.style.visibility = 'hidden';
        exportOverlay.style.opacity = '0';
        exportOverlay.style.pointerEvents = 'none';
        exportOverlay.style.zIndex = '-9999';
        exportOverlay.style.position = 'fixed';
        exportOverlay.style.left = '-9999px';
        exportOverlay.style.top = '-9999px';
        // 强制浏览器立即应用样式
        exportOverlay.offsetHeight; // 触发重排
      }
      
      // 同时更新React状态（同步执行，不等待）
      // 注意：先隐藏布局，再更新状态，避免状态更新导致布局显示
      setExportLayoutVisible(false);
      setIsGeneratingImage(false);
      
      // 使用双重 requestAnimationFrame 确保DOM更新立即生效
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const overlay = document.getElementById('export-layout-overlay');
          if (overlay) {
            overlay.style.display = 'none';
            overlay.style.visibility = 'hidden';
            overlay.style.opacity = '0';
            overlay.style.zIndex = '-9999';
            overlay.style.position = 'fixed';
            overlay.style.left = '-9999px';
            overlay.style.top = '-9999px';
          }
        });
      });

      // 转换为图片并下载
      canvas.toBlob((blob) => {
        // 再次确保布局已隐藏（额外保护）
        const overlay = document.getElementById('export-layout-overlay');
        if (overlay) {
          overlay.style.display = 'none';
          overlay.style.visibility = 'hidden';
          overlay.style.opacity = '0';
          overlay.style.zIndex = '-9999';
          overlay.style.position = 'fixed';
          overlay.style.left = '-9999px';
          overlay.style.top = '-9999px';
        }
        
        try {
          if (!blob) {
            throw new Error("无法创建图片blob");
          }
          
          const imageUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = imageUrl;
          const version = isSimplified ? "simplified" : "full";
          link.download = `kink-profile-${version}-${new Date().toISOString().split("T")[0]}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // 延迟释放URL，确保下载完成
          setTimeout(() => {
            URL.revokeObjectURL(imageUrl);
          }, 100);

          toast.success(t("export_image_success") || "图片导出成功");
        } catch (blobError: any) {
          console.error("Failed to create blob:", blobError);
          toast.error(`${t("export_image_failed") || "图片导出失败"}：${blobError?.message || "无法创建图片文件"}`);
          // 出错时也要立即隐藏布局
          setIsGeneratingImage(false);
          setExportLayoutVisible(false);
        }
      }, "image/png", 0.95);
      
    } catch (error: any) {
      console.error("Failed to export image:", error);
      const errorMessage = error?.message || "未知错误";
      toast.error(`${t("export_image_failed") || "图片导出失败"}：${errorMessage}`);
      setIsGeneratingImage(false);
      setExportLayoutVisible(false);
    }
  };

  /**
   * 导出完整的Kink Profile（PDF格式）
   * 包含图表、分析和所有结果的完整报告
   * 使用 jspdf 和 html2canvas 生成高质量的PDF报告
   */
  const handleDownloadKinkProfile = async () => {
    if (!result || !bank) {
      toast.error("无法导出：数据不完整");
      return;
    }

    setIsGeneratingPdf(true);
    try {
      // 动态导入所需的库
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      // 获取要导出的内容区域
      const element = document.getElementById("result-export-content");
      if (!element) {
        toast.error("无法找到导出内容");
        setIsGeneratingPdf(false);
        return;
      }

      // 转换为canvas
      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 2, // 提高图片质量
        logging: false,
        useCORS: true,
        allowTaint: false,
      });

      // 创建PDF文档
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png", 0.95);
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // 添加第一页
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // 如果内容超过一页，添加更多页面
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // 保存PDF
      const fileName = `kink-profile-${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);

      toast.success(t("download_profile_success") || "PDF报告生成成功");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      // 如果库加载失败，回退到浏览器打印功能
      try {
        window.print();
        toast.success(t("download_pdf_hint") || "请使用浏览器的打印功能保存为PDF");
      } catch (printError) {
        console.error("Print also failed:", printError);
        toast.error("PDF生成失败，请稍后重试");
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  /**
   * 清除所有数据（GDPR合规）
   * 清除localStorage中的所有测试数据，包括进度、历史记录和分享链接
   */
  const handleClearAllData = async () => {
    if (!confirm(t("clear_all_data_confirm"))) {
      return;
    }
    
    try {
      // 清除所有历史记录
      await clearAllHistory();
      // 清除当前结果和进度
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
    if (!result || !bank || !progress) {
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
          scores: result.scores || {},
          normalized: result.normalized || {},
          orientation_spectrum: result.orientation_spectrum,
          text_analysis: result.text_analysis,
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
      <div className="container mx-auto max-w-3xl py-10">
        <div className="rounded-lg border border-red-500 p-6">
          <h2 className="text-xl font-semibold text-red-500 mb-2">{t("error")}</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            {t("refresh_page")}
          </Button>
        </div>
      </div>
    );
  }

  if (!bank || !bank.questions || bank.questions.length === 0) {
    return <div className="container mx-auto max-w-3xl py-10">{t("loading")}</div>;
  }

  return (
    <>
      {/* 导出图片对话框 */}
      <ExportImageDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        onExport={handleDownloadImage}
      />

      {/* 导出布局（临时显示，仅用于导出） */}
      {exportLayoutVisible && result && bank && (
        <div 
          id="export-layout-overlay"
          className="fixed inset-0 w-screen h-screen overflow-hidden"
          style={{ 
            zIndex: 99999,
            background: resolvedTheme === "dark"
              ? "radial-gradient(ellipse at top, #3a4550 0%, #2b333e 50%, #1f2630 100%)" 
              : "radial-gradient(ellipse at top, rgba(32, 224, 192, 0.15) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(240, 253, 250, 0.9) 100%)",
            pointerEvents: 'auto', // 允许交互以便html2canvas捕获
            scrollBehavior: 'auto', // 确保滚动行为
            minHeight: '100vh', // 确保最小高度
          }}
        >
          {/* 背景装饰 - 与测试结果页面风格一致 */}
          <div 
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{
              opacity: resolvedTheme === "dark" ? 0.3 : 0.1,
            }}
          >
            {/* 渐变光晕效果 */}
            <div 
              className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl"
              style={{
                background: "radial-gradient(circle, rgba(32, 224, 192, 0.4) 0%, transparent 70%)",
                animation: "pulse-slow 4s ease-in-out infinite",
              }}
            />
            <div 
              className="absolute bottom-20 right-10 w-80 h-80 rounded-full blur-3xl"
              style={{
                background: "radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)",
                animation: "pulse-slow 5s ease-in-out infinite reverse",
              }}
            />
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl"
              style={{
                background: "radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)",
                animation: "pulse-slow 6s ease-in-out infinite",
              }}
            />
            
            {/* 装饰性网格线 */}
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: resolvedTheme === "dark"
                  ? "linear-gradient(rgba(32, 224, 192, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(32, 224, 192, 0.03) 1px, transparent 1px)"
                  : "linear-gradient(rgba(32, 224, 192, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(32, 224, 192, 0.02) 1px, transparent 1px)",
                backgroundSize: "50px 50px",
              }}
            />
          </div>

          {/* 加载提示弹窗 - 居中显示，美化设计 */}
          {isGeneratingImage && (
            <div 
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[100000] px-8 py-6 sm:px-10 sm:py-8 rounded-2xl sm:rounded-3xl"
              style={{
                minWidth: '280px',
                maxWidth: '90vw',
                background: resolvedTheme === "dark" 
                  ? "linear-gradient(135deg, rgba(43, 51, 62, 0.98) 0%, rgba(35, 42, 52, 0.98) 100%)" 
                  : "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)",
                border: `2px solid ${resolvedTheme === "dark" ? "rgba(32, 224, 192, 0.4)" : "rgba(32, 224, 192, 0.3)"}`,
                boxShadow: resolvedTheme === "dark"
                  ? "0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(32, 224, 192, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                  : "0 20px 60px rgba(32, 224, 192, 0.2), 0 8px 32px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* 内部光晕效果 */}
              <div 
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-30 pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(32, 224, 192, 0.4) 0%, transparent 70%)",
                }}
              />
              
              <div className="relative z-10 flex flex-col items-center gap-4">
                {/* 加载动画图标 */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-transparent"
                    style={{
                      borderTopColor: "#20E0C0",
                      borderRightColor: "#8B5CF6",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <div 
                    className="absolute inset-2 rounded-full border-4 border-transparent"
                    style={{
                      borderBottomColor: "#EC4899",
                      borderLeftColor: "#20E0C0",
                      animation: "spin 1.5s linear infinite reverse",
                    }}
                  />
                </div>
                
                {/* 提示文字 */}
                <div className="text-center">
                  <p 
                    className="text-lg sm:text-xl font-semibold mb-2"
                    style={{ 
                      color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.95)" : "rgba(0, 0, 0, 0.9)",
                    }}
                  >
                    正在导出结果
                  </p>
                  <p 
                    className="text-sm sm:text-base font-medium"
                    style={{ 
                      color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
                    }}
                  >
                    请您耐心等待...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 导出布局（在DOM中，用于html2canvas捕获） */}
          <div 
            style={{ 
              position: 'absolute', 
              left: '0', 
              top: '0', 
              width: '100%',
              height: 'auto',
              opacity: isGeneratingImage ? 0 : 1, // 生成图片时隐藏，捕获时显示
              visibility: isGeneratingImage ? 'hidden' : 'visible', // 生成图片时隐藏，捕获时显示
              pointerEvents: isGeneratingImage ? 'none' : 'auto', // 生成图片时禁用交互
              zIndex: 1, // 确保在背景之上
            }}
            id="export-layout-container"
          >
            <ExportImageLayout
              bank={bank}
              result={result}
              isSimplified={exportIsSimplified}
              chartType={exportChartType}
              getTopTraits={getTopTraits}
            />
          </div>
        </div>
      )}

      {/* 定义多种颜色主题 */}
      {(() => {
        const colorThemes = [
          { primary: "rgba(32, 224, 192, 0.9)", secondary: "rgba(20, 184, 166, 0.9)", bg: "rgba(32, 224, 192, 0.1)", border: "rgba(32, 224, 192, 0.3)" }, // 青色
          { primary: "rgba(139, 92, 246, 0.9)", secondary: "rgba(124, 58, 237, 0.9)", bg: "rgba(139, 92, 246, 0.1)", border: "rgba(139, 92, 246, 0.3)" }, // 紫色
          { primary: "rgba(236, 72, 153, 0.9)", secondary: "rgba(219, 39, 119, 0.9)", bg: "rgba(236, 72, 153, 0.1)", border: "rgba(236, 72, 153, 0.3)" }, // 粉色
          { primary: "rgba(59, 130, 246, 0.9)", secondary: "rgba(37, 99, 235, 0.9)", bg: "rgba(59, 130, 246, 0.1)", border: "rgba(59, 130, 246, 0.3)" }, // 蓝色
          { primary: "rgba(251, 146, 60, 0.9)", secondary: "rgba(249, 115, 22, 0.9)", bg: "rgba(251, 146, 60, 0.1)", border: "rgba(251, 146, 60, 0.3)" }, // 橙色
          { primary: "rgba(34, 197, 94, 0.9)", secondary: "rgba(22, 163, 74, 0.9)", bg: "rgba(34, 197, 94, 0.1)", border: "rgba(34, 197, 94, 0.3)" }, // 绿色
          { primary: "rgba(168, 85, 247, 0.9)", secondary: "rgba(147, 51, 234, 0.9)", bg: "rgba(168, 85, 247, 0.1)", border: "rgba(168, 85, 247, 0.3)" }, // 紫罗兰
        ];

        // 根据类别获取颜色主题
        const getColorTheme = (index: number) => colorThemes[index % colorThemes.length];

        return (
    <div 
      className="min-h-screen"
      style={{
        background: resolvedTheme === "dark"
          ? "#0f172a" // 深色模式：使用纯色背景，更干净
          : "#ffffff" // 浅色模式：使用纯白色背景，更干净
      }}
    >
      <div className="container mx-auto max-w-4xl pt-6 pb-8 space-y-5">
          {/* 标题区域 */}
          <div 
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: resolvedTheme === "dark"
                ? "rgba(30, 41, 59, 0.98)" // 深色模式：使用更纯的背景色
                : "#ffffff", // 浅色模式：使用纯白色背景
              border: `1px solid ${resolvedTheme === "dark" ? "rgba(32, 224, 192, 0.3)" : "rgba(32, 224, 192, 0.2)"}`,
              boxShadow: resolvedTheme === "dark"
                ? "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(32, 224, 192, 0.1)"
                : "0 8px 32px rgba(32, 224, 192, 0.15), 0 4px 16px rgba(32, 224, 192, 0.1)"
            }}
          >
            <h1 
              className="text-3xl sm:text-4xl font-extrabold relative z-10 mb-4 text-center"
              style={{
                background: "linear-gradient(135deg, #20E0C0 0%, #8B5CF6 50%, #EC4899 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-0.02em",
                lineHeight: "1.2"
              }}
            >
              {t("title")}
            </h1>
            {/* 发光线条效果 */}
            <div 
              className="relative z-10 mb-4"
              style={{
                height: '2px',
                width: '100%',
                maxWidth: '400px',
                margin: '0 auto',
                background: 'linear-gradient(90deg, transparent 0%, #20E0C0 15%, #8B5CF6 50%, #20E0C0 85%, transparent 100%)',
                boxShadow: `0 0 10px rgba(32, 224, 192, 0.6), 0 0 20px rgba(139, 92, 246, 0.5), 0 0 30px rgba(32, 224, 192, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)`,
                borderRadius: '1px'
              }}
            />
            <p 
              className="mt-3 text-sm sm:text-base relative z-10 text-center font-medium"
              style={{
                color: resolvedTheme === "dark" 
                  ? "rgba(255, 255, 255, 0.7)" 
                  : "rgba(0, 0, 0, 0.6)",
                letterSpacing: "0.02em",
                lineHeight: "1.6"
              }}
            >
          {t("disclaimer")}
        </p>
      </div>

          {/* 如果答题进度小于10%，显示提醒（不显示结果） */}
          {result && progressPercentage < 10 && (
            <div 
              className="rounded-2xl p-6 relative overflow-hidden"
              style={{
                background: resolvedTheme === "dark"
                  ? "rgba(251, 191, 36, 0.1)"
                  : "rgba(254, 243, 199, 0.9)",
                border: `1px solid ${resolvedTheme === "dark" ? "rgba(251, 191, 36, 0.3)" : "rgba(251, 191, 36, 0.25)"}`,
                boxShadow: resolvedTheme === "dark"
                  ? "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(251, 191, 36, 0.1)"
                  : "0 8px 32px rgba(251, 191, 36, 0.15), 0 4px 16px rgba(251, 191, 36, 0.1)"
              }}
            >
              <div className="flex items-start gap-4">
                {/* 警告图标 */}
                <div 
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: resolvedTheme === "dark"
                      ? "linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0.1) 100%)"
                      : "linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.08) 100%)",
                    border: `1.5px solid ${resolvedTheme === "dark" ? "rgba(251, 191, 36, 0.4)" : "rgba(251, 191, 36, 0.3)"}`,
                  }}
                >
                  <span className="text-2xl">⚠️</span>
                </div>
                
                {/* 提醒内容 */}
                <div className="flex-1">
                  <h2 
                    className="text-lg font-semibold mb-2 relative z-10"
                    style={{
                      color: resolvedTheme === "dark" ? "rgba(251, 191, 36, 0.95)" : "rgba(217, 119, 6, 0.9)"
                    }}
                  >
                    {t("low_progress_title")}
                  </h2>
                  <p 
                    className="text-sm mb-4 relative z-10"
                    style={{
                      color: resolvedTheme === "dark" ? "rgba(251, 191, 36, 0.8)" : "rgba(217, 119, 6, 0.8)"
                    }}
                  >
                    {t("low_progress_message", { percentage: progressPercentage })}
                  </p>
                  <Button 
                    onClick={() => router.push(`/${locale}/bdsm-test/run`)}
                    className="rounded-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group z-10"
                    style={{
                      background: "linear-gradient(135deg, rgba(32, 224, 192, 0.95) 0%, rgba(20, 184, 166, 0.95) 100%)",
                      color: 'white',
                      boxShadow: '0 4px 16px rgba(32, 224, 192, 0.4), 0 2px 8px rgba(32, 224, 192, 0.3)',
                      border: 'none'
                    }}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%)" }} />
                    <span className="relative z-10">{t("continue_test")}</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 如果答题进度 >= 10% 但 < 100%，显示提醒完成全部答题 */}
          {result && progressPercentage >= 10 && progressPercentage < 100 && (
            <div 
              className="rounded-2xl p-6 relative overflow-hidden"
              style={{
                background: resolvedTheme === "dark"
                  ? "rgba(59, 130, 246, 0.1)"
                  : "rgba(219, 234, 254, 0.9)",
                border: `1px solid ${resolvedTheme === "dark" ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.25)"}`,
                boxShadow: resolvedTheme === "dark"
                  ? "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(59, 130, 246, 0.1)"
                  : "0 8px 32px rgba(59, 130, 246, 0.15), 0 4px 16px rgba(59, 130, 246, 0.1)"
              }}
            >
              <div className="flex items-start gap-4">
                {/* 提示图标 */}
                <div 
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: resolvedTheme === "dark"
                      ? "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)"
                      : "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)",
                    border: `1.5px solid ${resolvedTheme === "dark" ? "rgba(59, 130, 246, 0.4)" : "rgba(59, 130, 246, 0.3)"}`,
                  }}
                >
                  <span className="text-2xl">💡</span>
                </div>
                
                {/* 提醒内容 */}
                <div className="flex-1">
                  <h2 
                    className="text-lg font-semibold mb-2 relative z-10"
                    style={{
                      color: resolvedTheme === "dark" ? "rgba(59, 130, 246, 0.95)" : "rgba(37, 99, 235, 0.9)"
                    }}
                  >
                    {t("incomplete_progress_title")}
                  </h2>
                  <p 
                    className="text-sm mb-4 relative z-10"
                    style={{
                      color: resolvedTheme === "dark" ? "rgba(59, 130, 246, 0.8)" : "rgba(37, 99, 235, 0.8)"
                    }}
                  >
                    {t("incomplete_progress_message", { percentage: progressPercentage })}
                  </p>
                  <Button 
                    onClick={() => router.push(`/${locale}/bdsm-test/run`)}
                    className="rounded-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group z-10"
                    style={{
                      background: "linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(37, 99, 235, 0.95) 100%)",
                      color: 'white',
                      boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4), 0 2px 8px rgba(59, 130, 246, 0.3)',
                      border: 'none'
                    }}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%)" }} />
                    <span className="relative z-10">{t("complete_test")}</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 如果没有结果，显示提示信息 */}
          {!result && (
            <div 
              className="rounded-2xl p-6 relative overflow-hidden"
              style={{
                background: resolvedTheme === "dark"
                  ? "rgba(251, 191, 36, 0.1)" // 深色模式：使用更纯的背景色
                  : "rgba(254, 243, 199, 0.9)", // 浅色模式：使用更纯的背景色
                border: `1px solid ${resolvedTheme === "dark" ? "rgba(251, 191, 36, 0.3)" : "rgba(251, 191, 36, 0.25)"}`,
                boxShadow: resolvedTheme === "dark"
                  ? "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(251, 191, 36, 0.1)"
                  : "0 8px 32px rgba(251, 191, 36, 0.15), 0 4px 16px rgba(251, 191, 36, 0.1)"
              }}
            >
              <h2 
                className="text-lg font-semibold mb-3 relative z-10"
                style={{
                  color: resolvedTheme === "dark" ? "rgba(251, 191, 36, 0.95)" : "rgba(217, 119, 6, 0.9)"
                }}
              >
                {t("no_result_title")}
              </h2>
              <p 
                className="text-sm mb-4 relative z-10"
                style={{
                  color: resolvedTheme === "dark" ? "rgba(251, 191, 36, 0.8)" : "rgba(217, 119, 6, 0.8)"
                }}
              >
                {t("no_result_message")}
              </p>
              {history.length > 0 ? (
                <p 
                  className="text-sm relative z-10"
                  style={{
                    color: resolvedTheme === "dark" ? "rgba(251, 191, 36, 0.8)" : "rgba(217, 119, 6, 0.8)"
                  }}
                >
                  {t("history_count_message", { count: history.length })}
                </p>
              ) : (
                <Button 
                  onClick={() => router.push(`/${locale}/bdsm-test/run`)}
                  className="mt-2 rounded-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group z-10"
                  style={{
                    background: "linear-gradient(135deg, rgba(32, 224, 192, 0.95) 0%, rgba(20, 184, 166, 0.95) 100%)",
                    color: 'white',
                    boxShadow: '0 4px 16px rgba(32, 224, 192, 0.4), 0 2px 8px rgba(32, 224, 192, 0.3)',
                    border: 'none'
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%)" }} />
                  <span className="relative z-10">{t("start_test")}</span>
          </Button>
              )}
      </div>
          )}

      {/* 分数概览与图表 */}
      {result && hasAnsweredQuestions ? (
            <div id="result-export-content" className="space-y-4">
              {/* 图表区域 */}
              <div 
                className="rounded-2xl p-5 relative overflow-hidden"
                style={{
                  background: resolvedTheme === "dark"
                    ? "rgba(30, 41, 59, 0.98)" // 深色模式：使用更纯的背景色
                    : "#ffffff", // 浅色模式：使用纯白色背景
                  border: `1px solid ${resolvedTheme === "dark" ? "rgba(139, 92, 246, 0.3)" : "rgba(139, 92, 246, 0.2)"}`,
                  boxShadow: resolvedTheme === "dark"
                    ? "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(139, 92, 246, 0.1)"
                    : "0 8px 32px rgba(139, 92, 246, 0.15), 0 4px 16px rgba(139, 92, 246, 0.1)"
                }}
              >
                <h2 className="sr-only">{tHeadings("test_results_chart")}</h2>
                <div className="relative z-10">
          <ResultChart bank={bank} result={result} variant="radar" />
                </div>
          </div>

          {/* Top 3 Traits 标签 */}
          {getTopTraits.length > 0 && (
                <div 
                  className="rounded-2xl p-6 relative overflow-hidden"
                  style={{
                    background: resolvedTheme === "dark"
                      ? "rgba(30, 41, 59, 0.98)" // 深色模式：使用更纯的背景色
                      : "#ffffff", // 浅色模式：使用纯白色背景
                    border: `1px solid ${resolvedTheme === "dark" ? "rgba(236, 72, 153, 0.3)" : "rgba(236, 72, 153, 0.2)"}`,
                    boxShadow: resolvedTheme === "dark"
                      ? "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(236, 72, 153, 0.1)"
                      : "0 8px 32px rgba(236, 72, 153, 0.15), 0 4px 16px rgba(236, 72, 153, 0.1)"
                  }}
                >
                  <h2 
                    className="text-xl font-bold mb-6 relative z-10 tracking-tight"
                    style={{
                      color: resolvedTheme === "dark" 
                        ? "rgba(236, 72, 153, 0.95)" 
                        : "rgba(236, 72, 153, 0.9)",
                      textShadow: resolvedTheme === "dark"
                        ? "0 2px 8px rgba(236, 72, 153, 0.3)"
                        : "0 2px 8px rgba(236, 72, 153, 0.2)"
                    }}
                  >
                    {t("top_traits")}
                  </h2>
                  <div className="flex flex-wrap gap-4 relative z-10">
                    {getTopTraits.map((trait, index) => {
                      const theme = getColorTheme(index);
                      return (
                  <div
                    key={trait.id}
                          className="flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                          style={{
                            background: resolvedTheme === "dark"
                              ? `linear-gradient(135deg, ${theme.bg} 0%, ${theme.bg.replace('0.1', '0.15')} 100%)`
                              : `linear-gradient(135deg, ${theme.bg} 0%, ${theme.bg.replace('0.1', '0.15')} 100%)`,
                            border: `1.5px solid ${theme.border}`,
                            boxShadow: `0 2px 8px ${theme.border.replace('0.3', '0.1')}, 0 1px 4px ${theme.border.replace('0.3', '0.08')}`
                          }}
                  >
                          <span 
                            className="text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0"
                            style={{ 
                              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                              color: 'white',
                              boxShadow: `0 1px 4px ${theme.border.replace('0.3', '0.2')}, inset 0 1px 0 rgba(255, 255, 255, 0.3)`
                            }}
                          >
                            {index + 1}
                    </span>
                          <div className="flex flex-col gap-0.5">
                            <h3 className="text-sm font-bold" style={{ color: theme.primary }}>
                              {trait.name}
                            </h3>
                            <span 
                              className="text-xs font-medium" 
                              style={{ 
                                color: resolvedTheme === "dark" 
                                  ? "rgba(255, 255, 255, 0.6)" 
                                  : "rgba(0, 0, 0, 0.5)"
                              }}
                            >
                              {trait.score}/100
                    </span>
                  </div>
                  </div>
                      );
                    })}
              </div>
            </div>
          )}

          {/* 文本分析 */}
          {result.text_analysis && hasAnsweredQuestions ? (
                <div 
                  className="rounded-2xl p-5 relative overflow-hidden"
                  style={{
                    background: resolvedTheme === "dark"
                      ? "rgba(30, 41, 59, 0.98)" // 深色模式：使用更纯的背景色
                      : "#ffffff", // 浅色模式：使用纯白色背景
                    border: `1px solid ${resolvedTheme === "dark" ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.2)"}`,
                    boxShadow: resolvedTheme === "dark"
                      ? "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(59, 130, 246, 0.1)"
                      : "0 8px 32px rgba(59, 130, 246, 0.15), 0 4px 16px rgba(59, 130, 246, 0.1)"
                  }}
                >
                  <h2 
                    className="text-xl font-bold mb-6 relative z-10 tracking-tight"
                    style={{
                      color: resolvedTheme === "dark" 
                        ? "rgba(139, 92, 246, 0.95)" 
                        : "rgba(139, 92, 246, 0.9)",
                      textShadow: resolvedTheme === "dark"
                        ? "0 2px 8px rgba(139, 92, 246, 0.3)"
                        : "0 2px 8px rgba(139, 92, 246, 0.2)"
                    }}
                  >
                    {t("analysis_result")}
                  </h2>
                  <div className="relative z-10">
              <ResultText result={result} />
        </div>
                    </div>
                    ) : null}

          {/* Kinsey光谱展示（如果有Orientation结果） */}
          {result.orientation_spectrum !== undefined ? (
                <div 
                  className="rounded-2xl p-5 relative overflow-hidden"
                  style={{
                    background: resolvedTheme === "dark"
                      ? "rgba(30, 41, 59, 0.98)" // 深色模式：使用更纯的背景色
                      : "#ffffff", // 浅色模式：使用纯白色背景
                    border: `1px solid ${resolvedTheme === "dark" ? "rgba(168, 85, 247, 0.3)" : "rgba(168, 85, 247, 0.2)"}`,
                    boxShadow: resolvedTheme === "dark"
                      ? "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(168, 85, 247, 0.1)"
                      : "0 8px 32px rgba(168, 85, 247, 0.15), 0 4px 16px rgba(168, 85, 247, 0.1)"
                  }}
                >
                  <h2 
                    className="text-base font-semibold mb-4 relative z-10"
                    style={{
                      color: resolvedTheme === "dark" ? "rgba(168, 85, 247, 0.95)" : "rgba(168, 85, 247, 0.9)"
                    }}
                  >
                    {t("orientation_spectrum_title")}
                  </h2>
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="flex-1 h-8 rounded-full relative overflow-hidden" style={{ background: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)" }}>
                  <div
                        className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(result.orientation_spectrum / 7) * 100}%`,
                          background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.9) 0%, rgba(139, 92, 246, 0.9) 50%, rgba(236, 72, 153, 0.9) 100%)',
                          boxShadow: '0 0 12px rgba(168, 85, 247, 0.5)'
                        }}
                  />
                      <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center text-xs font-bold" style={{ zIndex: 1, color: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)" }}>
                    {result.orientation_spectrum.toFixed(1)} / 7
                  </div>
                </div>
                    <div className="text-xs font-medium px-3 py-1 rounded-lg" style={{ 
                      background: resolvedTheme === "dark" ? "rgba(168, 85, 247, 0.15)" : "rgba(168, 85, 247, 0.1)",
                      color: resolvedTheme === "dark" ? "rgba(168, 85, 247, 0.95)" : "rgba(168, 85, 247, 0.9)"
                    }}>
                  {result.orientation_spectrum <= 1 ? "Heterosexual" :
                   result.orientation_spectrum <= 3 ? "Bisexual/Fluid" :
                   result.orientation_spectrum <= 5 ? "Homosexual" :
                   "Asexual/Aromantic"}
                </div>
              </div>
      </div>
          ) : null}

          {/* 分享和下载按钮 */}
              <div 
                className="flex flex-wrap gap-3 pt-5 pb-2 relative rounded-2xl p-5"
                style={{
                  background: resolvedTheme === "dark"
                    ? "linear-gradient(135deg, rgba(43, 51, 62, 0.4) 0%, rgba(35, 42, 52, 0.4) 100%)"
                    : "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(248, 250, 252, 0.4) 100%)",
                  border: "1px solid rgba(32, 224, 192, 0.1)"
                }}
              >
                {/* 生成分享链接按钮 */}
            <Button
              onClick={handleShare}
              disabled={isGeneratingShare}
                  className="flex items-center gap-2 rounded-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group"
                  style={{
                    background: "linear-gradient(135deg, rgba(32, 224, 192, 0.95) 0%, rgba(20, 184, 166, 0.95) 100%)",
                    color: 'white',
                    boxShadow: '0 4px 16px rgba(32, 224, 192, 0.4), 0 2px 8px rgba(32, 224, 192, 0.3)',
                    border: 'none'
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%)" }} />
                  <ShareIcon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{isGeneratingShare ? t("share_button") + "..." : t("share_button")}</span>
            </Button>
            {shareLink && (
              <Button
                variant="outline"
                onClick={handleCopyShareLink}
                    className="flex items-center gap-2 rounded-xl transition-all duration-300 hover:scale-105"
                    style={{
                      border: "1px solid rgba(139, 92, 246, 0.3)",
                      background: resolvedTheme === "dark" ? "rgba(139, 92, 246, 0.1)" : "rgba(139, 92, 246, 0.05)",
                      color: resolvedTheme === "dark" ? "rgba(139, 92, 246, 0.9)" : "rgba(139, 92, 246, 0.8)"
                    }}
              >
                <Copy className="w-4 h-4" />
                {t("share_link_copied").split("已")[0]}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleDownloadKinkProfile}
              disabled={isGeneratingPdf}
                  className="flex items-center gap-2 rounded-xl transition-all duration-300 hover:scale-105"
                  style={{
                    border: "1px solid rgba(236, 72, 153, 0.3)",
                    background: resolvedTheme === "dark" ? "rgba(236, 72, 153, 0.1)" : "rgba(236, 72, 153, 0.05)",
                    color: resolvedTheme === "dark" ? "rgba(236, 72, 153, 0.9)" : "rgba(236, 72, 153, 0.8)"
                  }}
            >
              <Download className="w-4 h-4" />
              {isGeneratingPdf ? t("download_profile_processing") || "生成中..." : t("download_profile") || "Download your kink profile"}
            </Button>
            <Button
              variant="outline"
                  onClick={handleOpenExportDialog} 
              disabled={isGeneratingImage}
                  className="flex items-center gap-2 rounded-xl transition-all duration-300 hover:scale-105"
                  style={{
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    background: resolvedTheme === "dark" ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.05)",
                    color: resolvedTheme === "dark" ? "rgba(59, 130, 246, 0.9)" : "rgba(59, 130, 246, 0.8)"
                  }}
            >
              <Download className="w-4 h-4" />
              {isGeneratingImage ? t("download_image_processing") || "生成中..." : t("download_image") || "Export as Image"}
            </Button>
            <Button
              variant="outline"
              onClick={handleExportJSON}
                  className="flex items-center gap-2 rounded-xl transition-all duration-300 hover:scale-105"
                  style={{
                    border: "1px solid rgba(251, 146, 60, 0.3)",
                    background: resolvedTheme === "dark" ? "rgba(251, 146, 60, 0.1)" : "rgba(251, 146, 60, 0.05)",
                    color: resolvedTheme === "dark" ? "rgba(251, 146, 60, 0.9)" : "rgba(251, 146, 60, 0.8)"
                  }}
            >
              <FileJson className="w-4 h-4" />
              {t("export_json")}
            </Button>
          </div>
        </div>
      ) : null}

          {/* 历史记录 */}
          <section 
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: resolvedTheme === "dark"
                ? "linear-gradient(135deg, rgba(43, 51, 62, 0.95) 0%, rgba(35, 42, 52, 0.95) 100%)"
                : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)",
              border: "1px solid rgba(34, 197, 94, 0.2)",
              boxShadow: resolvedTheme === "dark"
                ? "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(34, 197, 94, 0.1)"
                : "0 8px 32px rgba(34, 197, 94, 0.15), 0 4px 16px rgba(34, 197, 94, 0.1)"
            }}
          >
            <h2 
              className="text-lg font-semibold mb-4 relative z-10"
              style={{
                color: resolvedTheme === "dark" ? "rgba(34, 197, 94, 0.95)" : "rgba(34, 197, 94, 0.9)"
              }}
            >
              {t("history_title")}
            </h2>
        {history.length === 0 ? (
              <p className="text-sm text-muted-foreground relative z-10">{t("no_history")}</p>
        ) : (
              <>
                <ul className="space-y-3 text-sm relative z-10">
                  {(showAllHistory ? history : history.slice(0, 3)).map((h, index) => {
                    const theme = getColorTheme(index);
                    return (
                      <li 
                        key={h.id} 
                        className="rounded-xl p-4 flex items-center justify-between gap-3 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden"
                        style={{
                          background: resolvedTheme === "dark"
                            ? `linear-gradient(135deg, ${theme.bg.replace('0.1', '0.08')} 0%, ${theme.bg} 100%)`
                            : `linear-gradient(135deg, ${theme.bg} 0%, ${theme.bg.replace('0.1', '0.08')} 100%)`,
                          border: `1px solid ${theme.border}`,
                          boxShadow: `0 2px 8px ${theme.border.replace('0.3', '0.15')}`
                        }}
                      >
                        <div className="flex flex-col flex-1 relative z-10">
                          <span className="font-medium mb-1" style={{ color: theme.primary }}>
                            {t("time")}：{new Date(h.createdAt).toLocaleString()}
                          </span>
                          <span className="text-muted-foreground text-xs">{t("record_id")}：{h.id}</span>
                </div>
                        <div className="flex items-center gap-2 relative z-10">
                          <Button 
                            size="sm"
                            onClick={() => restoreResult(h)}
                            className="rounded-lg transition-all duration-300 hover:scale-105"
                            style={{
                              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                              color: 'white',
                              boxShadow: `0 2px 8px ${theme.border.replace('0.3', '0.4')}`,
                              border: 'none'
                            }}
                          >
                            {t("view")}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => deleteHistory(h.id)}
                            className="rounded-lg transition-all duration-300 hover:scale-105"
                            style={{
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                              background: resolvedTheme === "dark" ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.05)",
                              color: resolvedTheme === "dark" ? "rgba(239, 68, 68, 0.9)" : "rgba(239, 68, 68, 0.8)"
                            }}
                          >
                            {t("delete")}
                          </Button>
                </div>
              </li>
                    );
                  })}
          </ul>
                {history.length > 3 && (
                  <div className="pt-3 relative z-10">
                    <Button
                      variant="outline"
                      onClick={() => setShowAllHistory(!showAllHistory)}
                      className="w-full rounded-lg transition-all duration-300 hover:scale-105"
                      style={{
                        border: "1px solid rgba(34, 197, 94, 0.3)",
                        background: resolvedTheme === "dark" ? "rgba(34, 197, 94, 0.1)" : "rgba(34, 197, 94, 0.05)",
                        color: resolvedTheme === "dark" ? "rgba(34, 197, 94, 0.9)" : "rgba(34, 197, 94, 0.8)"
                      }}
                    >
                      {showAllHistory ? t("show_less") : t("show_more")} ({history.length - 3})
                    </Button>
                  </div>
                )}
              </>
        )}
        {history.length > 0 ? (
              <div className="pt-4 border-t relative z-10" style={{ borderColor: "rgba(34, 197, 94, 0.2)" }}>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => clearAllHistory()}
                  className="rounded-lg transition-all duration-300 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)",
                    boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
                    border: 'none'
                  }}
                >
                  {t("clear_all")}
                </Button>
          </div>
        ) : null}
      </div>

          {/* 操作按钮 */}
          <div 
            className="flex flex-wrap gap-3 rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: resolvedTheme === "dark"
                ? "linear-gradient(135deg, rgba(43, 51, 62, 0.95) 0%, rgba(35, 42, 52, 0.95) 100%)"
                : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)",
              border: "1px solid rgba(32, 224, 192, 0.2)",
              boxShadow: resolvedTheme === "dark"
                ? "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(32, 224, 192, 0.1)"
                : "0 8px 32px rgba(32, 224, 192, 0.15), 0 4px 16px rgba(32, 224, 192, 0.1)"
            }}
          >
            <Button 
              onClick={() => reset()}
              className="rounded-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group z-10"
              style={{
                background: "linear-gradient(135deg, rgba(32, 224, 192, 0.95) 0%, rgba(20, 184, 166, 0.95) 100%)",
                color: 'white',
                boxShadow: '0 4px 16px rgba(32, 224, 192, 0.4), 0 2px 8px rgba(32, 224, 192, 0.3)',
                border: 'none'
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%)" }} />
              <span className="relative z-10">{t("retest")}</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="rounded-xl transition-all duration-300 hover:scale-105 z-10"
              style={{
                border: "1px solid rgba(139, 92, 246, 0.3)",
                background: resolvedTheme === "dark" ? "rgba(139, 92, 246, 0.1)" : "rgba(139, 92, 246, 0.05)",
                color: resolvedTheme === "dark" ? "rgba(139, 92, 246, 0.9)" : "rgba(139, 92, 246, 0.8)"
              }}
            >
              {t("back")}
            </Button>
      </div>

          {/* 隐私声明和GDPR清除数据 */}
          <div 
            className="rounded-2xl p-5 space-y-3 relative overflow-hidden"
            style={{
              background: resolvedTheme === "dark"
                ? "linear-gradient(135deg, rgba(43, 51, 62, 0.95) 0%, rgba(35, 42, 52, 0.95) 100%)"
                : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)",
              border: "1px solid rgba(251, 146, 60, 0.2)",
              boxShadow: resolvedTheme === "dark"
                ? "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(251, 146, 60, 0.1)"
                : "0 8px 32px rgba(251, 146, 60, 0.15), 0 4px 16px rgba(251, 146, 60, 0.1)"
            }}
          >
            <p className="text-sm text-muted-foreground relative z-10 leading-relaxed">{t("principle")}</p>
            <div className="pt-2 relative z-10">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearAllData}
                className="w-full sm:w-auto rounded-lg transition-all duration-300 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)",
                  boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
                  border: 'none'
                }}
          >
            {t("clear_all_data")}
          </Button>
            </div>
        </div>
      </div>
    </div>
        );
      })()}
    </>
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


