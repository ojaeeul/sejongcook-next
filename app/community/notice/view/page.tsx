'use client';

import BoardView, { Post } from "@/components/BoardView";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";


function NoticeDetailContent() {
    const searchParams = useSearchParams();
    const idx = searchParams.get('id');

    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            if (!idx) {
                setLoading(false);
                return;
            }

            try {
                const url = '/api/admin/data/notice?_t=' + Date.now();
                const res = await fetch(url);
                const data = await res.json();

                if (Array.isArray(data)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const found = data.find((item: any) => String(item.id || item.idx) === idx);

                    if (found) {
                        setPost({
                            id: found.id || found.idx,
                            title: found.title,
                            author: found.author || found.writer || '관리자',
                            date: found.date || found.created_at,
                            hit: String(found.hit || found.view_count || '0'),
                            content: found.content,
                            category: '공지'
                        });
                    } else {
                        setPost(null);
                    }
                }
            } catch (err) {
                console.error(err);
                setPost(null);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [idx]);

    if (loading) {
        return <div className="p-10 text-center">Loading...</div>;
    }

    if (!post) {
        return <div className="p-10 text-center">게시글을 찾을 수 없습니다.</div>;
    }

    return (
        <BoardView
            boardCode="notice"
            boardName="공지사항"
            initialPost={post}
        />
    );
}

export default function NoticeDetail() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NoticeDetailContent />
        </Suspense>
    );
}
