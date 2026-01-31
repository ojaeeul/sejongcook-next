'use client';

import { useEffect, useState } from 'react';
import AdminTable from '@/app/admin/components/AdminTable';

import { supabase } from '@/lib/supabase';

export default function HonorList() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const { data: posts, error } = await supabase
                .from('posts')
                .select('*')
                .eq('board_type', 'honor')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setData(posts || []);
        } catch (error) {
            console.error('Failed to fetch honor posts', error);
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

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setData(prev => prev.filter((item: any) => item.id !== id));
        } catch {
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
                <h1 className="text-2xl font-bold text-gray-800">명예의 전당 관리</h1>
            </div>

            <AdminTable
                title="명예의 전당 게시물"
                data={data}
                columns={columns}
                onDelete={handleDelete}
                newLink="/admin/honor/new"
                editLinkPrefix="/admin/honor/edit"
            />
        </div>
    );
}
