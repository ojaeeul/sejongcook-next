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
    const [posts, setPosts] = useState<Post[]>(initialHonorData as Post[]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    const [sortOption, setSortOption] = useState<'date' | 'stars'>('date');

    useEffect(() => {
        const fetchHonorData = async () => {
            try {
                const url = '/api/admin/data/honor?_t=' + Date.now();
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setPosts(data as Post[]);
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

    // Sorting Logic
    const sortedPosts = [...posts].sort((a, b) => {
        if (sortOption === 'stars') {
            // Sort by stars descending, then date descending
            if ((b.stars || 0) !== (a.stars || 0)) {
                return (b.stars || 0) - (a.stars || 0);
            }
        }
        // Default: Date descending
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // Pagination Logic
    const indexOfLastPost = currentPage * itemsPerPage;
    const indexOfFirstPost = indexOfLastPost - itemsPerPage;
    const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(sortedPosts.length / itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to first page
    };

    if (loading) {
        return <div className="p-10 text-center text-gray-400 font-sans italic">로딩 중...</div>;
    }

    return (
        <div className="w-full px-4 md:px-0">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-2 border-b-2 border-black pb-2 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-black">명예의 전당</h1>
                </div>
            </div>

            <p className="text-gray-500 mb-6 text-sm italic">세종요리제과기술학원을 빛낸 영광의 얼굴들입니다.</p>

            <div className="flex justify-end mb-6">
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    {/* Sorting Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSortOption('date')}
                            className={`px-3 py-1 rounded transition-colors ${sortOption === 'date' ? 'bg-black text-white font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            최신순
                        </button>
                        <button
                            onClick={() => setSortOption('stars')}
                            className={`px-3 py-1 rounded transition-colors ${sortOption === 'stars' ? 'bg-amber-500 text-white font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            별점순
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <span>게시물 보기:</span>
                        <select
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-amber-500"
                        >
                            <option value={20}>20개</option>
                            <option value={30}>30개</option>
                            <option value={50}>50개</option>
                            <option value={100}>100개</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Gallery Grid */}
            {posts.length === 0 ? (
                <div className="py-20 text-center text-gray-500 bg-gray-50 rounded-lg">
                    등록된 게시물이 없습니다.
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                        {currentPosts.map((post) => (
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

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-8 mb-12">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-700'}`}
                            >
                                이전
                            </button>
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => handlePageChange(i + 1)}
                                    className={`px-3 py-1 rounded border ${currentPage === i + 1 ? 'bg-amber-500 text-white border-amber-500' : 'bg-white hover:bg-gray-50 text-gray-700'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 rounded border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-700'}`}
                            >
                                다음
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
