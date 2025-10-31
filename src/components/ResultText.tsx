import React from "react";
import { generateResultText } from "@/utils/resultText";
import type { TestResult } from "@/types/test";

interface ResultTextProps {
  result: TestResult;
}

export default function ResultText({ result }: ResultTextProps) {
  const text = result.text_analysis || 
    generateResultText(
      result.normalized || {},
      result.orientation_spectrum
    );
  
  return (
    <div className="p-4 text-base leading-relaxed whitespace-pre-wrap">
      {text}
    </div>
  );
}
