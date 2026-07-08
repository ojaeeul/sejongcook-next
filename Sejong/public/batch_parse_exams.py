import os
import re
import json
import time
import subprocess
import requests
from pathlib import Path

ENV_PATH = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/.env.local"
QUESTIONS_FILE = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/questions_data.json"
EXAM_COURSES_FILE = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/exam_courses.json"
TARGET_DIR = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/기출문제"
HWP5TXT_PATH = "/Library/Frameworks/Python.framework/Versions/3.13/bin/hwp5txt"

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

def extract_text_hwp(filepath):
    try:
        result = subprocess.run([HWP5TXT_PATH, filepath], capture_output=True, text=True, check=True)
        return result.stdout
    except Exception as e:
        print(f"Error extracting HWP {filepath}: {e}")
        return ""

def determine_category(filename):
    if "한식" in filename: return "한식"
    if "양식" in filename: return "양식"
    if "일식" in filename: return "일식"
    if "중식" in filename: return "중식"
    if "복어" in filename: return "복어"
    if "제과제빵" in filename or ("제과" in filename and "제빵" in filename): return "제과제빵"
    if "제과" in filename: return "제과"
    if "제빵" in filename: return "제빵"
    return "미분류"

def parse_with_ai(text, retries=5):
    prompt = """
다음은 객관식 시험지(문항, 보기, 정답) 텍스트입니다.
문서 전체를 읽고, 모든 객관식 문제를 누락 없이 배열로 추출하세요.
정답이 문서 어디에도 존재하지 않아 문항과 정답을 확실히 연결할 수 없다면 절대 지어내지 말고 빈 배열 []을 반환하세요.

반드시 문제(q), 보기 4개 배열(o), 정답(a - 1,2,3,4 등의 숫자 혹은 문자열) 형태로 반환해야 합니다.
"""
    
    # 텍스트가 너무 길면 자르지만, 가능한 10만자까지 보냄 (Flash는 긴 컨텍스트 지원)
    safe_text = text[:80000]
    
    schema = {
        "type": "ARRAY",
        "items": {
            "type": "OBJECT",
            "properties": {
                "q": {"type": "STRING", "description": "문제 지문 내용"},
                "o": {"type": "ARRAY", "items": {"type": "STRING"}, "description": "1,2,3,4번 보기 리스트. 정확히 4개여야 함."},
                "a": {"type": "STRING", "description": "정답 텍스트 또는 정답 번호"}
            },
            "required": ["q", "o", "a"]
        }
    }

    for attempt in range(retries):
        key = get_next_key()
        if not key: return []
            
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key={key}"
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
                        # Filter out any badly formatted ones
                        valid = [p for p in parsed if len(p.get("o", [])) >= 2 and str(p.get("a", "")).strip() != ""]
                        return valid
                except Exception as e:
                    print("Failed to parse JSON from AI response:", e)
                    return []
            elif resp.status_code in [429, 503]:
                print(f"Rate limit or overloaded ({resp.status_code}): {resp.text}. Waiting 10s... (Attempt {attempt+1}/{retries})")
                time.sleep(10)
                continue
            else:
                print(f"API Error {resp.status_code}: {resp.text}")
                return []
        except requests.exceptions.Timeout:
            print(f"Timeout on AI request. Waiting 10s... (Attempt {attempt+1}/{retries})")
            time.sleep(10)
            continue
        except Exception as e:
            print("Exception calling AI:", e)
            return []
            
    print("Failed after all retries.")
    return []

def normalize_text(text):
    t = re.sub(r'^[\d①-⑳가-하a-zA-Z]+[\.\)]?\s*', '', text)
    t = re.sub(r'[\s\W_]+', '', t)
    return t

def resolve_answer(q_obj):
    ans = str(q_obj.get("a", "")).strip()
    opts = q_obj.get("o", [])
    if not ans or len(opts) < 2: return None
    if ans in ["1", "2", "3", "4"]: return int(ans)
    mapping = {"가":1, "나":2, "다":3, "라":4, "①":1, "②":2, "③":3, "④":4}
    for k, v in mapping.items():
        if k in ans: return v
    for i, opt in enumerate(opts):
        if normalize_text(ans) == normalize_text(opt): return i + 1
        if len(ans) > 2 and normalize_text(ans) in normalize_text(opt): return i + 1
    match = re.search(r'([1-4])', ans)
    if match: return int(match.group(1))
    return None

