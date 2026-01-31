'use client';

import { useEffect, useState, Suspense } from 'react';
import DataEditor from '../../components/DataEditor';

import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';

function EditBakingPostContent() {
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
                const res = await fetch('/api/admin/data/baking');
                if (res.ok) {
                    const posts = await res.json();
                    const found = posts.find((p: any) => p.id === id);
                    if (found) setData(found);
                }
            } catch (error) {
                console.error('Failed to fetch baking post', error);
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
            title="제과반 게시물 수정"
            initialData={data}
            type="baking"
            backLink="/admin/baking-board"
        />
    );
}

export default function EditBakingPost() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EditBakingPostContent />
        </Suspense>
    );
}
