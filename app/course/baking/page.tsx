'use client';


import ActionButtons from "@/components/ActionButtons";
import Editor from "@/components/Editor";
import SuccessModal from "@/components/SuccessModal";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense, useEffect } from "react";
import { createPortal } from "react-dom";

import BakingSubNav from "@/components/BakingSubNav";

const INITIAL_SECTIONS = {
    overview: `
        <div style="text-align:center; margin-bottom:20px;">
            <img src="/img_up/shop_pds/sejongcook/farm/p121585901350.png" style="max-width:100%; border-radius:16px;" alt="제과제빵 실습 이미지">
        </div>
        <div style="font-family:'Noto Sans KR', sans-serif; line-height:1.6;">
            <p style="padding:15px 0;">
                <strong style="font-size:20px;">
                    <span style="color:#000080">빵은</span> <span style="color:#ff8c00;">"인류가 만들어낸 과일"</span><span style="color:#000080">이라고 할만큼 영양 면에서나 맛에서 사랑받고 있습니다.</span>
                </strong>
            </p>
            <p style="margin-bottom:10px;">우리나라에서도 식생활의 서구화로 빵과 과자의 수요가 증가하고 있습니다. 제과제빵사는 맛과 영양을 고려하여 소비자의 입맛에 맞는 제품을 개발하는 전문가입니다.</p>
            <br>
            <h3 style="border-left:4px solid #ff8c00; padding-left:10px; margin:20px 0 10px 0; font-size:18px; font-weight:bold;">교육 과정</h3>
            <p><strong>1. 제과 (20가지 상시검정)</strong>: 파운드케이크, 롤케이크, 브라우니, 타르트, 마들렌, 슈, 버터쿠키 등</p>
            <p><strong>2. 제빵 (20가지 상시검정)</strong>: 식빵(우유, 옥수수 등), 단팥빵, 크림빵, 베이글, 소시지빵, 모카빵 등</p>
        </div>
    `,
    confectionery: `
        <div class="menu-title">제과기능사</div>
        <div class="menu-content-box">
            <div class="main-image-wrap">
                <img src="/img_up/shop_pds/sejongcook/farm/clean_confectionery.png" alt="제과기능사" class="full-img">
            </div>
            <div class="text-content mt-8">
                <p class="section-desc text-xl font-bold mb-4">달콤한 예술, 제과 전문가의 시작</p>
                <p><strong>교육 내용:</strong> 파운드케이크, 롤케이크, 브라우니, 타르트, 마들렌, 슈, 버터쿠키, 다쿠와즈, 치즈케이크, 호두파이 등 20가지 국가기술자격증 실기 과제를 완벽하게 마스터합니다.</p>
                <p class="mt-4">정확한 계량법, 반죽법(공립법, 별립법 등), 팬닝 및 굽기 온도 조절 등 제과의 핵심 기술을 체계적으로 교육합니다.</p>
                <div class="board-link-wrap mt-8">
                    <a href="/course/baking/board" class="board-btn">
                        <span>제과제빵 소식 보기</span>
                    </a>
                </div>
            </div>
        </div>
    `,
    bread: `
        <div class="menu-title">제빵기능사</div>
        <div class="menu-content-box">
            <div class="main-image-wrap">
                <img src="/img_up/shop_pds/sejongcook/farm/clean_baking.png" alt="제빵기능사" class="full-img">
            </div>
            <div class="text-content mt-8">
                <p class="section-desc text-xl font-bold mb-4">발효의 미학, 건강한 빵 만들기</p>
                <p><strong>교육 내용:</strong> 식빵(우유, 옥수수, 건포도 등), 단팥빵, 크림빵, 소보로빵, 베이글, 소시지빵, 모카빵, 그 그리시니 등 20가지 제빵 실기 메뉴를 배웁니다.</p>
                <p class="mt-4">글루텐 형성의 이해, 발효 과정(1차, 중간, 2차) 관리, 성형 기술 등 빵이 만들어지는 과학적 원리와 실무를 동시에 익힙니다.</p>
                <div class="board-link-wrap mt-8">
                    <a href="/course/baking/board" class="board-btn">
                        <span>제과제빵 소식 보기</span>
                    </a>
                </div>
            </div>
        </div>
    `
};

function BakingContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const isEdit = searchParams.get('mode') === 'edit';

    // State for contents and active tab
    const [sectionsContent, setSectionsContent] = useState(INITIAL_SECTIONS);
    const [activeTab, setActiveTab] = useState<keyof typeof INITIAL_SECTIONS>('overview');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const handleHashChange = () => {
            const h = window.location.hash.replace('#', '');
            if (h && (h in INITIAL_SECTIONS)) {
                setActiveTab(h as keyof typeof INITIAL_SECTIONS);
            } else {
                setActiveTab('overview');
            }
        };

        handleHashChange();
        setMounted(true);
        window.addEventListener('hashchange', handleHashChange);
        // Polling to ensure hash sync like in Cooking page
        const interval = setInterval(handleHashChange, 200);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
            clearInterval(interval);
        };
    }, []);

    const [currentEditContent, setCurrentEditContent] = useState('');

    // Update editor content when active tab changes
    useEffect(() => {
        setCurrentEditContent(sectionsContent[activeTab]);
    }, [activeTab, sectionsContent]);

    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    const handleSave = () => {
        setSectionsContent(prev => ({
            ...prev,
            [activeTab]: currentEditContent
        }));
        // alert("저장되었습니다. (현재 세션에 반영됨)");
        setShowSuccessModal(true);
    };

    const handleConfirmSuccess = () => {
        setShowSuccessModal(false);
        // Redirect to view mode with same tab
        router.push(`/course/baking#${activeTab}`);
    };

    // State for Success Modal
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    return (
        <div className="container_2" style={{ flexGrow: 1 }}>
            <div className="sub_title_381227_">
                <h1 className="text-2xl font-bold mb-4">
                    제과제빵과정
                    {isEdit && <span className="text-sm text-red-500 font-normal ml-2">- 수정 모드 ({activeTab})</span>}
                </h1>
            </div>

            {/* Sub Navigation */}
            <BakingSubNav />

            <div style={{ marginBottom: '20px' }}>
                <span className="solid_line_381231_"></span>
            </div>

            {/* Content Area */}
            <div className="font-sans">
                {isEdit ? (
                    <div className="editor-wrapper min-h-[400px]">
                        <div className="mb-4 bg-yellow-50 p-4 rounded border border-yellow-200 text-sm text-yellow-800">
                            <strong>편집 안내:</strong> 현재 탭(<strong>{activeTab}</strong>)의 내용만 편집하고 있습니다.
                        </div>
                        <Editor content={currentEditContent} onChange={(newContent) => setCurrentEditContent(newContent)} />
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">현재 탭 저장하기</button>
                            <button onClick={() => router.push('/course/baking')} className="bg-gray-500 text-white px-6 py-2 rounded font-bold hover:bg-gray-600">편집 종료</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <style jsx global>{`
                            .menu-section {
                                animation: fadeIn 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                            }

                            .menu-title {
                                font-size: 1.75rem;
                                font-weight: 800;
                                color: #1a1a1a;
                                margin-bottom: 2.5rem;
                                border-left: 6px solid #ff8c00; /* Orange for Baking */
                                padding-left: 1.25rem;
                                letter-spacing: -0.025em;
                            }

                            .main-image-wrap {
                                width: 100%;
                                max-height: 450px;
                                border-radius: 16px;
                                overflow: hidden;
                                box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                                background: #fff;
                                position: relative;
                                transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                            }

                            /* Hover effect removed */

                            .full-img {
                                width: 100%;
                                height: 100%;
                                object-fit: cover;
                                display: block;
                                position: relative;
                                z-index: 1;
                            }

                            .text-content {
                                background: #fff;
                                border-radius: 16px;
                                border: 1px solid #f3f4f6;
                                padding: 2.5rem;
                                line-height: 1.8;
                            }

                            .board-link-wrap {
                                display: flex;
                                justify-content: flex-end;
                            }

                            .board-btn {
                                display: inline-flex;
                                align-items: center;
                                background: #ff8c00; /* Orange for Baking */
                                color: #fff !important;
                                padding: 12px 24px;
                                border-radius: 8px;
                                font-weight: 700;
                                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                                text-decoration: none !important;
                                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                            }

                            .board-btn:hover {
                                background: #e67e00;
                                transform: scale(1.05) translateY(-5px);
                                box-shadow: 0 15px 20px -3px rgba(0, 0, 0, 0.15);
                            }

                            @keyframes fadeIn {
                                from { opacity: 0; transform: translateY(20px); }
                                to { opacity: 1; transform: translateY(0); }
                            }
                            @keyframes zoomIn {
                                from { transform: scale(0.9); opacity: 0; }
                                to { transform: scale(1); opacity: 1; }
                            }
                            
                            .content-wrapper img {
                                cursor: pointer;
                                transition: transform 0.2s;
                            }
                            /* Hover scale removed */
                        `}</style>
                        <div
                            className="content-wrapper menu-section"
                            dangerouslySetInnerHTML={{ __html: sectionsContent[activeTab] }}
                            onClick={(e) => {
                                const target = e.target as HTMLElement;
                                if (target.tagName === 'IMG') {
                                    console.log('Image clicked:', (target as HTMLImageElement).src);
                                    setLightboxImage((target as HTMLImageElement).src);
                                }
                            }}
                        />

                        {/* Lightbox Modal */}
                        {/* Lightbox Modal */}
                        {lightboxImage && mounted && createPortal(
                            <div
                                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                                onClick={() => setLightboxImage(null)}
                            >
                                <img
                                    src={lightboxImage}
                                    alt="Enlarged view"
                                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl scale-100 transition-transform duration-300"
                                    style={{ animation: 'zoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
                                />
                            </div>,
                            document.body
                        )}

                        {/* Action Buttons */}
                        <ActionButtons
                            listLink="/course"
                            editLink={`/course/baking?mode=edit#${activeTab === 'overview' ? '' : activeTab}`}
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
                message="내용이 성공적으로 수정되었습니다."
            />
        </div>
    );
}

export default function BakingPage() {
    return (
        <div className="modern-container" style={{ padding: '40px 0' }}>
            <Suspense fallback={<div>Loading content...</div>}>
                <BakingContent />
            </Suspense>
        </div>
    );
}
