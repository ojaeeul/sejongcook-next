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
    const [phone, setPhone] = useState("");
    const [content, setContent] = useState("");
    const [consent1, setConsent1] = useState(false);
    const [consent2, setConsent2] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadPost = async () => {
            if (isEdit && idx) {
                try {
                    const url = '/data/qna_data.json?_t=' + Date.now();
                    const res = await fetch(url);
                    const data = await res.json();

                    if (Array.isArray(data)) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const found = data.find((item: any) => String(item.id) === String(idx) || String(item.idx) === String(idx));
                        if (found) {
                            setSubject(found.title);
                            setAuthor(found.author || "");
                            setContent(found.content || "");
                        } else {
                            console.error("Post not found");
                        }
                    }
                } catch (error) {
                    console.error("Error loading post:", error);
                }
            } else {
                // Defaults for new post
                setAuthor("학생");
            }
        }
        loadPost();
    }, [isEdit, idx]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const isProd = process.env.NODE_ENV === 'production';
            const endpoint = '/api/admin/data/qna';
            const method = isEdit ? 'PUT' : 'POST';

            let finalContent = content;
            if (phone) {
                finalContent = `<p><strong>연락처:</strong> ${phone}</p><br/>` + content;
            }

            const postData = {
                id: isEdit ? idx : undefined,
                title: subject,
                author: author,
                content: finalContent,
                date: new Date().toISOString().split('T')[0],
                hit: "0",
                status: "대기중" // Default status for QnA
            };

            const res = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });

            if (!res.ok) {
                if (!isProd) {
                    console.warn("Local POST might fail due to static export. Treating as success for UI.");
                } else {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to save via API');
                }
            }

            setShowSuccessModal(true);
        } catch (error) {
            console.error(error);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
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
                    <label className="w-20 font-bold text-gray-700">이름(작성자)</label>
                    <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded px-3 py-2 focus:border-amber-500 outline-none"
                        placeholder="이름"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        required
                    />
                </div>
                <div className="flex gap-4 items-center">
                    <label className="w-20 font-bold text-gray-700">전화번호</label>
                    <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded px-3 py-2 focus:border-amber-500 outline-none"
                        placeholder="예: 010-1234-5678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                </div>
                <div className="mt-4">
                    <Editor key={content ? 'loaded' : 'empty'} onChange={setContent} content={content} />
                </div>
                
                {/* Consents */}
                <div className="mt-6 space-y-4">
                    <div className="border border-gray-300 rounded p-4 bg-gray-50">
                        <div className="text-sm text-gray-600 h-24 overflow-y-auto mb-2 border border-gray-200 bg-white p-2">
                            [개인정보 수집 및 이용 동의]<br/>
                            1. 수집 목적: 게시판 문의 확인 및 답변, 상담 진행<br/>
                            2. 수집 항목: 이름, 전화번호<br/>
                            3. 보유 기간: 목적 달성 시 즉시 파기 (단, 관계법령에 의해 보존할 필요가 있는 경우 해당 기간까지 보존)
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer w-fit">
                            <input type="checkbox" required checked={consent1} onChange={(e) => setConsent1(e.target.checked)} className="w-4 h-4 accent-amber-500" />
                            <span className="text-sm font-bold text-gray-700">개인정보 수집 및 이용에 동의합니다. (필수)</span>
                        </label>
                    </div>

                    <div className="border border-gray-300 rounded p-4 bg-gray-50">
                        <div className="text-sm text-gray-600 h-24 overflow-y-auto mb-2 border border-gray-200 bg-white p-2">
                            [개인정보 제3자 제공 동의]<br/>
                            1. 제공받는 자: 세종요리제과기술학원<br/>
                            2. 제공 목적: 문의 사항에 대한 전문적인 상담 및 안내<br/>
                            3. 제공 항목: 이름, 전화번호<br/>
                            4. 보유 기간: 목적 달성 시 즉시 파기
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer w-fit">
                            <input type="checkbox" required checked={consent2} onChange={(e) => setConsent2(e.target.checked)} className="w-4 h-4 accent-amber-500" />
                            <span className="text-sm font-bold text-gray-700">개인정보 제3자 제공에 동의합니다. (필수)</span>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
                    <Link href="/community/qna" className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700">취소</Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-amber-500 text-white font-bold rounded hover:bg-amber-600 shadow disabled:opacity-50"
                    >
                        {loading ? "저장 중..." : (isEdit ? "수정하기" : "저장하기")}
                    </button>
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
