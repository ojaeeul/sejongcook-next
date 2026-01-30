import BakingSubNav from "@/components/BakingSubNav";
import Link from "next/link";
import { promises as fs } from 'fs';
import path from 'path';
import { Suspense } from 'react';

interface Post {
    id: string;
    category: string;
    title: string;
    author: string;
    date: string;
    hit: string;
    content?: string;
}

async function getBakingPosts() {
    const filePath = path.join(process.cwd(), 'data', 'baking_posts.json');
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        const data: Post[] = JSON.parse(fileContents);
        // Assuming we want to show all posts, or maybe filter by category '갤러리'?
        // The user request was just "Baking Gallery", and usually Gallery shows images.
        // Let's filter for posts that likely have images or just show all for now with a placeholder if no image.
        // For better UX, let's show all and try to extract an image.
        return data.reverse();
    } catch (e) {
        console.error("Failed to load baking posts:", e);
        return [];
    }
}

function extractImage(content?: string): string | null {
    if (!content) return null;
    const match = content.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : null;
}

export default async function BakingGalleryPage() {
    const posts = await getBakingPosts();

    return (
        <div className="modern-container" style={{ padding: '40px 0' }}>
            <div style={{ flexGrow: 1, minWidth: 0 }}>
                <div className="mb-6 flex justify-between items-end">
                    <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-[#3e2723] pb-2 inline-block">제과제빵 갤러리</h2>
                    <Link href="/course/baking/board/write" className="bg-[#3e2723] text-white px-4 py-2 rounded text-sm font-bold hover:bg-[#5d4037] transition-colors">
                        글쓰기
                    </Link>
                </div>

                <Suspense fallback={null}>
                    <BakingSubNav />
                </Suspense>

                <p className="text-gray-500 mb-6 text-sm italic">학생들의 정성과 열정이 담긴 작품들을 감상해보세요.</p>

                {/* Gallery Grid */}
                {posts.length === 0 ? (
                    <div className="py-20 text-center text-gray-500 bg-gray-50 rounded-lg">
                        등록된 갤러리 게시물이 없습니다.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {posts.map((post) => {
                            const imgSrc = extractImage(post.content);
                            return (
                                <Link href={`/course/baking/board/${post.id}`} key={post.id} className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                                        {imgSrc ? (
                                            <img
                                                src={imgSrc}
                                                alt={post.title}
                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
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
