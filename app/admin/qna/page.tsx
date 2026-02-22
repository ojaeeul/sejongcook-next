
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminTable from '../components/AdminTable';
import SuccessModal from '@/components/SuccessModal';
import ConfirmModal from '@/components/ConfirmModal';

export default function QnaList() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const url = '/api/admin/data/qna?_t=' + Date.now();
            const res = await fetch(url);
            const json = await res.json();
            if (Array.isArray(json)) {
                setData(json);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error('Failed to fetch qna', error);
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
            const url = `/api/admin/data/qna?id=${id}`;
            const res = await fetch(url, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete');

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setData(prev => prev.filter((item: any) => String(item.id) !== String(id)));
            setSuccessModal({ isOpen: true, message: '문의사항이 삭제되었습니다.' });
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            render: (val: string, item: any) => (
                <Link href={`/admin/qna/edit?id=${item.id}`} className="hover:text-indigo-600 hover:underline font-medium">
                    {val}
                </Link>
            )
        },
        { key: 'author', label: '작성자' },
        { key: 'date', label: '작성일' },
        {
            key: 'status', label: '상태', render: (val: string) => ( // Status
                <span className={`px-2 py-1 rounded-full text-xs ${val === '답변완료' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {val || '대기중'}
                </span>
            )
        },
    ];

    if (loading) return <div className="p-8 text-center text-gray-500">로딩 중...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">문의사항 관리</h1>
            </div>

            <AdminTable
                title="문의사항 목록"
                data={data}
                columns={columns}
                onDelete={handleDeleteClick}
                newLink="/admin/qna/new"
                editLinkPrefix="/admin/qna/edit"
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title="문의사항 삭제"
                message="정말 이 문의사항을 삭제하시겠습니까?"
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
