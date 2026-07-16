import os
import re
import json
import subprocess
import requests

ENV_PATH = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/.env.local"
QUESTIONS_FILE = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/questions_data.json"
TARGET_DIR_COOK = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/기출문제"
TARGET_DIR_BAKE = os.path.expanduser("~/Downloads/제과제빵필기")
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

def extract_text_hwp(filepath):
    try:
        result = subprocess.run([HWP5TXT_PATH, filepath], capture_output=True, text=True)
        return result.stdout
    except Exception as e:
        print(f"Error extracting HWP {filepath}: {e}")
        return ""

def find_file_for_key(key):
    # key format: 오재을_파일명.hwp or 제과제빵은행_... or 제빵기능사_...
    if key.startswith("오재을_"):
        fname = key.replace("오재을_", "")
        for root, _, files in os.walk(TARGET_DIR_COOK):
            if fname in files:
                return os.path.join(root, fname)
    else:
        # Check bakery dir
        # "제과제빵은행_2010년도_5회제빵" -> "2010년도 5회제빵.hwp" or "2010년 5회제빵.hwp"
        clean_key = key.replace("제과제빵은행_", "").replace("제빵기능사_", "").replace("제과기능사_", "")
        clean_key = clean_key.replace("시험지_", "").replace("_", "").replace("년도", "").replace("년", "")
        for root, _, files in os.walk(TARGET_DIR_BAKE):
            for f in files:
                if f.endswith(".hwp"):
                    import unicodedata
                    f_nfc = unicodedata.normalize("NFC", f)
                    clean_name = f_nfc.replace(".hwp", "").replace(" ", "").replace("년도", "").replace("년", "").replace("_", "")
                    if clean_name == clean_key or clean_key in clean_name or clean_name in clean_key:
                        return os.path.join(root, f)
    return None

def fix_answers_with_ai(text, current_qs):
    # Ask AI to extract just the answers table from the text and return as { "1": 2, "2": 4... }
    prompt = """
    다음은 한국 자격증 시험지 텍스트입니다. 텍스트 맨 아래에 주로 정답표(1번부터 60번까지)가 있습니다.
    이 텍스트에서 정답만 추출하여 JSON 객체로 반환하세요.
    키는 문항번호(문자열 "1" ~ "60"), 값은 정답번호(정수 1,2,3,4)로 해야합니다.
    """
    safe_text = text[-15000:] # Answers are usually at the end
    
    schema = {
        "type": "OBJECT",
        "additionalProperties": {"type": "INTEGER"}
    }
    
    key = API_KEYS[0]
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key={key}"
    headers = {'Content-Type': 'application/json'}
    data = {
        "contents": [{"parts": [{"text": prompt + "\n\n" + safe_text}]}],
        "generationConfig": {
            "response_mime_type": "application/json",
            "response_schema": schema
        }
    }
    
    try:
        resp = requests.post(url, headers=headers, json=data, timeout=30)
        if resp.status_code == 200:
            res_text = resp.json()['candidates'][0]['content']['parts'][0]['text']
            answers_dict = json.loads(res_text)
            
            # Update current questions
            updated_count = 0
            for i, q in enumerate(current_qs):
                q_num = str(i + 1)
                if q_num in answers_dict:
                    a_val = answers_dict[q_num]
                    if a_val in [1, 2, 3, 4]:
                        q['a'] = a_val
                        updated_count += 1
            print(f"    -> AI updated {updated_count} answers.")
            return True
    except Exception as e:
        print("    -> Failed to extract answers:", e)
    return False

def reparse_full_with_ai(text):
    prompt = """
    다음은 객관식 시험지(문항, 보기, 정답) 텍스트입니다.
    이 텍스트에서 60개의 문항을 모두 빠짐없이 추출하여 배열로 반환하세요.
    반드시 60개가 되어야 합니다. 정답은 텍스트 맨 끝의 정답표를 참고하세요.
    """
    safe_text = text[:80000]
    
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
    
    key = API_KEYS[0]
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key={key}"
    headers = {'Content-Type': 'application/json'}
    data = {
        "contents": [{"parts": [{"text": prompt + "\n\n" + safe_text}]}],
        "generationConfig": {
            "response_mime_type": "application/json",
            "response_schema": schema
        }
    }
    
    try:
        resp = requests.post(url, headers=headers, json=data, timeout=60)
        if resp.status_code == 200:
            res_text = resp.json()['candidates'][0]['content']['parts'][0]['text']
            parsed = json.loads(res_text)
            if isinstance(parsed, list) and len(parsed) >= 59:
                return parsed
    except Exception as e:
        pass
    return None

def main():
    with open(QUESTIONS_FILE, 'r', encoding='utf-8') as f:
        questions_db = json.load(f)

    # 1. Identify error exams
    # - Length != 60
    # - Missing answers
    error_exams = []
    for key, qs in questions_db.items():
        # Only process baking exams (제과제빵은행, 제빵기능사) that have length = 59 or missing answers
        if "제과제빵은행" not in key and "제빵기능사" not in key and "제과기능사" not in key:
            continue
            
        if "시험지_" in key: # Skip randomly generated duplicate exams
            continue
            
        if len(qs) != 60:
            error_exams.append((key, "length"))
            continue
            
        missing_answers = 0
        for q in qs:
            if not q.get("is_subjective"):
                a = q.get("a")
                if a not in [1, 2, 3, 4, "1", "2", "3", "4"]:
                    missing_answers += 1
        if missing_answers > 0:
            error_exams.append((key, "answers"))

    print(f"Found {len(error_exams)} exams with errors.")
    
    modified = False
    
    for key, err_type in error_exams:
        print(f"\nProcessing {key} (Error: {err_type})...")
        filepath = find_file_for_key(key)
        if not filepath:
            print("  -> Could not find HWP file.")
            continue
            
        print(f"  -> Found HWP: {filepath}")
        text = extract_text_hwp(filepath)
        if not text: continue
        
        # Look for answer file
        ans_filepath = None
        base = os.path.basename(filepath).replace('.hwp', '')
        for root, _, files in os.walk(os.path.dirname(filepath)):
            for f in files:
                if ("답지" in f or "정답" in f) and base[:5] in f and f != os.path.basename(filepath):
                    ans_filepath = os.path.join(root, f)
                    break
        
        if ans_filepath:
            print(f"  -> Appending answer file: {ans_filepath}")
            text += "\n\n" + extract_text_hwp(ans_filepath)
            
        if err_type == "answers":
            # Just try to map answers
            success = fix_answers_with_ai(text, questions_db[key])
            if success: 
                modified = True
            else:
                print("  -> AI answer extraction failed, falling back to full re-parse...")
                parsed = reparse_full_with_ai(text)
                if parsed:
                    print(f"  -> Extracted {len(parsed)} questions. Updating.")
                    questions_db[key] = parsed
                    modified = True
                else:
                    print("  -> Full re-parse fallback failed.")
        elif err_type == "length":
            # Re-parse full
            parsed = reparse_full_with_ai(text)
            if parsed:
                print(f"  -> Extracted {len(parsed)} questions. Updating.")
                questions_db[key] = parsed
                modified = True
            else:
                print("  -> Full re-parse failed.")
                
        # Dump every iteration to save progress
        if modified:
            with open(QUESTIONS_FILE, 'w', encoding='utf-8') as f:
                json.dump(questions_db, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
