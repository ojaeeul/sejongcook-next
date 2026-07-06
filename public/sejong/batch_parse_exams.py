import os
import re
import json
import time
import subprocess
import requests
from pathlib import Path

ENV_PATH = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/.env.local"
QUESTIONS_FILE = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/questions_data.json"
TARGET_DIR = "/Users/ojaeeul/Downloads/시험"
HWP5TXT_PATH = "/Library/Frameworks/Python.framework/Versions/3.13/bin/hwp5txt"

def load_api_keys():
    if not os.path.exists(ENV_PATH):
        return []
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
    if not API_KEYS:
        return None
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

def has_answers(text):
    # Heuristic for answer presence. Look for "정답" or digit sequences representing answers.
    if re.search(r'(정답|답안|가답안|답\s*안|정\s*답)', text):
        return True
    
    # Check if there are sequences of numbers like "1. ③ 2. ①" etc.
    if len(re.findall(r'\d{1,2}\s*[.\]]?\s*[①②③④⑤12345]', text)) > 10:
        return True
        
    return False

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

def parse_with_ai(text):
    prompt = """
다음은 시험지(문항과 정답 포함) 텍스트입니다. 
객관식 문제들을 찾아내어 아래 JSON 배열 형식으로만 완벽하게 추출하세요.
문제(q), 4개의 보기(o), 정답번호(a: 1~4 숫자)로 구성된 객체들의 배열이어야 합니다.
답안지가 없다면 빈 배열 [] 을 반환하세요.
오직 JSON 형태만 출력해야 하며 다른 말은 하지 마세요.

형식 예시:
[
  { "q": "문제 내용", "o": ["보기1", "보기2", "보기3", "보기4"], "a": 1 }
]

[텍스트 시작]
""" + text[:30000]

    key = get_next_key()
    if not key:
        print("No API Key available.")
        return []
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={key}"
    headers = {'Content-Type': 'application/json'}
    data = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"response_mime_type": "application/json"}
    }

    try:
        resp = requests.post(url, headers=headers, json=data)
        if resp.status_code == 200:
            result = resp.json()
            try:
                res_text = result['candidates'][0]['content']['parts'][0]['text']
                parsed = json.loads(res_text)
                if isinstance(parsed, list):
                    return parsed
            except:
                print("Failed to parse JSON from AI response")
        elif resp.status_code in [429, 503]:
            print(f"Rate limit or overloaded ({resp.status_code}). Waiting 10s...")
            time.sleep(10)
            return parse_with_ai(text) # Retry with next key
        else:
            print(f"API Error {resp.status_code}: {resp.text}")
    except Exception as e:
        print("Exception calling AI:", e)
    return []

def normalize_text(text):
    # Remove leading numbers and punctuation, e.g., "1.", "1)", "가.", "①"
    t = re.sub(r'^[\d①-⑳가-하a-zA-Z]+[\.\)]?\s*', '', text)
    # Remove all whitespace and non-alphanumeric characters for strict matching
    t = re.sub(r'[\s\W_]+', '', t)
    return t

def main():
    if not os.path.exists(QUESTIONS_FILE):
        questions_db = {}
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
    
    for root, _, files in os.walk(TARGET_DIR):
        for file in files:
            if not file.lower().endswith('.hwp'):
                continue
                
            filepath = os.path.join(root, file)
            print(f"Checking {file}...")
            
            text = extract_text_hwp(filepath)
            if not text:
                continue
                
            if not has_answers(text):
                print(f"  -> No answers detected. Skipping.")
                continue
                
            print(f"  -> Answers detected! Parsing with AI...")
            category = determine_category(file)
            new_key = f"{category}_자동수집_{file}"
            
            if new_key in questions_db:
                print(f"  -> Already processed this file ({new_key}). Skipping.")
                processed += 1
                continue
            
            questions = parse_with_ai(text)
            if questions and len(questions) > 0:
                final_questions = []
                new_count = 0
                for q_obj in questions:
                    q_text = q_obj.get("q", "")
                    norm = normalize_text(q_text)
                    if norm and norm not in existing_questions:
                        final_questions.append(q_obj)
                        existing_questions.add(norm)
                        new_count += 1
                    else:
                        # Replace duplicate with placeholder to maintain question count
                        final_questions.append({
                            "q": "[중복 문항으로 삭제되었습니다]",
                            "o": ["-", "-", "-", "-"],
                            "a": ""
                        })
                
                print(f"  -> Extracted {len(questions)} questions, {new_count} are new!")
                questions_db[new_key] = final_questions
                added += new_count
                
                with open(QUESTIONS_FILE, 'w', encoding='utf-8') as f:
                    json.dump(questions_db, f, ensure_ascii=False, indent=2)
            else:
                print("  -> AI extracted 0 questions.")
                
            processed += 1
            time.sleep(1) # Slight delay
            
    print(f"Job complete! Processed {processed} files, added {added} questions total.")
    # Run the deployment command
    subprocess.run(["/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/시스템_시작.command"])

if __name__ == "__main__":
    main()
