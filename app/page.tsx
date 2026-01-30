'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import noticeData from '../data/notice_data.json';
// import qnaData from '../data/qna_data.json'; // Removed static import
import jobData from '../data/job_openings_data.json';
import ActionCardSlider from "../components/ActionCardSlider";
import MainPopup from "../components/MainPopup";

import { DEFAULT_HERO_DATA } from "./data/defaultHeroData";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroData, setHeroData] = useState<typeof DEFAULT_HERO_DATA>(DEFAULT_HERO_DATA);
  const [latestQna, setLatestQna] = useState<any[]>([]); // Dynamic Q&A Data

  useEffect(() => {
    // Load Hero Data
    const fetchHeroData = async () => {
      try {
        const res = await fetch('/api/hero', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setHeroData({ ...DEFAULT_HERO_DATA, ...data });
        }
      } catch (e) {
        console.error("Failed to load hero data", e);
        const saved = localStorage.getItem('heroData');
        if (saved) {
          try {
            setHeroData({ ...DEFAULT_HERO_DATA, ...JSON.parse(saved) });
          } catch (err) { }
        }
      }
    };

    // Load Q&A Data dynamically
    const fetchQnaData = async () => {
      try {
        const res = await fetch('/api/admin/data/qna', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          // Sort or slice if needed, here we just expect the API to return the list
          // Usually we want the latest, so we might need to sort by date or id if the API returns raw
          // The admin API returns raw JSON. Let's assume raw order or sort desc.
          // qna_data.json usually has newest first? Or random?
          // Let's sort by date desc to be safe, or just take first 5
          // If the JSON is appended (newest last), we should reverse.
          // Let's assume newest last for appending, so reverse it.
          // Wait, file operations usually append.
          // Let's check typical behavior. Usually push() adds to end.
          // So newest is at end.
          if (Array.isArray(data)) {
            setLatestQna([...data].reverse());
          }
        }
      } catch (e) {
        console.error("Failed to load Q&A data", e);
      }
    };

    fetchHeroData();
    fetchQnaData();
  }, []);

  // Flatten photos for the hero background slider (taking the first image of each group or all if preferred)
  // Here we take the first available image from each group to serve as the background cycle
  const activeImages = (Array.isArray(heroData.photos) ? heroData.photos : [])
    .map(group => Array.isArray(group) ? group[0] : group) // scalable if group is string (legacy) or array
    .filter(p => p && typeof p === 'string');

  const heroImages = activeImages.length > 0 ? activeImages : DEFAULT_HERO_DATA.photos.map(g => Array.isArray(g) ? g[0] : g as string);

  useEffect(() => {
    if (heroImages.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages]);

  useEffect(() => {
    // Simple intersection observer from original code
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <MainPopup />
      {/* Modern Hero Section */}
      <section className="hero-section" id="main-hero-section">
        {/* Background Slider */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {heroImages.map((img: string, index: number) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center bg-fixed transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
              style={{ backgroundImage: `url('${img}')` }}
            />
          ))}
          <div className="absolute inset-0 bg-black/50 z-10" />
        </div>

        <div className="hero-content relative z-20">
          <span className="hero-badge" data-animate="" style={{
            fontSize: heroData?.badgeSize || '1rem',
            fontWeight: heroData?.badgeBold ? '700' : '400'
          }}>
            {heroData?.badge || "프리미엄 요리 제과 아카데미"}
          </span>
          <h1 className="hero-title delay-100" data-animate="" style={{
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
          <p className="hero-subtitle delay-200" data-animate="" style={{
            whiteSpace: 'pre-line',
            fontSize: heroData?.longDescSize || '1.2rem',
            fontWeight: heroData?.longDescBold ? '900' : '400' // Keeping 900 for longDesc as it was font-black
          }}>
            {heroData?.longDesc || "최고의 강사진이 여러분의 꿈을 현실로 만들어드립니다.\n자격증 취득부터 창업까지, 전문가가 함께합니다."}
          </p>
          <div className="hero-buttons delay-300" data-animate="">
            <Link href={heroData?.btn1Link || "/course/baking"} className="btn-hero btn-primary" id="hero-btn-primary">
              {heroData?.btn1Text || "과정리뷰하기"}
            </Link>
            <Link href={heroData?.btn2Link || "/inquiry"} className="btn-hero btn-outline" id="hero-btn-secondary">
              {heroData?.btn2Text || "상담문의"}
            </Link>
          </div>
          {/* Phone Banner Layout - Moved inside hero-content for correct flow */}
          {heroData?.phoneVisible && (
            <div
              className={`mt-6 animate-visible delay-500 flex justify-center w-full`}
              data-animate=""
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
                      <img src={heroData.phoneIcon} alt="icon" className="w-8 h-8 object-cover rounded-full" />
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
      </section>

      {/* Modern Quick Links Grid */}
      < section className="modern-container" >
        <div className="section-header" data-animate="">
          <h2 className="section-title">전문가를 위한 체계적인 교육과정</h2>
          <p className="section-desc">기초부터 심화까지, 당신에게 딱 맞는 커리큘럼을 만나보세요.</p>
        </div>


        <div className="card-grid-3">
          {/* Card 1 */}
          <Link href="/intro" className="info-card delay-100" data-animate="">
            <div style={{ height: '240px', overflow: 'hidden' }}>
              <ActionCardSlider
                images={Array.isArray(heroData.photos[0]) ? heroData.photos[0] : []}
                alt="Academy"
                imgStyle={{ objectPosition: 'left bottom' }}
              />
            </div>
            <div className="card-content">
              <div className="card-icon">🏢</div>
              <h3 className="card-title">학원소개</h3>
              <p className="card-text">강사진을 갖춘 글로벌 스탠다드 교육 학원입니다.</p>
            </div>
          </Link>

          {/* Card 2 */}
          <Link href="/course/baking" className="info-card delay-200" data-animate="">
            <div style={{ height: '240px', overflow: 'hidden' }}>
              <ActionCardSlider
                images={Array.isArray(heroData.photos[1]) ? heroData.photos[1] : []}
                alt="Patisserie"
              />
            </div>
            <div className="card-content">
              <div className="card-icon">🥖</div>
              <h3 className="card-title">제과제빵과정</h3>
              <p className="card-text">제과제빵부터 트렌디한 디저트까지 마스터하는 과정입니다.</p>
            </div>
          </Link>

          {/* Card 3 */}
          <Link href="/course/cooking/license" className="info-card delay-300" data-animate="">
            <div style={{ height: '240px', overflow: 'hidden' }}>
              <ActionCardSlider
                images={Array.isArray(heroData.photos[2]) ? heroData.photos[2] : []}
                alt="Culinary"
              />
            </div>
            <div className="card-content">
              <div className="card-icon">🍳</div>
              <h3 className="card-title">조리교육과정</h3>
              <p className="card-text">한식, 양식, 중식, 일식. 기능사 및 가정요리, 브런치 전문 조리 테크닉을 전수합니다.</p>
            </div>
          </Link>

          {/* Card 4 */}
          <Link href="/info/schedule" className="info-card delay-100" data-animate="">
            <div style={{ height: '240px', overflow: 'hidden' }}>
              <ActionCardSlider
                images={Array.isArray(heroData.photos[3]) ? heroData.photos[3] : []}
                alt="Certification"
              />
            </div>
            <div className="card-content">
              <div className="card-icon">📜</div>
              <h3 className="card-title">자격증 & 진학</h3>
              <p className="card-text">국가기술자격증 및 해외 유학, 진학을 위한 체계적인 솔루션.</p>
            </div>
          </Link>

          {/* Card 5 */}
          <Link href="/course/cooking/license#brunch" className="info-card delay-200" data-animate="">
            <div style={{ height: '240px', overflow: 'hidden' }}>
              <ActionCardSlider
                images={Array.isArray(heroData.photos[4]) ? heroData.photos[4] : []}
                alt="Career"
              />
            </div>
            <div className="card-content">
              <div className="card-icon">🤝</div>
              <h3 className="card-title">브런치 & 창업</h3>
              <p className="card-text">레스토랑 취업/창업 연계 프로그램.</p>
            </div>
          </Link>

          {/* Card 6 */}
          <Link href="/community/notice" className="info-card delay-300" data-animate="">
            <div style={{ height: '240px', overflow: 'hidden' }}>
              <ActionCardSlider
                images={Array.isArray(heroData.photos[5]) ? heroData.photos[5] : []}
                alt="Community"
              />
            </div>
            <div className="card-content">
              <div className="card-icon">💬</div>
              <h3 className="card-title">커뮤니티</h3>
              <p className="card-text">수료생 네트워크, 창업 정보 공유 등 활발한 소통의 장.</p>
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
          backgroundAttachment: 'fixed',
          opacity: 1,
          zIndex: 0
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '15px' }}>새로운 소식</h2>
            <p style={{ fontSize: '1.1rem', color: '#666' }}>세종요리제과기술학원의 새로운 소식입니다.</p>
          </div>

          <div className="updates-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            {/* Notice */}
            <div className="update-column" style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <div className="column-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f5a623', paddingBottom: '15px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>공지사항</h3>
                <Link href="/community/notice" className="more-link" style={{ color: '#f5a623', fontSize: '0.9rem', fontWeight: 600 }}>더보기 +</Link>
              </div>
              <ul className="latest-list space-y-3">
                {noticeData.slice(0, 5).map(item => (
                  <li key={item.id} className="flex justify-between items-center group cursor-pointer" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
                    <Link href={`/community/notice/${item.id}`} className="text-gray-700 hover:text-[#f5a623] transition-colors truncate flex-1 text-sm font-medium block">
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
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>질문&답변</h3>
                <Link href="/community/qna" className="more-link" style={{ color: '#f5a623', fontSize: '0.9rem', fontWeight: 600 }}>더보기 +</Link>
              </div>
              <ul className="latest-list space-y-3">
                {latestQna.slice(0, 5).map(item => (
                  <li key={item.id} className="flex justify-between items-center group cursor-pointer" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
                    <Link href={`/community/qna/${item.id}`} className="text-gray-700 hover:text-[#f5a623] transition-colors truncate flex-1 text-sm font-medium block">
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
                    <Link href={`/job/openings/${item.id}`} className="text-gray-700 hover:text-[#f5a623] transition-colors truncate flex-1 text-sm font-medium block">
                      {item.title}
                    </Link>
                    <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{item.date}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section >
    </>
  );
}
