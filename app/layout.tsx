import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";



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
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* Pretendard Font */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Gugi&family=Jua&family=Nanum+Pen+Script&display=swap" rel="stylesheet" />

        {/* Legacy CSS Support */}
        <link rel="stylesheet" href="/css/head_basic.css" />
        <link rel="stylesheet" href="/css/head_logout.css" />
        <link rel="stylesheet" href="/css/modern_home.css" />
        <link rel="stylesheet" href="/img_up/_addon/css/reset_1.0.css" />
        <link rel="stylesheet" href="/img_up/shop_pds/sejongcook/src_css_fram/pc.skin.custom2.css" />
        <link rel="stylesheet" href="/css/quick_menu.css" />
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

