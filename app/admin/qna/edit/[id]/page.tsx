
'use client';

import { useEffect, useState, use } from 'react';
import DataEditor from '../../../components/DataEditor';

export default function EditQna({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/admin/data/qna');
                const json = await res.json();
                const item = json.find((i: any) => i.id === unwrappedParams.id);
                setData(item);
            } catch (error) {
                console.error('Failed to fetch qna', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [unwrappedParams.id]);

    if (loading) return <div className="p-8 text-center text-gray-500">로딩 중...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">문의사항을 찾을 수 없습니다</div>;

    return (
        <DataEditor
            title="문의사항 수정/답변"
            initialData={data}
            type="qna"
            backLink="/admin/qna"
        />
    );
}
