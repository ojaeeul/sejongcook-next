'use client';

import InfoSidebar from "@/components/InfoSidebar";
import ActionButtons from "@/components/ActionButtons";
import Editor from "@/components/Editor";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import SuccessModal from "@/components/SuccessModal";

const INITIAL_CONTENT = `
        <div class="font-sans">
            <!-- Title -->
            <div style="margin-top: 20px; margin-bottom: 20px;">
                <div class="text-lg font-bold border-l-4 border-orange-500 pl-2 mb-2">고등학교 진학 안내</div>
            </div>

            <p class="mb-4 text-gray-700">
                미래의 셰프를 꿈꾸는 학생들을 위한 조리 특성화 고등학교 입시 및 진학 정보입니다.
            </p>

            <!-- Introduction -->
            <div class="mb-8 p-6 bg-orange-50 rounded-lg border border-orange-100">
                <h3 class="text-xl font-bold text-orange-800 mb-3">👨‍🍳 조리 특성화고란?</h3>
                <p class="text-gray-700 leading-relaxed">
                    조리, 제과제빵 등 외식 산업 분야의 전문 인력을 양성하기 위해 특화된 교육 과정을 운영하는 고등학교입니다.<br>
                    일반 교과목 외에도 전문적인 조리 실습 교육을 통해 조기 진로 탐색과 전문 기술 습득이 가능합니다.
                </p>
            </div>

            <!-- Admission Guidelines -->
            <div class="mb-8">
                <div class="text-lg font-bold border-l-4 border-orange-500 pl-2 mb-4">입시 전형 안내</div>
                <div class="grid md:grid-cols-2 gap-4">
                    <div class="bg-white p-5 rounded border border-gray-200 shadow-sm">
                        <h4 class="font-bold text-lg mb-2 text-blue-600">일반 전형</h4>
                        <ul class="list-disc pl-5 space-y-2 text-gray-700">
                            <li>중학교 내신 성적 위주 선발</li>
                            <li>출결 및 봉사활동 실적 반영</li>
                            <li>학교에 따라 면접 진행</li>
                        </ul>
                    </div>
                    <div class="bg-white p-5 rounded border border-gray-200 shadow-sm">
                        <h4 class="font-bold text-lg mb-2 text-green-600">특별 전형</h4>
                        <ul class="list-disc pl-5 space-y-2 text-gray-700">
                            <li><strong>미래인재:</strong> 학업계획서, 자기소개서, 심층 면접</li>
                            <li><strong>취업희망자:</strong> 취업 의지가 확고한 학생 선발</li>
                            <li><strong>가업승계:</strong> 관련 가업을 잇고자 하는 자</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Major Schools -->
                <div class="space-y-8">
                    <!-- Gyeonggi Area -->
                    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <div class="bg-gray-100 px-4 py-3 border-b border-gray-200 font-bold text-lg flex justify-between items-center">
                            <span>🏫 경기권 (김포/일산/시흥/양주)</span>
                            <span class="text-xs font-normal text-gray-500 bg-white px-2 py-1 rounded border">김포 통학권</span>
                        </div>
                        <div class="p-4">
                            <table class="w-full text-sm">
                                <thead class="bg-gray-50 text-gray-700">
                                    <tr>
                                        <th class="p-2 text-left w-1/4">학교명</th>
                                        <th class="p-2 text-left w-1/4">학과</th>
                                        <th class="p-2 text-left w-1/2">합격 가능 등급 (예상)</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100">
                                    <tr>
                                        <td class="p-2 font-bold">한국조리과학고<br><span class="text-xs font-normal text-gray-500">(시흥)</span></td>
                                        <td class="p-2">조리과</td>
                                        <td class="p-2">
                                            <div class="font-bold text-blue-600">일반: 상위 10~15% (180점 이상)</div>
                                            <div class="text-xs text-gray-600 mt-1">
                                                * 진로적성(특별): 면접/계획서 중요<br>
                                                * 내신 130점대 후반~140점대 합격 사례 존재 (면접 고득점 시)
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="p-2 font-bold">일산고등학교<br><span class="text-xs font-normal text-gray-500">(일산)</span></td>
                                        <td class="p-2">조리디자인과<br>제과제빵과</td>
                                        <td class="p-2">
                                            <div class="font-bold text-green-600">내신 140~150점대 (안정권)</div>
                                            <div class="text-xs text-gray-600 mt-1">
                                                * 미달 시 전원 합격 가능성 있음<br>
                                                * 면접 비중이 있어 내신 부족해도 도전 가능
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="p-2 font-bold">한국외식과학고<br><span class="text-xs font-normal text-gray-500">(양주)</span></td>
                                        <td class="p-2">조리과학과<br>관광과</td>
                                        <td class="p-2">
                                            <div class="text-gray-800">내신 150~160점대 (중상위권)</div>
                                            <div class="text-xs text-gray-600 mt-1">
                                                * 경기북부 유일 조리 특성화고<br>
                                                * 기숙사 운영으로 김포 학생 지원 가능
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Seoul Area -->
                    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <div class="bg-gray-100 px-4 py-3 border-b border-gray-200 font-bold text-lg flex justify-between items-center">
                            <span>🏫 서울권 (강서/관악/은평)</span>
                            <span class="text-xs font-normal text-gray-500 bg-white px-2 py-1 rounded border">대중교통 통학 가능</span>
                        </div>
                        <div class="p-4">
                            <table class="w-full text-sm">
                                <thead class="bg-gray-50 text-gray-700">
                                    <tr>
                                        <th class="p-2 text-left w-1/4">학교명</th>
                                        <th class="p-2 text-left w-1/4">학과</th>
                                        <th class="p-2 text-left w-1/2">합격 기준 / 특징</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100">
                                    <tr>
                                        <td class="p-2 font-bold">서울관광고<br><span class="text-xs font-normal text-gray-500">(관악구)</span></td>
                                        <td class="p-2">관광조리코디과<br>제과제빵과</td>
                                        <td class="p-2">
                                            <div class="font-bold text-blue-600">특별전형 의존도 높음</div>
                                            <div class="text-xs text-gray-600 mt-1">
                                                * 성적보다는 '취업희망자 전형' 등 면접/자소서 위주 선발<br>
                                                * 기독교 재단, 인성 면접 중요
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="p-2 font-bold">서서울생활과학고<br><span class="text-xs font-normal text-gray-500">(구로구)</span></td>
                                        <td class="p-2">국제조리과학과</td>
                                        <td class="p-2">
                                            <div class="text-gray-800">중위권 성적 유지 권장</div>
                                            <div class="text-xs text-gray-600 mt-1">
                                                * 김포/부천 지역 통학 용이 (온수역 인근)<br>
                                                * 유학반 운영 등 진학 프로그램 우수
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="p-2 font-bold">신진과학기술고<br><span class="text-xs font-normal text-gray-500">(은평구)</span></td>
                                        <td class="p-2">호텔조리과<br>호텔디저트과</td>
                                        <td class="p-2">
                                            <div class="text-gray-800">내신 부담 적음 (면접 중요)</div>
                                            <div class="text-xs text-gray-600 mt-1">
                                                * 남학교에서 남녀공학 전환<br>
                                                * 실습 위주의 교육과정 강점
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                     <!-- Incheon Area -->
                     <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <div class="bg-gray-100 px-4 py-3 border-b border-gray-200 font-bold text-lg flex justify-between items-center">
                            <span>🏫 인천권 (부평/연수)</span>
                            <span class="text-xs font-normal text-gray-500 bg-white px-2 py-1 rounded border">인천 거주자 우선</span>
                        </div>
                        <div class="p-4">
                            <table class="w-full text-sm">
                                <thead class="bg-gray-50 text-gray-700">
                                    <tr>
                                        <th class="p-2 text-left w-1/4">학교명</th>
                                        <th class="p-2 text-left w-1/4">학과</th>
                                        <th class="p-2 text-left w-1/2">합격 기준 / 특징</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100">
                                    <tr>
                                        <td class="p-2 font-bold">인천생활과학고<br><span class="text-xs font-normal text-gray-500">(연수구)</span></td>
                                        <td class="p-2">조리과학과</td>
                                        <td class="p-2">
                                            <div class="font-bold text-blue-600">내신 상위 20~30% 권장</div>
                                            <div class="text-xs text-gray-600 mt-1">
                                                * 인천 지역 유일 공립 가사계열 특성화고<br>
                                                * 인기도가 높아 성적 컷이 다소 높은 편
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="p-2 font-bold">한국글로벌셰프고<br><span class="text-xs font-normal text-gray-500">(강화군)</span></td>
                                        <td class="p-2">조리과학과</td>
                                        <td class="p-2">
                                            <div class="text-gray-800">전국 단위 모집 (기숙사)</div>
                                            <div class="text-xs text-gray-600 mt-1">
                                                * (구)삼량고등학교<br>
                                                * 강화도 소재, 실습 시설 최신식
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-gray-700">
                    <strong>⚠️ 주의사항:</strong><br>
                    위 합격 등급(점수)은 해마다 지원자 현황에 따라 변동될 수 있으며, 대략적인 기준점입니다.<br>
                    특별 전형(면접, 자격증 가산점 등)을 잘 활용하면 내신 성적이 다소 부족해도 충분히 합격할 수 있습니다.
                </div>

            <!-- Preparation Tips -->
            <div class="bg-gray-50 p-6 rounded-lg">
                <h3 class="font-bold text-lg mb-4 text-center">🎯 합격을 위한 준비 전략</h3>
                <div class="space-y-4">
                    <div class="flex items-start gap-3">
                        <span class="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm">1</span>
                        <div>
                            <strong class="block text-gray-800 mb-1">내신 성적 관리</strong>
                            <p class="text-sm text-gray-600">기본적인 교과 성적 관리는 필수입니다. 특히 일반 전형에서는 성적이 중요한 요소입니다.</p>
                        </div>
                    </div>
                     <div class="flex items-start gap-3">
                        <span class="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm">2</span>
                        <div>
                            <strong class="block text-gray-800 mb-1">자격증 취득</strong>
                            <p class="text-sm text-gray-600">한식, 양식, 중식, 일식, 제과, 제빵 등의 기능사 자격증 취득은 전공 적합성을 증명하는 강력한 무기입니다.</p>
                        </div>
                    </div>
                     <div class="flex items-start gap-3">
                        <span class="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm">3</span>
                        <div>
                            <strong class="block text-gray-800 mb-1">면접 대비 (심층 가이드)</strong>
                            <p class="text-sm text-gray-600 mb-3">면접은 합격의 당락을 결정짓는 중요한 요소입니다. 단순히 말을 잘하는 것보다 조리에 대한 진정성과 태도가 중요합니다.</p>
                            
                            <div class="bg-white border border-gray-200 rounded p-4 mt-2">
                                <h5 class="font-bold text-orange-700 mb-2">💡 면접 준비 핵심 팁</h5>
                                <ul class="list-disc pl-5 space-y-1 text-sm text-gray-700 mb-4">
                                    <li><strong>복장과 용모:</strong> 단정함은 요리사의 기본입니다. 교복을 깔끔하게 착용하고 머리와 손톱을 정돈하세요.</li>
                                    <li><strong>태도:</strong> 질문을 할 때는 면접관의 눈을 맞추고, 밝고 자신감 있는 목소리로 대답합니다.</li>
                                    <li><strong>진정성:</strong> 외운 듯한 답변보다는 자신의 경험과 생각이 담긴 솔직한 답변이 좋은 점수를 받습니다.</li>
                                </ul>

                                <h5 class="font-bold text-orange-700 mb-2">💬 자주 나오는 예상 질문</h5>
                                <div class="space-y-3 text-sm">
                                    <div class="bg-orange-50 p-2 rounded">
                                        <p class="font-bold text-gray-800">Q. 왜 우리 학교에 지원했나요? (지원 동기)</p>
                                        <p class="text-gray-600 text-xs mt-1">Tip: 학교의 특색(교육과정, 동아리 등)과 자신의 꿈을 연결지어 답변하세요.</p>
                                    </div>
                                    <div class="bg-orange-50 p-2 rounded">
                                        <p class="font-bold text-gray-800">Q. 가장 자신 있는 요리는 무엇인가요?</p>
                                        <p class="text-gray-600 text-xs mt-1">Tip: 거창한 요리보다는 직접 만들어본 경험과 그 과정에서 느낀 점을 이야기하세요.</p>
                                    </div>
                                    <div class="bg-orange-50 p-2 rounded">
                                        <p class="font-bold text-gray-800">Q. 요리사가 되기 위해 어떤 노력을 했나요?</p>
                                        <p class="text-gray-600 text-xs mt-1">Tip: 자격증 취득, 요리 학원 수강, 꾸준한 연습 등 구체적인 사례를 듭니다.</p>
                                    </div>
                                    <div class="bg-orange-50 p-2 rounded">
                                        <p class="font-bold text-gray-800">Q. 입학 후 학업 계획(미래 계획)은?</p>
                                        <p class="text-gray-600 text-xs mt-1">Tip: 구체적인 목표(대회 수상, 대학 진학, 창업 등)를 가지고 있음을 보여주세요.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
`;

