'use client';

import BoardList, { Post } from "@/components/BoardList";
import JobSidebar from "@/components/JobSidebar";
import { useEffect, useState } from "react";


export default function JobOpeningsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const url = process.env.NODE_ENV === 'production' ? '/api.php?board=job-openings' : '/data/job_openings_data.json';
                const res = await fetch(url);
                const data = await res.json();

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mappedPosts: Post[] = data.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    author: item.author || '관리자',
                    date: item.date,
                    hit: item.hits || item.hit || 0,
                    content: item.content
                }));
                // Sort by date DESCENDING (Newest -> Oldest)
                mappedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setPosts(mappedPosts);

            } catch (err) {
                console.error('Error fetching openings:', err);
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
        <div className="modern-container py-10">
            <div className="flex flex-col xl:flex-row gap-10">
                {/* Sidebar */}
                <div className="w-full xl:w-[250px] flex-shrink-0">
                    <JobSidebar />
                </div>
                <div className="flex-grow">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 min-h-[600px]">
                        <BoardList
                            boardCode="openings"
                            boardName="구인정보"
                            posts={posts}
                            basePath="/job"
                            showWriteButton={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
