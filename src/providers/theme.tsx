"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode, useEffect } from "react";
import { useLocale } from "next-intl";
import { Toaster } from "sonner";
import { isAuthEnabled } from "@/lib/auth";
import SignModal from "@/components/sign/modal";
import Analytics from "@/components/analytics";
import Adsense from "./adsense";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateBackground = () => {
        const html = document.documentElement;
        const body = document.body;
        const nextRoot = document.getElementById("__next");
        const scrollBoundary = document.querySelector("[data-nextjs-scroll-focus-boundary]");
        const firstDiv = body.firstElementChild;
        
        const isDark = html.classList.contains("dark");
        const bgColor = isDark ? "#2b333e" : "#ffffff";
        
        // 设置所有根元素的背景色
        html.style.setProperty("background-color", bgColor, "important");
        body.style.setProperty("background-color", bgColor, "important");
        
        if (nextRoot) {
          nextRoot.style.setProperty("background-color", bgColor, "important");
        }
        if (scrollBoundary) {
          (scrollBoundary as HTMLElement).style.setProperty("background-color", bgColor, "important");
        }
        if (firstDiv) {
          (firstDiv as HTMLElement).style.setProperty("background-color", bgColor, "important");
        }
        
        // 确保所有应该应用背景色的元素都能正确应用
        // 1. 查找所有使用了 dark:bg-[#2b333e] 的元素
        const darkBgElements = Array.from(document.querySelectorAll("*")).filter((el) => {
          const classList = Array.from(el.classList);
          return classList.some((cls) => cls.includes("dark:bg-[#2b333e]"));
        });
        
        // 2. 查找所有根级别的容器元素
        const rootContainers = [
          ...Array.from(document.querySelectorAll("body > div")),
          ...Array.from(document.querySelectorAll("#__next > div")),
          ...Array.from(document.querySelectorAll("main")),
          ...Array.from(document.querySelectorAll("section.min-h-screen, section.relative")),
          ...Array.from(document.querySelectorAll("div.min-h-screen")),
        ];
        
        // 3. 合并所有需要设置背景色的元素
        const allElementsToUpdate = [...darkBgElements, ...rootContainers];
        
        // 4. 去重并设置背景色
        const uniqueElements = Array.from(new Set(allElementsToUpdate));
        uniqueElements.forEach((element) => {
          const el = element as HTMLElement;
          // 如果元素有 min-h-screen 或者使用了 dark:bg-[#2b333e]，强制设置背景色
          if (el.classList.contains("min-h-screen") || Array.from(el.classList).some((cls) => cls.includes("dark:bg-[#2b333e]"))) {
            el.style.setProperty("background-color", bgColor, "important");
          }
        });
      };
      
      // 初始设置
      updateBackground();
      
      // 监听主题变化
      const observer = new MutationObserver(updateBackground);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"]
      });
      
      return () => observer.disconnect();
    }
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={process.env.NEXT_PUBLIC_DEFAULT_THEME || "system"}
      enableSystem
      disableTransitionOnChange
    >
      {children}

      <Toaster position="top-center" richColors />
      <Analytics />

      {isAuthEnabled() && <SignModal />}

      <Adsense />
    </NextThemesProvider>
  );
}
