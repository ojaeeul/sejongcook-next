'use client';

import Link from "next/link";
import { useState, useEffect } from 'react';
import ShinyLaurelBanner from "@/components/ShinyLaurelBanner";
import initialHonorData from '../../../public/data/honor_data.json';

interface Post {
    id: string;
    title: string;
    author: string;
    date: string;
    hit: string | number;
    content?: string;
    thumbnail?: string;
    category?: string;
    name?: string;
    stars?: number;
}

export default function HonorPage() {
    const [posts, setPosts] = useState<Post[]>(initialHonorData as any[]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHonorData = async () => {
            try {
                const url = process.env.NODE_ENV === 'production' ? '/api.php?board=honor' : '/data/honor_data.json';
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setPosts(data as any[]);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch honor data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHonorData();
    }, []);

    return (
        <div className="w-full px-4 md:px-0">
            {/* Header Area */}
            <div className="flex justify-between items-end mb-6 border-b-2 border-black pb-2">
                <div>
                    <h1 className="text-3xl font-bold text-black">명예의 전당</h1>
                </div>
            </div>

            <p className="text-gray-500 mb-8 text-sm italic">세종요리제과기술학원을 빛낸 영광의 얼굴들입니다.</p>

            {/* Gallery Grid */}
            {posts.length === 0 ? (
                <div className="py-20 text-center text-gray-500 bg-gray-50 rounded-lg">
                    등록된 게시물이 없습니다.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <Link href={`/community/honor/view?id=${post.id}`} key={post.id} className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-[4/3] bg-black relative overflow-hidden flex items-center justify-center">
                                <div className="w-full h-full flex items-center justify-center bg-black">
                                    <ShinyLaurelBanner
                                        stars={post.stars}
                                        name={post.name}
                                    />
                                </div>
                                {post.category && (
                                    <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                        {post.category}
                                    </span>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-2 min-h-[3.5rem] group-hover:text-blue-600 transition-colors">{post.title}</h3>
                                <div className="flex justify-between text-xs text-gray-500 mt-2">
                                    <span>{post.author}</span>
                                    <span>{post.date}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
