'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
// import noticeData from '../data/notice_data.json'; // Removed static import
// import qnaData from '../data/qna_data.json'; // Removed static import
// import jobData from '../data/job_openings_data.json'; // Removed static import
import dynamic from "next/dynamic";
import HeroBackground from "../components/HeroBackground";

const ActionCardSlider = dynamic(() => import("../components/ActionCardSlider"), {
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse" />,
  ssr: false
});
const MainPopup = dynamic(() => import("../components/MainPopup"), { ssr: false });


import { DEFAULT_HERO_DATA } from "./data/defaultHeroData"; import initialHeroData from "../public/data/hero_data.json"; // Updated to public/data


interface HeroData {
  badge: string;
  badgeSize?: string;
  badgeBold?: boolean;
  title: string;
  titleSize?: string;
  titleBold?: boolean;
  desc: string;
  descSize?: string;
  descBold?: boolean;
  longDesc: string;
  longDescSize?: string;
  longDescBold?: boolean;
  btn1Text: string;
  btn1Link: string;
  btn2Text: string;
  btn2Link: string;
  photos: string[][] | string[];
  phoneVisible?: boolean;
  phoneIcon?: string;
  phoneNumber?: string;
  phoneSize?: string;
  phoneBold?: boolean;
  phoneBackgroundColor?: string;
  phoneBorderColor?: string;
  phoneAlignment?: string;
  phoneTextColor?: string;
  laurelBannerVisible?: boolean;
  laurelStars?: number;
  laurelName?: string;
}

interface BoardItem {
  id: string | number;
  title: string;
  date: string;
  link?: string;
}

