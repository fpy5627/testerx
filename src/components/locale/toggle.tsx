"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

import { MdLanguage } from "react-icons/md";
import { localeNames } from "@/i18n/locale";

export default function ({ isIcon = false }: { isIcon?: boolean }) {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const isDark = resolvedTheme === "dark";

  const handleSwitchLanguage = (value: string) => {
    if (value !== locale) {
      let newPathName = pathname.replace(`/${locale}`, `/${value}`);
      if (!newPathName.startsWith(`/${value}`)) {
        newPathName = `/${value}${newPathName}`;
      }
      router.push(newPathName);
    }
  };

  // 使用 useEffect 监听悬停和打开状态，直接设置样式
  useEffect(() => {
    if (!isDark) return;

    let observer: MutationObserver | null = null;
    let trigger: HTMLElement | null = null;
    let icon: HTMLElement | null = null;
    let text: HTMLElement | null = null;
    let handleMouseEnter: (() => void) | null = null;
    let handleMouseLeave: (() => void) | null = null;

    // 使用 setTimeout 确保 DOM 已渲染
    const timer = setTimeout(() => {
      trigger = triggerRef.current;
      if (!trigger) return;

      icon = iconRef.current;
      text = textRef.current;
      const targetColor = "rgba(255, 255, 255, 0.8)"; // 80%白色

      const updateColors = () => {
        if (!trigger) return;
        const isHovered = trigger.matches(":hover");
        const isOpen = trigger.getAttribute("data-state") === "open";
        
        if (isHovered || isOpen) {
          // 设置文字和图标颜色为80%白色
          trigger.style.setProperty("color", targetColor, "important");
          if (icon) {
            icon.style.setProperty("color", targetColor, "important");
          }
          if (text) {
            text.style.setProperty("color", targetColor, "important");
          }
        } else {
          // 恢复默认颜色
          trigger.style.removeProperty("color");
          if (icon) {
            icon.style.removeProperty("color");
          }
          if (text) {
            text.style.removeProperty("color");
          }
        }
      };

      // 监听鼠标事件
      handleMouseEnter = () => updateColors();
      handleMouseLeave = () => updateColors();

      // 监听 data-state 变化
      observer = new MutationObserver(updateColors);
      observer.observe(trigger, {
        attributes: true,
        attributeFilter: ["data-state"],
      });

      trigger.addEventListener("mouseenter", handleMouseEnter);
      trigger.addEventListener("mouseleave", handleMouseLeave);

      // 初始更新
      updateColors();
    }, 0);

    return () => {
      clearTimeout(timer);
      if (observer) {
        observer.disconnect();
      }
      if (trigger && handleMouseEnter && handleMouseLeave) {
        trigger.removeEventListener("mouseenter", handleMouseEnter);
        trigger.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [isDark, resolvedTheme]);

  return (
    <Select value={locale} onValueChange={handleSwitchLanguage}>
      <SelectTrigger 
        ref={triggerRef}
        className="flex items-center gap-2 border-none bg-transparent text-gray-600 hover:text-gray-900 dark:text-white/87 outline-hidden hover:bg-gray-100/80 dark:hover:bg-white/25 focus:ring-0 focus:ring-offset-0 transition-all duration-200 rounded-lg px-3 py-2 hover:scale-105 hover:shadow-lg hover:border-2 hover:border-gray-300 dark:hover:border-white/40 dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
      >
        <MdLanguage 
          ref={iconRef}
          className="text-xl dark:text-white/87 transition-all duration-200 dark:hover:scale-110" 
        />
        {!isIcon && (
          <span 
            ref={textRef}
            className="hidden md:block font-medium transition-all duration-200 dark:hover:font-semibold"
          >
            {localeNames[locale]}
          </span>
        )}
      </SelectTrigger>
      <SelectContent className="z-50 bg-background">
        {Object.keys(localeNames).map((key: string) => {
          const name = localeNames[key];
          return (
            <SelectItem className="cursor-pointer px-4" key={key} value={key}>
              {name}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
