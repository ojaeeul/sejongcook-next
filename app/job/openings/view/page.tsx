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
    content: string;
}

function JobOpeningViewContent() {
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
                const url = '/api/admin/data/job-openings?_t=' + Date.now();
                const res = await fetch(url);
                if (res.ok) {
                    const data: Post[] = await res.json();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const found = data.find((p: any) => p.id === id);
                    if (found) {
                        setPost({
                            ...found,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            hit: String(found.hit || (found as any).hits || 0)
                        });
                    }
                }
            } catch (e) {
                console.error("Failed to load job opening:", e);
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
                <div className="w-full lg:w-[250px] flex-shrink-0">
                    <JobSidebar />
                </div>

                <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div className="sub_title_381227_" style={{ marginBottom: '20px' }}>
                        <h1 className="text-2xl font-bold">구인정보 (채용공고)</h1>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <span className="solid_line_381231_" style={{ display: 'block', width: '100%', height: '2px', background: '#000' }}></span>
                    </div>

                    <BoardView
                        boardCode="openings"
                        initialPost={post}
                        basePath="/job"
                    />
                </div>
            </div>
        </div>
    );
}

export default function JobOpeningViewPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <JobOpeningViewContent />
        </Suspense>
    );
}
