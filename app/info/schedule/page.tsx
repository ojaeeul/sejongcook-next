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

    // Load data on mount
    const fetchData = async () => {
        try {
            const url = '/api/admin/data/schedule?_t=' + Date.now();
            const res = await fetch(url, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setContent(data.content || "");
                }
            }
        } catch (error) {
            console.error("Failed to load schedule data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async () => {
        // if (confirm("저장하시겠습니까?")) { // Removed native confirm
        try {
            const url = '/api/admin/data/schedule?_t=' + Date.now();
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Save only content as HTML
                body: JSON.stringify({ content }),
            });

            if (res.ok) {
                // alert("저장되었습니다.");
                // router.push('/info/schedule');
                // router.refresh();
                setShowSuccessModal(true);
            } else {
                alert("저장 실패");
            }
        } catch (e) {
            alert("오류가 발생했습니다.");
            console.error(e);
        }
        // }
    };

    const handleConfirmSuccess = () => {
        setShowSuccessModal(false);
        router.push('/info/schedule');
        router.refresh();
    };

    // State for Success Modal
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="flex-grow">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 min-h-[600px]">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-4 text-black">자격시험일정 {isEdit && <span className="text-sm text-red-500 font-normal ml-2">- 수정 모드</span>}</h1>
                    <div className="border-b-2 border-black pb-2"></div>
                </div>

                <div className="font-sans">
                    {isEdit ? (
                        <div className="editor-wrapper min-h-[400px]">
                            <Editor content={content} onChange={setContent} />
                            <div className="flex justify-end gap-2 mt-4">
                                <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">저장하기</button>
                                <button onClick={() => router.push('/info/schedule')} className="bg-gray-500 text-white px-6 py-2 rounded font-bold hover:bg-gray-600">취소</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div dangerouslySetInnerHTML={{ __html: content }} />
                            <ActionButtons
                                listLink="/info/timetable"
                                editLink="/info/schedule?mode=edit"
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
