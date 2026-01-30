
'use client';

import { useEffect, useState, use } from 'react';
import DataEditor from '../../../components/DataEditor';

export default function EditJobOpening({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/admin/data/job_openings');
                const json = await res.json();
                // ID might be number in file but strings in params. Convert to compare effectively.
                const item = json.find((i: any) => String(i.id) === unwrappedParams.id);
                setData(item);
            } catch (error) {
                console.error('Failed to fetch job', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [unwrappedParams.id]);

    if (loading) return <div className="p-8 text-center text-gray-500">로딩 중...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">구인구직을 찾을 수 없습니다</div>;

    return (
        <DataEditor
            title="구인구직 수정"
            initialData={data}
            type="job_openings"
            backLink="/admin/job-openings"
        />
    );
}
