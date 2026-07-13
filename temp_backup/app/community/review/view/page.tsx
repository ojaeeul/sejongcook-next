
'use client';

import BoardView from "@/components/BoardView";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

interface Post {
    id: string;
    title: string;
    author: string;
    date: string;
    hit: string;
    content: string;
}

function ReviewViewContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) {
                setLoading(false);
                return;
            }
            try {
                const res = await fetch('/data/review_data.json');
                if (res.ok) {
                    const data: Post[] = await res.json();
                    const found = data.find(p => p.id === id);
                    if (found) {
                        setPost({
                            ...found,
                            hit: String(found.hit || 0)
                        });
                    }
                }
            } catch (e) {
                console.error("Failed to load review:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    if (loading) return <div className="p-20 text-center">Loading...</div>;
    if (!post) return <div className="p-20 text-center">Post not found</div>;

    return (
        <>
            <div className="sub_title_381227_" style={{ marginBottom: '20px' }}>
                <h1 className="text-2xl font-bold">수강후기</h1>
            </div>
            <div style={{ marginBottom: '20px' }}>
                <span className="solid_line_381231_" style={{ display: 'block', width: '100%', height: '2px', background: '#000' }}></span>
            </div>

            <BoardView
                boardCode="review"
                initialPost={post}
            />
        </>
    );
}

export default function ReviewViewPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ReviewViewContent />
        </Suspense>
    );
}
