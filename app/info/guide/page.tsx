'use client';

import InfoSidebar from "@/components/InfoSidebar";
import ActionButtons from "@/components/ActionButtons";
import Editor from "@/components/Editor";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";

function Content() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const isEdit = searchParams.get('mode') === 'edit';

    const [content, setContent] = useState(`
        <div class="font-sans">
            <!-- Image -->
            <div style="text-align: center; margin-bottom: 30px;">
                <img src="/img_up/shop_pds/sejongcook/farm/p31583999288.png" alt="제과제빵 자격시험" style="max-width: 100%;" />
            </div>

            <!-- Intro -->
            <div style="margin-bottom: 30px;">
                <h3 class="text-xl font-bold border-l-4 border-orange-500 pl-3 mb-3">제과,제빵사란?</h3>
                <div class="bg-orange-50 p-6 rounded-lg text-gray-700 leading-relaxed">
                    <p class="mb-4 text-lg font-bold text-center">
                        식품제조분야에서 종사하는 일반 제과제빵사는 크게 <span class="text-orange-600">2가지로 구분</span>됩니다.
                    </p>
                    <p class="mb-2">
                        케이크, 파이 및 기타 밀가루 반죽제품을 제조하거나 장식하는 사람을 <strong>"제과사"</strong>라고 하며, 
                        여러가지 곡식가루로 빵을 전문으로 만드는 사람을 <strong>"제빵사"</strong>라고 합니다.
                    </p>
                    <p class="mb-2">
                        비슷한 재료와 기구, 도구를 사용한다는 점에서 비슷하다고 할 수 있습니다.
                    </p>
                    <p>
                        기능사 자격 검정 시험은 한국기술자격검정원에서 주관하여 필기와 실기로 나누어 월 4회정도 실시하며, 
                        98년 7월부터 필기시험면제기간이 2년으로 연장되었습니다. 
                        또한 99년 5월 부터는 제과기능사와 제빵기능사의 필기시험이 통합 시행되고 있습니다.
                    </p>
                </div>
            </div>

            <!-- Baking Craftsman -->
            <div style="margin-bottom: 40px;">
                <h3 class="text-xl font-bold border-l-4 border-orange-500 pl-3 mb-3">제빵 기능사</h3>
                
                <div class="mb-4">
                    <p class="text-gray-700 bg-gray-50 p-4 rounded">
                        제빵제품 제조에 필요한 재료의 배합표 작성, 재료 평량을 하고 각종 제빵용 기계및 기구를 사용하여 반죽, 발효, 성형, 굽기 등의 공정을 거쳐 각종 빵류를 만드는 업무 수행
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-white border rounded p-4">
                        <h4 class="font-bold text-orange-600 mb-2">⭐ 시행처</h4>
                        <p>한국산업인력관리공단</p>
                    </div>
                    <div class="bg-white border rounded p-4">
                        <h4 class="font-bold text-orange-600 mb-2">⭐ 관련학과</h4>
                        <p>고등학교 식품 가공학과, 대학의 조리학과 및 제과제빵학과</p>
                    </div>
                    <div class="bg-white border rounded p-4">
                        <h4 class="font-bold text-orange-600 mb-2">⭐ 실기과목</h4>
                        <p>제빵작업 (작업형 3~4시간 정도)</p>
                    </div>
                        <div class="bg-white border rounded p-4">
                        <h4 class="font-bold text-orange-600 mb-2">⭐ 필기과목</h4>
                        <ul class="list-disc list-inside text-sm">
                            <li>제빵이론</li>
                            <li>재료과학</li>
                            <li>영양학</li>
                            <li>식품위생학</li>
                        </ul>
                    </div>
                        <div class="bg-white border rounded p-4 md:col-span-2">
                        <h4 class="font-bold text-orange-600 mb-2">⭐ 합격기준</h4>
                        <p>100점 만점에 60점이상 (응시자격 제한없음)</p>
                    </div>
                </div>
            </div>

                <div class="border-t border-gray-200 my-8"></div>

            <!-- Confectionery Craftsman -->
            <div style="margin-bottom: 40px;">
                <h3 class="text-xl font-bold border-l-4 border-orange-500 pl-3 mb-3">제과 기능사</h3>
                
                <div class="mb-4">
                        <p class="text-gray-700 bg-gray-50 p-4 rounded">
                        각 제과제품 제조에 필요한 재료의 배합표 작성, 재료 평량을 하고 각종 제과용 기계 및 기구를 사용하며 성형, 굽기, 장식, 포장 등의 공정을 거쳐 각종 제과제품을 만다는 업무 수행
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-white border rounded p-4">
                        <h4 class="font-bold text-orange-600 mb-2">⭐ 시행처</h4>
                        <p>한국산업인력관리공단</p>
                    </div>
                    <div class="bg-white border rounded p-4">
                        <h4 class="font-bold text-orange-600 mb-2">⭐ 관련학과</h4>
                        <p>고등학교 식품 가공학과, 대학의 조리학과 및 제과제빵학과</p>
                    </div>
                    <div class="bg-white border rounded p-4">
                        <h4 class="font-bold text-orange-600 mb-2">⭐ 실기과목</h4>
                        <p>제과작업 (작업형 2시간 정도)</p>
                    </div>
                        <div class="bg-white border rounded p-4">
                        <h4 class="font-bold text-orange-600 mb-2">⭐ 필기과목</h4>
                        <ul class="list-disc list-inside text-sm">
                            <li>제과이론</li>
                            <li>재료과학</li>
                            <li>영양학</li>
                            <li>식품위생학</li>
                        </ul>
                    </div>
                        <div class="bg-white border rounded p-4 md:col-span-2">
                        <h4 class="font-bold text-orange-600 mb-2">⭐ 합격기준</h4>
                        <p>100점 만점에 60점이상</p>
                    </div>
                </div>
            </div>

            <div class="border-t border-gray-200 my-8"></div>

            <!-- Cook Craftsman (Korean, Western, Chinese, Japanese) -->
            <div style="margin-bottom: 40px;">
                <h3 class="text-xl font-bold border-l-4 border-orange-500 pl-3 mb-3">조리 기능사 (한식, 양식, 중식, 일식)</h3>
                <div class="mb-4">
                    <p class="text-gray-700 bg-gray-50 p-4 rounded">
                        지급된 재료를 가지고 요구하는 작품을 시험 시간 내에 1인분을 만들어 내는 작업을 평가합니다.
                        위생상태(개인 및 조리과정), 조리기술(기구취급, 동작, 순서, 재료다듬기 방법), 작품의 평가(맛, 색, 모양, 그릇 담기 등), 정리정돈 등을 종합적으로 평가합니다.
                    </p>
                </div>

                <!-- 1. Korean -->
                <div class="mb-8">
                    <h4 class="text-lg font-bold text-gray-800 mb-2 flex items-center">
                        <span class="bg-orange-100 text-orange-700 px-2 py-1 rounded mr-2 text-sm">한식</span> 한식 조리기능사
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-white border rounded p-4">
                            <h4 class="font-bold text-orange-600 mb-2">⭐ 실기 메뉴 (33가지 중 2가지 출제)</h4>
                            <p class="text-sm text-gray-600 leading-relaxed">
                                비빔밥, 콩나물밥, 장국죽, 완자탕, 생선찌개, 두부젓국찌개, 제육구이, 너비아니구이, 더덕구이, 생선양념구이, 북어구이, 섭산적, 화양적, 지짐누름적, 풋고추전, 표고전, 생선전, 육원전, 두부조림, 홍합초, 겨자채, 도라지생채, 무생채, 더덕생채, 육회, 미나리강회, 탕평채, 잡채, 칠절판, 오징어볶음, 재료썰기, 배추김치, 오이소박이
                            </p>
                        </div>
                        <div class="bg-white border rounded p-4">
                            <h4 class="font-bold text-orange-600 mb-2">⭐ 검정 방법</h4>
                            <ul class="list-disc list-inside text-sm">
                                <li>필기: 객관식 4지 택일형 (60문항, 60분)</li>
                                <li>실기: 작업형 (약 70분 정도)</li>
                                <li>합격기준: 100점 만점에 60점 이상</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- 2. Western -->
                <div class="mb-8">
                    <h4 class="text-lg font-bold text-gray-800 mb-2 flex items-center">
                        <span class="bg-orange-100 text-orange-700 px-2 py-1 rounded mr-2 text-sm">양식</span> 양식 조리기능사
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-white border rounded p-4">
                            <h4 class="font-bold text-orange-600 mb-2">⭐ 실기 메뉴 (30가지 중 2가지 출제)</h4>
                            <p class="text-sm text-gray-600 leading-relaxed">
                                스페니쉬오믈렛, 치즈오믈렛, 브라운스톡, 비프콘소메, 미네스트로니수프, 포테이토크림수프, 프렌치어니언수프, 포테이토샐러드, 월도프샐러드, 사우전아일랜드드레싱, BLT샌드위치, 햄버거샌드위치, 브라운그래비소스, 타르타르소스, 홀렌다이즈소스, 이탈리안미트소스, 서로인스테이크, 치킨알라킹, 치킨커틀렛, 비프스튜, 살리스버리스테이크, 바베큐폭찹, 미트소스스파게티, 까르보나라스파게티, 토마토소스해산물스파게티, 참치타르타르, 쉬림프카나페
                            </p>
                        </div>
                        <div class="bg-white border rounded p-4">
                            <h4 class="font-bold text-orange-600 mb-2">⭐ 검정 방법</h4>
                            <ul class="list-disc list-inside text-sm">
                                <li>필기: 양식 재료관리, 음식조리 및 위생관리</li>
                                <li>실기: 작업형 (약 70분 정도)</li>
                                <li>합격기준: 100점 만점에 60점 이상</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- 3. Chinese -->
                <div class="mb-8">
                    <h4 class="text-lg font-bold text-gray-800 mb-2 flex items-center">
                        <span class="bg-orange-100 text-orange-700 px-2 py-1 rounded mr-2 text-sm">중식</span> 중식 조리기능사
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-white border rounded p-4">
                            <h4 class="font-bold text-orange-600 mb-2">⭐ 실기 메뉴 (20가지 중 2가지 출제)</h4>
                            <p class="text-sm text-gray-600 leading-relaxed">
                                탕수육, 난자완스, 고추잡채, 라조기, 깐풍기, 마파두부, 양장피잡채, 해파리냉채, 오징어냉채, 홍쇼두부, 새우볶음밥, 짜춘권, 유니짜장면, 경장육사, 새우케찹볶음, 부추잡채, 채소볶음, 옥수수빠스, 고구마빠스, 울면
                            </p>
                        </div>
                         <div class="bg-white border rounded p-4">
                            <h4 class="font-bold text-orange-600 mb-2">⭐ 검정 방법</h4>
                            <ul class="list-disc list-inside text-sm">
                                <li>필기: 중식 재료관리, 음식조리 및 위생관리</li>
                                <li>실기: 작업형 (약 60분 정도)</li>
                                <li>합격기준: 100점 만점에 60점 이상</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- 4. Japanese -->
                <div class="mb-8">
                    <h4 class="text-lg font-bold text-gray-800 mb-2 flex items-center">
                        <span class="bg-orange-100 text-orange-700 px-2 py-1 rounded mr-2 text-sm">일식</span> 일식 조리기능사
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div class="bg-white border rounded p-4">
                            <h4 class="font-bold text-orange-600 mb-2">⭐ 실기 메뉴 (19가지 중 2가지 출제)</h4>
                            <p class="text-sm text-gray-600 leading-relaxed">
                                갑오징어명란무침, 도미술찜, 도미조림, 문어초회, 쇠고기덮밥, 쇠고기간장구이, 생선모둠초밥, 삼치소금구이, 전복버터구이, 달걀말이, 튀김두부, 해삼초회, 참치김초밥, 김초밥, 옥돔구이, 우동조림, 튀김, 된장국
                            </p>
                        </div>
                        <div class="bg-white border rounded p-4">
                            <h4 class="font-bold text-orange-600 mb-2">⭐ 검정 방법</h4>
                            <ul class="list-disc list-inside text-sm">
                                <li>필기: 일식 재료관리, 음식조리 및 위생관리</li>
                                <li>실기: 작업형 (약 70분 정도)</li>
                                <li>합격기준: 100점 만점에 60점 이상</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div class="border-t border-gray-200 my-8"></div>

            <!-- Cook Industrial Engineer -->
            <div style="margin-bottom: 40px;">
                <h3 class="text-xl font-bold border-l-4 border-orange-500 pl-3 mb-3">조리 산업기사 (Industrial Engineer Cook)</h3>
                
                <div class="mb-4">
                        <p class="text-gray-700 bg-gray-50 p-4 rounded">
                        산업기사는 기능사보다 한 층 높은 숙련기능을 가지고 기술기초이론지식 또는 숙련과정에 관한 복합적인 기술지식을 가지고 기능인력의 지도, 현장훈련, 현장관리 등의 중간 관리자의 업무를 수행합니다.
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-white border rounded p-4">
                        <h4 class="font-bold text-orange-600 mb-2">⭐ 응시자격</h4>
                        <ul class="list-disc list-inside text-sm leading-relaxed">
                            <li>기능사(타 산업기사, 타 자격 포함) 이상 + 실무경력 1년 이상</li>
                            <li>관련학과 2,3년제 전문대학 졸업자 및 졸업예정자</li>
                            <li>관련학과 4년제 대학 졸업자 및 졸업예정자</li>
                            <li>실무경력 2년 이상</li>
                        </ul>
                    </div>
                     <div class="bg-white border rounded p-4">
                        <h4 class="font-bold text-orange-600 mb-2">⭐ 검정 방법</h4>
                        <p class="text-sm font-bold mb-1">[필기]</p>
                        <ul class="list-disc list-inside text-sm mb-2">
                            <li>식품위생 및 법규, 공중보건, 식품학, 조리이론 및 원가계산</li>
                            <li>객관식 4지 택일형 과목당 20문항 (과목당 30분)</li>
                        </ul>
                        <p class="text-sm font-bold mb-1">[실기]</p>
                        <ul class="list-disc list-inside text-sm">
                            <li>조리작업 (작업형 2시간 정도)</li>
                            <li>100점 만점에 60점 이상</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="border-t border-gray-200 my-8"></div>

            <!-- Master Cook -->
            <div style="margin-bottom: 40px;">
                <h3 class="text-xl font-bold border-l-4 border-orange-500 pl-3 mb-3">조리 기능장 (Master Cook)</h3>
                
                <div class="mb-4">
                        <p class="text-gray-700 bg-gray-50 p-4 rounded">
                        조리기능장은 최고급 수준의 숙련기능을 가지고 산업현장에서 작업 관리, 소속 기능 인력의 지도 및 감독, 현장훈련, 경영계층과 생산계층을 유기적으로 결합시켜 주는 현장의 중간관리 등의 업무를 수행합니다.
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-white border rounded p-4">
                        <h4 class="font-bold text-orange-600 mb-2">⭐ 응시자격</h4>
                        <ul class="list-disc list-inside text-sm leading-relaxed">
                            <li>산업기사 등급 이상의 자격을 취득한 후 실무경력 5년 이상</li>
                            <li>기능사 자격을 취득한 후 실무경력 7년 이상</li>
                            <li>실무경력 9년 이상</li>
                            <li>동일 및 유사 직무분야의 다른 종목 기능장 등급 자격 취득자</li>
                        </ul>
                    </div>
                     <div class="bg-white border rounded p-4">
                        <h4 class="font-bold text-orange-600 mb-2">⭐ 검정 방법</h4>
                        <p class="text-sm font-bold mb-1">[필기]</p>
                        <ul class="list-disc list-inside text-sm mb-2">
                            <li>공중보건, 식품위생 및 법규, 식품학, 조리이론 및 급식관리</li>
                            <li>객관식 4지 택일형 60문항 (60분)</li>
                        </ul>
                        <p class="text-sm font-bold mb-1">[실기]</p>
                        <ul class="list-disc list-inside text-sm">
                            <li>조리작업 (작업형 5시간 정도)</li>
                            <li>100점 만점에 60점 이상</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `);

    const handleSave = () => {
        if (confirm("저장하시겠습니까?")) {
            alert("저장되었습니다. (데모)");
            router.push('/info/guide');
        }
    };

    return (
        <div className="container_2" style={{ flexGrow: 1 }}>
            <div className="sub_title_381227_">
                <h1 className="text-2xl font-bold mb-4">자격시험안내 {isEdit && <span className="text-sm text-red-500 font-normal ml-2">- 수정 모드</span>}</h1>
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
                            <button onClick={() => router.push('/info/guide')} className="bg-gray-500 text-white px-6 py-2 rounded font-bold hover:bg-gray-600">취소</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div dangerouslySetInnerHTML={{ __html: content }} />
                        <ActionButtons
                            listLink="/info/schedule"
                            editLink="/info/guide?mode=edit"
                            onDelete={() => alert("삭제 권한이 없습니다.")}
                        />
                    </>
                )}
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
