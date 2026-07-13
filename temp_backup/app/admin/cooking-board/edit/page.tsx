'use client';

import { useEffect, useState, Suspense } from 'react';
import DataEditor from '../../components/DataEditor';

import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';

function EditCookingPostContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) {
                setLoading(false);
                return;
            }
            try {
                const { data: item, error } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setData(item);
            } catch (error) {
                console.error('Failed to fetch cooking post', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-gray-500">로딩 중...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">게시물을 찾을 수 없습니다</div>;

    return (
        <DataEditor
            title="조리반 게시물 수정"
            initialData={data}
            type="cooking"
            backLink="/admin/cooking-board"
        />
    );
}

export default function EditCookingPost() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EditCookingPostContent />
        </Suspense>
    );
}
