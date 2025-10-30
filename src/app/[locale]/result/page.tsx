import { useTestStore } from "@/contexts/TestStore";
import MyRadarChart from "@/components/RadarChart";
import ResultText from "@/components/ResultText";
import ExportPanel from "@/components/ExportPanel";

export default function ResultPage() {
  const { result } = useTestStore();
  const chartData = Object.keys(result).map((cat) => ({
    category: cat,
    value: result[cat],
  }));
  return (
    <div className="max-w-xl mx-auto my-10">
      <MyRadarChart data={chartData} />
      <ResultText scores={result} />
      <ExportPanel result={result} />
    </div>
  );
}
