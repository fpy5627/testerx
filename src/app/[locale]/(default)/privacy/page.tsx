/**
 * 页面：隐私政策
 * 作用：展示隐私政策内容，说明数据存储和处理方式。
 */

import { useTranslations } from "next-intl";

export default function PrivacyPage() {
  const t = useTranslations("privacy");

  return (
    <div className="container mx-auto max-w-4xl py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">隐私政策</h1>
        <p className="text-muted-foreground text-sm">
          最后更新日期：{new Date().toLocaleDateString("zh-CN")}
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">数据存储</h2>
          <p className="text-base leading-relaxed">
            本应用的所有数据仅存储在您的本地设备（浏览器 localStorage）中，采用加密存储方式。
            我们不会收集、上传或存储任何个人信息到服务器。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">匿名测试</h2>
          <p className="text-base leading-relaxed">
            所有测试结果均为匿名处理，不会关联任何个人身份信息。您可以自由选择分享测试结果，
            分享链接仅包含测试结果数据，不包含任何个人信息。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">数据安全</h2>
          <p className="text-base leading-relaxed">
            我们使用 AES 加密算法对本地存储的数据进行加密，确保数据安全性。
            加密密钥仅存储在本地，不会上传到服务器。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">GDPR 合规</h2>
          <p className="text-base leading-relaxed">
            本应用完全符合 GDPR（通用数据保护条例）要求：
          </p>
          <ul className="list-disc list-inside space-y-2 mt-3 ml-4">
            <li>数据最小化：仅存储测试所需的基本数据</li>
            <li>数据主体权利：您可以随时删除本地数据</li>
            <li>数据可移植性：支持导出测试结果</li>
            <li>数据删除权：支持一键清空所有本地数据</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">第三方服务</h2>
          <p className="text-base leading-relaxed">
            本应用不使用任何第三方分析或追踪服务，不会向第三方分享任何数据。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">联系我们</h2>
          <p className="text-base leading-relaxed">
            如果您对本隐私政策有任何疑问，请通过应用内的反馈功能联系我们。
          </p>
        </section>
      </div>
    </div>
  );
}

