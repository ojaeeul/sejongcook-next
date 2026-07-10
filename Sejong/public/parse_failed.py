import os
import json
import time
import subprocess
import requests
import unicodedata

QUESTIONS_FILE = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/questions_data.json"
COURSES_FILE = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/exam_courses.json"
TARGET_DIR = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/기출문제"
ENV_PATH = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/.env.local"

def normalize(s):
    return unicodedata.normalize('NFC', s)

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

def parse_with_gemini_flash(text, retries=5):
    prompt = """
다음은 객관식 시험지(문항, 보기, 정답) 텍스트입니다.
문서 전체를 읽고, 모든 객관식 문제를 누락 없이 배열로 추출하세요.
정답을 찾을 수 없는 경우 무조건 1로 설정하세요.

반드시 문제(q), 보기 4개 배열(o), 정답(a - 1,2,3,4 등의 숫자) 형태로 반환해야 합니다.
"""
    safe_text = text[:80000]
    schema = {
        "type": "ARRAY",
        "items": {
            "type": "OBJECT",
            "properties": {
                "q": {"type": "STRING", "description": "문제 지문 내용"},
                "o": {"type": "ARRAY", "items": {"type": "STRING"}, "description": "1,2,3,4번 보기 리스트. 정확히 4개여야 함."},
                "a": {"type": "INTEGER", "description": "정답 번호 (1, 2, 3, 4)"}
            },
            "required": ["q", "o", "a"]
        }
    }

    for attempt in range(retries):
        key = get_next_key()
        if not key: return []
            
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={key}"
        headers = {'Content-Type': 'application/json'}
        data = {
            "contents": [{"parts": [{"text": prompt + "\n\n[TEXT_START]\n" + safe_text}]}],
            "generationConfig": {
                "response_mime_type": "application/json",
                "response_schema": schema
            }
        }

        try:
            resp = requests.post(url, headers=headers, json=data, timeout=60)
            if resp.status_code == 200:
                result = resp.json()
                try:
                    res_text = result['candidates'][0]['content']['parts'][0]['text']
                    parsed = json.loads(res_text)
                    if isinstance(parsed, list):
                        return parsed
                except Exception as e:
                    print("JSON parse error:", e)
            else:
                print(f"API Error {resp.status_code}: {resp.text[:200]}")
                if resp.status_code == 429:
                    time.sleep(30)
                else:
                    time.sleep(10)
        except Exception as e:
            print("Request error:", e)
            time.sleep(10)
    return []

import sys
sys.path.append("/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public")
from batch_parse_exams import extract_text_hwp, resolve_answer

def main():
    if not os.path.exists(QUESTIONS_FILE):
        db = {}
    else:
        with open(QUESTIONS_FILE, 'r', encoding='utf-8') as f:
            db = json.load(f)

    with open(COURSES_FILE, 'r', encoding='utf-8') as f:
        courses = json.load(f)

    missing_files = set()
    user_files = [
        "한식조리기능사20070916(교사용).hwp", "한식조리기능사20130127(교사용).hwp", "hcook_070128.hwp",
        "한식조리기능사20100711(교사용).hwp", "한식조리기능사20051002(교사용).hwp", "한식조리기능사20090118(교사용).hwp",
        "한식조리기능사20120212(교사용).hwp", "한식조리기능사20110417(교사용).hwp", "조리기능사필기기출문제_140406.hwp",
        "hcook_040718.hwp", "hcook_160124-m.hwp", "한식조리기능사20080330(교사용).hwp",
        "한식조리기능사20041010(교사용).hwp", "hcook_130414.hwp", "한식조리기능사20070401(교사용).hwp",
        "한식조리기능사20070128(교사용).hwp"
    ]
    for f in user_files:
        missing_files.add(normalize(f))

    target_paths = []
    for root, _, files in os.walk(TARGET_DIR):
        for file in files:
            norm_file = normalize(file)
            if norm_file in missing_files:
                target_paths.append(os.path.join(root, file))

    print(f"Found {len(target_paths)} missing files to parse with gemini-2.5-flash...")

    def find_answer_file(main_file):
        base = normalize(os.path.basename(main_file).replace('.hwp', ''))
        if "답지" in base or "정답" in base: return None
        for root, _, files in os.walk(TARGET_DIR):
            for f in files:
                norm_f = normalize(f)
                if ("답지" in norm_f or "정답" in norm_f) and (base[:5] in norm_f):
                    return os.path.join(root, f)
        return None

    added = 0
    for idx, filepath in enumerate(target_paths):
        filename = normalize(os.path.basename(filepath))
        
        real_key = None
        for cat in courses:
            for c in cat.get('courses', []):
                for ex in c.get('exams', []):
                    if normalize(ex['name']) == filename.replace('.hwp', ''):
                        real_key = ex['key']
                        
        if not real_key:
            real_key = f"오재을_{filename}"

        print(f"[{idx+1}/{len(target_paths)}] Parsing {filename} (Key: {real_key})...")
        
        text = extract_text_hwp(filepath)
        if not text or len(text.strip()) < 50:
            print("  -> Empty text extracted.")
            continue
            
        ans_filepath = find_answer_file(filepath)
        if ans_filepath:
            ans_text = extract_text_hwp(ans_filepath)
            text += "\n\n[별도 파일 정답지 내용]\n" + ans_text

        questions = parse_with_gemini_flash(text)
        
        if questions and len(questions) > 0:
            final_questions = []
            for q_obj in questions:
                ans = q_obj.get("a", 1)
                try:
                    ans = int(ans)
                    if ans not in [1,2,3,4]: ans = 1
                except:
                    ans = 1
                q_obj["a"] = ans
                if ans == 1:
                    q_obj["q"] = str(q_obj.get("q", "")) + " [정답 확인 필요]"
                final_questions.append(q_obj)
            
            db[real_key] = final_questions
            added += 1
            print(f"  -> Extracted {len(final_questions)} questions!")
            
            with open(QUESTIONS_FILE, 'w', encoding='utf-8') as f:
                json.dump(db, f, ensure_ascii=False, indent=2)
        else:
            print("  -> AI failed to extract questions.")
            
        time.sleep(5) # wait to avoid rate limit

    if added > 0:
        js_content = "window.QUESTIONS_DATA = " + json.dumps(db, ensure_ascii=False) + ";"
        with open(QUESTIONS_FILE.replace(".json", ".js"), 'w', encoding='utf-8') as f:
            f.write(js_content)
        
        print("Deploying changes...")
        subprocess.run(["/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/시스템_시작.command"])

if __name__ == "__main__":
    main()
