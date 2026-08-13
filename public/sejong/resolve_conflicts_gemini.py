import os
import json
import time
import requests
import unicodedata
from collections import defaultdict

ENV_PATH = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/.env.local"
DATA_PATH = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/questions_data.json"

def normalize(text): return unicodedata.normalize('NFC', text)

def load_api_keys():
    if not os.path.exists(ENV_PATH): return []
    with open(ENV_PATH, "r") as f:
        for line in f:
            if line.startswith("GEMINI_API_KEYS="):
                keys = line.strip().split("=")[1].strip('"').split(",")
                return [k for k in keys if k]
    return []

API_KEYS = load_api_keys()

def get_correct_answer(q_text, options, api_key):
    prompt = f"""
당신은 조리기능사 필기시험 전문가입니다. 다음 기출문제의 올바른 정답 번호를 알려주세요.
문제: {q_text}
보기:
1. {options[0] if len(options)>0 else ''}
2. {options[1] if len(options)>1 else ''}
3. {options[2] if len(options)>2 else ''}
4. {options[3] if len(options)>3 else ''}

반드시 JSON 형식으로만 응답하세요. (Markdown이나 다른 텍스트 없이)
{{
  "a": 정답번호숫자(1~4)
}}
"""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-lite:generateContent?key={api_key}"
    headers = {'Content-Type': 'application/json'}
    data = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.1,
            "response_mime_type": "application/json"
        }
    }
    try:
        res = requests.post(url, headers=headers, json=data, timeout=10)
        if res.status_code == 200:
            result = res.json()
            text_response = result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
            parsed = json.loads(text_response)
            return parsed.get('a'), True
        else:
            return None, False
    except Exception as e:
        return None, False

def main():
    if not API_KEYS:
        print("No API keys found.")
        return

    with open(DATA_PATH, "r", encoding="utf-8") as f:
        q_data = json.load(f)

    # Find conflicts
    conflicts = defaultdict(set)
    q_options = {}
    
    for k, questions in q_data.items():
        if '시험지' not in k:
            for q in questions:
                q_text = normalize(q.get('q', '').strip())
                ans = q.get('a')
                if ans and isinstance(ans, int) and 1 <= ans <= 4:
                    conflicts[q_text].add(ans)
                    if q_text not in q_options:
                        q_options[q_text] = q.get('o', [])

    conflict_questions = {q: list(ans_set) for q, ans_set in conflicts.items() if len(ans_set) > 1}
    print(f"Found {len(conflict_questions)} conflicting questions.")

    resolved_answers = {}
    key_idx = 0
    resolved_count = 0

    for q_text, ans_list in conflict_questions.items():
        options = q_options[q_text]
        if not options or len(options) < 4:
            # just pick first if options are broken
            resolved_answers[q_text] = ans_list[0]
            continue
            
        success = False
        retry_count = 0
        while retry_count <= len(API_KEYS):
            api_key = API_KEYS[key_idx % len(API_KEYS)]
            ans, ok = get_correct_answer(q_text, options, api_key)
            if ok and isinstance(ans, int) and 1 <= ans <= 4:
                resolved_answers[q_text] = ans
                resolved_count += 1
                success = True
                print(f"[{resolved_count}/{len(conflict_questions)}] Resolved: {q_text[:30]}... -> {ans}")
                time.sleep(1)
                break
            else:
                key_idx += 1
                retry_count += 1
                time.sleep(1)
        
        if not success:
            print(f"Failed to resolve: {q_text[:30]}...")
            # Fallback to the first seen answer
            resolved_answers[q_text] = ans_list[0]

    # Update q_data with resolved answers
    updated_count = 0
    for k, questions in q_data.items():
        if '시험지' not in k:
            for q in questions:
                q_text = normalize(q.get('q', '').strip())
                if q_text in resolved_answers:
                    correct_ans = resolved_answers[q_text]
                    if q.get('a') != correct_ans:
                        q['a'] = correct_ans
                        updated_count += 1

    print(f"Updated {updated_count} answers in base bank.")

    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(q_data, f, ensure_ascii=False, indent=2)
        
    print("Saved questions_data.json.")

if __name__ == "__main__":
    main()
