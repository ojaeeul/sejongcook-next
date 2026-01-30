'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CookingSubNav() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isEdit = searchParams.get('mode') === 'edit';
    const [hash, setHash] = useState('');

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
                        >
                            <span className="break-keep">{menu.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
