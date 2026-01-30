'use client';

import CourseSidebar from "@/components/CourseSidebar";
import ActionButtons from "@/components/ActionButtons";
import Editor from "@/components/Editor";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import SuccessModal from "@/components/SuccessModal";

function HobbyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const isEdit = searchParams.get('mode') === 'edit';

    // Initial content state (from sub0203.html)
    const [content, setContent] = useState(`
        <div style="text-align:center; padding:20px 0;">
             <img src="/img_up/shop_pds/sejongcook/farm/ready0115839945951.jpg" style="max-width:100%; border:1px solid #eee;" alt="홈베이커리반 정보">
        </div>
        <div style="font-family:'Noto Sans KR', sans-serif; line-height:1.6; padding:20px;">
            <p><strong>홈베이커리(취미)반</strong>은 가정에서 손쉽게 즐길 수 있는 제과제빵 과정을 배울 수 있습니다.</p>
        </div>
    `);

    const handleSave = () => {
        // alert("저장되었습니다. (데모)");
        setShowSuccessModal(true);
    };

    const handleConfirmSuccess = () => {
        setShowSuccessModal(false);
        router.push('/course/hobby');
    };

    const [showSuccessModal, setShowSuccessModal] = useState(false);

    return (
        <div className="container_2" style={{ flexGrow: 1 }}>
            <div className="sub_title_381227_">
                <h1 className="text-2xl font-bold mb-4">홈베이커리(취미)반 {isEdit && <span className="text-sm text-red-500 font-normal ml-2">- 수정 모드</span>}</h1>
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
                            <button onClick={() => router.push('/course/hobby')} className="bg-gray-500 text-white px-6 py-2 rounded font-bold hover:bg-gray-600">취소</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div dangerouslySetInnerHTML={{ __html: content }} />

                        {/* Action Buttons */}
                        <ActionButtons
                            listLink="/course"
                            editLink="/course/hobby?mode=edit"
                            onDelete={() => alert('기본 페이지는 삭제할 수 없습니다.')}
                        />
                    </>
                )}
            </div>

            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleConfirmSuccess}
            />
        </div>
    );
}

export default function HobbyPage() {
    return (
        <div className="modern-container" style={{ padding: '40px 0' }}>
            <div className="layout_381226_ grid_left" style={{ display: 'flex', gap: '40px' }}>
                {/* Sidebar */}
                <div style={{ width: '250px', flexShrink: 0 }}>
                    <CourseSidebar />
                </div>

                <Suspense fallback={<div>Loading content...</div>}>
                    <HobbyContent />
                </Suspense>
            </div>
        </div>
    );
}
