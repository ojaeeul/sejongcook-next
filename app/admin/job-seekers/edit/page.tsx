'use client';

import { useEffect, useState, Suspense } from 'react';
import DataEditor from '../../components/DataEditor';
import { useSearchParams } from 'next/navigation';

function EditJobSeekerContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            try {
                // Use Local API or PHP Bridge in Production
                const url = '/api/admin/data/job-seekers?_t=' + Date.now();
                const res = await fetch(url);
                if (!res.ok) throw new Error('Failed to fetch data');
                const list = await res.json();

                // Find item by ID (string conversion for safety)
                const item = list.find((i: { id: string | number }) => String(i.id) === String(id));

                if (!item) throw new Error('Seeker not found');
                setData(item);
            } catch (error) {
                console.error('Failed to fetch seeker', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-gray-500">로딩 중...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">구직정보를 찾을 수 없습니다</div>;

    return (
        <DataEditor
            title="구직정보 수정"
            initialData={data}
            type="job-seekers"
            backLink="/admin/job-seekers"
        />
    );
}

export default function EditJobSeeker() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EditJobSeekerContent />
        </Suspense>
    );
}
