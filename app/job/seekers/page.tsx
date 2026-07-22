'use client';

import BoardList, { Post } from "@/components/BoardList";
import JobSidebar from "@/components/JobSidebar";
import { useEffect, useState } from "react";

export default function JobSeekersPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const url = '/api/admin/data/job-seekers?_t=' + Date.now();
                const res = await fetch(url);
                const data = await res.json();

                if (Array.isArray(data)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const mapped: Post[] = data.map((item: any) => ({
                        id: item.id || item.idx,
                        title: item.title,
                        author: item.author || '구직자',
                        date: item.date || item.created_at, // Use existing date string if present
                        hit: item.hits || item.hit || item.view_count || 0,
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
        <div className="flex flex-col md:flex-row max-w-6xl mx-auto py-10 gap-10">
            <div className="w-full xl:w-[250px] flex-shrink-0">
                <JobSidebar />
            </div>
            <div className="flex-1">
                <BoardList
                    boardCode="seekers"
                    boardName="구직정보"
                    posts={posts}
                    basePath="/job"
                    showWriteButton={true}
                />
            </div>
        </div>
    );
}
