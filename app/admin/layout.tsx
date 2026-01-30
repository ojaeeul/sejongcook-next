
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    FileText,
    MessageSquare,
    Briefcase,
    Image as ImageIcon,
    LogOut,
    Menu,
    X,
    Link as LinkIcon
} from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // If on login page, don't show the admin layout shell
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    const handleLogout = async () => {
        try {
            await fetch('/api/admin/auth/logout', { method: 'POST' });
            router.push('/admin/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const menuItems = [
        { name: '대시보드', href: '/admin', icon: LayoutDashboard },
        { name: '공지사항', href: '/admin/notice', icon: FileText },
        { name: '수강후기', href: '/admin/review', icon: MessageSquare }, // Using MessageSquare for reviews
        { name: '구인구직', href: '/admin/job-openings', icon: Briefcase },
        { name: '문의사항', href: '/admin/qna', icon: MessageSquare },
        { name: '팝업 관리', href: '/admin/popups', icon: Menu }, // Using Menu icon for popups
        { name: '갤러리', href: '/admin/gallery', icon: ImageIcon },
        { name: '사이트 링크', href: '/admin/links', icon: LinkIcon },
        { name: '하단 정보 (Footer)', href: '/admin/footer', icon: FileText },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside
                className={`bg-white shadow-xl z-20 transition-all duration-300 ease-in-out fixed inset-y-0 left-0 md:relative ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-0 md:translate-x-0 overflow-hidden'
                    } ${!isSidebarOpen && 'hidden md:block md:w-0'}`}
            // Note: The logic above for closing sidebar on desktop is a bit tricky with pure CSS classes due to layout shift.
            // Let's settle for a simpler responsive sidebar.
            >
                <div className={`h-full flex flex-col ${!isSidebarOpen ? 'hidden' : 'flex'}`}>
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h1 className="text-xl font-bold text-indigo-600">관리자 패널</h1>
                        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400">
                            <X size={24} />
                        </button>
                    </div>

                    <nav className="flex-1 overflow-y-auto py-4">
                        <ul className="space-y-1 px-3">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                                ? 'bg-indigo-50 text-indigo-600 font-medium'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            <Icon size={20} />
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <LogOut size={20} />
                            <span>로그아웃</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="bg-white shadow-sm z-10 p-4 flex items-center md:hidden">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600 mr-4">
                        <Menu size={24} />
                    </button>
                    <span className="font-semibold text-gray-800">메뉴</span>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
