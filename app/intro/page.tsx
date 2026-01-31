'use client';

import IntroSidebar from "@/components/IntroSidebar";
import ActionButtons from "@/components/ActionButtons";
import Editor from "@/components/Editor";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import SuccessModal from "@/components/SuccessModal";

function IntroContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const isEdit = searchParams.get('mode') === 'edit';

    // Initial content state
    const [content, setContent] = useState(`
        <style>
            .premium-intro { font-family: 'Suit', sans-serif; color: #333; }
            .intro-hero {
                position: relative;
                margin-bottom: 50px;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 20px 40px -10px rgba(0,0,0,0.15);
            }
            .intro-hero img { width: 100%; display: block; transition: transform 0.7s ease; }
            .intro-hero:hover img { transform: scale(1.03); }
            .intro-overlay {
                position: absolute;
                bottom: 0; left: 0; right: 0;
                background: linear-gradient(transparent, rgba(0,0,0,0.8));
                padding: 40px;
                color: white;
            }
            .values-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 20px;
                margin: 40px 0;
            }
            .value-card {
                padding: 30px;
                background: #fdfdfd;
                border: 1px solid #eee;
                border-radius: 12px;
                text-align: center;
                transition: transform 0.3s, box-shadow 0.3s;
            }
            .value-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 20px rgba(0,0,0,0.05);
                border-color: #ff8c00;
            }
            .value-icon { font-size: 40px; margin-bottom: 15px; display: block; }
            .highlight-text { color: #ff8c00; font-weight: bold; }
        </style>

        <div class="premium-intro">
            <!-- Hero Section -->
            <div class="intro-hero">
                <img src="/img_up/shop_pds/sejongcook/farm/main011590398100.png" alt="Academy View" />
                <div class="intro-overlay">
                    <h2 style="font-size: 28px; font-weight: bold; margin: 0 0 10px 0;">꿈을 요리하는 공간</h2>
                    <p style="margin: 0; opacity: 0.9; font-size: 16px;">세종요리제과기술학원에서 당신의 미래를 시작하세요.</p>
                </div>
            </div>

            <!-- Greeting Message -->
            <div style="padding: 0 10px; margin-bottom: 50px; text-align: center;">
                <h3 style="font-size: 24px; font-weight: bold; margin-bottom: 25px; color: #111;">
                    "<span class="highlight-text">열정</span>과 <span class="highlight-text">실력</span>을 겸비한<br/>최고의 전문가로 양성합니다."
                </h3>
                <div style="max-width: 700px; margin: 0 auto; line-height: 1.8; color: #555; text-align: left;">
                    <p style="margin-bottom: 15px;">
                        안녕하세요. <strong>세종요리제과기술학원</strong> 홈페이지를 방문해주셔서 진심으로 감사드립니다.
                        저희 학원은 2000년 설립 이래, 제과제빵 및 조리 분야의 전문 인재 양성을 목표로 
                        수많은 합격생과 전문가를 배출해온 <strong>전통 있는 교육 기관</strong>입니다.
                    </p>
                    <p style="margin-bottom: 15px;">
                        급변하는 외식 산업 트렌드에 발맞춰,단순한 자격증 취득을 넘어
                        <span style="background: #fff3cd; padding: 0 4px;">현장 실무 능력</span>과
                        <span style="background: #fff3cd; padding: 0 4px;">창의적 감각</span>을 갖춘 인재를 길러내는 데 주력하고 있습니다.
                    </p>
                </div>
            </div>

            <!-- Core Values -->
            <div class="values-grid">
                <div class="value-card">
                    <span class="value-icon">🎓</span>
                    <h4 style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">체계적인 교육</h4>
                    <p style="font-size: 14px; color: #666; margin: 0;">기초부터 심화까지<br/>단계별 맞춤형 커리큘럼</p>
                </div>
                <div class="value-card">
                    <span class="value-icon">🔥</span>
                    <h4 style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">최적의 환경</h4>
                    <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>쾌적한 실습실<br/>실무 중심 현장 교육</p>
                </div>
                <div class="value-card">
                    <span class="value-icon">🤝</span>
                    <h4 style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">취업/창업 지원</h4>
                    <p style="font-size: 14px; color: #666; margin: 0;">자격증 취득 후<br/>진로 상담 및 취업 연계</p>
                </div>
            </div>

            <!-- Closing -->
            <div style="margin-top: 50px; padding: 30px; background: #f9f9f9; border-left: 4px solid #ff8c00; border-radius: 4px;">
                <p style="margin-bottom: 15px; font-size: 16px; line-height: 1.6; color: #444;">
                    여러분의 꿈이 현실이 되는 그날까지,<br/>
                    세종요리제과기술학원 강사진 모두가 든든한 멘토가 되어드리겠습니다.
                </p>
                <div style="text-align: right; margin-top: 20px;">
                    <span style="font-size: 14px; color: #777;">세종요리제과기술학원 원장</span>
                    <strong style="font-size: 18px; margin-left: 10px; font-family: sans-serif;">오 재 을</strong>
                </div>
            </div>
        </div>
    `);

    const handleSave = () => {
        // alert("저장되었습니다. (데모)");
        // Show success modal instead of alert
        setShowSuccessModal(true);
    };

    const handleConfirmSuccess = () => {
        setShowSuccessModal(false);
        router.push('/intro');
    };

    // State for Success Modal
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    return (
        <div className="container_2" style={{ flexGrow: 1 }}>
            {/* Content Body */}
            <div className="flex-grow">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 min-h-[600px]">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold mb-4 text-black">인사말 {isEdit && <span className="text-sm text-red-500 font-normal ml-2">- 수정 모드</span>}</h1>
                        <div className="border-b-2 border-black pb-2"></div>
                    </div>

                    <div className="layout_381268_">
                        {isEdit ? (
                            <div className="editor-wrapper min-h-[400px]">
                                <Editor content={content} onChange={setContent} />
                                <div className="flex justify-end gap-2 mt-4">
                                    <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">저장하기</button>
                                    <button onClick={() => router.push('/intro')} className="bg-gray-500 text-white px-6 py-2 rounded font-bold hover:bg-gray-600">취소</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div dangerouslySetInnerHTML={{ __html: content }} />

                                {/* Action Buttons */}
                                <ActionButtons
                                    listLink="/intro"
                                    editLink="/intro?mode=edit"
                                    onDelete={() => alert('기본 페이지는 삭제할 수 없습니다.')}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleConfirmSuccess}
            />
        </div>
    );
}

export default function IntroPage() {
    return (
        <div className="modern-container" style={{ padding: '40px 0' }}>
            <div className="layout_381226_ grid_left flex flex-col xl:flex-row gap-10">
                {/* Sidebar */}
                <IntroSidebar />

                <Suspense fallback={<div>Loading content...</div>}>
                    <IntroContent />
                </Suspense>
            </div>
        </div>
    );
}
