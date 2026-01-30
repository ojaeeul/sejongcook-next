
'use client';

import { useEffect, useState } from 'react';
import AdminTable from '../components/AdminTable';

export default function ReviewList() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/admin/data/review'); // review_data.json
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: string | number) => {
        try {
            const newData = data.filter((item: any) => item.id !== id);
            await fetch('/api/admin/data/review', {
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
        { key: 'hit', label: '조회수' },
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
                onDelete={handleDelete}
                newLink="/admin/review/new"
                editLinkPrefix="/admin/review/edit"
            />
        </div>
    );
}
