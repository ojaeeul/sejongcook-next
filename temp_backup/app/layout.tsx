import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";



import { Gugi, Jua, Nanum_Pen_Script } from 'next/font/google';

const gugi = Gugi({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-gugi',
  display: 'swap',
});

const jua = Jua({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-jua',
  display: 'swap',
});

const nanumPen = Nanum_Pen_Script({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-nanum-pen',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "세종요리제과기술학원",
  description: "김포 최고의 요리 제과 제빵 전문 교육기관",
};

// ... existing imports ...
import { getSettings } from "@/lib/settings";

// ... existing metadata ...

import { AuthProvider } from "@/context/AuthContext";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();

  return (
    <html lang="ko" className={`${gugi.variable} ${jua.variable} ${nanumPen.variable}`} suppressHydrationWarning>
      <head>
        {/* Pretendard Font - Kept as CDN for specific version control or moved to globals if preferred, suppressing warning for now */}

        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />

        {/* Legacy CSS Support - Suppressing eslint rule for static file imports */}
        {/* eslint-disable @next/next/no-css-tags */}
        <link rel="stylesheet" href="/css/head_basic.css" />
        <link rel="stylesheet" href="/css/head_logout.css" />
        <link rel="stylesheet" href="/css/modern_home.css" />
        <link rel="stylesheet" href="/img_up/_addon/css/reset_1.0.css" />
        <link rel="stylesheet" href="/img_up/shop_pds/sejongcook/src_css_fram/pc.skin.custom2.css" />
        <link rel="stylesheet" href="/css/quick_menu.css" />
        {/* eslint-enable @next/next/no-css-tags */}
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          <Header initialShowAuthLinks={settings.showAuthLinks} />
          <main style={{ minHeight: '600px' }}>
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

