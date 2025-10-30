import React from "react";

export default function ProgressBar({ current, total }: { current: number; total: number }) {
  const percent = ((current + 1) / total) * 100;
  return (
    <div className="w-full bg-gray-100 h-2 rounded my-4">
      <div
        className="h-full bg-primary rounded transition-all"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
