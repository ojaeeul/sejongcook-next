import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollNavigator from "@/components/ScrollNavigator";
import VisitorTracker from "@/components/VisitorTracker";




export const metadata: Metadata = {
  metadataBase: new URL('https://www.sejongcook.co.kr'),
  alternates: {
    canonical: 'https://www.sejongcook.co.kr',
  },
  title: {
    default: "세종요리제과기술학원 | 김포요리학원 - 제과제빵, 원데이클래스",
    template: "%s | 세종요리제과기술학원"
  },
  description: "김포 사우동 위치 전문 요리 및 제과제빵 교육기관. 취미요리, 가정요리, 원데이클래스부터 한식, 양식, 중식, 일식, 제과, 제빵 기능사 자격증 및 취업/창업까지. 사우, 북변, 장기, 구래, 고촌, 검단 등 김포 및 인천 전 지역 수강 가능.",
  keywords: [
    "요리학원", "김포요리학원", "쿠킹클래스", "원데이클래스", "원데이쿠킹클래스", "쿠킹원데이", "베이킹원데이", "원데", 
    "세종요리학원", "세종요릭학원", "세종요리", "세종요리기술학원", "세종요리제과학원", "세종요리제과기술학원", "김포제과제빵요리학원",
    "김포제과학원", "김포제빵학원", "김포바리스타학원", 
    "인천요리학원", "검단요리학원", "일산요리학원", "계양요리학원", 
    "취미요리", "가정요리", "과정요리", "디저트", "김포쿠킹클래스", "요리동아리",
    "사우요리학원", "북변요리학원", "장기요리학원", "장기요리락원", "구래요리학원", "구레요리학원", "고촌요리학원", 
    "풍무요리학원", "풍푸요리학원", "운양요리학원", "김포본동요리학원", "마산요리학원", 
    "기능사", "조리기능사", "제과기능사", "제빵기능사", "재빵기능사", "제과제빵기능사", "제빵제과기능사",
    "바리스타자격증", "자격증", "취업", "창업"
  ],
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
  verification: {
    other: {
      'naver-site-verification': '4bed7399117f3b18d3cb01bc418ca03e84be78a0',
    },
  },
  openGraph: {
    title: '세종요리제과기술학원 | 김포요리학원, 취미요리, 제과제빵',
    description: '김포 사우동 위치 전문 요리/제과제빵 교육기관. 원데이클래스, 자격증 취득 및 취업 연계. 김포 전 지역(사우, 장기, 구래, 고촌 등) 및 검단 최고 수준의 시설.',
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
    title: '세종요리제과기술학원 | 김포요리학원 최우수 교육기관',
    description: '제과제빵, 원데이클래스, 취미요리 전문 학원. 사우동, 장기동, 구래동, 검단 등 접근성 우수.',
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
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        
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
              "@type": ["EducationalOrganization", "LocalBusiness"],
              "name": "세종요리제과기술학원",
              "alternateName": [
                "요리학원", "쿠킹클래스", "원데이클래스", "원데이쿠킹클래스", "쿠킹원데이", "베이킹원데이", "원데",
                "김포요리학원", "세종요리학원", "세종요릭학원", "세종요리", "세종요리기술학원", "세종요리제과학원", "세종요리제과기술학원", 
                "김포제과학원", "김포제빵학원", "김포쿠킹클래스", "사우요리학원", 
                "장기요리학원", "장기요리락원", "구래요리학원", "구레요리학원", "검단요리학원", "인천요리학원",
                "풍무요리학원", "풍푸요리학원", "운양요리학원", "일산요리학원",
                "기능사", "조리기능사", "제과기능사", "제빵기능사", "재빵기능사", "제빵제과기능사",
                "취미요리", "과정요리", "가정요리", "디저트"
              ],
              "description": "김포 사우동 위치 전문 요리 및 제과제빵 교육기관. 취미요리, 원데이클래스, 한식/양식/일식/중식 자격증, 제과제빵 기능사.",
              "url": "https://www.sejongcook.co.kr",
              "logo": "https://www.sejongcook.co.kr/chef_final.png",
              "image": "https://www.sejongcook.co.kr/chef_leemisun_final.png",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "김포대로 841, 6층 (사우동, 제우스프라자)",
                "addressLocality": "김포시",
                "addressRegion": "경기도",
                "postalCode": "10110",
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
                "areaServed": ["김포시", "인천광역시 서구", "사우동", "장기동", "구래동", "북변동", "고촌읍", "운양동", "마산동", "검단동", "계양구"],
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
          <div id="main-wrapper"><main style={{ minHeight: '600px' }}>
            {children}
          </main></div>
          <Footer />
          <ScrollNavigator />
        </AuthProvider>
      </body>
    </html>
  );
}

