import React from "react";

export default function ExportPanel({ result }: { result: Record<string, number> }) {
  // TODO: 可集成html2pdf.js、html2canvas等导出实际行为
  const exportPDF = () => {
    window.alert("PDF导出待接入实现");
  };
  const exportPNG = () => {
    window.alert("PNG保存待接入实现");
  };
  const clearData = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="flex gap-3 mt-6">
      <button onClick={exportPDF} className="btn">导出PDF</button>
      <button onClick={exportPNG} className="btn">保存为PNG</button>
      <button onClick={clearData} className="btn">清除数据</button>
    </div>
  );
}
