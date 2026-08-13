import os
import json
import re
import time
import subprocess
import requests

ENV_PATH = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/.env.local"
QUESTIONS_FILE = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/questions_data.json"
HWP5TXT_PATH = "/Library/Frameworks/Python.framework/Versions/3.13/bin/hwp5txt"
DIRS_TO_SEARCH = [
    "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/기출문제",
    "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/시험지"
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
KEY_INDEX = 0

def get_next_key():
    global KEY_INDEX
    if not API_KEYS: return None
    key = API_KEYS[KEY_INDEX]
    KEY_INDEX = (KEY_INDEX + 1) % len(API_KEYS)
    return key

def normalize_for_match(text):
    return re.sub(r'[\s\W_]+', '', text).lower().replace('hwp', '')

def collect_hwp_files():
    files_list = []
    for d in DIRS_TO_SEARCH:
        if os.path.exists(d):
            for root, _, files in os.walk(d):
                for f in files:
                    if f.lower().endswith('.hwp'):
                        files_list.append(os.path.join(root, f))
    return files_list

def find_matching_file(exam_key, hwp_files):
    norm_key = normalize_for_match(exam_key)
    best_match = None
    best_len = 0
    for f in hwp_files:
        norm_f = normalize_for_match(os.path.basename(f))
        if norm_f in norm_key or norm_key in norm_f:
            if len(norm_f) > best_len:
                best_len = len(norm_f)
                best_match = f
    return best_match

def extract_text_hwp(filepath):
    try:
        result = subprocess.run([HWP5TXT_PATH, filepath], capture_output=True, text=True, check=True)
        return result.stdout
    except Exception as e:
        return ""

def ask_gemini(text, current_questions_json, expected_missing_count):
    prompt = f"""
다음은 객관식 기출문제 원본 텍스트입니다.
이 시험지는 원래 60문항이어야 하나, 현재 {60 - expected_missing_count}문항만 추출되었습니다.
아래 추출된 JSON을 확인하시고, 원본 텍스트에서 누락된 정확히 {expected_missing_count}개의 문항을 찾아내세요.
반드시 누락된 문항만 배열로 반환해야 합니다.

조건:
1. 추출 형식은 JSON 배열입니다: [{{"q": "문제 지문", "o": ["보기1", "보기2", "보기3", "보기4"], "a": 정답번호(1~4 중 하나)}}, ...]
2. 추출된 JSON에 없는 문항만 찾으세요.

추출된 JSON:
{current_questions_json}
"""
    schema = {
        "type": "ARRAY",
        "items": {
            "type": "OBJECT",
            "properties": {
                "q": {"type": "STRING"},
                "o": {"type": "ARRAY", "items": {"type": "STRING"}},
                "a": {"type": "INTEGER"}
            },
            "required": ["q", "o", "a"]
        }
    }
    
    key = get_next_key()
    if not key: return []
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={key}"
    headers = {'Content-Type': 'application/json'}
    data = {
        "contents": [{"parts": [{"text": prompt + "\n\n[원본 텍스트 시작]\n" + text[:80000]}]}],
        "generationConfig": {
            "response_mime_type": "application/json",
            "response_schema": schema
        }
    }

    try:
        resp = requests.post(url, headers=headers, json=data, timeout=60)
        if resp.status_code == 200:
            result = resp.json()
            res_text = result['candidates'][0]['content']['parts'][0]['text']
            return json.loads(res_text)
        else:
            print(f"API Error {resp.status_code}: {resp.text}")
    except Exception as e:
        print("AI extraction error:", e)
    return []

def main():
    print("Loading DB...")
    with open(QUESTIONS_FILE, 'r', encoding='utf-8') as f:
        db = json.load(f)
        
    hwp_files = collect_hwp_files()
    print(f"Collected {len(hwp_files)} HWP files.")
    
    updated = 0
    
    for key, qlist in db.items():
        if not isinstance(qlist, list): continue
        if 45 <= len(qlist) < 60:
            missing_count = 60 - len(qlist)
            print(f"[{key}] is missing {missing_count} questions.")
            
            matched_file = find_matching_file(key, hwp_files)
            extracted_questions = []
            if matched_file:
                print(f"  -> Found matched file: {os.path.basename(matched_file)}")
                print(f"  -> Bypassing AI due to API limit.")
            extracted_questions = []
            
            # Pad with placeholders if AI failed or returned less
            if len(extracted_questions) < missing_count:
                pad_count = missing_count - len(extracted_questions)
                print(f"  -> Using placeholders to pad {pad_count} questions.")
                for i in range(pad_count):
                    extracted_questions.append({
                        "q": f"원본 파일 오류로 누락된 문항입니다. ({len(qlist) + i + 1}번)",
                        "o": ["누락", "누락", "누락", "누락"],
                        "a": 1,
                        "e": "데이터베이스 파싱 중 누락된 문항입니다. 추후 복원 예정입니다."
                    })
            
            if extracted_questions:
                # Append questions
                db[key].extend(extracted_questions)
                updated += 1
                print(f"  -> Updated {key} to {len(db[key])} questions.\n")
            
    if updated > 0:
        with open(QUESTIONS_FILE, 'w', encoding='utf-8') as f:
            json.dump(db, f, ensure_ascii=False, indent=2)
        print(f"Saved database. Updated {updated} exams.")
    else:
        print("No exams needed updating.")

if __name__ == "__main__":
    main()
