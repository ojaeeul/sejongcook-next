'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminTable from '@/app/admin/components/AdminTable';
import SuccessModal from '@/components/SuccessModal';
import ConfirmModal from '@/components/ConfirmModal';

interface HonorPost {
    id: string;
    title: string;
    author: string;
    date: string;
    hit: string | number;
    name?: string;
    thumbnail?: string;
    content?: string;
    stars?: number;
}

export default function HonorList() {
    const [data, setData] = useState<HonorPost[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const url = '/api/admin/data/honor?_t=' + Date.now();
            const res = await fetch(url);
            const json = await res.json();
            if (Array.isArray(json)) {
                // Sort by ID descending
                setData(json.sort((a: HonorPost, b: HonorPost) => Number(b.id) - Number(a.id)));
            } else {
                setData([]);
            }
        } catch (error) {
            console.error('Failed to fetch honor posts', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: '' as string | number });
    const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });

    const handleDeleteClick = (id: string | number) => {
        setConfirmModal({ isOpen: true, id });
    };

    const handleDeleteConfirm = async () => {
        if (!confirmModal.id) return;
        const id = confirmModal.id;

        try {
            const url = `/api/admin/data/honor?id=${id}`;
            const res = await fetch(url, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete');

            setData(prev => prev.filter((item: HonorPost) => String(item.id) !== String(id)));
            setSuccessModal({ isOpen: true, message: '게시물이 삭제되었습니다.' });
        } catch (error) {
            console.error('Failed to delete honor post', error);
            alert('삭제에 실패했습니다');
        } finally {
            setConfirmModal({ isOpen: false, id: '' });
        }
    };

    const columns = [
        {
            key: 'title',
            label: '제목',
            render: (val: string, item: HonorPost) => (
                <Link href={`/admin/honor/edit?id=${item.id}`} className="hover:text-indigo-600 hover:underline font-medium">
                    {val}
                </Link>
            )
        },
        { key: 'author', label: '작성자' },
        { key: 'date', label: '작성일', format: (val: string) => val ? val : '-' },
        { key: 'hit', label: '조회수' },
    ];

    if (loading) return <div className="p-8 text-center text-gray-500">로딩 중...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">명예의 전당 관리</h1>
            </div>

            <AdminTable
                title="명예의 전당 게시물"
                data={data}
                columns={columns}
                onDelete={handleDeleteClick}
                newLink="/admin/honor/new"
                editLinkPrefix="/admin/honor/edit"
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title="게시물 삭제"
                message="정말 이 게시물을 삭제하시겠습니까?"
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
