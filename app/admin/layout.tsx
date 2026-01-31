
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
    Settings,
    Link as LinkIcon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import type { SupabaseClient, Session } from '@supabase/supabase-js';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

    useEffect(() => {
        import('@/lib/supabase').then(mod => {
            setSupabase(mod.supabase);
        });
    }, []);

    useEffect(() => {
        if (!supabase) return;

        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                if (pathname !== '/admin/login') {
                    router.push('/admin/login');
                }
            } else {
                setAuthorized(true);
            }
        };
        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
            if (!session) {
                if (pathname !== '/admin/login') {
                    router.push('/admin/login');
                }
                setAuthorized(false);
            } else {
                setAuthorized(true);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase, router, pathname]);

    const handleLogout = async () => {
        try {
            if (supabase) {
                await supabase.auth.signOut();
            }
            router.push('/admin/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    // If on login page, don't show the admin layout shell
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    if (!authorized) {
        return <div className="min-h-screen flex items-center justify-center">Loading auth...</div>;
    }

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
        { name: '환경 설정', href: '/admin/settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside
                className={`bg-white shadow-xl z-20 transition-all duration-300 ease-in-out fixed inset-y-0 left-0 md:relative ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-0 md:translate-x-0 overflow-hidden'
                    } ${!isSidebarOpen && 'hidden md:block md:w-0'}`}
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
