
'use client';

import { FileText, MessageSquare, Briefcase, Image as ImageIcon, Wrench, ChevronRight, ClipboardList, Users, Layers, Activity } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
    const [visitors, setVisitors] = useState({ today: 0, total: 0 });

    useEffect(() => {
        const fetchVisitors = async () => {
            try {
                const url = '/api/visitors?_t=' + Date.now();
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setVisitors(data);
                }
            } catch (e) {
                console.error('Failed to load visitors', e);
            }
        };
        fetchVisitors();
    }, []);
    const stats = [
        { name: '총 공지사항', value: '12', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100', href: '/admin/notice' },
        { name: '수강후기', value: '8', icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-100', href: '/admin/review' },
        { name: '구인구직', value: '5', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-100', href: '/admin/job-openings' },
        { name: '갤러리 이미지', value: '24', icon: ImageIcon, color: 'text-amber-600', bg: 'bg-amber-100', href: '/admin/gallery' },
        { name: '강사 소개', value: '관리', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100', href: '/admin/teachers' },
        { name: '문의사항', value: 'Q&A', icon: MessageSquare, color: 'text-cyan-600', bg: 'bg-cyan-100', href: '/admin/qna' },
        { name: '메인 히어로', value: '설정', icon: Wrench, color: 'text-rose-600', bg: 'bg-rose-100', href: '/admin/hero' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">대시보드</h1>
                <div className="text-sm text-gray-500">세종요리제과기술학원 관리자 페이지에 오신 것을 환영합니다.</div>
            </div>

            {/* Visitor Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-md flex items-center justify-between">
                    <div>
                        <p className="text-blue-100 font-medium text-sm mb-1">오늘 방문자</p>
                        <h3 className="text-3xl font-bold">{visitors.today.toLocaleString()}명</h3>
                    </div>
                    <div className="bg-white/20 p-3 rounded-lg">
                        <Activity className="w-8 h-8 text-white" />
                    </div>
                </div>
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-md flex items-center justify-between">
                    <div>
                        <p className="text-emerald-100 font-medium text-sm mb-1">총 방문자</p>
                        <h3 className="text-3xl font-bold">{visitors.total.toLocaleString()}명</h3>
                    </div>
                    <div className="bg-white/20 p-3 rounded-lg">
                        <Users className="w-8 h-8 text-white" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Link
                            key={stat.name}
                            href={stat.href}
                            className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                                    <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.bg}`}>
                                    <Icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Quick Access Section based on user request */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                    <Wrench className="w-5 h-5 text-gray-700" />
                    <h2 className="text-lg font-bold text-gray-800">관리자 바로가기 (Quick Access)</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Card 1: Online Application Status */}
                    <Link href="/admin/inquiry" className="group block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="flex items-stretch">
                            <div className="w-1.5 bg-blue-500"></div>
                            <div className="p-5 flex-1 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-100 rounded-lg">
                                        <ClipboardList className="w-8 h-8 text-gray-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">온라인 접수 현황</h3>
                                        <p className="text-gray-500 text-sm">통합 접수 관리</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-blue-500 font-medium text-sm group-hover:underline">
                                    이동 <ChevronRight className="w-4 h-4 ml-1" />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Card 2: Member Management */}
                    <Link href="/admin/member" className="group block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="flex items-stretch">
                            <div className="w-1.5 bg-green-500"></div>
                            <div className="p-5 flex-1 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-100 rounded-lg">
                                        <Users className="w-8 h-8 text-gray-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">회원 관리</h3>
                                        <p className="text-gray-500 text-sm">회원/승인 관리</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-green-600 font-medium text-sm group-hover:underline">
                                    이동 <ChevronRight className="w-4 h-4 ml-1" />
                                </div>
                            </div>
                        </div>
                    </Link>
                    {/* Card 3: Baking Board Management */}
                    <Link href="/admin/baking-board" className="group block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="flex items-stretch">
                            <div className="w-1.5 bg-amber-500"></div>
                            <div className="p-5 flex-1 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-100 rounded-lg">
                                        <ImageIcon className="w-8 h-8 text-gray-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">제과제빵 갤러리 관리</h3>
                                        <p className="text-gray-500 text-sm">갤러리 글쓰기/수정</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-amber-600 font-medium text-sm group-hover:underline">
                                    이동 <ChevronRight className="w-4 h-4 ml-1" />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Card 4: Cooking Board Management */}
                    <Link href="/admin/cooking-board" className="group block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="flex items-stretch">
                            <div className="w-1.5 bg-rose-500"></div>
                            <div className="p-5 flex-1 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-100 rounded-lg">
                                        <FileText className="w-8 h-8 text-gray-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">조리 게시판 관리</h3>
                                        <p className="text-gray-500 text-sm">수업뉴스 글쓰기/수정</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-rose-600 font-medium text-sm group-hover:underline">
                                    이동 <ChevronRight className="w-4 h-4 ml-1" />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Card 5: Popup Management (Moved down) */}
                    <Link href="/admin/popups" className="group block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="flex items-stretch">
                            <div className="w-1.5 bg-purple-500"></div>
                            <div className="p-5 flex-1 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-100 rounded-lg">
                                        <Layers className="w-8 h-8 text-gray-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">팝업 관리</h3>
                                        <p className="text-gray-500 text-sm">메인 팝업/배너 관리</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-purple-600 font-medium text-sm group-hover:underline">
                                    이동 <ChevronRight className="w-4 h-4 ml-1" />
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">빠른 실행</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/admin/notice/new" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-center transition-colors">
                            <span className="font-medium text-gray-700">공지사항 작성</span>
                        </Link>
                        <Link href="/admin/gallery" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-center transition-colors">
                            <span className="font-medium text-gray-700">이미지 관리</span>
                        </Link>
                        <Link href="/admin/links" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-center transition-colors">
                            <span className="font-medium text-gray-700">링크 관리</span>
                        </Link>
                        <Link href="/" target="_blank" className="p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 text-center transition-colors">
                            <span className="font-medium text-indigo-700">사이트 보기</span>
                        </Link>
                    </div>
                </div>

                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">시스템 상태</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <span className="text-gray-600">서버 상태</span>
                            <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">정상</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <span className="text-gray-600">최근 백업</span>
                            <span className="text-sm text-gray-900">오늘, 09:00 AM</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-gray-600">버전</span>
                            <span className="text-sm text-gray-900">v1.0.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
