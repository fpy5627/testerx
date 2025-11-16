import "@/app/globals.css";

import { getLocale, setRequestLocale } from "next-intl/server";
import { locales } from "@/i18n/locale";
import { cn } from "@/lib/utils";
import StructuredData from "@/components/StructuredData";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  setRequestLocale(locale);

  const webUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://bdsm-test.toolina.com";
  const googleAdsenseCode = process.env.NEXT_PUBLIC_GOOGLE_ADCODE || "";

  return (
    <html lang={locale} suppressHydrationWarning className="bg-white dark:bg-[#2b333e] transition-colors duration-200">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(){try{var e=localStorage.getItem('theme'),t=e;if(!e||'system'===e){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}var r=document.documentElement;if('dark'===t){r.classList.add('dark');r.style.setProperty('--description-text-color','#ffffff');r.style.setProperty('--text-shadow','0 3px 12px rgba(0, 0, 0, 0.8), 0 2px 6px rgba(0, 0, 0, 0.6), 0 1px 3px rgba(0, 0, 0, 0.4), 0 0 2px rgba(255, 255, 255, 0.2)')}else{r.classList.remove('dark');r.style.setProperty('--description-text-color','rgba(17, 24, 39, 0.9)');r.style.setProperty('--text-shadow','0 1px 4px rgba(255, 255, 255, 0.9), 0 0 2px rgba(0, 0, 0, 0.15)')}}catch(e){}}();
            `,
          }}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {googleAdsenseCode && (
          <meta name="google-adsense-account" content={googleAdsenseCode} />
        )}

        <link rel="icon" href="/favicon.ico" />

        {locales &&
          locales.map((loc) => {
            const href = `${webUrl}${loc === "en" ? "" : `/${loc}`}/`;
            return (
              <link
                key={loc}
                rel="alternate"
                hrefLang={loc}
                href={href}
              />
            );
          })}
        <link rel="alternate" hrefLang="x-default" href={webUrl} />
        
        {/* 全局结构化数据：Organization 和 WebSite */}
        <StructuredData locale={locale} />
      </head>
      <body className="bg-white dark:bg-[#2b333e] transition-colors duration-200">{children}</body>
    </html>
  );
}
