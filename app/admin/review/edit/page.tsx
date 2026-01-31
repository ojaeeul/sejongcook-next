'use client';

import { useEffect, useState, Suspense } from 'react';
import DataEditor from '../../components/DataEditor';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function EditReviewContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            try {
                const { data: post, error } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setData(post);
            } catch (error) {
                console.error('Failed to fetch review', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-gray-500">로딩 중...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">수강후기를 찾을 수 없습니다</div>;

    return (
        <DataEditor
            title="수강후기 수정"
            initialData={data}
            type="review"
            backLink="/admin/review"
        />
    );
}

export default function EditReview() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EditReviewContent />
        </Suspense>
    );
}
