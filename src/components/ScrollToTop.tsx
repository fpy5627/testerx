/**
 * 组件：回到顶部按钮
 * 作用：在所有页面提供回到顶部功能，当滚动超过200px时显示按钮
 */

"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const { resolvedTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  /**
   * 监听滚动事件，当滚动超过200px时显示按钮
   */
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setIsVisible(scrollTop > 200);
    };

    // 初始检查
    handleScroll();

    // 添加滚动监听
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /**
   * 回到顶部功能
   */
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
      style={{
        background: resolvedTheme === "dark"
          ? "linear-gradient(135deg, rgba(32, 224, 192, 0.95) 0%, rgba(20, 184, 166, 0.95) 100%)"
          : "linear-gradient(135deg, rgba(32, 224, 192, 0.98) 0%, rgba(20, 184, 166, 0.98) 100%)",
        boxShadow: resolvedTheme === "dark"
          ? "0 8px 32px rgba(32, 224, 192, 0.4), 0 4px 16px rgba(32, 224, 192, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
          : "0 8px 32px rgba(32, 224, 192, 0.5), 0 4px 16px rgba(32, 224, 192, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
        border: "none",
        width: "48px",
        height: "48px",
      }}
      aria-label="回到顶部"
    >
      <ArrowUp className="h-5 w-5 text-white" />
    </Button>
  );
}

