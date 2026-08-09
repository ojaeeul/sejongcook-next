import os
import json
import time
import requests
import sys

ENV_PATH = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/.env.local"
DATA_PATH = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/questions_data.json"

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
        return "정답 정보가 올바르지 않습니다.", False
        
    correct_ans = options[correct_idx - 1]
    
    prompt = f"""
다음은 요리/제과/제빵/공중보건 등 기능사 자격증 기출문제입니다.
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
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key={api_key}"
    headers = {'Content-Type': 'application/json'}
    data = {
        "contents": [{"parts": [{"text": prompt}]}],
    }
    
    try:
        resp = requests.post(url, headers=headers, json=data, timeout=15)
        if resp.status_code == 200:
            res_text = resp.json()['candidates'][0]['content']['parts'][0]['text']
            return res_text.strip(), True
        elif resp.status_code == 429:
            return None, False  # Rate limit
        else:
            print(f"API Error: {resp.status_code} - {resp.text}")
            return None, False
    except Exception as e:
        print(f"Request failed: {e}")
        return None, False

def main():
    if not API_KEYS:
        print("No API key found")
        return
        
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    total_needed = 0
    for exam_name in data:
        for q in data[exam_name]:
            if 'e' not in q or not q['e'] or str(q['e']).strip() == "":
                total_needed += 1
                    
    print(f"Total missing explanations across all exams: {total_needed}")
    if total_needed == 0:
        return
        
    key_idx = 0
    save_counter = 0
    total_processed = 0
    
    for exam_name in data:
        exam_changed = False
        print(f"Checking {exam_name}...")
        
        for idx, q in enumerate(data[exam_name]):
            if 'e' not in q or not q['e'] or str(q['e']).strip() == "":
                ans = q.get('a')
                opts = q.get('o', [])
                if ans and isinstance(ans, int) and opts:
                    
                    success = False
                    retry_count = 0
                    while not success:
                        api_key = API_KEYS[key_idx % len(API_KEYS)]
                        key_idx += 1
                        
                        explanation, ok = get_explanation(q['q'], opts, ans, api_key)
                        
                        if ok and explanation:
                            q['e'] = explanation
                            exam_changed = True
                            save_counter += 1
                            total_processed += 1
                            print(f"  [{total_processed}/{total_needed}] {exam_name} Q{idx+1} explained.")
                            success = True
                            
                            # Sleep 4.5 seconds to strictly enforce < 15 requests per minute limit across IP
                            time.sleep(4.5)
                        else:
                            retry_count += 1
                            print(f"  API Failed (429). Retry {retry_count} with next key...")
                            # If we hit 429, wait 5 seconds before trying the next key
                            time.sleep(5.0)
                            
                            # If we failed 8 times in a row, it means the whole IP is rate limited for the minute.
                            # We just need to wait 60 seconds for the minute bucket to refill!
                            if retry_count > len(API_KEYS):
                                print("  IP Rate limit hit. Sleeping for 60 seconds...")
                                time.sleep(60)
                                retry_count = 0
                                
                    if save_counter >= 30:
                        with open(DATA_PATH, 'w', encoding='utf-8') as f:
                            json.dump(data, f, ensure_ascii=False, indent=2)
                        print(f"--- Checkpoint saved ---")
                        save_counter = 0
                        
        if exam_changed:
            with open(DATA_PATH, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"Saved progress for {exam_name}")
            save_counter = 0

if __name__ == "__main__":
    main()
