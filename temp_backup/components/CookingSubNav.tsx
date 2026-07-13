'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CookingSubNav() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isEdit = searchParams.get('mode') === 'edit';
    const [hash, setHash] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Safe check for window
        if (typeof window !== 'undefined') {
            const updateHash = () => setHash(window.location.hash);

            updateHash();

            window.addEventListener('hashchange', updateHash);
            // Polling as a fallback for some Next.js link behaviors
            const interval = setInterval(updateHash, 200);

            return () => {
                window.removeEventListener('hashchange', updateHash);
                clearInterval(interval);
            };
        }
    }, [pathname, searchParams]);

    // Menu items as requested
    const menus = [
        { name: '조리교육과정 개요', href: '/course/cooking/license' },
        { name: '한식조리 기능사', href: '/course/cooking/license#korean' },
        { name: '양식조리 기능사', href: '/course/cooking/license#western' },
        { name: '중식조리 기능사', href: '/course/cooking/license#chinese' },
        { name: '일식조리 기능사', href: '/course/cooking/license#japanese' },
        { name: '복어조리 기능사', href: '/course/cooking/license#puffer' },
        { name: '한식산업기사', href: '/course/cooking/license#industrial' },
        { name: '브런치마스터', href: '/course/cooking/license#brunch' },
        { name: '생활요리', href: '/course/cooking/license#life' },
        { name: '수업뉴스/갤러리', href: '/course/cooking/board' },
    ];

    const isActive = (href: string) => {
        const [path, h] = href.split('#');
        if (h) {
            return pathname === path && hash === `#${h}`;
        }
        // For Overview (no hash in href), active if path matches and hash is empty or just '#'
        return pathname === path && (!hash || hash === '#');
    };

    if (isEdit) return null; // Hide sub-nav in edit mode for cleaner editing

    return (
        <div className="w-full mb-8">
            {/* Mobile Header */}
            <div
                className="bg-gray-800 text-white text-xl font-bold p-4 text-center rounded-lg xl:hidden flex justify-between items-center mb-2 cursor-pointer shadow-sm"
                onClick={() => setIsOpen(!isOpen)}
            >
                조리교육과정
                <div className="flex items-center gap-1 text-sm font-medium">
                    <span>MENU</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className={`w-6 h-6 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </div>
            </div>

            {/* Menu Grid - Collapsible on Mobile */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out xl:block ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 xl:max-h-none xl:opacity-100'}`}>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-[13px] md:text-[15px]">
                    {menus.map((menu) => {
                        const active = isActive(menu.href);
                        return (
                            <Link
                                key={menu.name}
                                href={menu.href}
                                className={`
                                py-3 px-2 rounded-lg flex items-center justify-center min-h-[50px] action-wild
                                ${active
                                        ? 'bg-[#3e2723] !text-white font-bold shadow-md'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-[#3e2723] hover:text-[#3e2723] hover:shadow-sm'
                                    }
                            `}
                                onClick={() => setIsOpen(false)}
                            >
                                <span className="break-keep">{menu.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
