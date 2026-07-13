'use client';


import ActionButtons from "@/components/ActionButtons";
import Editor from "@/components/Editor";
import SuccessModal from "@/components/SuccessModal";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";

import BakingSubNav from "@/components/BakingSubNav";

function CakeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isEdit = searchParams.get('mode') === 'edit';

  // Initial content state (from sub0202.html)
  const [content, setContent] = useState(`
        <div style="text-align:center; margin-bottom:30px;">
             <img src="/img_up/shop_pds/sejongcook/farm/cake_design_header.png" alt="케익디자인(데코레이션)" style="width:100%; border-radius:16px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); object-fit:cover; max-height:450px;">
        </div>
        <div style="font-family:'Noto Sans KR', sans-serif; line-height:1.6;">
             <div style="margin-top:20px; margin-bottom:10px;">
                <p style="font-size:18px; font-weight:bold; border-left:4px solid #ff8c00; padding-left:10px;">수업과정</p>
            </div>
            <div style="margin:0 30px 20px 30px; font-size:14px;">
                <p>주 1회 금요일(시간대 조율가능)</p>
            </div>

            <div style="margin-top:20px; margin-bottom:10px;">
                <p style="font-size:18px; font-weight:bold; border-left:4px solid #ff8c00; padding-left:10px;">수업내용</p>
            </div>

            <style>
                .tg  {border-collapse:collapse;border-spacing:0; width: 100%;}
                .tg td{font-family:Arial, sans-serif;font-size:14px;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:#ccc;}
                .tg th{font-family:Arial, sans-serif;font-size:14px;font-weight:normal;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:#ccc;}
                .tg .tg-29js{font-weight:bold;background-color:#ffffc7;text-align:center;vertical-align:middle}
                .tg .tg-9wq8{text-align:center;vertical-align:middle}
                .tg .tg-amri{font-weight:bold;font-size:16px;background-color:#ffce93;text-align:center;vertical-align:middle}
            </style>

            <table class="tg">
                <colgroup>
                    <col style="width: 15%">
                    <col style="width: 35%">
                    <col style="width: 15%">
                    <col style="width: 35%">
                </colgroup>
                <tbody>
                  <tr>
                    <th class="tg-amri" colspan="2">1 개 월</th>
                    <th class="tg-amri" colspan="2">2 개 월</th>
                  </tr>
                  <tr>
                    <td class="tg-29js" rowspan="2">1주차</td>
                    <td class="tg-9wq8">하트케익</td>
                    <td class="tg-29js" rowspan="2">1주차</td>
                    <td class="tg-9wq8">스위트케잌</td>
                  </tr>
                  <tr>
                    <td class="tg-9wq8">- 별, 드롭플라워, 스타플라워, 지그재그, 리본</td>
                    <td class="tg-9wq8">- 바스켓, 드롭플라워, 선긋기</td>
                  </tr>
                  <tr>
                    <td class="tg-29js" rowspan="2">2주차</td>
                    <td class="tg-9wq8">악어, 토끼</td>
                    <td class="tg-29js" rowspan="2">2주차</td>
                    <td class="tg-9wq8">풍선든 곰케잌</td>
                  </tr>
                  <tr>
                    <td class="tg-9wq8">- 병, 기둥, 도트점, 선긋기</td>
                    <td class="tg-9wq8">- 별, 곰, 풍선, 선긋기</td>
                  </tr>
                  <tr>
                    <td class="tg-29js" rowspan="2">3주차</td>
                    <td class="tg-9wq8">선인장, 자동차</td>
                    <td class="tg-29js" rowspan="2">3주차</td>
                    <td class="tg-9wq8">과일케잌</td>
                  </tr>
                  <tr>
                    <td class="tg-9wq8">- 드롭플라워, 별, 도트점, 바다기둥, 꽃</td>
                    <td class="tg-9wq8">- 바스켓, 바나나, 포도, 체리, 잎사귀</td>
                  </tr>
                  <tr>
                    <td class="tg-29js">4주차</td>
                    <td class="tg-9wq8">소년, 소녀</td>
                    <td class="tg-29js">4주차</td>
                    <td class="tg-9wq8">하트케잌,  조개</td>
                  </tr>
                  <tr>
                    <th class="tg-amri" colspan="2">3 개 월</th>
                    <th class="tg-amri" colspan="2">4 개 월</th>
                  </tr>
                  <tr>
                    <td class="tg-29js" rowspan="2">1주차</td>
                    <td class="tg-9wq8">데이지 케잌</td>
                    <td class="tg-29js" rowspan="2">1주차</td>
                    <td class="tg-9wq8">로얄아이싱(페츄니아케잌)</td>
                  </tr>
                  <tr>
                    <td class="tg-9wq8">- 데이지 꽃, 드롭플라워, 바스켓 로프</td>
                    <td class="tg-9wq8">- 페츄니아, 백합</td>
                  </tr>
                  <tr>
                    <td class="tg-29js" rowspan="2">2주차</td>
                    <td class="tg-9wq8">와일드로즈케잌</td>
                    <td class="tg-29js" rowspan="2">2주차</td>
                    <td class="tg-9wq8">캐릭터케잌</td>
                  </tr>
                  <tr>
                    <td class="tg-9wq8">- 와일드로즈, 꽃술</td>
                    <td class="tg-9wq8">- 곰, 블루클루</td>
                  </tr>
                  <tr>
                    <td class="tg-29js" rowspan="2">3주차</td>
                    <td class="tg-9wq8">카네이션케잌</td>
                    <td class="tg-29js" rowspan="2">3주차</td>
                    <td class="tg-9wq8">사각케잌</td>
                  </tr>
                  <tr>
                    <td class="tg-9wq8">- 카네이션, 비드, 러플레이스, 도트</td>
                    <td class="tg-9wq8">- 골프장, 무지개</td>
                  </tr>
                  <tr>
                    <td class="tg-29js" rowspan="2">4주차</td>
                    <td class="tg-9wq8">로즈케잌</td>
                    <td class="tg-29js" rowspan="2">4주차</td>
                    <td class="tg-9wq8" rowspan="2">바비인형</td>
                  </tr>
                  <tr>
                    <td class="tg-9wq8">- 장미, 패턴도트, 잎사귀</td>
                  </tr>
                </tbody>
            </table>
        </div>
    `);

  const handleSave = () => {
    if (confirm("저장하시겠습니까?")) {
      // alert("저장되었습니다. (데모)");
      // router.push('/course/cake');
      setShowSuccessModal(true);
    }
  };

  const handleConfirmSuccess = () => {
    setShowSuccessModal(false);
    router.push('/course/cake');
  };

  // State for Success Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  return (
    <div className="container_2" style={{ flexGrow: 1 }}>
      <div className="sub_title_381227_">
        <h1 className="text-2xl font-bold mb-4">케익디자인(데코레이션) {isEdit && <span className="text-sm text-red-500 font-normal ml-2">- 수정 모드</span>}</h1>
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
            <Editor content={content} onChange={setContent} />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">저장하기</button>
              <button onClick={() => router.push('/course/cake')} className="bg-gray-500 text-white px-6 py-2 rounded font-bold hover:bg-gray-600">취소</button>
            </div>
          </div>
        ) : (
          <>
            <div dangerouslySetInnerHTML={{ __html: content }} />

            {/* Action Buttons */}
            <ActionButtons
              listLink="/course"
              editLink="/course/cake?mode=edit"
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

export default function CakePage() {
  return (
    <div className="modern-container" style={{ padding: '40px 0' }}>
      <Suspense fallback={<div>Loading content...</div>}>
        <CakeContent />
      </Suspense>
    </div>
  );
}
