'use client';

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Mock data type, eventually replaced by API data
export interface Post {
    id: string | number;
    category?: string;
    title: string;
    author: string;
    date: string;
    hit: string | number;
    content?: string;
}

export default function BoardList({ boardCode, boardName, posts, basePath = '/community' }: { boardCode: string, boardName: string, posts: Post[], basePath?: string }) {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Calculate pagination logic
    const totalPages = Math.ceil(posts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentPosts = posts.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to first page when changing limit
    };

    const handleRowClick = (postId: string | number) => {
        const url = `${basePath ? basePath : ''}/${boardCode}/${postId}`;
        router.push(url);
    };

    return (
        <div className="w-full px-4 md:px-0">


            {/* Header Area */}
            <div className="flex justify-between items-end mb-4 border-b-2 border-black pb-2">
                <div>
                    <h1 className="text-3xl font-bold text-black"><Link href={`${basePath}/${boardCode}`}>{boardName}</Link></h1>
                </div>
                {/* Search, Write, and Limit Selector */}
                <div className="flex gap-4 text-gray-400 items-center">
                    <select
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        className="text-sm border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 text-gray-600"
                    >
                        <option value={10}>10개씩</option>
                        <option value={15}>15개씩</option>
                        <option value={20}>20개씩</option>
                        <option value={30}>30개씩</option>
                        <option value={50}>50개씩</option>
                    </select>

                    <button className="hover:text-gray-600 transition-colors" title="검색">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                    <Link href={`${basePath}/${boardCode}/write`} className="hover:text-gray-600 transition-colors" title="글쓰기">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* Board Table */}
            <div className="w-full border-t border-gray-300">
                <table className="w-full text-center text-sm">
                    <thead>
                        <tr className="bg-[#f5f5f5] text-gray-700 font-bold border-b border-gray-300">
                            <th className="py-3 w-[80px] hidden md:table-cell">번호</th>
                            <th className="py-3 px-2">제목</th>
                            <th className="py-3 w-[100px] hidden md:table-cell">이름</th>
                            <th className="py-3 w-[120px] hidden md:table-cell">날짜</th>
                            <th className="py-3 w-[80px] hidden md:table-cell">조회수</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPosts.length === 0 ? (
                            <tr><td colSpan={5} className="py-10 text-gray-500">게시물이 없습니다.</td></tr>
                        ) : (
                            currentPosts.map((post, index) => (
                                <tr
                                    key={post.id}
                                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => handleRowClick(post.id)}
                                >
                                    <td className="py-4 hidden md:table-cell">
                                        <span className="text-gray-500">{posts.length - ((currentPage - 1) * itemsPerPage) - index}</span>
                                    </td>
                                    <td className="py-4 text-left pl-2 md:pl-4">
                                        <div className="block">
                                            <div className="flex items-center gap-2 mb-1">
                                                {post.category && (
                                                    <span className="bg-[#3e2723] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase leading-none">
                                                        {post.category}
                                                    </span>
                                                )}
                                                <span className="text-gray-700 font-medium text-[15px] block break-words">{post.title}</span>
                                            </div>
                                            {/* Mobile-only Meta Info */}
                                            <div className="md:hidden text-xs text-gray-400 mt-1 flex gap-2 flex-wrap">
                                                <span>{post.author}</span>
                                                <span>|</span>
                                                <span>{post.date}</span>
                                                <span>|</span>
                                                <span>조회 {post.hit}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 text-gray-500 hidden md:table-cell">{post.author}</td>
                                    <td className="py-4 text-gray-500 font-sans hidden md:table-cell">{post.date}</td>
                                    <td className="py-4 text-gray-500 font-sans hidden md:table-cell">{post.hit}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-10 gap-1 text-sm text-gray-500">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                        &lt;
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-8 h-8 flex items-center justify-center rounded ${currentPage === page
                                ? 'bg-gray-600 text-white font-bold'
                                : 'hover:bg-gray-100'
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                        &gt;
                    </button>
                </div>
            )}
        </div>
    );
}
