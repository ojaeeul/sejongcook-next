'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BakingSubNav() {
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

    // Menu items for Baking Course
    const menus = [
        { name: '제과제빵과정 개요', href: '/course/baking' },
        { name: '제과기능사', href: '/course/baking#confectionery' },
        { name: '제빵기능사', href: '/course/baking#bread' },
        { name: '케익디자인', href: '/course/cake' },
        { name: '디저트', href: '/course/dessert' },
        { name: '수업뉴스', href: '/course/baking/board' },
        { name: '제과제빵 갤러리', href: '/course/baking/gallery' },
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
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-[13px] md:text-[15px]">
                {menus.map((menu) => {
                    const active = isActive(menu.href);
                    // Baking theme color: Orange/Amber (#ff8c00 used in content) or similar to match design
                    // Cooking used #3e2723 (Dark Brown). Let's stick to a consistent theme or use the orange widely used in baking page.
                    // The user said "Just like Cooking Course", so I will reuse the #3e2723 brown style for consistency across the site 
                    // unless specifically differentiated. However, usually Baking is orange. 
                    // Let's look at Baking Page content: "color:#ff8c00" is used.
                    // But CookingSubNav used #3e2723. To "match Cooking Course" usually means structural consistency.
                    // I'll stick to #3e2723 to match the requested "standardization" exactly, or I can use an accent.
                    // Let's use #3e2723 (Brown) for buttons to be safe and consistent with "Standardize".

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
