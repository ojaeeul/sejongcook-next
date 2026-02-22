'use client';

import { useEffect, useState } from 'react';
import AdminTable from '@/app/admin/components/AdminTable';

interface CookingPost {
    id: string | number;
    category: string;
    title: string;
    author: string;
    date: string;
    hit: number;
    [key: string]: string | number | undefined;
}

export default function CookingBoardList() {
    const [data, setData] = useState<CookingPost[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const url = process.env.NODE_ENV === 'production' ? '/api.php?board=cooking' : '/api/admin/data/cooking?t=' + Date.now();
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const json = await res.json();
            if (Array.isArray(json)) {
                setData(json.sort((a: CookingPost, b: CookingPost) => {
                    const idA = Number(a.id) || 0;
                    const idB = Number(b.id) || 0;
                    return idB - idA;
                }));
            } else {
                setData([]);
            }
        } catch (error) {
            console.error('Failed to fetch cooking posts', error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: string | number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            const url = process.env.NODE_ENV === 'production' ? `/api.php?board=cooking&id=${id}` : `/api/admin/data/cooking?id=${id}`;
            const res = await fetch(url, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Delete failed');

            setData(prev => prev.filter((item: CookingPost) => String(item.id) !== String(id)));
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
                <h1 className="text-2xl font-bold text-gray-800">조리 게시판 관리</h1>
            </div>

            <AdminTable
                title="조리 게시판 게시물"
                data={data}
                columns={columns}
                onDelete={handleDelete}
                newLink="/admin/cooking-board/new"
                editLinkPrefix="/admin/cooking-board/edit"
            />
        </div>
    );
}
