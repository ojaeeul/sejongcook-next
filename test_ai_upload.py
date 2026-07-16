import requests
import json
import sys

def test_extract(hwp_path):
    print(f"Testing with: {hwp_path}")
    
    # 1. HWP Extract
    print("Step 1: Extracting HTML from HWP...")
    with open(hwp_path, 'rb') as f:
        res = requests.post("http://localhost:3000/api/sejong/hwp-extract", files={"file": f})
    
    if res.status_code != 200:
        print(f"Error extracting HWP: {res.text}")
        return False
        
    html_content = res.json().get('html', '')
    print(f"Extracted {len(html_content)} bytes of HTML.")
    
    # 2. AI Analyze
    print("Step 2: Sending to Gemini API...")
    prompt = "첨부된 문서(또는 이미지)에서 60개의 객관식 문제를 누락 없이 모두 추출하세요. 반드시 JSON 배열(Array) 형태로, 객체는 {\"q\": \"문제내용\", \"o\": [\"보기1\", \"보기2\", \"보기3\", \"보기4\"], \"a\": 정답번호(1~4)} 구조여야 합니다. 불필요한 설명 없이 JSON 배열만 출력하세요."
    
    payload = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {"text": html_content[:80000]}
            ]
        }],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }
    
    res = requests.post("http://localhost:3000/api/sejong/ai_analyze", json=payload)
    if res.status_code != 200:
        print(f"Error in AI analysis: {res.text}")
        return False
        
    ai_data = res.json()
    extracted_text = ai_data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '[]')
    
    try:
        questions = json.loads(extracted_text)
        print(f"Success! Extracted {len(questions)} questions.")
        if len(questions) > 0:
            print(f"Sample Question 1: {questions[0]['q']}")
        return True
    except Exception as e:
        print(f"Failed to parse JSON: {e}")
        print(f"Raw output: {extracted_text}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Provide path to hwp")
        sys.exit(1)
    test_extract(sys.argv[1])
