'use client';

import ActionButtons from "@/components/ActionButtons";
import BakingSubNav from "@/components/BakingSubNav";
import Link from 'next/link';
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import AlertModal from "@/components/AlertModal";

interface Post {
    id: string;
    category: string;
    title: string;
    author: string;
    date: string;
    hit: string;
    content?: string;
}

function BakingPostDetailContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);

    // Alert Modal State
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '알림',
        message: '',
        type: 'warning' as 'success' | 'warning' | 'error' | 'info'
    });

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) {
                setLoading(false);
                return;
            }
            try {
                const url = process.env.NODE_ENV === 'production'
                    ? '/api.php?board=baking'
                    : '/data/baking_posts.json?t=' + Date.now();
                const res = await fetch(url);
                if (res.ok) {
                    const data: Post[] = await res.json();
                    const found = data.find(p => String(p.id) === String(id));
                    if (found) setPost(found);
                }
            } catch (e) {
                console.error("Failed to load baking post:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    const handleDelete = () => {
        setAlertConfig({
            title: '삭제 불가',
            message: "기본 게시물은 삭제할 수 없습니다.\n(데이터 보호됨)",
            type: 'warning'
        });
        setShowAlert(true);
    };

    if (loading) return <div className="p-20 text-center">Loading...</div>;
    if (!post) return <div className="p-20 text-center">Post not found</div>;

    return (
        <div className="modern-container" style={{ padding: '40px 0' }}>
            <div style={{ flexGrow: 1, minWidth: 0 }}>
                {/* Header Section */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-[#3e2723] pb-2 inline-block">수업뉴스</h2>
                </div>

                <BakingSubNav />

                <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden mt-6">
                    {/* Post Header */}
                    <div className="p-6 md:p-10 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-[#3e2723] text-white text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                {post.category || '공지'}
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
                        ` }} />
                        <div
                            className="prose max-w-none text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: post.content || '' }}
                        />
                    </div>

                    {/* Footer Nav / Buttons */}
                    <div className="px-6 md:px-10 pb-10">
                        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                            <Link
                                href="/course/baking/gallery"
                                className="inline-flex items-center px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                갤러리
                            </Link>

                            <ActionButtons
                                listLink="/course/baking/board"
                                editLink={`/admin/baking-board/edit?id=${post.id}`}
                                onDelete={handleDelete}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <AlertModal
                isOpen={showAlert}
                onClose={() => setShowAlert(false)}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
            />
        </div>
    );
}

export default function BakingPostDetailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BakingPostDetailContent />
        </Suspense>
    );
}
