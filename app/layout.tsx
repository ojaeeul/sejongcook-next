import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollNavigator from "@/components/ScrollNavigator";
import VisitorTracker from "@/components/VisitorTracker";



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
  metadataBase: new URL('https://www.sejongcook.co.kr'),
  title: {
    default: "세종요리제과기술학원 | 김포요리학원 - 국비지원, 자격증, 취업",
    template: "%s | 세종요리제과기술학원"
  },
  description: "김포 사우동 위치. 전문 요리/제과제빵 교육기관. 국비지원 및 자격증 취득. 김포요리학원, 김포요리, 요리학원 추천. 한식, 양식, 중식, 일식, 제과, 제빵 기능사 자격증.",
  keywords: [
    "요리학원", "김포요리학원", "세종요리학원", "세종요리제과학원", "세종요리제과기술학원",
    "김포 요리학원", "국비지원요리학원", "제과제빵학원", "자격증", "취업",
    "한식조리기능사", "양식조리기능사", "중식조리기능사", "일식조리기능사", "제과기능사", "제빵기능사",
    "김포요리", "한식기능사", "양식기능사", "중식기능사", "일식기능사", "제과기능사", "제빵기능사",
    "김포 사우동 요리학원", "검단 요리학원", "강화 요리학원", "인천요리학원"
  ],
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
  verification: {
    other: {
      'naver-site-verification': 'c03e63b14e13550e508823e20689530491873138',
    },
  },
  openGraph: {
    title: '세종요리제과기술학원 | 김포요리학원',
    description: '김포 사우동 위치. 전문 요리/제과제빵 교육기관. 국비지원 및 자격증 취득. 최고의 강사진과 함께하세요.',
    url: 'https://www.sejongcook.co.kr',
    siteName: '세종요리제과기술학원',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: '/chef_leemisun_final.png',
        width: 800,
        height: 600,
        alt: '세종요리제과기술학원 대표 이미지 - Master Chef Lee Mi Sun',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '세종요리제과기술학원 | 김포요리학원',
    description: '김포 사우동 위치. 국비지원 및 자격증 취득 전문 교육기관.',
    images: ['/chef_leemisun_final.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "세종요리제과기술학원",
              "alternateName": ["김포요리학원", "세종요리학원", "세종요리제과학원"],
              "description": "김포 사우동 위치한 전문 요리 및 제과제빵 교육기관. 국비지원 과정 운영.",
              "url": "https://www.sejongcook.co.kr",
              "logo": "https://www.sejongcook.co.kr/chef_final.png",
              "image": "https://www.sejongcook.co.kr/chef_leemisun_final.png",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "김포대로 841, 6층 (사우동, 제우스프라자)",
                "addressLocality": "김포시",
                "addressRegion": "경기도",
                "postalCode": "10111",
                "addressCountry": "KR"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 37.6206,
                "longitude": 126.7157
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "031-986-1933",
                "contactType": "customer service",
                "areaServed": "KR",
                "availableLanguage": "Korean"
              },
              "sameAs": [
                "https://blog.naver.com/oje2332",
                "https://www.instagram.com/sejongcook"
              ]
            })
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          <VisitorTracker />
          <Header initialShowAuthLinks={settings.showAuthLinks} />
          <main style={{ minHeight: '600px' }}>
            {children}
          </main>
          <Footer />
          <ScrollNavigator />
        </AuthProvider>
      </body>
    </html>
  );
}

