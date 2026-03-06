'use client';

import { useMemo } from 'react';
import AdminTable from '@/app/admin/components/AdminTable';
import { useAdminData } from '@/lib/hooks/useAdminData';

interface BakingPost {
    id: string | number;
    category: string;
    title: string;
    author: string;
    date: string;
    hit: string | number;
    [key: string]: unknown;
}

export default function BakingBoardList() {
    const { data: rawData, loading, mutate } = useAdminData<BakingPost[]>('/api/admin/data/baking');

    const data = useMemo(() => {
        if (!Array.isArray(rawData)) return [];
        return [...rawData].sort((a: BakingPost, b: BakingPost) => {
            const idA = Number(a.id) || 0;
            const idB = Number(b.id) || 0;
            return idB - idA;
        });
    }, [rawData]);

    const handleDelete = async (id: string | number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            const url = `/api/admin/data/baking?id=${id}`;
            const res = await fetch(url, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Delete failed');

            if (rawData) {
                mutate(rawData.filter((item: BakingPost) => String(item.id) !== String(id)));
            }
        } catch {
            alert('삭제에 실패했습니다');
        }
    };

    const columns = [
        { key: 'category', label: '카테고리' },
        { key: 'title', label: '제목' },
        { key: 'author', label: '작성자' },
        { key: 'date', label: '작성일' },
        { key: 'hit', label: '조회수' },
    ];

    if (loading) return <div className="p-8 text-center text-gray-500">로딩 중...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">제과제빵 게시판 관리</h1>
            </div>

            <AdminTable
                title="제과제빵 게시판 게시물"
                data={data}
                columns={columns}
                onDelete={handleDelete}
                newLink="/admin/baking-board/new"
                editLinkPrefix="/admin/baking-board/edit"
            />
        </div>
    );
}
