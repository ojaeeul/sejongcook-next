'use client';

import InfoSidebar from "@/components/InfoSidebar";
import ActionButtons from "@/components/ActionButtons";
import Editor from "@/components/Editor";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import SuccessModal from "@/components/SuccessModal";

const INITIAL_CONTENT = `
        <div class="font-sans">
            <!-- Original Content (Restored) -->
            <div style="margin-top: 20px; margin-bottom: 20px;">
                <div class="text-lg font-bold border-l-4 border-orange-500 pl-2 mb-2">관련학과 소개</div>
            </div>

            <div style="text-align: left; margin-bottom: 20px;">
                <img src="/img_up/shop_pds/sejongcook/farm/sub0405--dae-hak1584001839.png" alt="대학진학 관련학과" style="max-width: 100%; border-radius: 8px;" />
            </div>

            <p class="mb-4 text-gray-700">
                조리 및 제과제빵 관련 학과로의 진학을 희망하는 학생들을 위한 입시 정보입니다.
            </p>

            <table class="tg" style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
                <colgroup>
                    <col style="width: 20%">
                    <col style="width: 80%">
                </colgroup>
                <thead>
                    <tr>
                        <th class="tg-header" style="background:#f0f0f0; padding:10px; border:1px solid #ddd; font-weight:bold; text-align:center;">구분</th>
                        <th class="tg-header" style="background:#f0f0f0; padding:10px; border:1px solid #ddd; font-weight:bold; text-align:center;">내용</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="tg-label" style="padding:10px; border:1px solid #ddd; text-align:center; font-weight:bold;">지원자격</td>
                        <td class="tg-content" style="padding:10px; border:1px solid #ddd;">
                            고등학교 졸업자 또는 예정자 (검정고시 합격자 포함)
                        </td>
                    </tr>
                    <tr>
                        <td class="tg-label" style="padding:10px; border:1px solid #ddd; text-align:center; font-weight:bold;">전형방법</td>
                        <td class="tg-content" style="padding:10px; border:1px solid #ddd;">
                            <ul style="list-style-type: disc; padding-left: 20px;">
                                <li>특별전형: 자격증 소지자, 각종 대회 입상자</li>
                                <li>일반전형: 학생부 성적 + 면접</li>
                                <li>독자전형: 학교장 추천, 취업 희망자 등</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td class="tg-label" style="padding:10px; border:1px solid #ddd; text-align:center; font-weight:bold;">주요대학</td>
                        <td class="tg-content" style="padding:15px; border:1px solid #ddd;">
                            <div class="university-list">
                                <p style="margin-bottom: 12px; border-bottom: 1px dotted #ccc; padding-bottom: 5px;">
                                    <strong style="color:#e65100; font-size:1.1em;">[서울권 4년제]</strong><br>
                                    <span style="display:block; margin-top:5px; line-height:1.6;">
                                    경희대, 세종대, 숙명여대, 경기대, 상명대, 한성대 등
                                    </span>
                                </p>
                                <p style="margin-bottom: 5px;">
                                    <strong style="color:#e65100; font-size:1.1em;">[수도권/전문대]</strong><br>
                                    <span style="display:block; margin-top:5px; line-height:1.6;">
                                    우송대, 을지대, 수원대, 한국관광대, 청강문화산업대, 한양여대, 배화여대 등
                                    </span>
                                </p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td class="tg-label" style="padding:10px; border:1px solid #ddd; text-align:center; font-weight:bold;">졸업 후 진로</td>
                        <td class="tg-content" style="padding:10px; border:1px solid #ddd;">
                            호텔 조리사, 제과제빵사, 푸드스타일리스트, 외식업체 매니저 등
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- New Detailed Guide -->
            <div style="margin-top: 40px; margin-bottom: 20px;">
                <div class="text-lg font-bold border-l-4 border-blue-500 pl-2 mb-2">대학 진학 심층 가이드 (등급컷 & 전략)</div>
            </div>

            <p class="mb-4 text-gray-700">
                주요 대학의 합격 등급 컷과 구체적인 합격 전략을 확인하세요.
            </p>

            <!-- University Table -->
            <div class="space-y-8 mb-8">
                <!-- 4-Year Universities (Seoul/Gyeonggi) -->
                <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <div class="bg-gray-100 px-4 py-3 border-b border-gray-200 font-bold text-lg flex justify-between items-center">
                        <span>🎓 서울/수도권 4년제 대학교</span>
                        <span class="text-xs font-normal text-gray-500 bg-white px-2 py-1 rounded border">최상위권 목표</span>
                    </div>
                    <div class="p-4">
                        <table class="w-full text-sm">
                            <thead class="bg-gray-50 text-gray-700">
                                <tr>
                                    <th class="p-2 text-left w-1/4">대학명</th>
                                    <th class="p-2 text-left w-1/4">학과</th>
                                    <th class="p-2 text-left w-1/2">합격 등급 (2024~2025 기준)</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                <tr>
                                    <td class="p-2 font-bold">경희대학교<br><span class="text-xs font-normal text-gray-500">(서울/국제)</span></td>
                                    <td class="p-2">조리&푸드디자인학과<br>외식경영학과</td>
                                    <td class="p-2">
                                        <div class="font-bold text-blue-600">학생부교과: 1.8 ~ 2.0등급</div>
                                        <div class="text-xs text-gray-600 mt-1">
                                            * 네오르네상스(종합): 2.5 ~ 3.0등급 (활동 중요)<br>
                                            * 수능 최저학력기준 충족 필요
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="p-2 font-bold">세종대학교<br><span class="text-xs font-normal text-gray-500">(서울)</span></td>
                                    <td class="p-2">호텔외식경영학부</td>
                                    <td class="p-2">
                                        <div class="font-bold text-blue-600">학생부교과: 2.1 ~ 2.3등급</div>
                                        <div class="text-xs text-gray-600 mt-1">
                                            * 창의인재(종합-면접형): 3.0등급 내외<br>
                                            * 면접 비중이 높음
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="p-2 font-bold">경기대학교<br><span class="text-xs font-normal text-gray-500">(수원/서울)</span></td>
                                    <td class="p-2">외식조리전공</td>
                                    <td class="p-2">
                                        <div class="text-gray-800">교과: 2.8 ~ 3.2등급</div>
                                        <div class="text-xs text-gray-600 mt-1">
                                            * 종합전형: 3.5등급 전후까지 합격 사례<br>
                                            * 실기 위주보다는 학업 역량 중시
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Specialized Universities -->
                <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <div class="bg-gray-100 px-4 py-3 border-b border-gray-200 font-bold text-lg flex justify-between items-center">
                        <span>🔪 조리 특성화/전문대학교</span>
                        <span class="text-xs font-normal text-gray-500 bg-white px-2 py-1 rounded border">실무 중심</span>
                    </div>
                    <div class="p-4">
                        <table class="w-full text-sm">
                            <thead class="bg-gray-50 text-gray-700">
                                <tr>
                                    <th class="p-2 text-left w-1/4">대학명</th>
                                    <th class="p-2 text-left w-1/4">학과</th>
                                    <th class="p-2 text-left w-1/2">합격 등급 / 특징</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                <tr>
                                    <td class="p-2 font-bold">우송대학교<br><span class="text-xs font-normal text-gray-500">(대전)</span></td>
                                    <td class="p-2">외식조리학부<br>(글로벌조리 등)</td>
                                    <td class="p-2">
                                        <div class="font-bold text-green-600">교과: 3.6 ~ 4.0등급</div>
                                        <div class="text-xs text-gray-600 mt-1">
                                            * 종합(면접형): 4.0 ~ 5.0등급까지 다양<br>
                                            * 영어 수업 가능한 글로벌 전형 별도 운영
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="p-2 font-bold" style="background-color: #fff8e1;">배화여자대학교<br><span class="text-xs font-normal text-gray-500">(서울 종로)</span></td>
                                    <td class="p-2" style="background-color: #fff8e1;">조리학과 K-푸드전공<br>외식조리디저트전공</td>
                                    <td class="p-2" style="background-color: #fff8e1;">
                                        <div class="font-bold text-orange-600">평균 4.2 ~ 4.8등급</div>
                                        <div class="text-xs text-gray-800 mt-1">
                                            * <strong>K-푸드(구 전통조리)</strong>: 평균 4.8 / 최저 6.5<br>
                                            * <strong>외식디저트</strong>: 평균 4.2 / 최저 5.1<br>
                                            * 서울권 유일 전통조리 특화, 취업률 우수
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="p-2 font-bold">한국관광대<br><span class="text-xs font-normal text-gray-500">(이천)</span></td>
                                    <td class="p-2">호텔조리과</td>
                                    <td class="p-2">
                                        <div class="text-gray-800">평균 4.5등급 (최저 7등급대)</div>
                                        <div class="text-xs text-gray-600 mt-1">
                                            * 면접 비중이 매우 높음 (성적 낮아도 도전 가능)<br>
                                            * 유학 및 해외 취업 프로그램 우수
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="p-2 font-bold">대림대학교<br><span class="text-xs font-normal text-gray-500">(안양)</span></td>
                                    <td class="p-2">호텔조리과</td>
                                    <td class="p-2">
                                        <div class="text-gray-800">일반고: 4.5 ~ 5.0등급</div>
                                        <div class="text-xs text-gray-600 mt-1">
                                            * 특성화고 전형은 등급 컷이 더 높음<br>
                                            * 수도권 접근성 좋아 경쟁률 상승세
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Regional Universities (Gimpo/Incheon/Seoul Outskirts) -->
                <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <div class="bg-gray-100 px-4 py-3 border-b border-gray-200 font-bold text-lg flex justify-between items-center">
                        <span>🚌 김포/인천/서울근교 전문대</span>
                        <span class="text-xs font-normal text-gray-500 bg-white px-2 py-1 rounded border">통학 가능 추천</span>
                    </div>
                    <div class="p-4">
                        <table class="w-full text-sm">
                            <thead class="bg-gray-50 text-gray-700">
                                <tr>
                                    <th class="p-2 text-left w-1/4">대학명</th>
                                    <th class="p-2 text-left w-1/4">학과</th>
                                    <th class="p-2 text-left w-1/2">합격 등급 / 특징 (2025 기준)</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                <tr>
                                    <td class="p-2 font-bold">김포대학교<br><span class="text-xs font-normal text-gray-500">(김포)</span></td>
                                    <td class="p-2">호텔제과제빵과<br>호텔조리과</td>
                                    <td class="p-2">
                                        <div class="font-bold text-gray-700">평균 3.8 ~ 5.3등급</div>
                                        <div class="text-xs text-gray-600 mt-1">
                                            * <strong>제과제빵</strong>: 수시1차 평균 3.8 / 2차 5.3<br>
                                            * 김포 거주 학생 통학 최적, 실습 위주 교육
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="p-2 font-bold">부천대학교<br><span class="text-xs font-normal text-gray-500">(부천)</span></td>
                                    <td class="p-2">호텔외식조리학과</td>
                                    <td class="p-2">
                                        <div class="font-bold text-gray-700">평균 4.0 ~ 5.8등급</div>
                                        <div class="text-xs text-gray-600 mt-1">
                                            * <strong>수시 1차</strong>: 일반고 평균 4.0 / 최저 6.0<br>
                                            * 김포/인천 지역 학생 선호도 높음
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="p-2 font-bold">경인여자대학교<br><span class="text-xs font-normal text-gray-500">(인천 계양)</span></td>
                                    <td class="p-2">호텔조리베이커리과</td>
                                    <td class="p-2">
                                        <div class="font-bold text-gray-700">평균 5.2등급 (수시1차)</div>
                                        <div class="text-xs text-gray-600 mt-1">
                                            * 계양구 위치 주차/교통 편리<br>
                                            * 최우수 1개 학기 성적만 반영 (전략 지원 가능)
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="p-2 font-bold">유한대학교<br><span class="text-xs font-normal text-gray-500">(부천/서울경계)</span></td>
                                    <td class="p-2">호텔조리전공</td>
                                    <td class="p-2">
                                        <div class="font-bold text-gray-700">평균 5.0 ~ 6.2등급</div>
                                        <div class="text-xs text-gray-600 mt-1">
                                            * <strong>수시 2차</strong>: 평균 5.0 / 최저 4.1<br>
                                            * 1호선 역곡/온수역 인접으로 서울 통학 용이
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Detailed Strategy (Academics & Certifications) -->
            <div class="bg-orange-50 p-6 rounded-lg border border-orange-100 mb-8">
                <h3 class="font-bold text-xl mb-6 text-center text-orange-800">🚀 합격을 위한 필수 준비 전략</h3>
                
                <div class="grid md:grid-cols-2 gap-6">
                    <!-- Strategy 1: Student Record -->
                    <div class="bg-white p-5 rounded shadow-sm border border-orange-100">
                        <div class="text-center mb-3">
                            <span class="text-3xl">📝</span>
                            <h4 class="font-bold text-lg mt-2">생활기록부 (생기부) 관리</h4>
                        </div>
                        <ul class="text-sm text-gray-700 space-y-2">
                            <li><strong>진로 활동:</strong> '요리' 하나에만 국한되지 말고, '식품 영양', '경영', '푸드 테크' 등 확장된 관심을 보여주세요.</li>
                            <li><strong>세특(세부능력 및 특기사항):</strong> 일반 교과목 수행평가에서도 조리 관련 주제를 녹여내세요. (예: 화학 시간에 식재료의 변화 원리 탐구)</li>
                            <li><strong>자율/동아리:</strong> 단순히 '요리했다'가 아니라, '어떤 문제를 해결하기 위해 어떤 요리를 기획했는지' 과정이 중요합니다.</li>
                        </ul>
                    </div>

                    <!-- Strategy 2: Certifications & Practical -->
                    <div class="bg-white p-5 rounded shadow-sm border border-orange-100">
                        <div class="text-center mb-3">
                            <span class="text-3xl">🔪</span>
                            <h4 class="font-bold text-lg mt-2">자격증 & 실무 능력</h4>
                        </div>
                        <ul class="text-sm text-gray-700 space-y-2">
                            <li><strong>다자격증 취득:</strong> 한식, 양식, 중식, 제과, 제빵 등 다양한 자격증은 성실함과 전공 적합성을 증명하는 가장 확실한 지표입니다.</li>
                            <li><strong>대회 수상:</strong> 교내외 요리 대회 수상 경력은 실기 능력을 객관적으로 입증할 수 있는 강력한 무기입니다.</li>
                            <li><strong>포트폴리오:</strong> 자신이 만든 요리 사진, 레시피 개발 과정 등을 기록한 포트폴리오는 면접 시 큰 가산점이 됩니다.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Deep Interview Master Class -->
            <div class="bg-indigo-900 rounded-xl overflow-hidden shadow-2xl mb-12 text-white">
                <div class="p-8 text-center border-b border-indigo-800 bg-gradient-to-r from-purple-900 to-indigo-900">
                    <span class="inline-block px-3 py-1 bg-yellow-400 text-indigo-900 rounded-full text-xs font-bold mb-3">합격의 열쇠</span>
                    <h3 class="text-3xl font-bold mb-2">💎 심층 면접 마스터 클래스</h3>
                    <p class="text-indigo-200">단순한 암기가 아닌, '나'만의 스토리를 완성하는 심층 전략 가이드</p>
                </div>

                <div class="p-8 space-y-10 bg-indigo-50">
                    
                    <!-- 1. Key Competencies -->
                    <div class="grid md:grid-cols-3 gap-6">
                        <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-indigo-600 text-gray-800">
                            <div class="text-3xl mb-3">🔥</div>
                            <h4 class="font-bold text-lg mb-2">진정성 (Sincerity)</h4>
                            <p class="text-sm text-gray-600">화려한 스펙보다 중요한 것은 요리를 향한 꾸준한 관심과 태도입니다. 솔직한 나의 이야기를 들려주세요.</p>
                        </div>
                        <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-600 text-gray-800">
                            <div class="text-3xl mb-3">💡</div>
                            <h4 class="font-bold text-lg mb-2">전문성 (Knowledge)</h4>
                            <p class="text-sm text-gray-600">푸드테크, 비건 등 최신 트렌드에 대한 본인의 견해를 정리하여 준비된 인재임을 증명하세요.</p>
                        </div>
                        <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-pink-600 text-gray-800">
                            <div class="text-3xl mb-3">🌱</div>
                            <h4 class="font-bold text-lg mb-2">잠재력 (Potential)</h4>
                            <p class="text-sm text-gray-600">현재의 실력보다 중요한 것은 입학 후 어떻게 성장할 것인가에 대한 구체적인 비전입니다.</p>
                        </div>
                    </div>

                    <!-- 2. Basic Q&A -->
                    <div>
                        <h4 class="flex items-center text-xl font-bold text-indigo-900 mb-4">
                            <span class="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                            필수 기본 질문 공략
                        </h4>
                        <div class="space-y-4">
                            <div class="bg-white p-5 rounded border border-gray-200">
                                <p class="font-bold text-lg mb-2 text-gray-800">Q. 자기소개를 해보세요.</p>
                                <div class="bg-gray-50 p-3 rounded text-sm text-gray-600 border-l-2 border-indigo-400">
                                    <strong>💡 답변 포인트:</strong> "저는 OO한 요리사입니다"로 시작하여 자신의 강점(성실함, 도전정신 등)을 경험과 연결하세요. <br>
                                    예) 좋아하는 식재료에 비유하거나, 요리를 시작하게 된 결정적인 계기를 짧은 스토리로 전달.
                                </div>
                            </div>
                            <div class="bg-white p-5 rounded border border-gray-200">
                                <p class="font-bold text-lg mb-2 text-gray-800">Q. 우리 대학(학과)에 지원한 이유는?</p>
                                <div class="bg-gray-50 p-3 rounded text-sm text-gray-600 border-l-2 border-indigo-400">
                                    <strong>💡 답변 포인트:</strong> 학교 홈페이지를 정독하세요. 해당 학교만의 커리큘럼, 동아리, 교수진, 인재상을 언급하며 "이 학교여야만 하는 이유"를 구체적으로 어필해야 합니다.
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 3. Trend Q&A -->
                    <div>
                        <h4 class="flex items-center text-xl font-bold text-indigo-900 mb-4">
                            <span class="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                            시사 & 트렌드 심층 질문 (변별력 UP)
                        </h4>
                        <div class="grid md:grid-cols-2 gap-4">
                            <div class="bg-white p-5 rounded border border-gray-200 hover:shadow-md transition-shadow">
                                <span class="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded mb-2 inline-block">필수 키워드</span>
                                <p class="font-bold text-gray-800 mb-2">Q. 푸드테크(FoodTech) 위기에 대해 어떻게 생각하나요?</p>
                                <p class="text-xs text-gray-500 mb-3">#로봇조리 #대체식품 #개인맞춤형</p>
                                <p class="text-sm text-gray-700">
                                    "단순한 기술 도입을 넘어, 로봇이 효율성을 높여줄 때 인간 셰프는 '창의성'과 '감성'에 더 집중할 수 있다는 긍정적인 상호보완 관계를 강조합니다."
                                </p>
                            </div>
                            <div class="bg-white p-5 rounded border border-gray-200 hover:shadow-md transition-shadow">
                                <span class="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded mb-2 inline-block">필수 키워드</span>
                                <p class="font-bold text-gray-800 mb-2">Q. 비건(Vegan) & 지속가능한 미식</p>
                                <p class="text-xs text-gray-500 mb-3">#가치소비 #환경보호 #식물성단백질</p>
                                <p class="text-sm text-gray-700">
                                    "비건은 일시적 유행이 아닌 필수 흐름입니다. 채소 본연의 맛을 살리는 조리법을 연구하여, 비건이 아니더라도 맛있게 즐길 수 있는 메뉴를 개발하고 싶습니다."
                                </p>
                            </div>
                            <div class="bg-white p-5 rounded border border-gray-200 hover:shadow-md transition-shadow">
                                <span class="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded mb-2 inline-block">필수 키워드</span>
                                <p class="font-bold text-gray-800 mb-2">Q. HMR (가정간편식) 시장의 성장</p>
                                <p class="text-xs text-gray-500 mb-3">#RMR #밀키트 #편의성vs퀄리티</p>
                                <p class="text-sm text-gray-700">
                                    "HMR은 셰프의 요리를 대중화하는 기회입니다. 영양 불균형 문제를 해결할 수 있는 '프리미엄 건강 간편식'을 개발해보고 싶다는 포부를 밝히세요."
                                </p>
                            </div>
                            <div class="bg-white p-5 rounded border border-gray-200 hover:shadow-md transition-shadow">
                                <span class="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded mb-2 inline-block">필수 키워드</span>
                                <p class="font-bold text-gray-800 mb-2">Q. 저속노화 식단 (건강 트렌드)</p>
                                <p class="text-xs text-gray-500 mb-3">#혈당관리 #저당 #건강한탄수화물</p>
                                <p class="text-sm text-gray-700">
                                    "건강은 외식업의 핵심 가치입니다. 자극적인 맛보다는 기본 식재료의 조화를 통해 맛과 건강을 모두 잡는 레시피를 연구하겠습니다."
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- 4. Final Tips -->
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h4 class="font-bold text-lg text-yellow-800 mb-3">🚀 면접관의 마음을 사로잡는 마지막 팁!</h4>
                        <ul class="list-disc list-inside text-sm text-gray-700 space-y-2">
                            <li><strong>두괄식 답변:</strong> 결론부터 말하고 이유를 설명하세요. (면접관은 하루 종일 수많은 학생을 만납니다.)</li>
                            <li><strong>아이컨택 & 미소:</strong> 답변 내용을 까먹더라도, 자신감 있는 미소와 눈맞춤은 잃지 마세요. 태도 점수가 큽니다.</li>
                            <li><strong>마지막 한마디:</strong> 꼭 준비하세요. "떨어지더라도 이 학교를 목표로 재도전하겠다"는 패기나, 면접 기회에 대한 감사를 진심으로 전하세요.</li>
                        </ul>
                    </div>

                </div>
            </div>

            <div class="mt-8 p-4 bg-gray-100 rounded text-sm text-gray-600 text-center">
                ※ 위 합격 정보는 세종요리제과기술학원 입시연구소에서 수집 분석한 자료입니다.<br>
                매년 달라지는 입시 요강을 반드시 대학 홈페이지에서 재확인하시기 바랍니다.
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
        //     router.push('/info/university');
        // }
        setShowSuccessModal(true);
    };

    const handleConfirmSuccess = () => {
        setShowSuccessModal(false);
        router.push('/info/university');
    };

    const [showSuccessModal, setShowSuccessModal] = useState(false);

    return (
        <div className="flex-grow">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 min-h-[600px]">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-4 text-black">대학진학 {isEdit && <span className="text-sm text-red-500 font-normal ml-2">- 수정 모드</span>}</h1>
                    <div className="border-b-2 border-black pb-2"></div>
                </div>

                <div className="font-sans">
                    {isEdit ? (
                        <div className="editor-wrapper min-h-[400px]">
                            <Editor content={content} onChange={setContent} />
                            <div className="flex justify-end gap-2 mt-4">
                                <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">저장하기</button>
                                <button onClick={() => router.push('/info/university')} className="bg-gray-500 text-white px-6 py-2 rounded font-bold hover:bg-gray-600">취소</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div dangerouslySetInnerHTML={{ __html: content }} />
                            <ActionButtons
                                listLink="/info/schedule"
                                editLink="/info/university?mode=edit"
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
