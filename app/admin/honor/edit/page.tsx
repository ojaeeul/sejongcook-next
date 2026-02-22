'use client';

import { useEffect, useState, Suspense } from 'react';
import DataEditor from '../../components/DataEditor';

import { useSearchParams } from 'next/navigation';

function EditHonorContent() {
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
                const url = process.env.NODE_ENV === 'production' ? '/api.php?board=honor' : '/api/admin/data/honor';
                const res = await fetch(url);
                if (!res.ok) throw new Error('Failed to fetch data');
                const list = await res.json();
                const item = list.find((i: { id: string | number }) => String(i.id) === String(id));

                if (!item) throw new Error('Post not found');
                setData(item);
            } catch (error) {
                console.error('Failed to fetch honor post', error);
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
            title="명예의 전당 수정"
            initialData={data}
            type="honor"
            backLink="/admin/honor"
        />
    );
}

export default function EditHonor() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EditHonorContent />
        </Suspense>
    );
}
