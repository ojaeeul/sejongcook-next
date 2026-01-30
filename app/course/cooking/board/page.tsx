import BoardList from "@/components/BoardList";
import CookingSubNav from "@/components/CookingSubNav";
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

async function getCookingPosts() {
    const filePath = path.join(process.cwd(), 'data', 'cooking_posts.json');
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        const data: Post[] = JSON.parse(fileContents);
        return data.reverse(); // Newest first
    } catch (e) {
        console.error("Failed to load cooking posts:", e);
        return [];
    }
}

export default async function CookingBoardPage() {
    const posts = await getCookingPosts();

    return (
        <div className="modern-container" style={{ padding: '40px 0' }}>
            <div style={{ flexGrow: 1, minWidth: 0 }}>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-[#3e2723] pb-2 inline-block">조리교육 소식 & 갤러리</h2>
                </div>

                <Suspense fallback={null}>
                    <CookingSubNav />
                </Suspense>

                <p className="text-gray-500 mb-6 text-sm italic">세종요리학원 조리 과정의 생생한 수업 현장과 최신 공지사항을 확인하세요.</p>

                <BoardList
                    boardCode="course/cooking/board"
                    boardName="조리 게시판"
                    posts={posts}
                    basePath=""
                />
            </div>
        </div>
    );
}
