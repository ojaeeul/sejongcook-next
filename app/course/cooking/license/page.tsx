'use client';

import ActionButtons from "@/components/ActionButtons";
import Editor from "@/components/Editor";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense, useEffect } from "react";
import SuccessModal from "@/components/SuccessModal";
import CookingSubNav from "@/components/CookingSubNav";

const INITIAL_SECTIONS = {
    overview: `
        <div class="menu-title">조리교육과정 개요</div>
        <div class="menu-content-box">
            <div class="main-image-wrap action-wild">
                <img src="/img_up/shop_pds/sejongcook/farm/certification_exam_dishes_collage_high_res.png" alt="조리기능사 자격증 실기 작품" class="full-img">
            </div>
            <div class="text-content mt-8">
                <table class="tg">
                    <colgroup>
                        <col style="width: 25%">
                        <col style="width: 75%">
                    </colgroup>
                    <tr>
                        <th class="tg-header">개 요</th>
                        <td class="tg-content">5대 조리기능사(한식, 양식, 중식, 일식, 복어) 자격증 취득 및 실무 요리 전문가 양성을 목표로 합니다. 기초 칼질부터 고급 조리 기술까지 체계적인 커리큘럼을 제공합니다.</td>
                    </tr>
                    <tr>
                        <th class="tg-header">진로 및 전망</th>
                        <td class="tg-content">호텔, 전문 레스토랑, 단체급식소, 식품연구소 등 다양한 분야로 진출 가능하며, 창업을 위한 실무 역량도 배양할 수 있습니다.</td>
                    </tr>
                    <tr>
                        <th class="tg-header">수강 대상</th>
                        <td class="tg-content">조리 자격증 취득 희망자, 외식업 창업 예정자, 조리 관련 학과 진학 희망 학생 등 누구나 수강 가능합니다.</td>
                    </tr>
                </table>
            </div>
        </div>
    `,
    korean: `
        <div class="menu-title">한식조리기능사</div>
        <div class="menu-content-box">
            <div class="main-image-wrap">
                <img src="/img_up/shop_pds/sejongcook/farm/bibimbap_final_high_res.png" alt="한식조리기능사" class="full-img">
            </div>
            <div class="text-content mt-8">
                <p class="section-desc text-xl font-bold mb-4">한국인의 맛, 한식 조리의 정석</p>
                <p><strong>교육 내용:</strong> 비빔밥, 잡채, 너비아니구이, 생선찌개 등 33가지 국가기술자격증 실기 과제를 완벽하게 마스터합니다.</p>
                <p class="mt-4">재료 손질부터 위생 관리, 조리 순서까지 시험 합격 포인트와 실무 노하우를 동시에 전수합니다.</p>
                <div class="board-link-wrap mt-8">
                    <a href="/course/cooking/board" class="board-btn">
                        <span>한식과정 소식 보기</span>
                    </a>
                </div>
            </div>
        </div>
    `,
    western: `
        <div class="menu-title">양식조리기능사</div>
        <div class="menu-content-box">
            <div class="main-image-wrap">
                <img src="/img_up/shop_pds/sejongcook/farm/western_steak_no_sauce_final.png" alt="양식조리기능사" class="full-img">
            </div>
            <div class="text-content mt-8">
                <p class="section-desc text-xl font-bold mb-4">글로벌 스탠다드, 서양 요리의 기초</p>
                <p><strong>교육 내용:</strong> 스테이크, 파스타, 오믈렛, 샐러드 등 30가지 양식 실기 메뉴를 통해 서양 조리의 기본 소스와 조리법을 익힙니다.</p>
                <p class="mt-4">브런치 카페 창업이나 호텔 양식당 취업을 위한 필수 코스입니다.</p>
                <div class="board-link-wrap mt-8">
                    <a href="/course/cooking/board" class="board-btn">
                        <span>양식과정 소식 보기</span>
                    </a>
                </div>
            </div>
        </div>
    `,
    chinese: `
        <div class="menu-title">중식조리기능사</div>
        <div class="menu-content-box">
            <div class="main-image-wrap">
                <img src="/img_up/shop_pds/sejongcook/farm/yangjangpi_high_res.png" alt="중식조리기능사" class="full-img">
            </div>
            <div class="text-content mt-8">
                <p class="section-desc text-xl font-bold mb-4">화려한 불맛, 중식 전문가 과정</p>
                <p><strong>교육 내용:</strong> 탕수육, 고추잡채, 마파두부, 짜장면 등 20가지 중식 메뉴를 다룹니다.</p>
                <p class="mt-4">강력한 화력을 다루는 웍(Wok) 기술과 중식 칼판 기술을 중점적으로 교육합니다.</p>
                <div class="board-link-wrap mt-8">
                    <a href="/course/cooking/board" class="board-btn">
                        <span>중식과정 소식 보기</span>
                    </a>
                </div>
            </div>
        </div>
    `,
    japanese: `
        <div class="menu-title">일식조리기능사</div>
        <div class="menu-content-box">
            <div class="main-image-wrap">
                <img src="/img_up/shop_pds/sejongcook/farm/sushi_8pieces_high_res.png" alt="일식조리기능사" class="full-img">
            </div>
            <div class="text-content mt-8">
                <p class="section-desc text-xl font-bold mb-4">섬세함의 미학, 정통 일식 조리</p>
                <p><strong>교육 내용:</strong> 생선초밥, 도미술찜, 모둠튀김, 우동 등 19가지 일식 메뉴를 배웁니다.</p>
                <p class="mt-4">날카로운 칼을 사용하는 사시미 기술과 식재료 본연의 맛을 살리는 섬세한 조리법을 익힙니다.</p>
                <div class="board-link-wrap mt-8">
                    <a href="/course/cooking/board" class="board-btn">
                        <span>일식과정 소식 보기</span>
                    </a>
                </div>
            </div>
        </div>
    `,
    puffer: `
        <div class="menu-title">복어조리기능사</div>
        <div class="menu-content-box">
            <div class="main-image-wrap">
                <img src="/img_up/shop_pds/sejongcook/farm/bok_eo_sashimi_high_res.png" alt="복어조리기능사" class="full-img">
            </div>
            <div class="text-content mt-8">
                <p class="section-desc text-xl font-bold mb-4">최고 난이도, 복어 조리 전문가</p>
                <p><strong>교육 내용:</strong> 복어 제독(독 제거), 복어회(우스즈쿠리), 복어지리 등 고난도 기술을 교육합니다.</p>
                <p class="mt-4">전문 조리사로서의 가치를 높여주는 특수 자격증 과정으로, 철저한 안전 교육이 동반됩니다.</p>
                <div class="board-link-wrap mt-8">
                    <a href="/course/cooking/board" class="board-btn">
                        <span>복어과정 소식 보기</span>
                    </a>
                </div>
            </div>
        </div>
    `,
    industrial: `
        <div class="menu-title">한식산업기사</div>
        <div class="menu-content-box">
            <div class="main-image-wrap">
                <img src="/img_up/shop_pds/sejongcook/farm/hansik_industrial_engineer.png" alt="한식산업기사" class="full-img">
            </div>
            <div class="text-content mt-8">
                <p class="section-desc text-xl font-bold mb-4">조리 마스터를 향한 도약</p>
                <p><strong>교육 내용:</strong> 고급 한식 코스, 궁중 요리, 메뉴 기획 및 원가 관리 등 관리자급 실무 역량을 키웁니다.</p>
                <p class="mt-4">기능사 자격증 소지자 또는 실무 경력자를 위한 심화 과정입니다.</p>
                <div class="board-link-wrap mt-8">
                    <a href="/course/cooking/board" class="board-btn">
                        <span>심화과정 소식 보기</span>
                    </a>
                </div>
            </div>
        </div>
    `,
    brunch: `
        <div class="menu-title">브런치마스터</div>
        <div class="menu-content-box">
            <div class="main-image-wrap">
                <img src="/img_up/shop_pds/sejongcook/farm/brunch_new.png" alt="브런치마스터" class="full-img">
            </div>
            <div class="text-content mt-8">
                <p class="section-desc text-xl font-bold mb-4">트렌디한 카페 메뉴 창업 클래스</p>
                <p><strong>교육 내용:</strong> 에그 베네딕트, 파니니, 샐러드 파스타, 수제 리코타 치즈 등 인기 브런치 메뉴를 실습합니다.</p>
                <p class="mt-4">소자본 창업을 준비하거나 카페 사이드 메뉴를 강화하고 싶은 분들에게 최적화된 과정입니다.</p>
                <div class="board-link-wrap mt-8">
                    <a href="/course/cooking/board" class="board-btn">
                        <span>브런치 소식 보기</span>
                    </a>
                </div>
            </div>
        </div>
    `,
    life: `
        <div class="menu-title">생활요리</div>
        <div class="menu-content-box">
            <div class="main-image-wrap">
                <img src="/img_up/shop_pds/sejongcook/farm/household_cooking_class.png" alt="생활요리" class="full-img">
            </div>
            <div class="text-content mt-8">
                <p class="section-desc text-xl font-bold mb-4">매일 먹는 집밥이 특별해지는 시간</p>
                <p><strong>교육 내용:</strong> 제철 식재료를 활용한 국, 찌개, 밑반찬부터 손님 초대 요리까지 다양한 가정식을 배웁니다.</p>
                <p class="mt-4">요리 초보자도 쉽게 따라 할 수 있는 1:1 맞춤형 지도로 진행됩니다.</p>
                <div class="board-link-wrap mt-8">
                    <a href="/course/cooking/board" class="board-btn">
                        <span>생활요리 소식 보기</span>
                    </a>
                </div>
            </div>
        </div>
    `
};