export default function Home() {
  // const [currentSlide, setCurrentSlide] = useState(0); // REMOVED: Managed in HeroBackground
  // Use imported data as initial state for immediate render
  const [heroData, setHeroData] = useState<HeroData>(initialHeroData || DEFAULT_HERO_DATA);
  const [latestQna, setLatestQna] = useState<BoardItem[]>([]); // Dynamic Q&A Data
  const [noticeData, setNoticeData] = useState<BoardItem[]>([]);
  const [jobData, setJobData] = useState<BoardItem[]>([]);
  const [previewData, setPreviewData] = useState<BoardItem[]>([]);

  useEffect(() => {
    // Optional: Re-fetch to get any admin updates since build
    const fetchHeroData = async () => {
      try {
        const url = '/api/hero?_t=' + Date.now();
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setHeroData((prev: HeroData) => {
            if (JSON.stringify(data) !== JSON.stringify(prev)) {
              return data;
            }
            return prev;
          });
        }
      } catch {
        // Silent fail is fine, we have initial data
      }
    };

    fetchHeroData();

    // Load Q&A Data dynamically
    const fetchDashboardData = async () => {
      const endpoints = [
        { url: '/data/qna_data.json', setter: setLatestQna },
        { url: '/api/admin/data/notice', setter: setNoticeData },
        { url: '/data/job_openings_data.json', setter: setJobData },
        { url: '/data/popups.json', setter: setPreviewData }
      ];

      await Promise.allSettled(endpoints.map(async ({ url, setter }) => {
        try {
          const res = await fetch(url + '?_t=' + Date.now());
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              // Sort by date descending (newest first)
              const sorted = [...data].sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return dateB - dateA;
              });
              setter(sorted);
            }
          }
        } catch (e) {
          console.error(`Failed to load ${url}`, e);
        }
      }));
    };

    fetchDashboardData();
  }, []);

  // Flatten photos for the hero background slider (taking the first image of each group or all if preferred)
  // We use useMemo to ensure this array reference is stable and doesn't trigger effect re-runs on every render
  const activeImages = useMemo(() => {
    return (Array.isArray(heroData.photos) ? heroData.photos : [])
      .map((group: string | string[]) => Array.isArray(group) ? group[0] : group) // scalable if group is string (legacy) or array
      .filter((p: string) => p && typeof p === 'string');
  }, [heroData.photos]);

  const heroImages = useMemo(() => {
    return activeImages.length > 0 ? activeImages : DEFAULT_HERO_DATA.photos.map(g => Array.isArray(g) ? g[0] : g as string);
  }, [activeImages]);

  // REMOVED: Interval effect moved to HeroBackground component
  // useEffect(() => {
  //   if (heroImages.length === 0) return;
  //   const timer = setInterval(() => {
  //     setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  //   }, 5000);
  //   return () => clearInterval(timer);
  // }, [heroImages]);


  // REMOVED: IntersectionObserver for stability
  // useEffect(() => {
  //   const observerOptions = {
  //     root: null,
  //     rootMargin: '0px',
  //     threshold: 0.1
  //   };
  //   const observer = new IntersectionObserver((entries, observer) => {
  //     entries.forEach(entry => {
  //       if (entry.isIntersecting) {
  //         entry.target.classList.add('animate-visible');
  //         observer.unobserve(entry.target);
  //       }
  //     });
  //   }, observerOptions);
  //   const animatedElements = document.querySelectorAll('[data-animate]');
  //   animatedElements.forEach(el => observer.observe(el));
  //   return () => observer.disconnect();
  // }, []); 


  return (
    <>
      <MainPopup />

      {/* Modern Hero Section */}
      <section className="hero-section" id="main-hero-section">
        {/* Background Slider - Isolated State */}
        <HeroBackground images={heroImages} />

        <div className="hero-content relative z-20 pointer-events-none">
          <span className="hero-badge pointer-events-auto" style={{
            fontSize: heroData?.badgeSize || '1rem',
            fontWeight: heroData?.badgeBold ? '700' : '400'
          }}>
            {heroData?.badge || "프리미엄 요리 제과 아카데미"}
          </span>
          <h1 className="hero-title pointer-events-auto" style={{
            fontSize: heroData?.titleSize || '3.5rem',
            fontWeight: heroData?.titleBold ? '700' : '400'
          }}>
            {heroData?.title || "세종요리제과기술학원"}
            <br />
            <span style={{
              fontSize: heroData?.descSize || '0.6em',
              fontWeight: heroData?.descBold ? '700' : '400', // Respect explicit setting
              opacity: 0.9
            }}>
              {heroData?.desc || "꿈을 향한 맛있는 도전"}
            </span>
          </h1>
          <p className="hero-subtitle pointer-events-auto" style={{
            whiteSpace: 'pre-line',
            fontSize: heroData?.longDescSize || '1.2rem',
            fontWeight: heroData?.longDescBold ? '900' : '400' // Keeping 900 for longDesc as it was font-black
          }}>
            {heroData?.longDesc || "최고의 강사진이 여러분의 꿈을 현실로 만들어드립니다.\n김포요리학원은 자격증, 창업까지, 전문가가 함께합니다."}
          </p>
          <div className="hero-buttons pointer-events-auto">
            <Link href={heroData?.btn1Link || "/community/qna"} className="btn-hero btn-outline" id="hero-btn-primary">
              {heroData?.btn1Text || "질문오토봇"}
            </Link>
            <Link href={heroData?.btn2Link || "/inquiry"} className="btn-hero btn-outline" id="hero-btn-secondary">
              {heroData?.btn2Text || "상담문의"}
            </Link>
            <a href="https://open.kakao.com/o/gw4q3s9h" target="_blank" rel="noopener noreferrer" className="btn-hero btn-outline" style={{ fontWeight: 'bold' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#FEE500" style={{ marginRight: '6px' }}>
                  <path d="M12 3c-5.52 0-10 3.58-10 8 0 2.87 1.76 5.4 4.47 6.88-.28 1-.98 3.52-1.02 3.73-.06.23.08.23.18.17.13-.08 3.23-2.18 4.54-3.08.6.08 1.22.13 1.83.13 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
              </svg>
              카카오톡 상담
            </a>
          </div>
          {/* Phone Banner Layout - Moved inside hero-content for correct flow */}
          {heroData?.phoneVisible && (
            <div
              className={`mt-6 flex justify-center w-full pointer-events-auto`}
            >
              <div style={{
                background: heroData.phoneBackgroundColor || 'rgba(0, 0, 0, 0.4)',
                padding: '12px 30px',
                borderRadius: '50px',
                border: `2px solid ${heroData.phoneBorderColor || '#ffa200'}`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '15px',
                backdropFilter: 'blur(5px)',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <div className="font-bold text-gray-800">
                  {heroData.phoneIcon ? (
                    heroData.phoneIcon.startsWith('http') || heroData.phoneIcon.startsWith('/') || heroData.phoneIcon.startsWith('data:') ? (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={heroData.phoneIcon}
                          alt="icon"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <span className="text-2xl">{heroData.phoneIcon}</span>
                    )
                  ) : (
                    <span className="text-2xl">📞</span>
                  )}
                </div>
                <div>
                  <div className="text-xs text-gray-300 font-bold uppercase tracking-wider mb-0.5">Consultation</div>
                  <a href={`tel:${heroData.phoneNumber || "031-986-1933"}`} style={{
                    fontSize: heroData.phoneSize || '24px',
                    fontWeight: heroData.phoneBold !== false ? '900' : '400',
                    color: '#ffffff',
                    lineHeight: 1,
                    textDecoration: 'none',
                    letterSpacing: '0.5px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                  }}>
                    {heroData.phoneNumber || "031-986-1933"}
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section >

      {/* Modern Quick Links Grid */}
      < section className="modern-container" >
        <div className="section-header" data-animate="">
          <h2 className="section-title">김포 요리학원만의 체계적인 교육과정</h2>
          <p className="section-desc">세종요리제과학원에서는 기초부터 심화까지, 당신에게 딱 맞는 커리큘럼을 제공합니다.</p>
        </div>


        <div className="card-grid-3">
          {/* Card 1 */}
          <Link href="/intro" className="info-card">
            <div style={{ height: '240px', overflow: 'hidden' }}>
              <ActionCardSlider
                images={Array.isArray(heroData.photos[0]) ? heroData.photos[0] : []}
                alt="김포요리학원 세종요리제과기술학원 학원소개"
                imgStyle={{ objectPosition: 'left bottom' }}
              />
            </div>
            <div className="card-content">
              <div className="card-icon">🏢</div>
              <h3 className="card-title">학원소개</h3>
              <p className="card-text">김포요리학원 <span className="sr-only">세종요리제과기술학원</span> 최고의 강사진을 갖춘 글로벌 스탠다드 교육 학원입니다.</p>
            </div>
          </Link>

          {/* Card 2 */}
          <Link href="/course/baking" className="info-card">
            <div style={{ height: '240px', overflow: 'hidden' }}>
              <ActionCardSlider
                images={Array.isArray(heroData.photos[1]) ? heroData.photos[1] : []}
                alt="김포제과제빵학원 세종요리제과기술학원 제과제빵과정"
              />
            </div>
            <div className="card-content">
              <div className="card-icon">🥖</div>
              <h3 className="card-title">제과제빵과정</h3>
              <p className="card-text">제과제빵부터 트렌디한 디저트까지 마스터하는 김포제과제빵학원의 특화 과정입니다.</p>
            </div>
          </Link>

          {/* Card 3 */}
          <Link href="/course/cooking/license" className="info-card">
            <div style={{ height: '240px', overflow: 'hidden' }}>
              <ActionCardSlider
                images={Array.isArray(heroData.photos[2]) ? heroData.photos[2] : []}
                alt="김포요리학원 세종요리제과기술학원 조리교육과정"
              />
            </div>
            <div className="card-content">
              <div className="card-icon">🍳</div>
              <h3 className="card-title">조리교육과정</h3>
              <p className="card-text">한식, 양식, 중식, 일식 기능사 및 가정요리 등 김포요리학원만의 조리 테크닉을 전수합니다.</p>
            </div>
          </Link>

          {/* Card 4 */}
          <Link href="/info/schedule" className="info-card">
            <div style={{ height: '240px', overflow: 'hidden' }}>
              <ActionCardSlider
                images={Array.isArray(heroData.photos[3]) ? heroData.photos[3] : []}
                alt="김포요리학원 국가기술자격증 및 진학"
              />
            </div>
            <div className="card-content">
              <div className="card-icon">📜</div>
              <h3 className="card-title">자격증 & 진학</h3>
              <p className="card-text">국가기술자격증 취득 및 전문 진학을 책임지는 김포요리학원만의 <span className="sr-only">세종요리제과기술학원</span> 체계적인 솔루션을 만나보세요.</p>
            </div>
          </Link>

          {/* Card 5 */}
          <Link href="/course/cooking/license#brunch" className="info-card">
            <div style={{ height: '240px', overflow: 'hidden' }}>
              <ActionCardSlider
                images={Array.isArray(heroData.photos[4]) ? heroData.photos[4] : []}
                alt="김포요리학원 브런치 창업 실무"
              />
            </div>
            <div className="card-content">
              <div className="card-icon">🤝</div>
              <h3 className="card-title">브런치 & 창업</h3>
              <p className="card-text">성공적인 취업 및 창업 연계를 위한 김포요리학원 실무 중심 프로그램.</p>
            </div>
          </Link>

          {/* Card 6 */}
          <Link href="/community/notice" className="info-card">
            <div style={{ height: '240px', overflow: 'hidden' }}>
              <ActionCardSlider
                images={Array.isArray(heroData.photos[5]) ? heroData.photos[5] : []}
                alt="세종요리제과기술학원 커뮤니티"
              />
            </div>
            <div className="card-content">
              <div className="card-icon">💬</div>
              <h3 className="card-title">커뮤니티</h3>
              <p className="card-text">수료생 네트워크 및 정보 공유가 이루어지는 세종요리제과기술학원만의 활발한 소통의 장.</p>
            </div>
          </Link>
        </div>
      </section >

      {/* Latest Updates Section (Simplified for Static Build) */}
      < section className="modern-container" id="latest-updates-section" style={{
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        padding: '60px 0',
        overflow: 'hidden'
      }
      }>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: "url('/img/bg_updates_custom.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 1,
          zIndex: 0
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '15px' }}>새로운 소식</h2>
            <p style={{ fontSize: '1.1rem', color: '#666' }}>김포요리학원 세종요리제과기술학원의 새로운 소식입니다.</p>
          </div>

          <div className="updates-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', minHeight: '300px' }}>
            {/* Notice */}
            <div className="update-column" style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <div className="column-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f5a623', paddingBottom: '15px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>공지사항</h3>
                <Link href="/community/notice" className="more-link" style={{ color: '#f5a623', fontSize: '0.9rem', fontWeight: 600 }}>더보기 +</Link>
              </div>
              <ul className="latest-list space-y-3">
                {noticeData.slice(0, 5).map(item => (
                  <li key={item.id} className="flex justify-between items-center group cursor-pointer" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
                    <Link href={`/community/notice/view?id=${item.id}`} className="text-gray-700 hover:text-[#f5a623] transition-colors truncate flex-1 text-sm font-medium block">
                      {item.title}
                    </Link>
                    <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{item.date}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Q&A */}
            <div className="update-column" style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <div className="column-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f5a623', paddingBottom: '15px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>질문오토봇</h3>
                <Link href="/community/qna" className="more-link" style={{ color: '#f5a623', fontSize: '0.9rem', fontWeight: 600 }}>더보기 +</Link>
              </div>
              <ul className="latest-list space-y-3">
                {latestQna.slice(0, 5).map(item => (
                  <li key={item.id} className="flex justify-between items-center group cursor-pointer" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
                    <Link href={`/community/qna/view?id=${item.id}`} className="text-gray-700 hover:text-[#f5a623] transition-colors truncate flex-1 text-sm font-medium block">
                      {item.title}
                    </Link>
                    <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{item.date}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Jobs */}
            <div className="update-column" style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <div className="column-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f5a623', paddingBottom: '15px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>취업정보</h3>
                <Link href="/job/openings" className="more-link" style={{ color: '#f5a623', fontSize: '0.9rem', fontWeight: 600 }}>더보기 +</Link>
              </div>
              <ul className="latest-list space-y-3">
                {jobData.slice(0, 5).map(item => (
                  <li key={item.id} className="flex justify-between items-center group cursor-pointer" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
                    <Link href={`/job/openings/view?id=${item.id}`} className="text-gray-700 hover:text-[#f5a623] transition-colors truncate flex-1 text-sm font-medium block">
                      {item.title}
                    </Link>
                    <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{item.date}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Preview (Popups) */}
            <div className="update-column" style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <div className="column-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f5a623', paddingBottom: '15px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>미리보기</h3>
                <Link href="/" className="more-link" style={{ color: '#f5a623', fontSize: '0.9rem', fontWeight: 600 }}>전체보기</Link>
              </div>
              <ul className="latest-list space-y-3">
                {previewData.slice(0, 5).map(item => (
                  <li key={item.id} className="flex justify-between items-center group cursor-pointer" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
                    <Link href={item.link || '#'} className="text-gray-700 hover:text-[#f5a623] transition-colors truncate flex-1 text-sm font-medium block">
                      {item.title}
                    </Link>
                    <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{item.date}</span>
                  </li>
                ))}
                {previewData.length === 0 && (
                  <li className="text-gray-400 text-sm italic py-2">활성 팝업이 없습니다.</li>
                )}
              </ul>
            </div>

          </div>
        </div>
      </section >
    </>
  );
}
