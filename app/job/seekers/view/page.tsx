'use client';

import JobSidebar from "@/components/JobSidebar";
import BoardView from "@/components/BoardView";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

interface Post {
    id: string;
    title: string;
    author: string;
    date: string;
    hit: string;
    content?: string;
}

function JobSeekerViewContent() {
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
                const res = await fetch('/data/job_seekers_data.json');
                if (res.ok) {
                    const data = await res.json();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const found = data.find((item: any) => String(item.id || item.idx) === id);

                    if (found) {
                        setPost({
                            id: found.id || found.idx,
                            title: found.title,
                            author: found.author || '구직자',
                            date: found.date || found.created_at,
                            hit: String(found.hits || found.hit || found.view_count || 0),
                            content: found.content,
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to fetch seeker', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    if (loading) return <div className="p-20 text-center">Loading...</div>;
    if (!post) return <div className="p-20 text-center">Post not found</div>;

    return (
        <div className="modern-container" style={{ padding: '40px 0' }}>
            <div className="flex flex-col lg:flex-row gap-10">
                <div className="w-full md:w-[250px] flex-shrink-0">
                    <JobSidebar />
                </div>

                <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div className="sub_title_381227_" style={{ marginBottom: '20px' }}>
                        <h1 className="text-2xl font-bold">구직정보 (인재정보)</h1>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <span className="solid_line_381231_" style={{ display: 'block', width: '100%', height: '2px', background: '#000' }}></span>
                    </div>

                    <BoardView
                        boardCode="seekers"
                        initialPost={post}
                        basePath="/job"
                    />
                </div>
            </div>
        </div>
    );
}

export default function JobSeekerViewPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <JobSeekerViewContent />
        </Suspense>
    );
}
