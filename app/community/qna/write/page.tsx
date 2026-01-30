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
            setSubject("질문있습니다 (수정)");
            setAuthor("학생");
            setContent("<p>질문 내용...</p>");
        }
    }, [isEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate processing time
        setTimeout(() => {
            setShowSuccessModal(true);
        }, 500);
    };

    const handleConfirmSuccess = () => {
        window.location.href = "/community/qna";
    };

    return (
        <div className="container_2" style={{ flexGrow: 1 }}>
            <div className="sub_title_381227_">
                <h1>질문&답변 <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#666' }}>- {isEdit ? "글수정" : "글쓰기"}</span></h1>
            </div>
            <div style={{ marginBottom: '20px' }}>
                <span className="solid_line_381231_" style={{ display: 'block', width: '100%', height: '2px', background: '#000' }}></span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="mt-4">
                    <Editor key={content ? 'loaded' : 'empty'} onChange={setContent} content={content} />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
                    <Link href="/community/qna" className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700">취소</Link>
                    <button type="submit" className="px-6 py-2 bg-amber-500 text-white font-bold rounded hover:bg-amber-600 shadow">{isEdit ? "수정하기" : "저장하기"}</button>
                </div>
            </form>

            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleConfirmSuccess}
                title={isEdit ? "수정이 완료되었습니다" : "저장이 완료되었습니다"}
                message={`작성하신 문의가 성공적으로 ${isEdit ? "수정" : "등록"}되었습니다.`}
            />
        </div>
    );
}

export default function QnaWritePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <WriteForm />
        </Suspense>
    );
}
