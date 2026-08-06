import os
import json
import time
import requests
import sys

ENV_PATH = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/.env.local"
DATA_PATH = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/questions_data.json"

TARGET_EXAMS = [
    '제과기능사_제과기능사 가형', '제과기능사_제과기능사 나형', '제과기능사_제과기능사 다형', '제과기능사_제과기능사 라형', '제과기능사_제과기능사 마형',
    '제빵기능사_제빵기능사 가형', '제빵기능사_제빵기능사 나형', '제빵기능사_제빵기능사 다형', '제빵기능사_제빵기능사 라형', '제빵기능사_제빵기능사 마형'
]

def load_api_keys():
    if not os.path.exists(ENV_PATH): return []
    with open(ENV_PATH, "r") as f:
        for line in f:
            if line.startswith("GEMINI_API_KEYS="):
                keys = line.strip().split("=")[1].strip('"').split(",")
                return [k for k in keys if k]
    return []

API_KEYS = load_api_keys()

def get_explanation(q, options, correct_idx, api_key):
    if not correct_idx or correct_idx > len(options):
        return "정답 정보가 올바르지 않습니다."
        
    correct_ans = options[correct_idx - 1]
    
    prompt = f"""
다음은 제과/제빵/조리 기능사 자격증 기출문제입니다.
문제: {q}
보기:
1. {options[0] if len(options)>0 else ''}
2. {options[1] if len(options)>1 else ''}
3. {options[2] if len(options)>2 else ''}
4. {options[3] if len(options)>3 else ''}

정답: {correct_idx}번 ({correct_ans})

이 문제에 대해 왜 {correct_idx}번이 정답인지, 그리고 가능하다면 다른 보기가 오답인 이유를 아주 간략하고 명쾌하게 2~4문장으로 설명해주세요.
답변은 오직 '해설' 텍스트만 출력하세요 (기타 군더더기 말 금지).
"""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    headers = {'Content-Type': 'application/json'}
    data = {
        "contents": [{"parts": [{"text": prompt}]}],
    }
    
    try:
        resp = requests.post(url, headers=headers, json=data, timeout=10)
        if resp.status_code == 200:
            res_text = resp.json()['candidates'][0]['content']['parts'][0]['text']
            return res_text.strip()
        else:
            return None
    except Exception as e:
        return None

def main():
    if not API_KEYS:
        print("No API key found")
        return
        
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    total_processed = 0
    total_needed = 0
    
    for exam in TARGET_EXAMS:
        if exam in data:
            for q in data[exam]:
                if 'e' not in q or not q['e'] or q['e'].strip() == "":
                    total_needed += 1
                    
    print(f"Total missing explanations in target exams: {total_needed}")
    if total_needed == 0:
        print("No missing explanations for target exams.")
        return
        
    key_idx = 0
    
    for exam in TARGET_EXAMS:
        if exam not in data: continue
        
        print(f"Processing {exam}...")
        changed = False
        
        for idx, q in enumerate(data[exam]):
            if 'e' not in q or not q['e'] or q['e'].strip() == "":
                ans = q.get('a')
                opts = q.get('o', [])
                if ans and opts:
                    api_key = API_KEYS[key_idx % len(API_KEYS)]
                    key_idx += 1
                    
                    explanation = get_explanation(q['q'], opts, ans, api_key)
                    if explanation:
                        q['e'] = explanation
                        changed = True
                        total_processed += 1
                        print(f"  [{total_processed}/{total_needed}] {exam} Q{idx+1} explained.")
                    else:
                        print(f"  [{total_processed}/{total_needed}] {exam} Q{idx+1} API Failed.")
                        
                    time.sleep(1.0) # To avoid rate limit
                    
        # Save after each exam
        if changed:
            with open(DATA_PATH, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"Saved progress for {exam}")

if __name__ == "__main__":
    main()
