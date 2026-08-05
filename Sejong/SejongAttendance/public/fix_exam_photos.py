import os
import re
import json
import base64
import time
import requests
import unicodedata

ENV_PATH = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/.env.local"
QUESTIONS_FILE = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/questions_data.json"
PHOTOS_DIR = "/Users/ojaeeul/Documents/시사쿡 시험지"

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

def encode_image(filepath):
    with open(filepath, "rb") as f:
        return base64.b64encode(f.read()).decode('utf-8')

def parse_with_ai(images_data, existing_json, exam_name, retries=5):
    prompt = f"""
다음 사진들은 '{exam_name}' 객관식 시험지의 원본 사진들입니다.
제공된 JSON 데이터는 기존에 텍스트 추출로만 생성된 문항 데이터입니다.

기존 데이터에는 다음과 같은 문제점들이 있을 수 있습니다:
1. 사진에 존재하는 '표(테이블)'나 '그림' 관련 내용이 지문(q)에 누락됨
2. 보기(o) 내용 중 일부가 누락되거나 오타가 있음

당신의 임무는 사진 원본을 바탕으로 기존 JSON 데이터를 완벽하게 교정하는 것입니다.
- 누락된 표가 있다면 HTML `<table border="1" style="border-collapse: collapse; margin-top: 10px;">` 태그를 사용하여 문제 지문(q)의 텍스트에 자연스럽게 삽입하세요.
- 오타나 누락된 보기 내용이 있으면 수정하세요.
- 단, 기존 JSON에 있는 정답(a)과 해설(e) 필드의 값은 절대 변경하거나 삭제하지 말고 그대로 유지하세요!

결과는 반드시 수정이 완료된 동일한 형태의 JSON 배열 구조로 반환하세요.
(다른 설명 없이 오직 JSON 배열만 출력하세요)

[기존 JSON 데이터]
{json.dumps(existing_json, ensure_ascii=False, indent=2)}
"""

    parts = [{"text": prompt}]
    for img_data in images_data:
        parts.append({
            "inlineData": {
                "mimeType": "image/jpeg",
                "data": img_data
            }
        })
        
    schema = {
        "type": "ARRAY",
        "items": {
            "type": "OBJECT",
            "properties": {
                "q": {"type": "STRING", "description": "문제 지문 내용 (필요시 HTML 표 포함)"},
                "o": {"type": "ARRAY", "items": {"type": "STRING"}, "description": "1,2,3,4번 보기 리스트. 정확히 4개여야 함."},
                "a": {"type": "INTEGER", "description": "정답 번호"},
                "e": {"type": "STRING", "description": "해설"}
            },
            "required": ["q", "o", "a"]
        }
    }

    for attempt in range(retries):
        key = get_next_key()
        if not key: return None
            
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={key}"
        headers = {'Content-Type': 'application/json'}
        data = {
            "contents": [{"parts": parts}],
            "generationConfig": {
                "response_mime_type": "application/json",
                "response_schema": schema
            }
        }

        try:
            resp = requests.post(url, headers=headers, json=data, timeout=120)
            if resp.status_code == 200:
                result = resp.json()
                try:
                    res_text = result['candidates'][0]['content']['parts'][0]['text']
                    parsed = json.loads(res_text)
                    if isinstance(parsed, list) and len(parsed) >= 50:
                        return parsed
                    else:
                        print(f"Warning: Parsed list length is only {len(parsed)}.")
                except Exception as e:
                    print("Failed to parse JSON from AI response:", e)
            elif resp.status_code in [429, 503]:
                print(f"Rate limit or overloaded ({resp.status_code}). Waiting 15s...")
                time.sleep(15)
                continue
            else:
                print(f"API Error {resp.status_code}: {resp.text}")
        except Exception as e:
            print("Exception calling AI:", e)
            time.sleep(5)
            
    print("Failed after all retries.")
    return None

def main():
    if not os.path.exists(QUESTIONS_FILE):
        print("Questions DB not found!")
        return
        
    with open(QUESTIONS_FILE, 'r', encoding='utf-8') as f:
        q_db = json.load(f)
        
    suffix_map = {"1회": "가형", "2회": "나형", "3회": "다형", "4회": "라형", "5회": "마형"}
    
    processed_count = 0
    
    for folder_name in os.listdir(PHOTOS_DIR):
        folder_path = os.path.join(PHOTOS_DIR, folder_name)
        if not os.path.isdir(folder_path): continue
        
        folder_nfc = unicodedata.normalize('NFC', folder_name)
        
        # Determine subject and suffix
        subject = ""
        if "제과기능사" in folder_nfc: subject = "제과기능사_제과기능사"
        elif "제빵기능사" in folder_nfc: subject = "제빵기능사_제빵기능사"
        
        suffix = None
        for k, v in suffix_map.items():
            if k in folder_nfc:
                suffix = v
                break
                
        if not subject or not suffix: continue
        
        key = f"{subject} {suffix}"
        
        if key not in q_db:
            print(f"Skipping {folder_name}: Key {key} not found in DB.")
            continue
            
        existing_data = q_db[key]
        print(f"Processing {folder_name} -> {key} ({len(existing_data)} questions existing)")
        
        # Load images
        images_data = []
        for img_file in sorted(os.listdir(folder_path)):
            if img_file.lower().endswith(('.jpg', '.jpeg', '.png')):
                img_path = os.path.join(folder_path, img_file)
                images_data.append(encode_image(img_path))
                
        if not images_data:
            print(f"  -> No images found in {folder_name}")
            continue
            
        print(f"  -> Found {len(images_data)} images. Requesting AI validation...")
        
        updated_data = parse_with_ai(images_data, existing_data, folder_name)
        if updated_data:
            print(f"  -> Success! Merging updated data.")
            # Ensure explanations/answers are not lost if AI missed them
            for idx, new_q in enumerate(updated_data):
                if idx < len(existing_data):
                    old_q = existing_data[idx]
                    if 'a' in old_q and 'a' not in new_q: new_q['a'] = old_q['a']
                    if 'e' in old_q and 'e' not in new_q: new_q['e'] = old_q['e']
                    
            q_db[key] = updated_data
            processed_count += 1
            
            # Save incrementally
            with open(QUESTIONS_FILE, 'w', encoding='utf-8') as f:
                json.dump(q_db, f, ensure_ascii=False, indent=2)
        else:
            print("  -> Failed to get valid updated data from AI.")
            
        time.sleep(2)
        
    print(f"Completed! {processed_count} exams updated.")

if __name__ == "__main__":
    main()
