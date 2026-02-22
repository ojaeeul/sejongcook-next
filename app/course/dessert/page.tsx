'use client';

import BoardList from "@/components/BoardList";
import BakingSubNav from "@/components/BakingSubNav";
import { Suspense, useEffect, useState } from 'react';

interface Post {
    id: string;
    category: string;
    title: string;
    author: string;
    date: string;
    hit: string;
    content?: string;
}

export default function DessertBoardPage() {
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const url = '/api/admin/data/dessert';
                const res = await fetch(url);
                if (res.ok) {
                    const data: Post[] = await res.json();
                    setPosts(data.reverse());
                }
            } catch (e) {
                console.error("Failed to load dessert posts:", e);
            }
        };
        fetchPosts();
    }, []);

    return (
        <div className="modern-container" style={{ padding: '40px 0' }}>
            <div style={{ flexGrow: 1, minWidth: 0 }}>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-[#3e2723] pb-2 inline-block">디저트</h2>
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
