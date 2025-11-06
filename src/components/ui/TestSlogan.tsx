"use client";

import React, { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";

interface TestSloganProps {
  pageIndex: number;
  updateInterval?: number; // 更新间隔（毫秒），默认10分钟
}

/**
 * 测试标语组件
 * 显示在答题区域上方的动态标语
 * 
 * @param pageIndex - 当前页面索引，用于获取不同的标语
 * @param updateInterval - 更新间隔（毫秒），默认600000（10分钟）
 */
export default function TestSlogan({ pageIndex, updateInterval = 600000 }: TestSloganProps) {
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const [slogan, setSlogan] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 获取标语
   */
  const fetchSlogan = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/test/slogan?locale=${locale}&page=${pageIndex}`, {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.slogan) {
          setSlogan(data.slogan);
        }
      }
    } catch (error) {
      console.error("Failed to fetch slogan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 初始加载和定时更新
   */
  useEffect(() => {
    // 初始加载
    void fetchSlogan();

    // 设置定时更新
    const interval = setInterval(() => {
      void fetchSlogan();
    }, updateInterval);

    return () => {
      clearInterval(interval);
    };
  }, [pageIndex, locale, updateInterval]);

  if (isLoading && !slogan) {
    return null;
  }

  if (!slogan) {
    return null;
  }

  return (
    <div 
      className="w-full px-4 sm:px-6 md:px-8 lg:px-10 mb-4 sm:mb-5 md:mb-6 transition-all duration-500"
      style={{
        animation: "fadeIn 0.5s ease-in"
      }}
    >
      <div 
        className="rounded-xl px-4 py-3 sm:px-5 sm:py-3.5 md:px-6 md:py-4 backdrop-blur-sm transition-all duration-300"
        style={{
          background: resolvedTheme === "dark"
            ? "rgba(32, 224, 192, 0.1)"
            : "rgba(32, 224, 192, 0.08)",
          border: `1px solid ${resolvedTheme === "dark" ? "rgba(32, 224, 192, 0.2)" : "rgba(32, 224, 192, 0.15)"}`,
          boxShadow: resolvedTheme === "dark"
            ? "0 2px 8px rgba(32, 224, 192, 0.15), 0 0 20px rgba(32, 224, 192, 0.1)"
            : "0 2px 10px rgba(32, 224, 192, 0.12), 0 0 25px rgba(32, 224, 192, 0.08)"
        }}
      >
        <p 
          className="text-center text-sm sm:text-base md:text-lg font-medium leading-relaxed transition-all duration-300"
          style={{
            color: resolvedTheme === "dark" 
              ? "rgba(32, 224, 192, 0.9)" 
              : "rgba(0, 0, 0, 0.75)"
          }}
        >
          {slogan}
        </p>
      </div>
    </div>
  );
}


