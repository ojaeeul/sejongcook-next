'use client';

import BoardList, { Post } from "@/components/BoardList";
import { useEffect, useState } from "react";

export default function QnaPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch('/data/qna_data.json');
                const data = await res.json();

                if (Array.isArray(data)) {
                    const mapped: Post[] = data.map((item: any) => ({
                        id: item.id || item.idx,
                        title: item.title,
                        author: item.author || item.writer || '게스트',
                        date: item.date || item.created_at,
                        hit: item.hit || item.view_count || '0',
                        content: item.content
                    }));
                    setPosts(mapped.reverse());
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
