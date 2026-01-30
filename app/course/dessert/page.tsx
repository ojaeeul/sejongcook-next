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

async function getDessertPosts() {
    const filePath = path.join(process.cwd(), 'data', 'dessert_posts.json');
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        const data: Post[] = JSON.parse(fileContents);
        return data.reverse();
    } catch (e) {
        console.error("Failed to load dessert posts:", e);
        return [];
    }
}

export default async function DessertBoardPage() {
    const posts = await getDessertPosts();

    return (
        <div className="modern-container" style={{ padding: '40px 0' }}>
            <div style={{ flexGrow: 1, minWidth: 0 }}>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-[#3e2723] pb-2 inline-block">디저트 소식 & 레시피</h2>
                </div>

                <Suspense fallback={null}>
                    <BakingSubNav />
                </Suspense>

                <p className="text-gray-500 mb-6 text-sm italic">달콤한 디저트의 세계! 최신 트렌드 디저트와 레시피 정보를 확인하세요.</p>

                <BoardList
                    boardCode="course/dessert"
                    boardName="디저트 게시판"
                    posts={posts}
                    basePath=""
                />
            </div>
        </div>
    );
}