function Content() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const isEdit = searchParams.get('mode') === 'edit';

    const [content, setContent] = useState(INITIAL_CONTENT);

    const handleSave = () => {
        // if (confirm("저장하시겠습니까?")) {
        //     alert("저장되었습니다. (데모)");
        //     router.push('/info/highschool');
        // }
        setShowSuccessModal(true);
    };

    const handleConfirmSuccess = () => {
        setShowSuccessModal(false);
        router.push('/info/highschool');
    };

    const [showSuccessModal, setShowSuccessModal] = useState(false);

    return (
        <div className="flex-grow">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 min-h-[600px]">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-4 text-black">고등학교진학 {isEdit && <span className="text-sm text-red-500 font-normal ml-2">- 수정 모드</span>}</h1>
                    <div className="border-b-2 border-black pb-2"></div>
                </div>

                <div className="font-sans">
                    {isEdit ? (
                        <div className="editor-wrapper min-h-[400px]">
                            <Editor content={content} onChange={setContent} />
                            <div className="flex justify-end gap-2 mt-4">
                                <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">저장하기</button>
                                <button onClick={() => router.push('/info/highschool')} className="bg-gray-500 text-white px-6 py-2 rounded font-bold hover:bg-gray-600">취소</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div dangerouslySetInnerHTML={{ __html: content }} />
                            <ActionButtons
                                listLink="/info/schedule"
                                editLink="/info/highschool?mode=edit"
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
