'use client';

import BoardList, { Post } from "@/components/BoardList";
import { useEffect, useState } from "react";

export default function QnaPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const url = '/api/admin/data/qna?_t=' + Date.now();
                const res = await fetch(url);
                const data = await res.json();

                if (Array.isArray(data)) {
                    const mapped: Post[] = data.map((item: { id?: string | number, idx?: string | number, title: string, author?: string, writer?: string, date?: string, created_at?: string, hit?: string | number, view_count?: string | number, content?: string }) => ({
                        id: item.id || item.idx || 0,
                        title: item.title,
                        author: item.author || item.writer || '게스트',
                        date: item.date || item.created_at || '',
                        hit: item.hit || item.view_count || '0',
                        content: item.content
                    }));
                    // Sort by date DESCENDING
                    mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    setPosts(mapped);
                }
            } catch (err) {
                console.error('Unexpected error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) {
        return <div className="p-10 text-center">Loading...</div>;
    }

    return (
        <BoardList
            boardCode="qna"
            boardName="질문게시판"
            posts={posts}
            showWriteButton={true}
        />
    );
}
