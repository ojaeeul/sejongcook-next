'use client';

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SuccessModal from "@/components/SuccessModal";
import JobSidebar from "@/components/JobSidebar";
import Editor from "@/components/Editor";
import { supabase } from "@/lib/supabase";



function WriteForm() {
    const searchParams = useSearchParams();
    const idx = searchParams.get('idx');
    const isEdit = !!idx;

    const [subject, setSubject] = useState("");
    const [author, setAuthor] = useState("");
    const [content, setContent] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            if (isEdit && idx) {
                const { data, error } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('id', idx)
                    .single();

                if (data) {
                    setSubject(data.title);
                    setAuthor(data.author || "");
                    setContent(data.content || "");
                } else if (error) {
                    console.error("Error loading post:", error);
                }
            } else {
                setAuthor("구직자");
                if (isEdit) { // Just in case logic flow needs initial setup
                    setSubject("구직 희망합니다 (수정)");
                    setContent(`
                        <p>희망 근무 조건:</p>
                        <p>보유 자격증:</p>
                        <p>경력 사항:</p>
                    `);
                }
            }
        };
        load();
    }, [isEdit, idx]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const postData = {
                board_type: 'seekers',
                title: subject,
                author: author,
                content: content,
                updated_at: new Date().toISOString()
            };

            let error;

            if (isEdit && idx) {
                const { error: updateError } = await supabase
                    .from('posts')
                    .update(postData)
                    .eq('id', idx);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('posts')
                    .insert(postData);
                error = insertError;
            }

            if (error) throw error;

            setShowSuccessModal(true);
        } catch (error) {
            console.error(error);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmSuccess = () => {
        window.location.href = "/job/seekers";
    };

    return (
        <div className="container_2" style={{ flexGrow: 1 }}>
            <div className="sub_title_381227_">
                <h1>구직정보 <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#666' }}>- {isEdit ? "글수정" : "글쓰기"}</span></h1>
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
                    <Link href="/job/seekers" className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700">
                        취소
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-amber-500 text-white font-bold rounded hover:bg-amber-600 shadow disabled:opacity-50"
                    >
                        {loading ? "저장 중..." : (isEdit ? "수정하기" : "저장하기")}
                    </button>
                </div>
            </form>

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleConfirmSuccess}
                title={isEdit ? "수정이 완료되었습니다" : "저장이 완료되었습니다"}
                message={`게시글이 성공적으로 ${isEdit ? "수정" : "등록"}되었습니다.`}
            />
        </div>
    );
}

export default function JobSeekersWritePage() {
    return (
        <div className="modern-container" style={{ padding: '40px 0' }}>
            <div className="layout_381226_ grid_left" style={{ display: 'flex', gap: '40px' }}>
                <div style={{ width: '250px', flexShrink: 0 }}>
                    <JobSidebar />
                </div>
                <Suspense fallback={<div>Loading...</div>}>
                    <WriteForm />
                </Suspense>
            </div>
        </div>
    );
}
