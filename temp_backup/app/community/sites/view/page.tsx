'use client';

import BoardView from "@/components/BoardView";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';

function SiteViewContent() {
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
                const { data, error } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('id', idx)
                    .single();

                if (error) throw error;
                setPost(data);
            } catch (e) {
                console.error("Failed to load site post:", e);
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
            boardCode="sites"
            initialPost={post}
        />
    );
}

export default function SiteViewPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SiteViewContent />
        </Suspense>
    );
}
