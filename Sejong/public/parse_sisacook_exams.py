import os
import sys
import json
import base64
import requests
import unicodedata
import time
import random
from concurrent.futures import ThreadPoolExecutor, as_completed

ENV_PATH = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/.env.local"
def load_api_keys():
    if not os.path.exists(ENV_PATH): return []
    with open(ENV_PATH, "r") as f:
        for line in f:
            if line.startswith("GEMINI_API_KEYS="):
                return line.strip().split("=")[1].strip('"').split(",")
    return []

API_KEYS = load_api_keys()

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

def parse_with_gemini(image_paths, exam_name, start_key_idx):
    prompt = f"""
다음은 제과/제빵 기능사 기출문제({exam_name}) 시험지의 문항 및 해설지 사진들입니다.
사진들을 꼼꼼하게 읽고, 전체 객관식 문제(문제 지문, 보기 4개, 정답, 해설)를 추출하세요. (최대 60문제)
문제 번호순으로 빠짐없이 추출해야 합니다. 
보기는 반드시 4개여야 하며, 정답은 1, 2, 3, 4 중 하나의 숫자입니다.
해설(e)은 제공된 사진에 있는 해설을 그대로 추출하세요. 해설이 없는 경우 빈 문자열("")로 두세요.

반드시 문제(q), 보기 4개 배열(o), 정답(a - 1,2,3,4), 해설(e) 형태로 반환해야 합니다.
"""
    schema = {
        "type": "ARRAY",
        "items": {
            "type": "OBJECT",
            "properties": {
                "q": {"type": "STRING", "description": "문제 지문 내용"},
                "o": {"type": "ARRAY", "items": {"type": "STRING"}, "description": "1,2,3,4번 보기 리스트. 정확히 4개여야 함."},
                "a": {"type": "INTEGER", "description": "정답 번호 (1, 2, 3, 4)"},
                "e": {"type": "STRING", "description": "정답 해설 (없으면 빈 문자열)"}
            },
            "required": ["q", "o", "a", "e"]
        }
    }
    
    parts = [{"text": prompt}]
    for path in image_paths:
        ext = path.lower().split('.')[-1]
        mime = f"image/{ext}" if ext != 'jpg' else "image/jpeg"
        parts.append({
            "inlineData": {
                "mimeType": mime,
                "data": encode_image(path)
            }
        })
    
    headers = {'Content-Type': 'application/json'}
    payload = {
        "contents": [{"parts": parts}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": schema
        }
    }
    
    key_idx = start_key_idx
    retries = 0
    while True:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEYS[key_idx]}"
        print(f"[{exam_name}] Sending {len(image_paths)} images using key {key_idx} (Timeout=600s, Retry={retries})...")
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=600)
            if response.status_code == 200:
                print(f"[{exam_name}] Success!")
                return json.loads(response.json()["candidates"][0]["content"]["parts"][0]["text"])
            elif response.status_code == 429:
                print(f"[{exam_name}] 429 Quota Exceeded on key {key_idx}. Switching key and sleeping 20s...")
            else:
                print(f"[{exam_name}] API Error: {response.text}. Switching key and sleeping 20s...")
        except requests.exceptions.Timeout:
            print(f"[{exam_name}] Timeout on key {key_idx}. Switching key...")
        except Exception as e:
            print(f"[{exam_name}] Request failed: {e}. Switching key and sleeping 20s...")
            
        key_idx = (key_idx + 1) % len(API_KEYS)
        retries += 1
        time.sleep(20)

def process_all_exams():
    base_dir = "/Users/ojaeeul/Documents/시사쿡 시험지"
    output_dir = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/data/sisacook"
    os.makedirs(output_dir, exist_ok=True)
    
    if not os.path.exists(base_dir):
        print(f"Directory not found: {base_dir}")
        return
        
    tasks = []
    
    for item in sorted(os.listdir(base_dir)):
        item_path = os.path.join(base_dir, item)
        if os.path.isdir(item_path):
            item_nfc = unicodedata.normalize('NFC', item)
            if "제과기능사" in item_nfc or "제빵기능사" in item_nfc:
                exam_name = item_nfc.strip()
                images = []
                for root_dir, dirs, files in os.walk(item_path):
                    for f in sorted(files):
                        if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                            images.append(os.path.join(root_dir, f))
                
                tasks.append((exam_name, images))
                
    all_exams_data = {}
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        future_to_exam = {}
        for i, (exam_name, images) in enumerate(tasks):
            key_idx = i % len(API_KEYS)
            future = executor.submit(parse_with_gemini, images, exam_name, key_idx)
            future_to_exam[future] = exam_name
            
        for future in as_completed(future_to_exam):
            exam_name = future_to_exam[future]
            try:
                result = future.result()
                if result:
                    all_exams_data[exam_name] = result
                else:
                    print(f"[{exam_name}] Failed to parse.")
            except Exception as e:
                print(f"[{exam_name}] Exception during processing: {e}")

    output_file = os.path.join(output_dir, "all_sisacook_exams.json")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_exams_data, f, ensure_ascii=False, indent=2)
    print(f"\nFinished. Combined data saved to {output_file}")

if __name__ == "__main__":
    process_all_exams()
