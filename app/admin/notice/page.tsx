
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import AdminTable from '../components/AdminTable';
import SuccessModal from '@/components/SuccessModal';
import ConfirmModal from '@/components/ConfirmModal';
import { useAdminData } from '@/lib/hooks/useAdminData';

interface NoticeItem {
    id: string | number;
    title: string;
    author: string;
    date: string;
    hit: string | number;
}

export default function NoticeList() {
    const { data: rawData, loading, mutate } = useAdminData<NoticeItem[]>('/api/admin/data/notice');

    const data = useMemo(() => {
        if (!Array.isArray(rawData)) return [];
        return [...rawData].sort((a: NoticeItem, b: NoticeItem) => Number(b.id) - Number(a.id));
    }, [rawData]);

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: '' as string | number });
    const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });

    const handleDeleteClick = (id: string | number) => {
        setConfirmModal({ isOpen: true, id });
    };

    const handleDeleteConfirm = async () => {
        if (!confirmModal.id) return;
        const id = confirmModal.id;

        try {
            const url = `/api/admin/data/notice?id=${id}`;
            const res = await fetch(url, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Delete failed');

            if (rawData) {
                mutate(rawData.filter((item: NoticeItem) => String(item.id) !== String(id)));
            }
            setSuccessModal({ isOpen: true, message: '공지사항이 삭제되었습니다.' });
        } catch {
            alert('삭제에 실패했습니다');
        } finally {
            setConfirmModal({ isOpen: false, id: '' });
        }
    };

    const columns = [
        {
            key: 'title',
            label: '제목',
            render: (val: string, item: NoticeItem) => (
                <Link href={`/admin/notice/edit?id=${item.id}`} className="hover:text-indigo-600 hover:underline font-medium">
                    {val}
                </Link>
            )
        },
        { key: 'author', label: '작성자' },
        { key: 'date', label: '작성일' },
        { key: 'hit', label: '조회수' },
    ];

    if (loading) return <div className="p-8 text-center text-gray-500">로딩 중...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">공지사항 관리</h1>
            </div>

            <AdminTable
                title="전체 공지사항"
                data={data}
                columns={columns}
                onDelete={handleDeleteClick}
                newLink="/admin/notice/new"
                editLinkPrefix="/admin/notice/edit"
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title="공지사항 삭제"
                message="정말 이 공지사항을 삭제하시겠습니까?"
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
