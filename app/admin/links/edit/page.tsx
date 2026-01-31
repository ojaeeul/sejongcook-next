
'use client';

import { useEffect, useState, Suspense } from 'react';
import DataEditor from '../../components/DataEditor';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function EditLinkContent() {
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
                console.error('Failed to fetch link', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-gray-500">로딩 중...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">항목을 찾을 수 없습니다</div>;

    return (
        <DataEditor
            title="사이트 링크/페이지 수정"
            initialData={data}
            type="sites"
            backLink="/admin/links"
        />
    );
}

export default function EditLink() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EditLinkContent />
        </Suspense>
    );
}
