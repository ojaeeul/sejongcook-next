'use client';

import BakingSubNav from "@/components/BakingSubNav";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, Suspense } from 'react';

interface Post {
    id: string | number;
    category: string;
    title: string;
    author: string;
    date: string;
    hit: string | number;
    content?: string;
}

function extractImage(content?: string): string | null {
    if (!content) return null;
    // Improved regex to handle various image tag structures and single/double quotes
    const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    return match ? match[1] : null;
}

export default function BakingGalleryPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // In production, use api.php to get the latest data. In dev, use the JSON directly.
                const url = '/api/admin/data/baking?t=' + Date.now();

                const res = await fetch(url);
                if (!res.ok) throw new Error('Failed to fetch baking posts');
                const data = await res.json();

                if (Array.isArray(data)) {
                    // Filter for gallery category or show all? 
                    // Let's keep all but sort by ID descending (newest first)
                    const sorted = [...data].sort((a, b) => Number(b.id) - Number(a.id));
                    setPosts(sorted);
                }
            } catch (e) {
                console.error("Failed to load baking posts:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    return (
        <div className="modern-container" style={{ padding: '40px 0' }}>
            <div style={{ flexGrow: 1, minWidth: 0 }}>
                <div className="mb-6 flex justify-between items-end">
                    <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-[#3e2723] pb-2 inline-block">제과제빵 갤러리</h2>
                </div>

                <Suspense fallback={null}>
                    <BakingSubNav />
                </Suspense>

                <p className="text-gray-500 mb-6 text-sm italic">학생들의 정성과 열정이 담긴 작품들을 감상해보세요.</p>

                {/* Gallery Grid */}
                {loading ? (
                    <div className="py-20 text-center text-gray-500 bg-gray-50 rounded-lg animate-pulse">
                        갤러리 게시물을 불러오는 중입니다...
                    </div>
                ) : posts.length === 0 ? (
                    <div className="py-20 text-center text-gray-500 bg-gray-50 rounded-lg">
                        등록된 갤러리 게시물이 없습니다.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {posts.map((post) => {
                            const imgSrc = extractImage(post.content);
                            return (
                                <Link href={`/course/baking/board/view?id=${post.id}`} key={post.id} className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                                        {imgSrc ? (
                                            <Image
                                                src={imgSrc}
                                                alt={post.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                        {post.category && (
                                            <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                                {post.category}
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg text-gray-800 mb-1 truncate group-hover:text-[#3e2723] transition-colors">{post.title}</h3>
                                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                                            <span>{post.author}</span>
                                            <span>{post.date}</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
