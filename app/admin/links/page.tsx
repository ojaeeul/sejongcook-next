'use client';

import { useEffect, useState } from 'react';
import AdminTable from '../components/AdminTable';
import { Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LinksList() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAuthLinks, setShowAuthLinks] = useState(true);

    const fetchData = async () => {
        try {
            const { data: posts, error } = await supabase
                .from('posts')
                .select('*')
                .eq('board_type', 'sites')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setData(posts || []);
        } catch (error) {
            console.error('Failed to fetch sites', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        // Mock settings or implement distinct table
        // For now, default true
        setShowAuthLinks(true);
    };

    const toggleAuthLinks = async (checked: boolean) => {
        setShowAuthLinks(checked);
        // Implement settings save to Supabase if needed
        alert('설정 기능은 현재 개발 중입니다.');
    };

    useEffect(() => {
        fetchData();
        fetchSettings();
    }, []);

    const handleDelete = async (id: string | number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setData(data.filter((item) => item.id !== id));
        } catch (error) {
            console.error('Failed to delete site', error);
            alert('삭제에 실패했습니다');
        }
    };

    const columns = [
        { key: 'title', label: '제목' },
        { key: 'author', label: '작성자' },
        { key: 'created_at', label: '작성일', format: (val: string) => new Date(val).toLocaleDateString('ko-KR') },
    ];

    if (loading) return <div className="p-8 text-center text-gray-500">로딩 중...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">사이트 링크 / 페이지 관리</h1>
            </div>

            <AdminTable
                title="사이트 컨텐츠"
                data={data}
                columns={columns}
                onDelete={handleDelete}
                newLink="/admin/links/new"
                editLinkPrefix="/admin/links/edit"
            />

            {/* Global Settings Section (Based on admin.html) */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-8">
                <h2 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-indigo-500 pl-3 flex items-center gap-2">
                    <Settings size={20} className="text-indigo-500" />
                    학보 소개 및 설정 (Global Settings)
                </h2>

                <div className="border-t border-gray-100 pt-6 mt-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm font-bold text-gray-800">홈페이지 로그인/회원가입 메뉴 표시</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={showAuthLinks}
                                        onChange={(e) => toggleAuthLinks(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">
                                OFF로 설정하면 메인 홈페이지 상단의 &apos;로그인&apos;, &apos;회원가입&apos; 메뉴가 숨겨집니다.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
