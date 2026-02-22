'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import AdminTable from '../components/AdminTable';
import SuccessModal from '@/components/SuccessModal';
import ConfirmModal from '@/components/ConfirmModal';


export default function ReviewList() {
    interface ReviewItem {
        id: string | number;
        title: string;
        author: string;
        created_at: string;
        view_count: string | number;
    }
    const [data, setData] = useState<ReviewItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const url = '/api/admin/data/review';
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch reviews');
            const data = await res.json();
            const sorted = Array.isArray(data) ? data.sort((a: ReviewItem, b: ReviewItem) => Number(b.id) - Number(a.id)) : [];
            setData(sorted);
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: '' as string | number });
    const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });

    const handleDeleteClick = (id: string | number) => {
        setConfirmModal({ isOpen: true, id });
    };

    const handleDeleteConfirm = async () => {
        if (!confirmModal.id) return;
        const id = confirmModal.id;

        try {
            const url = `/api/admin/data/review?id=${id}`;
            const res = await fetch(url, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Delete failed');

            setData(prev => prev.filter((item: ReviewItem) => String(item.id) !== String(id)));
            setSuccessModal({ isOpen: true, message: '수강후기가 삭제되었습니다.' });
        } catch (error) {
            console.error('Failed to delete review', error);
            alert('삭제에 실패했습니다'); // Fallback for error
        } finally {
            setConfirmModal({ isOpen: false, id: '' });
        }
    };

    const columns = [
        {
            key: 'title',
            label: '제목',
            render: (val: string, item: ReviewItem) => (
                <Link href={`/admin/review/edit?id=${item.id}`} className="hover:text-indigo-600 hover:underline font-medium">
                    {val}
                </Link>
            )
        },
        { key: 'author', label: '작성자' },
        { key: 'created_at', label: '작성일', format: (val: string) => new Date(val).toLocaleDateString('ko-KR') },
        { key: 'view_count', label: '조회수' },
    ];

    if (loading) return <div className="p-8 text-center text-gray-500">로딩 중...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">수강후기 관리</h1>
            </div>

            <AdminTable
                title="전체 수강후기"
                data={data}
                columns={columns}
                onDelete={handleDeleteClick}
                newLink="/admin/review/new"
                editLinkPrefix="/admin/review/edit"
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title="수강후기 삭제"
                message="정말 이 수강후기를 삭제하시겠습니까?"
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
