'use client';

import BoardView from "@/components/BoardView";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function HonorViewContent() {
    const searchParams = useSearchParams();
    const idx = searchParams.get('id');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!idx) {
            setLoading(false);
            return;
        }
        const fetchPost = async () => {
            try {
                // Fetch from PHP bridge in production, local JSON otherwise
                const url = '/api/admin/data/honor?_t=' + Date.now();
                const res = await fetch(url);
                const list = await res.json();
                const data = list.find((i: { id: string | number }) => String(i.id) === String(idx));

                if (!data) throw new Error('Post not found');
                setPost(data);
            } catch (e) {
                console.error("Failed to load honor post:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [idx]);

    if (loading) return <div className="p-20 text-center">Loading...</div>;
    if (!post) return <div className="p-20 text-center">Post not found</div>;

    return (
        <BoardView
            boardCode="honor"
            initialPost={post}
        />
    );
}

export default function HonorViewPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HonorViewContent />
        </Suspense>
    );
}
