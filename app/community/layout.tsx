'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function CommunityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

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
                        <div className="bg-gray-800 text-white text-xl font-bold p-6 text-center">
                            커뮤니티
                        </div>
                        <ul className="divide-y divide-gray-50">
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
