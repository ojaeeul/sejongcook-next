import os
import re
import json
import subprocess

TARGET_DIR = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/기출문제"
QUESTIONS_FILE = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/questions_data.json"
HWP5TXT_BIN = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/hwp_env/bin/hwp5txt"

FILES_TO_PARSE = [
    "한식조리기능사20070916(교사용).hwp",
    "한식조리기능사20130127(교사용).hwp",
    "hcook_070128.hwp",
    "한식조리기능사20100711(교사용).hwp",
    "한식조리기능사20051002(교사용).hwp",
    "한식조리기능사20090118(교사용).hwp",
    "한식조리기능사20120212(교사용).hwp",
    "한식조리기능사20110417(교사용).hwp",
    "조리기능사필기기출문제_140406.hwp",
    "hcook_040718.hwp",
    "hcook_160124-m.hwp",
    "한식조리기능사20080330(교사용).hwp",
    "한식조리기능사20041010(교사용).hwp",
    "hcook_130414.hwp",
    "한식조리기능사20070401(교사용).hwp",
    "한식조리기능사20070128(교사용).hwp",
    "한식조리기능사20070715(교사용).hwp"
]

import unicodedata

def normalize(s):
    return unicodedata.normalize('NFC', s)

def extract_text(hwp_path):
    try:
        env = os.environ.copy()
        res = subprocess.run([HWP5TXT_BIN, hwp_path], capture_output=True, text=True, check=True, env=env)
        return res.stdout
    except Exception as e:
        print(f"Failed to extract {hwp_path}: {e}")
        return ""

def parse_text(text):
    text = text.replace('\xa0', ' ').replace('\u3000', ' ').replace('\r', '')
    
    # Split text by "number." pattern at start of a line or after spaces
    parts = re.split(r'\n\s*(\d{1,2})\.\s+', text)
    if len(parts) < 3:
        # try another pattern: "1.문제" without space
        parts = re.split(r'\n\s*(\d{1,2})\.', text)
    
    questions = []
    
    # parts[0] is preamble. then parts[1] is "1", parts[2] is text, etc.
    for i in range(1, len(parts), 2):
        try:
            q_num = int(parts[i])
            q_body = parts[i+1]
        except:
            continue
            
        # find the options
        # Usually starts with 가. 나. 다. 라. or 가) 나) 다) 라) or ① ② ③ ④
        opts_split = re.split(r'\s*(?:가\.|나\.|다\.|라\.|가\)|나\)|다\)|라\)|①|②|③|④)\s*', q_body)
        
        if len(opts_split) >= 5:
            q_text = opts_split[0].strip()
            # clean up question text (remove extra newlines)
            q_text = re.sub(r'\n+', ' ', q_text).strip()
            
            o1 = opts_split[1].strip()
            o2 = opts_split[2].strip()
            o3 = opts_split[3].strip()
            o4 = opts_split[4].strip()
            
            # Further clean options if they contain newlines or garbage at the end
            o4 = o4.split('\n')[0].strip()
            
            if q_text and o1 and o2 and o3 and o4:
                questions.append({
                    "q": q_text,
                    "o": [o1, o2, o3, o4],
                    "a": 1
                })
        else:
            # Maybe it uses 1) 2) 3) 4)
            opts_split = re.split(r'\s*(?:1\)|2\)|3\)|4\)|1\.|2\.|3\.|4\.)\s*', q_body)
            if len(opts_split) >= 5:
                q_text = opts_split[0].strip()
                q_text = re.sub(r'\n+', ' ', q_text).strip()
                o1 = opts_split[1].strip()
                o2 = opts_split[2].strip()
                o3 = opts_split[3].strip()
                o4 = opts_split[4].strip()
                o4 = o4.split('\n')[0].strip()
                
                if q_text and o1 and o2 and o3 and o4:
                    questions.append({
                        "q": q_text,
                        "o": [o1, o2, o3, o4],
                        "a": 1
                    })
    
    return questions

def main():
    if os.path.exists(QUESTIONS_FILE):
        with open(QUESTIONS_FILE, 'r', encoding='utf-8') as f:
            db = json.load(f)
    else:
        db = {}
        
    normalized_target_files = [normalize(f) for f in FILES_TO_PARSE]
    
    # Map actual files in directory
    actual_files = {}
    for root, _, files in os.walk(TARGET_DIR):
        for f in files:
            actual_files[normalize(f)] = os.path.join(root, f)
            
    success_keys = []
    
    for f in normalized_target_files:
        if f in actual_files:
            hwp_path = actual_files[f]
            key = f"과거기출_{f}"
            
            print(f"Processing {f}...")
            text = extract_text(hwp_path)
            if not text:
                continue
                
            parsed = parse_text(text)
            if len(parsed) >= 10:
                # Store in db
                db[key] = parsed
                success_keys.append((f, key, len(parsed)))
                print(f"  -> Extracted {len(parsed)} questions")
            else:
                print(f"  -> Failed: only extracted {len(parsed)} questions.")
        else:
            print(f"File not found: {f}")
            
    # Save db
    with open(QUESTIONS_FILE, 'w', encoding='utf-8') as f:
        json.dump(db, f, ensure_ascii=False, indent=2)
        
    print("\n--- Summary ---")
    for fname, key, count in success_keys:
        print(f"Added {fname} (key: {key}) with {count} questions.")
        
    # Write to a temp json so we can easily update exam_courses.json later
    with open("temp_keys.json", "w") as f:
        json.dump([{"name": k[0].replace(".hwp", ""), "key": k[1]} for k in success_keys], f, ensure_ascii=False)

if __name__ == "__main__":
    main()
