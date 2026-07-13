'use client';

import CourseSidebar from "@/components/CourseSidebar";
import ActionButtons from "@/components/ActionButtons";
import Editor from "@/components/Editor";
import SuccessModal from "@/components/SuccessModal";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";

function JobContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const isEdit = searchParams.get('mode') === 'edit';

    // Initial content state (from sub0204.html)
    const [content, setContent] = useState(`
        <div style="text-align:center; padding:20px 0;">
             <img src="/img_up/shop_pds/sejongcook/farm/ready0115839945952.jpg" style="max-width:100%; border:1px solid #eee;" alt="취업반 정보">
        </div>
        <div style="font-family:'Noto Sans KR', sans-serif; line-height:1.6; padding:20px;">
             <p><strong>취업반</strong>은 베이커리 및 외식 산업 현장에서 필요한 실무 중심의 기술을 습득하는 과정입니다.</p>
        </div>
    `);

    const handleSave = () => {
        if (confirm("저장하시겠습니까?")) {
            // alert("저장되었습니다. (데모)");
            // router.push('/course/job');
            setShowSuccessModal(true);
        }
    };

    const handleConfirmSuccess = () => {
        setShowSuccessModal(false);
        router.push('/course/job');
    };

    // State for Success Modal
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    return (
        <div className="container_2" style={{ flexGrow: 1 }}>
            <div className="sub_title_381227_">
                <h1 className="text-2xl font-bold mb-4">취업반 {isEdit && <span className="text-sm text-red-500 font-normal ml-2">- 수정 모드</span>}</h1>
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
                            <button onClick={() => router.push('/course/job')} className="bg-gray-500 text-white px-6 py-2 rounded font-bold hover:bg-gray-600">취소</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div dangerouslySetInnerHTML={{ __html: content }} />

                        {/* Action Buttons */}
                        <ActionButtons
                            listLink="/course"
                            editLink="/course/job?mode=edit"
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
                message="취업반 정보가 성공적으로 수정되었습니다."
            />
        </div>
    );
}

export default function JobPage() {
    return (
        <div className="modern-container" style={{ padding: '40px 0' }}>
            <div className="layout_381226_ grid_left" style={{ display: 'flex', gap: '40px' }}>
                {/* Sidebar */}
                <div className="w-full xl:w-[250px] flex-shrink-0">
                    <CourseSidebar />
                </div>

                <Suspense fallback={<div>Loading content...</div>}>
                    <JobContent />
                </Suspense>
            </div>
        </div>
    );
}
