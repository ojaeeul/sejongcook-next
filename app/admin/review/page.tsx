'use client';

import { useEffect, useState } from 'react';
import AdminTable from '../components/AdminTable';
import { supabase } from '@/lib/supabase';

export default function ReviewList() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const { data: posts, error } = await supabase
                .from('posts')
                .select('*')
                .eq('board_type', 'review')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setData(posts || []);
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
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setData(data.filter((item) => item.id !== id));
        } catch (error) {
            console.error('Failed to delete review', error);
            alert('삭제에 실패했습니다');
        }
    };

    const columns = [
        { key: 'title', label: '제목' },
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
                onDelete={handleDelete}
                newLink="/admin/review/new"
                editLinkPrefix="/admin/review/edit"
            />
        </div>
    );
}
