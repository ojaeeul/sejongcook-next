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

async function getCakePosts() {
    const filePath = path.join(process.cwd(), 'data', 'cake_posts.json');
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        const data: Post[] = JSON.parse(fileContents);
        return data.reverse(); // Newest first
    } catch (e) {
        console.error("Failed to load cake posts:", e);
        return [];
    }
}

export default async function CakeBoardPage() {
    const posts = await getCakePosts();

    return (
        <div className="modern-container" style={{ padding: '40px 0' }}>
            <div style={{ flexGrow: 1, minWidth: 0 }}>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-[#3e2723] pb-2 inline-block">케익디자인 소식 & 갤러리</h2>
                </div>

                <Suspense fallback={null}>
                    <BakingSubNav />
                </Suspense>

                <p className="text-gray-500 mb-6 text-sm italic">나만의 특별한 케이크를 디자인하는 세종요리학원 케익디자인 과정의 수업 현장입니다.</p>

                <BoardList
                    boardCode="course/cake/board"
                    boardName="케익 게시판"
                    posts={posts}
                    basePath=""
                />
            </div>
        </div>
    );
}
