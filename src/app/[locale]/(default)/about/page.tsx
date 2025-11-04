/**
 * 页面：关于
 * 作用：展示应用信息、版本、功能说明等。
 */

import { useTranslations } from "next-intl";

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <div className="container mx-auto max-w-4xl py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">关于</h1>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">应用简介</h2>
          <p className="text-base leading-relaxed">
            本应用是一个科学、匿名、安全的心理倾向测试工具，帮助您了解自己的心理维度与性取向光谱。
            所有数据仅存储在本地，无需登录，完全保护您的隐私。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">核心特性</h2>
          <ul className="list-disc list-inside space-y-2 mt-3 ml-4">
            <li><strong>安全</strong>：所有数据采用 AES 加密存储，仅存储在本地设备</li>
            <li><strong>匿名</strong>：无需登录，不收集任何个人信息</li>
            <li><strong>科学</strong>：基于科学的心理测量方法，提供准确的分析报告</li>
            <li><strong>隐私保护</strong>：完全符合 GDPR 要求，尊重用户隐私权</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">测试说明</h2>
          <p className="text-base leading-relaxed">
            本测试包含多个心理维度的测量，包括但不限于：
          </p>
          <ul className="list-disc list-inside space-y-2 mt-3 ml-4">
            <li>主导倾向（Dominance）</li>
            <li>服从倾向（Submission）</li>
            <li>切换倾向（Switch）</li>
            <li>性取向光谱（Orientation Spectrum）</li>
          </ul>
          <p className="text-base leading-relaxed mt-3">
            测试结果仅供参考，不构成任何医疗或心理建议。如有心理健康相关问题，请咨询专业心理医生。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">技术栈</h2>
          <p className="text-base leading-relaxed">
            本应用基于以下技术构建：
          </p>
          <ul className="list-disc list-inside space-y-2 mt-3 ml-4">
            <li>Next.js 15 - React 框架</li>
            <li>TypeScript - 类型安全</li>
            <li>Tailwind CSS - 样式框架</li>
            <li>Recharts - 数据可视化</li>
            <li>next-intl - 国际化支持</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">版本信息</h2>
          <p className="text-base leading-relaxed">
            当前版本：v1.0.0
          </p>
          <p className="text-base leading-relaxed mt-2">
            最后更新：{new Date().toLocaleDateString("zh-CN")}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">免责声明</h2>
          <p className="text-base leading-relaxed">
            本应用提供的测试结果仅供参考，不构成任何医疗、心理或法律建议。
            测试结果不代表任何官方或专业机构的观点。使用者应自行承担使用本应用的风险。
          </p>
        </section>
      </div>
    </div>
  );
}

