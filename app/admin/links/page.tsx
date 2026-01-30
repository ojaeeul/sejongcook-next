
'use client';

import { useEffect, useState } from 'react';
import AdminTable from '../components/AdminTable';
import { Settings } from 'lucide-react';

export default function LinksList() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/admin/data/sites');
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error('Failed to fetch sites', error);
        } finally {
            setLoading(false);
        }
    };

    // Settings state
    const [showAuthLinks, setShowAuthLinks] = useState(true);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/data/settings');
            const json = await res.json();
            if (json.showAuthLinks !== undefined) setShowAuthLinks(json.showAuthLinks);
        } catch (error) {
            console.error('Failed to fetch settings');
        }
    };

    const toggleAuthLinks = async (checked: boolean) => {
        setShowAuthLinks(checked);
        try {
            await fetch('/api/admin/data/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ showAuthLinks: checked }),
            });
        } catch (error) {
            alert('설정 저장 실패');
        }
    };

    useEffect(() => {
        fetchData();
        fetchSettings();
    }, []);

    const handleDelete = async (id: string | number) => {
        try {
            const newData = data.filter((item: any) => item.id !== id);
            await fetch('/api/admin/data/sites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData),
            });
            setData(newData);
        } catch (error) {
            alert('삭제에 실패했습니다');
        }
    };

    const columns = [
        { key: 'title', label: '제목' },
        { key: 'author', label: '작성자' },
        { key: 'date', label: '작성일' },
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
                                OFF로 설정하면 메인 홈페이지 상단의 '로그인', '회원가입' 메뉴가 숨겨집니다.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
