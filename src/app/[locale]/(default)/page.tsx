import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h1 className="mb-4 text-3xl font-bold">BDSM心理测试与性取向光谱</h1>
      <p className="mb-8 text-lg text-gray-600">科学量化你的心理维度与性取向光谱。全部数据仅存于本地，无需登录，18+可用。</p>
      <Link href="/test" className="btn btn-primary text-lg px-8 py-3">立即开始</Link>
    </div>
  );
}
