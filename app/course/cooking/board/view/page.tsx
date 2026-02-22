'use client';

import Sidebar from "@/components/CourseSidebar";
import ActionButtons from "@/components/ActionButtons";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, Suspense } from "react";

interface Post {
    id: string;
    category: string;
    title: string;
    author: string;
    date: string;
    hit: string;
    content: string;
}

function CookingPostDetailContent() {
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
                const url = process.env.NODE_ENV === 'production'
                    ? '/api.php?board=cooking'
                    : '/data/cooking_posts.json?t=' + Date.now();
                const res = await fetch(url);
                if (res.ok) {
                    const data: Post[] = await res.json();
                    const found = data.find(p => String(p.id) === String(idx));
                    if (found) setPost(found);
                }
            } catch (e) {
                console.error("Failed to load post:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [idx]);

    if (loading) return <div className="p-20 text-center">Loading...</div>;
    if (!post) return <div className="p-20 text-center">Post not found</div>;

    return (
        <div className="modern-container" style={{ padding: '40px 0' }}>
            <div className="flex flex-col xl:flex-row gap-10">
                <div className="w-full xl:w-[250px] flex-shrink-0">
                    <Sidebar />
                </div>

                <div className="w-full bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden" style={{ flexGrow: 1 }}>
                    {/* Post Header */}
                    <div className="p-6 md:p-10 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-[#3e2723] text-white text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                {post.category}
                            </span>
                            <span className="text-gray-400 text-sm">|</span>
                            <span className="text-gray-500 text-sm">{post.date}</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                            {post.title}
                        </h1>
                        <div className="mt-6 flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-4">
                            <div className="flex items-center gap-4">
                                <span>작성자: <span className="text-gray-900 font-medium">{post.author}</span></span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span>조회수: <span className="text-gray-900 font-medium">{post.hit}</span></span>
                            </div>
                        </div>
                    </div>

                    {/* Post Content */}
                    <div className="p-6 md:p-10 min-h-[400px]">
                        <style dangerouslySetInnerHTML={{
                            __html: `
                            .info-box {
                                background: #f9fafb !important;
                                border: 1px solid #f3f4f6 !important;
                                border-radius: 12px !important;
                                padding: 1.5rem !important;
                                margin: 1.5rem 0 !important;
                            }
                            .info-box p {
                                margin: 0.5rem 0 !important;
                                color: #374151 !important;
                                font-size: 0.95rem !important;
                            }
                            .info-box strong {
                                color: #111827 !important;
                                display: inline-block !important;
                                width: 100px !important;
                            }
                            .menu-list {
                                background: #fffaf0 !important;
                                border: 1px solid #feebc8 !important;
                                border-radius: 12px !important;
                                padding: 1.5rem !important;
                                margin: 1.5rem 0 !important;
                            }
                            .menu-list ul {
                                list-style: disc !important;
                                padding-left: 1.5rem !important;
                                margin-top: 0.5rem !important;
                            }
                            .menu-list li {
                                color: #7b341e !important;
                                margin-bottom: 0.25rem !important;
                            }
                        ` }} />
                        <div
                            className="prose max-w-none text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    </div>

                    {/* Footer Nav / Buttons */}
                    <div className="px-6 md:px-10 pb-10">
                        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                            <Link
                                href="/course/cooking/board"
                                className="inline-flex items-center px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                목록으로
                            </Link>

                            <ActionButtons
                                listLink="/course/cooking/board"
                                editLink={`/admin/cooking/edit?id=${post.id}`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CookingPostDetailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CookingPostDetailContent />
        </Suspense>
    );
}
