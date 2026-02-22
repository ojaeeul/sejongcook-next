'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminTable from '../components/AdminTable';
import SuccessModal from '@/components/SuccessModal';
import ConfirmModal from '@/components/ConfirmModal';

export default function JobOpeningsList() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const url = '/api/admin/data/job-openings?_t=' + Date.now();
            const res = await fetch(url);
            const json = await res.json();
            if (Array.isArray(json)) {
                setData(json);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error('Failed to fetch jobs', error);
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
            const url = `/api/admin/data/job-openings?id=${id}`;
            const res = await fetch(url, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete');

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setData(prev => prev.filter((item: any) => String(item.id) !== String(id)));
            setSuccessModal({ isOpen: true, message: '구인구직이 삭제되었습니다.' });
        } catch (error) {
            console.error('Failed to delete job', error);
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
                <Link href={`/admin/job-openings/edit?id=${item.id}`} className="hover:text-indigo-600 hover:underline font-medium">
                    {val}
                </Link>
            )
        },
        { key: 'author', label: '회사/작성자' },
        { key: 'date', label: '작성일', format: (val: string) => val ? new Date(val).toLocaleDateString('ko-KR') : '-' },
        { key: 'hits', label: '조회수' },
    ];

    if (loading) return <div className="p-8 text-center text-gray-500">로딩 중...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">구인구직 관리</h1>
            </div>

            <AdminTable
                title="구인구직 목록"
                data={data}
                columns={columns}
                onDelete={handleDeleteClick}
                newLink="/admin/job-openings/new"
                editLinkPrefix="/admin/job-openings/edit"
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title="구인구직 삭제"
                message="정말 이 구인구직을 삭제하시겠습니까?"
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
