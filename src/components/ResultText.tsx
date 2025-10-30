import React from "react";
import { generateResultText } from "@/utils/resultText";

export default function ResultText({ scores }: { scores: Record<string, number> }) {
  return <div className="p-4 text-base leading-relaxed">{generateResultText(scores)}</div>;
}
