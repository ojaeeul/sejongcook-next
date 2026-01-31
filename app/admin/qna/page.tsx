
'use client';

import { useEffect, useState } from 'react';
import AdminTable from '../components/AdminTable';

import { supabase } from '@/lib/supabase';

export default function QnaList() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const { data: posts, error } = await supabase
                .from('posts')
                .select('*')
                .eq('board_type', 'qna')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setData(posts || []);
        } catch (error) {
            console.error('Failed to fetch qna', error);
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
            alert('삭제에 실패했습니다'); // Failed to delete
        }
    };

    const columns = [
        { key: 'title', label: '제목' }, // Title
        { key: 'author', label: '작성자' }, // Author
        { key: 'date', label: '작성일' }, // Date
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
                <h1 className="text-2xl font-bold text-gray-800">문의사항 관리</h1> {/* Q&A Management */}
            </div>

            <AdminTable
                title="문의사항 목록" /* Q&A List */
                data={data}
                columns={columns}
                onDelete={handleDelete}
                newLink="/admin/qna/new"
                editLinkPrefix="/admin/qna/edit"
            />
        </div>
    );
}
