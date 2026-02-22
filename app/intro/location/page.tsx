'use client';

import IntroSidebar from "@/components/IntroSidebar";
import ActionButtons from "@/components/ActionButtons";
import Editor from "@/components/Editor";
import SuccessModal from "@/components/SuccessModal";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

function LocationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const isEdit = searchParams.get('mode') === 'edit';

    // Initial content state
    const [content, setContent] = useState(`
        <div style="font-family: sans-serif;">
             <div style="margin-bottom: 30px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; height: 450px; background-color: #f3f4f6; display: flex; align-items: center; justify-content: center;">
                 <!-- Google Map Embed -->
                 <iframe 
                    src="https://maps.google.com/maps?q=경기도+김포시+김포대로+841&output=embed"
                    width="100%" 
                    height="100%" 
                    style="border: 0;" 
                    allowFullScreen="" 
                    loading="lazy"
                 ></iframe>
             </div>
             
             <h3 style="font-size: 1.25rem; font-weight: bold; color: #1f2937; border-bottom: 2px solid #1f2937; padding-bottom: 8px; margin-bottom: 16px;">📍 Location Information</h3>
             
             <div style="display: flex; flex-direction: column; gap: 16px;">
                <div style="background-color: #f9fafb; padding: 24px; border-radius: 8px;">
                    <strong style="color: #ea580c; font-size: 1.125rem; display: block; margin-bottom: 8px;">🏢 주소</strong>
                    <p style="color: #1f2937; font-size: 1.125rem; margin: 0; font-weight: bold;">경기도 김포시 김포대로 841, 6층 (사우동, 제우스프라자)</p>
                    <p style="color: #1f2937; font-size: 1.125rem; margin-top: 4px;">세종요리제과기술요리학원</p>
                    <span style="color: #6b7280; font-size: 0.875rem; display: block; margin-top: 8px;">(사우역 3번 출구 도보 1분)</span>
                </div>

                <div style="background-color: #f9fafb; padding: 24px; border-radius: 8px;">
                    <strong style="color: #ea580c; font-size: 1.125rem; display: block; margin-bottom: 8px;">📞 문의전화</strong>
                    <p style="color: #1f2937; font-size: 1.25rem; font-weight: bold; margin: 0;">031-986-1933, 1966</p>
                    <p style="color: #6b7280; font-size: 0.9rem; margin-top: 4px;">궁금하신 점이 있으시면 언제든지 문의주세요.</p>
                </div>
             </div>
        </div>
    `);

    // Load content on mount
    useEffect(() => {
        fetch('/api/admin/data/intro')
            .then(res => res.json())
            .then(data => {
                if (data.location) {
                    setContent(data.location);
                }
            })
            .catch(err => console.error('Failed to load location content:', err));
    }, []);

    const handleSave = async () => {
        if (confirm("저장하시겠습니까?")) {
            try {
                const res = await fetch('/api/admin/data/intro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        pageKey: 'location',
                        content: content
                    })
                });

                if (res.ok) {
                    setShowSuccessModal(true);
                } else {
                    alert("저장에 실패했습니다.");
                }
            } catch (err) {
                console.error(err);
                alert("저장 중 오류가 발생했습니다.");
            }
        }
    };

    const handleConfirmSuccess = () => {
        setShowSuccessModal(false);
        router.push('/intro/location');
    };

    // State for Success Modal
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    return (
        <div className="container_2" style={{ flexGrow: 1 }}>
            <div className="sub_title_381227_">
                <h1 className="text-2xl font-bold mb-4">오시는 길 {isEdit && <span className="text-sm text-red-500 font-normal ml-2">- 수정 모드</span>}</h1>
            </div>
            <div style={{ marginBottom: '20px' }}>
                <span className="solid_line_381231_"></span>
            </div>

            {/* Content Area */}
            <div className="font-sans">
                {isEdit ? (
                    <div className="editor-wrapper min-h-[400px]">
                        <Editor content={content} onChange={setContent} />
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">저장하기</button>
                            <button onClick={() => router.push('/intro/location')} className="bg-gray-500 text-white px-6 py-2 rounded font-bold hover:bg-gray-600">취소</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div dangerouslySetInnerHTML={{ __html: content }} />

                        {/* Action Buttons */}
                        <ActionButtons
                            listLink="/intro"
                            editLink="/intro/location?mode=edit"
                            onDelete={() => alert('기본 페이지는 삭제할 수 없습니다.')}
                        />
                    </>
                )}
            </div>

            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleConfirmSuccess}
                title="저장이 완료되었습니다"
                message="위치 정보가 성공적으로 수정되었습니다."
            />
        </div>
    );
}

export default function LocationPage() {
    return (
        <div className="modern-container" style={{ padding: '40px 0' }}>
            <div className="layout_381226_ grid_left flex flex-col lg:flex-row gap-10">
                {/* Sidebar */}
                <div className="w-full lg:w-[250px] flex-shrink-0">
                    <IntroSidebar />
                </div>

                <Suspense fallback={<div>Loading content...</div>}>
                    <LocationContent />
                </Suspense>
            </div>
        </div>
    );
}
