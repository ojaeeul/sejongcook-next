'use client';

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SuccessModal from "@/components/SuccessModal";

import Editor from "@/components/Editor";

function WriteForm() {
    const searchParams = useSearchParams();
    const idx = searchParams.get('idx');
    const isEdit = !!idx;

    const [subject, setSubject] = useState("");
    const [author, setAuthor] = useState("");
    const [content, setContent] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        if (isEdit) {
            // Simulate Fetching Data for Edit
            // In real app: fetch(`/api/index.php?mode=view&idx=${idx}`)
            // Using mock data matching BoardView for demo
            setSubject("2024년도 1기 브런치반 모집");
            setAuthor("관리자");
            // Mock Content from BoardView
            setContent(`
                <div style="text-align:center; padding: 20px;">
                    <p>안녕하세요, 세종요리제과기술학원입니다.</p>
                    <p>2024년도 1기 브런치반을 모집합니다.</p>
                    <br/>
                    <p><strong>[교육내용]</strong></p>
                    <p>- 에그베네딕트</p>
                    <p>- 프렌치토스트</p>
                    <p>- 파니니</p>
                    <br/>
                    <p>문의사항은 학원으로 연락주세요.</p>
                </div>
        `);
        }
    }, [isEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate processing time for better UX
        setTimeout(() => {
            setShowSuccessModal(true);
        }, 500);
    };

    const handleConfirmSuccess = () => {
        // In a real app, you would await the save API call here
        window.location.href = "/community/notice";
    };

    return (
        <div className="container_2" style={{ flexGrow: 1 }}>
            <div className="sub_title_381227_">
                <h1>공지사항 <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#666' }}>- {isEdit ? "글수정" : "글쓰기"}</span></h1>
            </div>
            <div style={{ marginBottom: '20px' }}>
                <span className="solid_line_381231_"></span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    {/* Key forces re-render when content is loaded, simple fix for SunEditor taking initial value */}
                    <Editor key={content ? 'loaded' : 'empty'} onChange={setContent} content={content} />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
                    <Link href="/community/notice" className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700">
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
                message={`작성하신 글이 성공적으로 ${isEdit ? "수정" : "등록"}되었습니다.`}
            />
        </div>
    );
}

export default function NoticeWritePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <WriteForm />
        </Suspense>
    );
}
