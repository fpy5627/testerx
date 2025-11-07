"use client";

import React from "react";
import { useLocale } from "next-intl";
import { generateResultText } from "@/utils/resultText";
import type { TestResult } from "@/types/test";

interface ResultTextProps {
  result: TestResult;
}

export default function ResultText({ result }: ResultTextProps) {
  const locale = useLocale();
  const text = result.text_analysis || 
    generateResultText(
      result.normalized || {},
      result.orientation_spectrum,
      locale
    );
  
  return (
    <div className="p-4 text-base leading-relaxed whitespace-pre-wrap">
      {text}
    </div>
  );
}
