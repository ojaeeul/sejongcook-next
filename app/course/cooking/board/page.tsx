'use client';

import BoardList, { Post } from "@/components/BoardList";
import CookingSubNav from "@/components/CookingSubNav";
import { useEffect, useState, Suspense } from 'react';

export default function CookingBoardPage() {
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const url = '/api/admin/data/cooking?_t=' + Date.now();
                const res = await fetch(url);
                const data = await res.json();
                setPosts(data.reverse());
            } catch (e) {
                console.error("Failed to load cooking posts:", e);
            }
        };
        fetchPosts();
    }, []);

    return (
        <div className="modern-container" style={{ padding: '40px 0' }}>
            <div style={{ flexGrow: 1, minWidth: 1 }}>
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
                    showWriteButton={false}
                />
            </div>
        </div>
    );
}
