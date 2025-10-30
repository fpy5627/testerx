import React from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";

export default function MyRadarChart({ data }: { data: { category: string; value: number }[] }) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="80%">
          <PolarGrid />
          <PolarAngleAxis dataKey="category" />
          <Radar name="Result" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
