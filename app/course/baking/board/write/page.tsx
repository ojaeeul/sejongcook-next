'use client';

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import SuccessModal from "@/components/SuccessModal";
import BakingSubNav from "@/components/BakingSubNav";
import Editor from "@/components/Editor";

function WriteForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const idx = searchParams.get('idx');
    const isEdit = !!idx;

    const [subject, setSubject] = useState("");
    const [author, setAuthor] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("갤러리"); // Default category
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        if (isEdit) {
            // In a real app, fetch data by ID
            // For demo, we just populate dummy data or try to find in localStorage if implemented
            setSubject("수정할 게시물 제목 (데모)");
            setAuthor("작성자");
            setContent("<p>이전에 작성된 내용입니다.</p>");
        }
    }, [isEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            setShowSuccessModal(true);
        }, 1000);
    };

    const handleConfirmSuccess = () => {
        // In real app, redirect to the new post or list
        window.location.href = "/course/baking/board";
    };

    return (
        <div className="container_2" style={{ flexGrow: 1 }}>
            <div className="sub_title_381227_">
                <h1>제과제빵 게시판 <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#666' }}>- {isEdit ? "글수정" : "글쓰기"}</span></h1>
            </div>

            <BakingSubNav />

            <div style={{ marginBottom: '20px' }}>
                <span className="solid_line_381231_" style={{ display: 'block', width: '100%', height: '2px', background: '#000' }}></span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 font-sans">
                {/* Category Selection */}
                <div className="flex gap-4 items-center">
                    <label className="w-20 font-bold text-gray-700">분류</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 focus:border-amber-500 outline-none"
                    >
                        <option value="공지">공지</option>
                        <option value="갤러리">갤러리</option>
                        <option value="뉴스">뉴스</option>
                    </select>
                </div>

                {/* Subject */}
                <div className="flex gap-4 items-center">
                    <label className="w-20 font-bold text-gray-700">제목</label>
                    <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded px-3 py-2 focus:border-amber-500 outline-none"
                        placeholder="제목을 입력하세요"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                    />
                </div>

                {/* Author */}
                <div className="flex gap-4 items-center">
                    <label className="w-20 font-bold text-gray-700">작성자</label>
                    <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded px-3 py-2 focus:border-amber-500 outline-none"
                        placeholder="이름"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        required
                    />
                </div>

                {/* Editor */}
                <div className="mt-4">
                    <Editor key={content ? 'loaded' : 'empty'} onChange={setContent} content={content} />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
                    <Link href="/course/baking/board" className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700">
                        취소
                    </Link>
                    <button type="submit" className="px-6 py-2 bg-amber-500 text-white font-bold rounded hover:bg-amber-600 shadow">
                        {isEdit ? "수정하기" : "저장하기"}
                    </button>
                </div>
            </form>

            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleConfirmSuccess}
                title={isEdit ? "수정이 완료되었습니다" : "저장이 완료되었습니다"}
                message={`게시물이 성공적으로 ${isEdit ? "수정" : "등록"}되었습니다. (데모)`}
            />
        </div>
    );
}

export default function BakingBoardWritePage() {
    return (
        <div className="modern-container" style={{ padding: '40px 0' }}>
            <Suspense fallback={<div>Loading...</div>}>
                <WriteForm />
            </Suspense>
        </div>
    );
}
