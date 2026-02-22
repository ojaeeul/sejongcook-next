'use client';

import BoardList, { Post } from "@/components/BoardList";
import { useEffect, useState } from "react";

export default function ReviewPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const url = '/api/admin/data/review?_t=' + Date.now();
                const res = await fetch(url);
                const data = await res.json();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mappedPosts: Post[] = data.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    author: item.author || '학생',
                    date: item.date,
                    hit: item.hit || 0,
                    content: item.content
                }));
                // Sort by date DESCENDING
                mappedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setPosts(mappedPosts);
            } catch (err) {
                console.error('Error fetching reviews:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <BoardList
            boardCode="review"
            boardName="수강후기"
            posts={posts}
            showWriteButton={false}
        />
    );
}