def main():
    if not os.path.exists(QUESTIONS_FILE): questions_db = {}
    else:
        with open(QUESTIONS_FILE, 'r', encoding='utf-8') as f:
            questions_db = json.load(f)

    existing_questions = set()
    for cat, qlist in questions_db.items():
        if isinstance(qlist, list):
            for q_obj in qlist:
                q_text = q_obj.get("q", "")
                if q_text and "중복 문항으로 삭제되었습니다" not in q_text:
                    existing_questions.add(normalize_text(q_text))

    processed = 0
    added = 0
    
    # 1. 파일 목록 수집 및 정답지 자동 매칭 준비
    all_files = []
    for root, _, files in os.walk(TARGET_DIR):
        for file in files:
            if file.lower().endswith('.hwp'):
                all_files.append(os.path.join(root, file))
                
    # 파일명 기반으로 답지 찾기 로직
    def find_answer_file(main_file, all_files):
        base = os.path.basename(main_file).replace('.hwp', '')
        # 만약 이미 이 파일이 답지라면 None
        if "답지" in base or "정답" in base:
            return None
        # 이름이 유사하고 '답지'나 '정답'이 포함된 파일 찾기
        for f in all_files:
            f_base = os.path.basename(f)
            if ("답지" in f_base or "정답" in f_base) and (base[:5] in f_base):
                if f != main_file:
                    return f
        return None

    for filepath in all_files:
        filename = os.path.basename(filepath)
        # 답지만 단독으로 파싱하지 않음 (본문 매칭시 사용됨)
        if "답지" in filename or "정답" in filename:
            continue
            
        print(f"Checking {filename}...")
        
        text = extract_text_hwp(filepath)
        if not text or len(text.strip()) < 50:
            continue
            
        ans_filepath = find_answer_file(filepath, all_files)
        if ans_filepath:
            print(f"  -> Found separate answer file: {os.path.basename(ans_filepath)}. Merging text...")
            ans_text = extract_text_hwp(ans_filepath)
            text += "\n\n[별도 파일 정답지 내용]\n" + ans_text
            
        new_key = f"오재을_{filename}"
        
        if new_key in questions_db:
            print(f"  -> Already processed this file ({new_key}). Skipping.")
            processed += 1
            continue
        
        print(f"  -> Requesting AI extraction with strict JSON schema...")
        questions = parse_with_ai(text)
        
        if questions and len(questions) > 0:
            final_questions = []
            new_count = 0
            for q_obj in questions:
                ans_idx = resolve_answer(q_obj)
                if not ans_idx:
                    print(f"    [WARN] Unresolvable answer '{q_obj.get('a')}' for question: {q_obj.get('q')[:20]}")
                    continue
                q_obj["a"] = ans_idx
                
                q_text = q_obj.get("q", "")
                norm = normalize_text(q_text)
                if norm and norm not in existing_questions:
                    final_questions.append(q_obj)
                    existing_questions.add(norm)
                    new_count += 1
            
            print(f"  -> Extracted {len(questions)} questions, {new_count} are new!")
            if new_count > 0:
                questions_db[new_key] = final_questions
                added += new_count
                with open(QUESTIONS_FILE, 'w', encoding='utf-8') as f:
                    json.dump(questions_db, f, ensure_ascii=False, indent=2)
        else:
            print("  -> AI extracted 0 questions. (No answers or format unreadable)")
            
        processed += 1
        time.sleep(1)
        
    print(f"Job complete! Processed {processed} files, added {added} questions total.")
    
    if added > 0 and os.path.exists(EXAM_COURSES_FILE):
        with open(EXAM_COURSES_FILE, 'r', encoding='utf-8') as f:
            ec = json.load(f)
        for cat in ec:
            if cat.get('category') == '전체과정':
                ojae_course = next((c for c in cat.get('courses', []) if isinstance(c, dict) and c.get('name') == '오재을'), None)
                if not ojae_course:
                    ojae_course = {"name": "오재을", "exams": []}
                    cat['courses'].insert(0, ojae_course)
                
                existing_keys = [ex['key'] for ex in ojae_course.get('exams', [])]
                for filepath in all_files:
                    fname = os.path.basename(filepath)
                    if "답지" in fname or "정답" in fname: continue
                    nkey = f"오재을_{fname}"
                    if nkey in questions_db and nkey not in existing_keys:
                        ojae_course['exams'].append({"name": fname.replace('.hwp', ''), "key": nkey})
                        
        with open(EXAM_COURSES_FILE, 'w', encoding='utf-8') as f:
            json.dump(ec, f, ensure_ascii=False, indent=2)
            
    print("Deploying changes...")
    subprocess.run(["/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/시스템_시작.command"])

if __name__ == "__main__":
    main()
