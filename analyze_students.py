import requests
import json
import pandas as pd
import os
import base64
import time
import re
import fitz  # PyMuPDF

files = [
    "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/수강생 /수강생/KakaoTalk_Photo_2026-06-25-08-50-33.jpeg",
    "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/수강생 /수강생/CCF_000007.pdf",
    "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/수강생 /수강생/CCF_000008.pdf",
    "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/수강생 /수강생/pc.add.sub0103.pdf"
]

url = "http://localhost:3000/api/sejong/ai_analyze"

prompt = """이 이미지는 요리학원의 수강생 등록 원서입니다. 
사진이 거꾸로(180도) 찍혀 있거나 옆으로 돌아가 있을 수 있으니, 글자 방향을 스스로 판단하여 이미지를 회전시킨 상태로 읽어주세요.
사용자가 직접 펜으로 적은 글씨와 펜으로 동그라미 친 부분을 완벽하게 인식해주세요.

[데이터 추출 규칙 및 절대 주의사항]
1. 전화번호는 주소 필드에 절대 입력하지 마세요. 주소 란에 전화번호(예: 010-XXXX-XXXX)가 적혀 있다면, 해당 번호를 주소에서 완전히 삭제하고 순수 주소만 남기세요.
2. 주소 란이나 다른 곳에서 발견된 모든 전화번호는 반드시 '학생연락처'나 '부모연락처' 필드로 이동시키세요.
3. 성명은 표의 맨 위 좌측 '성명' 란에 있는 이름을 추출합니다.
4. 글씨를 알아볼 수 없거나 비어있는 칸은 무조건 빈칸("")으로 처리하세요.

다음 정보를 추출하여 정확히 아래 형식의 JSON 객체로 반환하세요. JSON 코드 블록 없이 순수 JSON 텍스트만 출력하세요.
{
    "성명": "이름 추출",
    "성별": "남 또는 여",
    "생년월일": "원서에 적힌 그대로 추출",
    "주소": "순수 주소 텍스트만",
    "학생연락처": "수강생 본인 연락처",
    "부모연락처": "부모 연락처",
    "학교": "학교 및 학년",
    "수강과목": "직접 펜으로 쓴 수강과목란 내용",
    "수강시작일": "YYYY년 M월 D일 HH:MM 형식",
    "수강료": "숫자만",
    "도구비": "숫자만",
    "결제금액": "숫자만",
    "과정체크": "하단 표에서 펜으로 동그라미 쳐진 과목명과 시간 (예: 제과, 7시)",
    "비고": "하단 빈 공간(메모란)에 적힌 글씨"
}"""

results = []

def extract_json(text):
    try:
        return json.loads(text)
    except:
        try:
            match = re.search(r'```(?:json)?(.*?)```', text, re.DOTALL)
            if match:
                return json.loads(match.group(1).strip())
        except:
            pass
    return None

def analyze_image(image_bytes, mime_type, filename, page_num=None):
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "inlineData": {
                            "mimeType": mime_type,
                            "data": base64.b64encode(image_bytes).decode('utf-8')
                        }
                    },
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "generationConfig": {
             "temperature": 0.4
        }
    }
    
    file_id = f"{filename} (Page {page_num})" if page_num is not None else filename
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = requests.post(url, json=payload, timeout=120)
            if response.status_code == 200:
                res_data = response.json()
                if 'candidates' in res_data and len(res_data['candidates']) > 0:
                    text_response = res_data['candidates'][0]['content']['parts'][0]['text']
                    parsed_json = extract_json(text_response)
                    
                    if parsed_json:
                        print(f"Success for {file_id}: {parsed_json.get('성명', '')}")
                        
                        name = parsed_json.get('성명', '')
                        phone = parsed_json.get('학생연락처', '') or parsed_json.get('부모연락처', '')
                        course = parsed_json.get('수강과목', '')
                        time_val = parsed_json.get('과정체크', '')
                        
                        results.append({
                            "이름": name,
                            "전화번호": phone,
                            "과정명": course,
                            "시간": time_val,
                            "비고": parsed_json.get('비고', ''),
                            "원본파일": file_id
                        })
                        return True
                    else:
                        print(f"Failed to parse JSON for {file_id}:\n{text_response}")
                else:
                    print(f"Error for {file_id}: No candidates in response. {res_data}")
            elif response.status_code == 429:
                print(f"Rate limited for {file_id}. Waiting 60 seconds...")
                time.sleep(60)
                continue
            else:
                print(f"Error for {file_id}: HTTP {response.status_code}")
                print(response.text)
        except Exception as e:
            print(f"Exception for {file_id}: {e}")
        
        print(f"Retrying... ({attempt+1}/{max_retries})")
        time.sleep(10)
    return False

for file_path in files:
    filename = os.path.basename(file_path)
    print(f"Analyzing {filename}...")
    
    if file_path.lower().endswith('.pdf'):
        try:
            doc = fitz.open(file_path)
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for better OCR
                image_bytes = pix.tobytes("jpeg")
                analyze_image(image_bytes, "image/jpeg", filename, page_num + 1)
                time.sleep(6)  # 6 seconds delay between pages to respect rate limits (10 RPM)
            doc.close()
        except Exception as e:
            print(f"Failed to process PDF {filename}: {e}")
    else:
        with open(file_path, 'rb') as f:
            image_bytes = f.read()
        analyze_image(image_bytes, "image/jpeg", filename)
        time.sleep(6)

df = pd.DataFrame(results)
output_path = "/Users/ojaeeul/Downloads/수강생분석.xlsx"
df.to_excel(output_path, index=False)
print(f"\\nDone! Excel saved to {output_path}")
