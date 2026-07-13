'use client';
// Force sidebar update

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function CourseSidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [hash, setHash] = useState('');
    const isCooking = pathname?.startsWith('/course/cooking');

    useEffect(() => {
        // Safe check for window
        if (typeof window !== 'undefined') {
            const updateHash = () => setHash(window.location.hash);
            updateHash();
            window.addEventListener('hashchange', updateHash);
            const interval = setInterval(updateHash, 200);
            return () => {
                window.removeEventListener('hashchange', updateHash);
                clearInterval(interval);
            };
        }
    }, [pathname]);

    const title = isCooking ? '조리교육과정' : '제과제빵과정';

    const menuItems = isCooking ? [
        { name: '조리교육과정 개요', path: '/course/cooking/license' },
        { name: '한식조리 기능사', path: '/course/cooking/license#korean' },
        { name: '양식조리 기능사', path: '/course/cooking/license#western' },
        { name: '중식조리 기능사', path: '/course/cooking/license#chinese' },
        { name: '일식조리 기능사', path: '/course/cooking/license#japanese' },
        { name: '복어조리 기능사', path: '/course/cooking/license#puffer' },
        { name: '한식산업기사', path: '/course/cooking/license#industrial' },
        { name: '브런치마스터', path: '/course/cooking/license#brunch' },
        { name: '생활요리', path: '/course/cooking/license#life' },
        // { name: '수업뉴스/갤러리', path: '/course/cooking/board' },
    ] : [
        { name: '제과제빵과정 개요', path: '/course/baking' },
        { name: '케익디자인', path: '/course/cake' },
        { name: '디저트', path: '/course/dessert' },
        { name: '홈베이커리반', path: '/course/hobby' },
        { name: '취업반', path: '/course/job' },
    ];

    // Themes
    const bakingTheme = {
        borderColor: 'border-amber-400',
        textColor: 'text-amber-600',
        activeBg: 'bg-amber-50',
        accentColor: 'text-amber-500',
        phoneColor: 'text-amber-700'
    };

    const cookingTheme = {
        borderColor: 'border-[#3e2723]',
        textColor: 'text-[#3e2723]',
        activeBg: 'bg-[#faf7f6]',
        accentColor: 'text-[#3e2723]',
        phoneColor: 'text-[#3e2723]'
    };

    const theme = isCooking ? cookingTheme : bakingTheme;

    return (
        <div className="w-full">
            {/* Header - Minimalist Style with Section Color */}
            {menuItems.length > 0 && (
                <div
                    className={`bg-white ${theme.textColor} text-xl font-bold p-6 text-center rounded-t-lg border-b-2 ${theme.borderColor} cursor-pointer xl:cursor-default flex justify-between xl:justify-center items-center gap-2`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {title}
                    <div className="xl:hidden flex items-center gap-1 text-sm font-medium">
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
            )}

            {/* Menu List */}
            {menuItems.length > 0 && (
                <ul className={`border-x border-b border-gray-100 rounded-b-lg overflow-hidden bg-white transition-all duration-300 ease-in-out xl:max-h-none xl:opacity-100 ${isOpen ? 'max-h-[1000px] opacity-100 block' : 'max-h-0 opacity-0 xl:block hidden'}`}>
                    {menuItems.map((item) => {
                        const [itemPath, itemHash] = item.path.split('#');
                        const isActive = itemHash
                            ? (pathname === itemPath && hash === '#' + itemHash)
                            : (pathname === itemPath && (!hash || hash === '#'));

                        return (
                            <li key={item.path} className="border-b last:border-b-0 border-gray-50">
                                <Link
                                    href={item.path}
                                    className={`block px-6 py-4 transition-all font-medium hover:bg-gray-50 flex justify-between items-center ${isActive
                                        ? `text-gray-900 ${theme.activeBg} font-bold`
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.name}
                                    {isActive && <span className={`${theme.accentColor} text-lg font-bold`}>›</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}


        </div>
    );
}
