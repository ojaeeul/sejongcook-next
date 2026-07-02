import fitz  # PyMuPDF
import base64
import json
import urllib.request
import sys

def test_student_application():
    pdf_path = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/수강생 /수강생/CCF_000007.pdf"
    
    print("Opening PDF:", pdf_path)
    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        print("Failed to open PDF:", e)
        return

    prompt = """이 이미지는 요리학원의 수강생 등록 원서입니다. 
사진이 거꾸로(180도) 찍혀 있거나 옆으로 돌아가 있을 수 있으니, 글자 방향을 스스로 판단하여 이미지를 회전시킨 상태로 읽어주세요.
사용자가 직접 펜으로 적은 글씨와 펜으로 동그라미 친 부분을 완벽하게 인식해주세요.

[중요 지시사항: 2~3번 교차 검증]
이미지를 단번에 판단하지 말고, 2~3번에 걸쳐서 꼼꼼히 다시 읽고 확인하며 분석하세요.
특히 '수강생 본인 연락처'와 '부모님 연락처' 필드의 위치와 내용을 2~3번 확인하여 절대 헷갈리지 않게 정확히 추출하세요.

[데이터 추출 규칙 및 절대 주의사항]
1. 전화번호는 주소 필드에 절대 입력하지 마세요. 주소 란에 전화번호(예: 010-XXXX-XXXX)가 적혀 있다면, 해당 번호를 주소에서 완전히 삭제하고 순수 주소만 남기세요.
2. 주소 란이나 다른 곳에서 발견된 모든 전화번호는 반드시 '학생연락처'나 '부모연락처' 필드로 이동시키세요.
   - 번호 옆에 부, 모, 父, 母 등의 한글/한문이 있다면 '부모연락처'입니다.
   - 관계 표시가 없는 번호나 본인 번호는 '학생연락처'입니다.
3. 성명은 표의 맨 위 좌측 '성명' 란에 있는 이름을 추출합니다. 주소를 이름으로 착각해서는 절대 안 됩니다.
4. 글씨를 알아볼 수 없거나 비어있는 칸은 무조건 빈칸("")으로 처리하세요. 사진에 없는 내용을 지어내지 마세요. (No Hallucination)
5. 이름 끝에 마침표(.)나 특수기호가 잘못 인식되어 있다면 제외하고 순수 이름만 추출하세요.

다음 정보를 추출하여 정확히 아래 형식의 JSON 객체로 반환하세요. JSON 코드 블록 없이 순수 JSON 텍스트만 출력하세요.
{
    "성명": "이름 추출 (주소나 번호 절대 금지)",
    "성별": "남 또는 여 (동그라미 쳐진 것)",
    "생년월일": "YYYY년 M월 D일 형식",
    "주소": "순수 주소 텍스트만 (전화번호가 포함되어 있으면 전화번호는 완전히 제거할 것)",
    "학생연락처": "수강생 본인 연락처 (연락처 란 또는 주소 란에서 찾은 학생 본인의 번호)",
    "부모연락처": "부모 연락처 (연락처 란 또는 주소 란에서 찾은 부모님 번호)",
    "학교": "학교 및 학년 (원서에 적힌 그대로만. 적혀있지 않으면 무조건 빈칸 처리. 절대 임의로 지어내지 말 것. 성인이라 '일반'이라고 적혀있으면 '일반' 추출)",
    "수강과목": "직접 펜으로 쓴 수강과목란 내용",
    "수강시작일": "YYYY년 M월 D일 HH:MM 형식",
    "수강료": "숫자만 (예: 250000)",
    "도구비": "숫자만",
    "결제금액": "숫자만",
    "과정체크": "하단 표에서 펜으로 동그라미 쳐진 과목명과 시간을 결합 (예: 한식(10시), 양식(5시)). 여러 개면 콤마로 연결."
}"""
    for page_num in range(min(doc.page_count, 3)): # Just first 3 pages
        page = doc.load_page(page_num)
        matrix = fitz.Matrix(2.5, 2.5)
        pix = page.get_pixmap(matrix=matrix)
        
        img_data = pix.tobytes("jpeg")
        base64_data = base64.b64encode(img_data).decode("utf-8")
        
        payload = {
            "contents": [{
                "parts": [
                    { "text": prompt },
                    { "inlineData": { "mimeType": "image/jpeg", "data": base64_data } }
                ]
            }],
            "generationConfig": {
                "temperature": 0.0,
                "responseMimeType": "application/json"
            }
        }

        req = urllib.request.Request("http://localhost:3000/api/sejong/ai_analyze", data=json.dumps(payload).encode('utf-8'))
        req.add_header('Content-Type', 'application/json')
        
        try:
            with urllib.request.urlopen(req) as response:
                result = response.read().decode('utf-8')
                data = json.loads(result)
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                print(f"Page {page_num + 1}:", json.loads(text).get("성명"))
        except Exception as e:
            print(f"Page {page_num + 1} API Request failed:", e)

if __name__ == "__main__":
    test_student_application()
