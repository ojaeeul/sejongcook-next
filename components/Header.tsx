'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Header({ initialShowAuthLinks = true }: { initialShowAuthLinks?: boolean }) {
    const { isAdmin, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [hoveredMenu, setHoveredMenu] = useState<number | null>(null);
    const [showAuthLinks, setShowAuthLinks] = useState(initialShowAuthLinks);

    useEffect(() => {
        // Fetch global settings on mount to ensure client is in sync if navigation happened
        fetch('/api/settings', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (data.showAuthLinks !== undefined) setShowAuthLinks(data.showAuthLinks);
            })
            .catch(err => console.error('Failed to load settings', err));
    }, []);

    const navigation = [
        {
            label: '학원소개',
            href: '/intro',
            submenu: [
                { label: '인사말', href: '/intro' },
                { label: '강사 프로필', href: '/intro/teachers' },
                { label: '오시는 길', href: '/intro/location' },
            ]
        },
        {
            label: '제과제빵과정',
            href: '/course/baking',
            submenu: [
                { label: '제과/제빵기능사반', href: '/course/baking' },
                { label: '케익디자인반', href: '/course/cake' },
            ]
        },
        {
            label: '조리교육과정',
            href: '/course/cooking/license',
            submenu: [
                { label: '한식조리 기능사', href: '/course/cooking/license#korean' },
                { label: '양식조리 기능사', href: '/course/cooking/license#western' },
                { label: '중식조리 기능사', href: '/course/cooking/license#chinese' },
                { label: '일식조리 기능사', href: '/course/cooking/license#japanese' },
                { label: '복어조리 기능사', href: '/course/cooking/license#puffer' },
                { label: '한식산업기사', href: '/course/cooking/license#industrial' },
                { label: '브런치마스터', href: '/course/cooking/license#brunch' },
                { label: '생활요리', href: '/course/cooking/license#life' },
                { label: '수업뉴스/갤러리', href: '/course/cooking/board' },
            ]
        },
        {
            label: '자격증&진학',
            href: '/info/schedule',
            submenu: [
                { label: '자격시험일정', href: '/info/schedule' },
                { label: '자격시험안내', href: '/info/guide' },
                { label: '대학진학', href: '/info/university' },
                { label: '고등학교진학', href: '/info/highschool' },
                { label: '상담/수강신청', href: '/inquiry' },
            ]
        },
        {
            label: '취업정보',
            href: '/job/openings',
            submenu: [
                { label: '구인정보', href: '/job/openings' },
                { label: '구직정보', href: '/job/seekers' },
            ]
        },
        {
            label: '커뮤니티',
            href: '/community/notice',
            submenu: [
                { label: '공지사항', href: '/community/notice' },
                { label: '수강후기', href: '/community/review' },
                { label: '질문&답변', href: '/community/qna' },
                { label: '관련사이트', href: '/community/sites' },
                { label: '명예의 전당', href: '/community/honor' },
            ]
        },
    ];

    const handleMenuClick = () => {
        setHoveredMenu(null);
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="w-full bg-white font-sans text-gray-800">
            {/* Top Bar */}
            <div className="border-b border-gray-100">
                <div className="max-w-[1200px] mx-auto px-4 h-[80px] flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/">
                            {/* Using standard img tag for compatibility */}
                            <Image
                                src="/img_up/shop_pds/sejongcook/farm/logo1590397857.png"
                                alt="세종요리제과기술학원"
                                width={200}
                                height={50}
                                className="h-[50px] w-auto object-contain"
                                priority
                            />
                        </Link>
                    </div>

                    {/* Desktop Top Nav */}
                    <div className="!hidden lg:!flex items-center gap-3 text-sm text-gray-600">
                        {/* Quick Lookup Buttons */}
                        <div className="flex gap-2 mr-2">
                            <Link
                                href="/info/timetable"
                                className="flex items-center gap-2 bg-[#f9f8f5] border border-[#e5e7eb] px-3 py-1.5 rounded hover:bg-white hover:border-amber-400 transition-colors group"
                            >
                                {/* Calendar Icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 group-hover:text-amber-600">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                <span className="text-xs font-medium text-gray-700">시간표조회</span>
                                <span className="text-gray-400 text-[10px]">+</span>
                            </Link>
                            <Link
                                href="/intro/location"
                                className="flex items-center gap-2 bg-[#f9f8f5] border border-[#e5e7eb] px-3 py-1.5 rounded hover:bg-white hover:border-amber-400 transition-colors group"
                            >
                                {/* Pin Icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 group-hover:text-amber-600">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                <span className="text-xs font-medium text-gray-700">학원위치조회</span>
                                <span className="text-gray-400 text-[10px]">+</span>
                            </Link>
                        </div>

                        <div className="flex gap-4">
                            <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
                            {showAuthLinks && !isAdmin && (
                                <>
                                    <Link href="/login" className="hover:text-amber-500 transition-colors">로그인</Link>
                                    <Link href="/join" className="hover:text-amber-500 transition-colors">회원가입</Link>
                                </>
                            )}
                            {isAdmin && (
                                <>
                                    <Link href="/admin" className="hover:text-amber-500 transition-colors font-bold text-indigo-600">관리자</Link>
                                    <button onClick={logout} className="hover:text-amber-500 transition-colors">로그아웃</button>
                                </>
                            )}
                        </div>
                        <div className="h-3 w-[1px] bg-gray-300"></div>
                        <button onClick={() => alert('스마트폰에서만 전화를 연결할 수 있습니다.')} className="font-bold text-gray-800 hover:text-amber-600 transition-colors">
                            전화걸기
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="lg:!hidden p-2 text-gray-600 hover:text-amber-500 flex items-center gap-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <span className="font-bold text-lg">MENU</span>
                        {/* Hamburger Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Main Navigation (Yellow Bar) */}
            <div className="bg-[#f7bc5a] sticky top-0 z-50 shadow-md">
                <div className="max-w-[1200px] mx-auto px-4">
                    {/* Desktop Menu - Visible only on LG+ screens */}
                    <nav className="hidden lg:block" style={{ display: 'none' }} suppressHydrationWarning>
                        {/* Hack for hydration warning */}
                    </nav>
                    {/* Retrying with !important Tailwind classes */}
                    <nav className="!hidden lg:!block">
                        <ul className="flex justify-between items-center h-[50px] font-bold text-white tracking-wide">
                            {navigation.map((item, index) => (
                                <li
                                    key={index}
                                    className="relative h-full"
                                    onMouseEnter={() => setHoveredMenu(index)}
                                    onMouseLeave={() => setHoveredMenu(null)}
                                >
                                    <Link
                                        href={item.href}
                                        className="h-full flex items-center px-4 xl:px-6 lg:text-sm xl:text-base hover:bg-[#e6a840] transition-colors whitespace-nowrap"
                                        onClick={handleMenuClick}
                                    >
                                        {item.label}
                                    </Link>

                                    {/* Dropdown */}
                                    {item.submenu && hoveredMenu === index && (
                                        <div className={`absolute top-full text-gray-800 shadow-xl rounded-b-md overflow-hidden border-t-4 border-[#f7bc5a] bg-white w-[200px] ${index === navigation.length - 1 ? 'right-0' : 'left-0'
                                            }`}>
                                            <ul className="py-2 text-sm font-medium">
                                                {item.submenu.map((subItem, subIndex) => (
                                                    <li key={subIndex}>
                                                        <Link
                                                            href={subItem.href}
                                                            className="block px-5 py-2 hover:bg-amber-50 hover:text-amber-600 whitespace-nowrap"
                                                            onClick={handleMenuClick}
                                                        >
                                                            {subItem.label}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Mobile Menu (Collapsible) - Visible below LG */}
                    <nav className={`lg:!hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <ul className="flex flex-col text-white pb-6 pt-2 space-y-1">
                            {navigation.map((item, index) => (
                                <li key={index}>
                                    <Link
                                        href={item.href}
                                        className="block py-3 px-4 rounded-md hover:bg-[#e6a840] transition-colors"
                                        onClick={handleMenuClick}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </div>
        </header>
    );
}
