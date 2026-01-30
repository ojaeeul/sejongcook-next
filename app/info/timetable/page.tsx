'use client';

import InfoSidebar from "@/components/InfoSidebar";
import ActionButtons from "@/components/ActionButtons";
import Editor from "@/components/Editor";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense, useEffect } from "react";
import SuccessModal from "@/components/SuccessModal";

function Content() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const isEdit = searchParams.get('mode') === 'edit';
    const [loading, setLoading] = useState(true);

    const [content, setContent] = useState("");

    // Load data on mount from timetable endpoint
    const fetchData = async () => {
        try {
            const res = await fetch('/api/admin/data/timetable');
            if (res.ok) {
                const data = await res.json();
                if (data && data.content) {
                    setContent(data.content);
                }
            }
        } catch (error) {
            console.error("Failed to load timetable data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async () => {
        // Removed native confirm
        try {
            const res = await fetch('/api/admin/data/timetable', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content }),
            });

            if (res.ok) {
                setShowSuccessModal(true);
            } else {
                alert("저장 실패");
            }
        } catch (e) {
            alert("오류가 발생했습니다.");
            console.error(e);
        }
    };

    const handleConfirmSuccess = () => {
        setShowSuccessModal(false);
        router.push('/info/timetable');
        router.refresh();
    };

    // State for Success Modal
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="container_2" style={{ flexGrow: 1 }}>
            <div className="sub_title_381227_">
                <h1 className="text-2xl font-bold mb-4">시간표 {isEdit && <span className="text-sm text-red-500 font-normal ml-2">- 수정 모드</span>}</h1>
            </div>
            <div style={{ marginBottom: '20px' }}>
                <span className="solid_line_381231_"></span>
            </div>

            <div className="font-sans">
                {isEdit ? (
                    <div className="editor-wrapper min-h-[400px]">
                        <Editor content={content} onChange={setContent} />
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">저장하기</button>
                            <button onClick={() => router.push('/info/timetable')} className="bg-gray-500 text-white px-6 py-2 rounded font-bold hover:bg-gray-600">취소</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div dangerouslySetInnerHTML={{ __html: content }} />
                        <ActionButtons
                            listLink="/info/timetable"
                            editLink="/info/timetable?mode=edit"
                            onDelete={() => alert("삭제 권한이 없습니다.")}
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

export default function Page() {
    return (
        <div className="modern-container" style={{ padding: '40px 0' }}>
            <div className="layout_381226_ grid_left flex flex-col xl:flex-row gap-10">
                <div className="w-full xl:w-[250px] flex-shrink-0">
                    <InfoSidebar />
                </div>
                <Suspense fallback={<div>Loading...</div>}>
                    <Content />
                </Suspense>
            </div>
        </div>
    );
}
