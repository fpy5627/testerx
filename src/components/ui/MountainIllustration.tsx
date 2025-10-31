/**
 * 组件：山脉插画（可商用）
 * 作用：提供简单的山脉插画，用于测试页面顶部装饰
 */

"use client";

import React from "react";

export default function MountainIllustration() {
  return (
    <div className="absolute inset-0 flex items-end justify-center">
      <svg
        className="w-full h-[140px] md:h-[160px]"
        viewBox="0 0 400 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Cloud 1 */}
        <ellipse cx="80" cy="60" rx="35" ry="25" fill="white" opacity="0.3" />
        <ellipse cx="95" cy="60" rx="30" ry="20" fill="white" opacity="0.3" />
        {/* Cloud 2 */}
        <ellipse cx="320" cy="50" rx="40" ry="28" fill="white" opacity="0.3" />
        <ellipse cx="340" cy="50" rx="35" ry="22" fill="white" opacity="0.3" />
        
        {/* Mountain range */}
        {/* Left mountain */}
        <path
          d="M 50 200 L 120 80 L 160 140 L 50 200 Z"
          fill="white"
          stroke="white"
          strokeWidth="3"
        />
        {/* Center mountain (with flag) */}
        <path
          d="M 130 140 L 200 40 L 270 120 L 280 140 L 130 140 Z"
          fill="white"
          stroke="white"
          strokeWidth="3"
        />
        {/* Flag on center peak */}
        <rect x="195" y="35" width="10" height="18" fill="white" stroke="hsl(var(--primary))" strokeWidth="2" />
        <polygon points="205,35 205,45 215,40" fill="white" />
        {/* Right mountain */}
        <path
          d="M 260 140 L 320 60 L 380 100 L 400 120 L 400 200 L 260 200 Z"
          fill="white"
          stroke="white"
          strokeWidth="3"
        />
      </svg>
    </div>
  );
}

