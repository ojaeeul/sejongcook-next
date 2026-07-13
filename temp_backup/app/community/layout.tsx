'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function CommunityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { name: '공지사항', path: '/community/notice' },
        { name: '수강후기', path: '/community/review' },
        { name: '질문&답변', path: '/community/qna' },
        { name: '명예의 전당', path: '/community/honor' },
    ];

    return (
        <div className="modern-container py-10">
            <div className="flex flex-col xl:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full xl:w-[250px] flex-shrink-0">
                    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm sticky top-24">
                        <div
                            className="bg-gray-800 text-white text-xl font-bold p-6 text-center cursor-pointer xl:cursor-default flex justify-between xl:justify-center items-center gap-2"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            커뮤니티
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
                        <ul className={`divide-y divide-gray-50 bg-white transition-all duration-300 ease-in-out xl:max-h-none xl:opacity-100 ${isOpen ? 'max-h-[500px] opacity-100 block' : 'max-h-0 opacity-0 xl:block hidden'}`}>
                            {menuItems.map((item) => {
                                const isActive = pathname?.startsWith(item.path);
                                return (
                                    <li key={item.path}>
                                        <Link
                                            href={item.path}
                                            className={`block px-6 py-4 transition-all font-medium hover:bg-gray-50 flex justify-between items-center ${isActive
                                                ? 'text-gray-900 bg-gray-50 font-bold border-l-4 border-gray-800'
                                                : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {item.name}
                                            {isActive && <span className="text-gray-800 text-lg font-bold">›</span>}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-grow">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 min-h-[600px]">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
