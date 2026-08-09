import os
import json
import time
import requests
import unicodedata

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

def get_rewritten_question(course, q_text, options, correct_idx, api_key):
    course_context = ""
    if "양식" in course:
        course_context = "'김치', '고추장', '된장', '청국장' 같은 한식 재료를 '치즈', '피클', '버터', '마요네즈', '토마토소스' 등 서양식(양식) 식재료로 치환하세요."
    elif "중식" in course:
        course_context = "'김치', '고추장', '된장', '청국장' 같은 한식 재료를 '두반장', '굴소스', '짜사이', '춘장' 등 중식 식재료로 치환하세요."
    elif "일식" in course:
        course_context = "'김치', '고추장', '된장', '청국장' 같은 한식 재료를 '미소(일본식 된장)', '낫토', '다쿠앙', '우메보시' 등 일식 식재료로 치환하세요."
    else:
        return None, False

    prompt = f"""
당신은 조리기능사 필기시험 출제위원입니다. 
다음은 과거 공통과목 시절에 출제되어 양식/중식/일식 시험에 섞여 들어간 한식 관련 문제(식품학, 원가계산 등)입니다.
원래의 출제 의도(예: 발효 원리, 산성도, 갈변 현상, 원가계산 식 등)와 **정답 번호({correct_idx}번)**는 정확히 유지하되, 
{course} 과정에 어울리게 문맥과 보기 식재료를 완전히 새롭게 작성해주세요.
{course_context}

[원본 문제]
질문: {q_text}
보기:
1. {options[0] if len(options)>0 else ''}
2. {options[1] if len(options)>1 else ''}
3. {options[2] if len(options)>2 else ''}
4. {options[3] if len(options)>3 else ''}
정답 번호: {correct_idx}

출력은 반드시 JSON 형식으로만 해주세요 (Markdown 코드 블록 없이 순수 JSON만).
형식:
{{
  "q": "새롭게 작성된 질문",
  "o": ["새로운 보기1", "새로운 보기2", "새로운 보기3", "새로운 보기4"],
  "e": "새롭게 작성된 질문에 대한 구체적이고 친절한 해설"
}}
"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-lite:generateContent?key={api_key}"
    headers = {'Content-Type': 'application/json'}
    data = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "response_mime_type": "application/json"
        }
    }
    
    try:
        res = requests.post(url, headers=headers, json=data, timeout=20)
        if res.status_code == 200:
            result = res.json()
            text_response = result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
            parsed = json.loads(text_response)
            if 'q' in parsed and 'o' in parsed and 'e' in parsed and len(parsed['o']) == len(options):
                return parsed, True
            else:
                return None, False
        elif res.status_code == 429 or res.status_code == 503:
            return "RATE_LIMIT", False
        else:
            return "RATE_LIMIT", False # Treat other errors as rate limit to retry
    except Exception as e:
        return "RATE_LIMIT", False

def run_rewriter():
    if not API_KEYS:
        print("API Keys missing.")
        return

    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    keywords = ['고추장', '김치', '된장', '청국장']
    target_courses = ['양식', '중식', '일식']
    
    key_idx = 0
    rewritten_count = 0
    error_count = 0

    for subj, exams in data.items():
        subj_nfc = unicodedata.normalize('NFC', subj)
        matched_course = next((c for c in target_courses if c in subj_nfc), None)
        if not matched_course: continue
        
        for q in exams:
            if q.get('rewritten'): continue
            
            text = q.get('q', '') + ' '.join([str(o) for o in q.get('o', []) if isinstance(o, str)])
            if any(k in text for k in keywords):
                # Rewrite required
                original_q = q.get('q')
                options = q.get('o', [])
                ans = q.get('a')
                if not ans or not isinstance(ans, int) or ans < 1 or ans > len(options):
                    continue

                retry_count = 0
                success = False
                while retry_count <= len(API_KEYS):
                    api_key = API_KEYS[key_idx % len(API_KEYS)]
                    parsed_res, ok = get_rewritten_question(matched_course, original_q, options, ans, api_key)
                    
                    if ok:
                        q['q'] = parsed_res['q']
                        q['o'] = parsed_res['o']
                        q['e'] = parsed_res['e']
                        q['rewritten'] = True
                        rewritten_count += 1
                        print(f"[{rewritten_count}] Rewrote in {matched_course}: {original_q[:30]}... -> {q['q'][:30]}...")
                        
                        # Save incrementally
                        with open(DATA_PATH, "w", encoding="utf-8") as f_out:
                            json.dump(data, f_out, ensure_ascii=False, indent=2)
                        
                        success = True
                        key_idx += 1
                        time.sleep(3) # Delay to share quota
                        break
                    elif parsed_res == "RATE_LIMIT":
                        print(f"Rate limit on key index {key_idx % len(API_KEYS)}. Switching key...")
                        key_idx += 1
                        retry_count += 1
                    else:
                        print(f"Failed to rewrite: {original_q[:30]}...")
                        error_count += 1
                        key_idx += 1
                        break
                
                if not success and retry_count > len(API_KEYS):
                    print("All keys rate limited. Sleeping for 60 seconds...")
                    time.sleep(60)
                    
if __name__ == "__main__":
    print("Starting course question rewriter...")
    run_rewriter()
    print("Finished.")
