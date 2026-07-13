'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function InfoSidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { name: '시간표', path: '/info/timetable' },
        { name: '자격시험일정', path: '/info/schedule' },
        { name: '자격시험안내', path: '/info/guide' },
        { name: '대학진학', path: '/info/university' },
        { name: '고등학교진학', path: '/info/highschool' },
        { name: '상담/수강신청', path: '/inquiry' },
    ];

    // Info: Trust Blue - Professional, educational, clear
    const theme = {
        borderColor: 'border-[#0984E3]',
        textColor: 'text-[#0984E3]',
        activeBg: 'bg-[#0984E3]/10',
        accentColor: 'text-[#0984E3]',
        phoneColor: 'text-[#0984E3]'
    };

    return (
        <div className="w-full xl:w-[250px] flex-shrink-0 sticky top-24 h-fit space-y-8">
            {/* Menu Card */}
            <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
                {/* Header - Minimalist Style */}
                <div
                    className={`bg-white ${theme.textColor} text-xl font-bold p-6 text-center border-b-2 ${theme.borderColor} cursor-pointer xl:cursor-default flex justify-between xl:justify-center items-center gap-2`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    자격증&진학
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

                {/* Menu List */}
                <ul className={`bg-white transition-all duration-300 ease-in-out xl:max-h-none xl:opacity-100 ${isOpen ? 'max-h-[500px] opacity-100 block' : 'max-h-0 opacity-0 xl:block hidden'}`}>
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

            {/* Mobile Counseling Button */}
            <Link
                href="/inquiry"
                className="block xl:hidden text-gray-800 text-center py-4 rounded-lg mt-2 font-bold hover:bg-gray-50 transition-colors border border-gray-200"
            >
                상담/수강신청
            </Link>

            {/* Inquiry Box */}
            <div className="hidden xl:block bg-white p-6 rounded-lg text-center border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-2">상담문의</h3>
                <p className={`${theme.phoneColor} font-bold text-2xl mb-4`}>031-986-1933</p>
                <p className="text-sm text-gray-500 mb-4">
                    평일 09:00 ~ 22:00<br />
                    주말 09:00 ~ 18:00
                </p>
                <Link href="/inquiry" className="block w-full bg-slate-800 text-white py-3 rounded font-bold hover:bg-slate-700 transition-colors shadow-sm" style={{ color: '#fff' }}>
                    온라인 상담신청
                </Link>
            </div>
        </div>
    );
}