function Content() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const isEdit = searchParams.get('mode') === 'edit';

    // State for contents and active tab
    const [sectionsContent, setSectionsContent] = useState(INITIAL_SECTIONS);
    const [activeTab, setActiveTab] = useState<keyof typeof INITIAL_SECTIONS>('overview');

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
        window.addEventListener('hashchange', handleHashChange);
        // Polling to ensure hash sync
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

    const handleEditorChange = (newContent: string) => {
        setCurrentEditContent(newContent);
    };

    const handleSave = () => {
        // In a real app, this would send an API request to save specifically this section.
        // For now, we update client state and simulate a save.
        setSectionsContent(prev => ({
            ...prev,
            [activeTab]: currentEditContent
        }));
        // alert("저장되었습니다. (현재 세션에 반영됨)");
        // Note: We don't redirect away in granular edit mode so user can edit other tabs.
        setShowSuccessModal(true);
    };

    const handleConfirmSuccess = () => {
        setShowSuccessModal(false);
        // Redirect to view mode with same tab
        router.push(`/course/cooking/license#${activeTab}`);
    };

    // State for Success Modal
    const [showSuccessModal, setShowSuccessModal] = useState(false);


    return (
        <div className="container_2" style={{ flexGrow: 1 }}>
            <div className="sub_title_381227_">
                <h1 className="text-2xl font-bold mb-4">
                    조리교육과정
                    {isEdit && <span className="text-sm text-red-500 font-normal ml-2">- 수정 모드 ({activeTab})</span>}
                </h1>
            </div>

            {/* In Edit mode, we still show navigation so users can switch between sections to edit */}
            <CookingSubNav />

            <div style={{ marginBottom: '20px' }}>
                <span className="solid_line_381231_"></span>
            </div>

            <div className="font-sans">
                {isEdit ? (
                    <div className="editor-wrapper min-h-[400px]">
                        <div className="mb-4 bg-yellow-50 p-4 rounded border border-yellow-200 text-sm text-yellow-800">
                            <strong>편집 안내:</strong> 현재 탭(<strong>{activeTab}</strong>)의 내용만 편집하고 있습니다. 다른 섹션을 편집하려면 위의 탭을 클릭하세요.
                        </div>
                        <Editor content={currentEditContent} onChange={handleEditorChange} />
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">현재 탭 저장하기</button>
                            <button onClick={() => router.push('/course/cooking/license')} className="bg-gray-500 text-white px-6 py-2 rounded font-bold hover:bg-gray-600">편집 종료</button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Global Code Styles from Previous Implementation Preserved */}
                        <style jsx global>{`
                            .menu-section {
                                animation: fadeIn 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                            }

                            .menu-title {
                                font-size: 1.75rem;
                                font-weight: 800;
                                color: #1a1a1a;
                                margin-bottom: 2.5rem;
                                border-left: 6px solid #3e2723;
                                padding-left: 1.25rem;
                                letter-spacing: -0.025em;
                            }

                            .main-image-wrap {
                                width: 100%;
                                aspect-ratio: 21/9;
                                max-height: 500px;
                                border-radius: 16px;
                                overflow: hidden;
                                box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                                background: #fff;
                                position: relative;
                                transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                            }

                            .main-image-wrap:hover {
                                transform: scale(1.02);
                                box-shadow: 0 25px 30px -5px rgba(0, 0, 0, 0.2);
                            }

                            .full-img {
                                width: 100%;
                                height: 100%;
                                object-fit: contain;
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
                                background: #3e2723;
                                color: #fff !important;
                                padding: 12px 24px;
                                border-radius: 8px;
                                font-weight: 700;
                                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                                text-decoration: none !important;
                                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                            }

                            .board-btn:hover {
                                background: #5d4037;
                                transform: scale(1.05) translateY(-5px);
                                box-shadow: 0 15px 20px -3px rgba(0, 0, 0, 0.15);
                            }

                            @keyframes fadeIn {
                                from { opacity: 0; transform: translateY(20px); }
                                to { opacity: 1; transform: translateY(0); }
                            }

                            /* Table tweaks */
                            .tg { border-collapse: collapse; width: 100%; }
                            .tg-header { background: #f9fafb; color: #374151; font-weight: 600; text-align: left; padding: 1rem; border: 1px solid #e5e7eb; }
                            .tg-content { padding: 1rem; border: 1px solid #e5e7eb; color: #4b5563; }
                        `}</style>
                        <div
                            className="content-wrapper menu-section"
                            dangerouslySetInnerHTML={{ __html: sectionsContent[activeTab] }}
                        />
                        <ActionButtons
                            listLink="/course/cooking"
                            editLink={`/course/cooking/license?mode=edit#${activeTab === 'overview' ? '' : activeTab}`}
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

export default function Page() {
    return (
        <div className="modern-container" style={{ padding: '40px 0' }}>
            <Suspense fallback={<div>Loading...</div>}>
                <Content />
            </Suspense>
        </div>
    );
}
