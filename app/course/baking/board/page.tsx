import BoardList from "@/components/BoardList";
import BakingSubNav from "@/components/BakingSubNav";
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
        return data.reverse(); // Newest first
    } catch (e) {
        console.error("Failed to load baking posts:", e);
        return [];
    }
}

export default async function BakingBoardPage() {
    const posts = await getBakingPosts();

    return (
        <div className="modern-container" style={{ padding: '40px 0' }}>
            <div style={{ flexGrow: 1, minWidth: 0 }}>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-[#3e2723] pb-2 inline-block">제과제빵과정 소식 & 갤러리</h2>
                </div>

                <Suspense fallback={null}>
                    <BakingSubNav />
                </Suspense>

                <p className="text-gray-500 mb-6 text-sm italic">세종요리학원 제과제빵 과정의 생생한 수업 현장과 최신 공지사항을 확인하세요.</p>

                <BoardList
                    boardCode="course/baking/board"
                    boardName="제과제빵 게시판"
                    posts={posts}
                    basePath=""
                />
            </div>
        </div>
    );
}
