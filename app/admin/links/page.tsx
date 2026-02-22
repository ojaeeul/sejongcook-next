'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import AdminTable from '../components/AdminTable';
import { Settings } from 'lucide-react';
import SuccessModal from '@/components/SuccessModal';
import ConfirmModal from '@/components/ConfirmModal';

export default function LinksList() {
    interface LinkItem {
        id: string | number;
        title: string;
        author: string;
        created_at: string;
    }
    const [data, setData] = useState<LinkItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAuthLinks, setShowAuthLinks] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const url = '/api/admin/data/links' + Date.now();
            const res = await fetch(url);
            const json = await res.json();
            if (Array.isArray(json)) {
                setData(json.sort((a: LinkItem, b: LinkItem) => Number(b.id) - Number(a.id)));
            } else {
                setData([]);
            }
        } catch (error) {
            console.error('Failed to fetch sites', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSettings = useCallback(async () => {
        try {
            const url = '/api/admin/data/settings';
            const res = await fetch(url);
            const data = await res.json();
            if (data.showAuthLinks !== undefined) setShowAuthLinks(data.showAuthLinks);
        } catch {
            // ignore
        }
    }, []);

    const toggleAuthLinks = async (checked: boolean) => {
        setShowAuthLinks(checked);
        try {
            const url = '/api/admin/data/settings';
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ showAuthLinks: checked }),
            });
        } catch {
            alert('설정 저장 실패');
        }
    };

    useEffect(() => {
        fetchData();
        fetchSettings();
    }, [fetchData, fetchSettings]);

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: '' as string | number });
    const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });

    const handleDeleteClick = (id: string | number) => {
        setConfirmModal({ isOpen: true, id });
    };

    const handleDeleteConfirm = async () => {
        if (!confirmModal.id) return;
        const id = confirmModal.id;

        try {
            const url = `/api/admin/data/links?id=${id}`;
            const res = await fetch(url, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete');

            setData(prev => prev.filter((item: LinkItem) => String(item.id) !== String(id)));
            setSuccessModal({ isOpen: true, message: '링크가 삭제되었습니다.' });
        } catch (error) {
            console.error('Failed to delete site', error);
            alert('삭제에 실패했습니다');
        } finally {
            setConfirmModal({ isOpen: false, id: '' });
        }
    };

    const columns = [
        {
            key: 'title',
            label: '제목',
            render: (val: string, item: LinkItem) => (
                <Link href={`/admin/links/edit?id=${item.id}`} className="hover:text-indigo-600 hover:underline font-medium">
                    {val}
                </Link>
            )
        },
        { key: 'author', label: '작성자' },
        { key: 'created_at', label: '작성일', format: (val: string) => val ? new Date(val).toLocaleDateString('ko-KR') : '-' },
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
                onDelete={handleDeleteClick}
                newLink="/admin/links/new"
                editLinkPrefix="/admin/links/edit"
            />

            {/* Global Settings Section */}
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

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title="링크 삭제"
                message="정말 이 링크를 삭제하시겠습니까?"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                confirmText="삭제"
                isDangerous={true}
            />

            <SuccessModal
                isOpen={successModal.isOpen}
                onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
                title="삭제 완료"
                message={successModal.message}
            />
        </div>
    );
}
