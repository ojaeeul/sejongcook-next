'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function IntroSidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { name: '인사말', path: '/intro' },
        { name: '강사소개', path: '/intro/teachers' },
        { name: '오시는길', path: '/intro/location' },
    ];

    // Intro: Neutral Gray - Clean, Modern, Minimalist
    const theme = {
        borderColor: 'border-gray-400',
        textColor: 'text-gray-600',
        activeBg: 'bg-gray-100',
        accentColor: 'text-gray-500',
        phoneColor: 'text-gray-700'
    };

    return (
        <div className="w-full">
            {/* Header - Minimalist Style with Mobile Toggle */}
            <div
                className={`bg-white ${theme.textColor} text-xl font-bold p-6 text-center rounded-t-lg border-b-2 ${theme.borderColor} cursor-pointer xl:cursor-default flex justify-between xl:justify-center items-center gap-2`}
                onClick={() => setIsOpen(!isOpen)}
            >
                학원소개
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

            {/* Menu List - Collapsible on Mobile */}
            <ul className={`border-x border-b border-gray-100 rounded-b-lg overflow-hidden bg-white transition-all duration-300 ease-in-out xl:max-h-none xl:opacity-100 ${isOpen ? 'max-h-[500px] opacity-100 block' : 'max-h-0 opacity-0 xl:block hidden'
                }`}>
                {menuItems.map((item) => {
                    const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
                    return (
                        <li key={item.path} className="border-b last:border-b-0 border-gray-50">
                            <Link
                                href={item.path}
                                className={`block px-6 py-4 transition-all font-medium hover:bg-gray-50 flex justify-between items-center ${isActive
                                    ? `text-gray-900 ${theme.activeBg} font-bold`
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {item.name}
                                {isActive && <span className={`${theme.accentColor} text-lg font-bold`}>›</span>}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
