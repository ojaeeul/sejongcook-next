import os
import json
import subprocess
import time
import re
import requests

QUESTIONS_FILE = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/public/sejong/questions_data.json"
COURSES_FILE = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/public/sejong/exam_courses.json"
TARGET_FILE = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/기출문제/hcook_070128.hwp"
ANS_FILE = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/기출문제/한식조리기능사20070128(교사용).hwp"

# Copy helper functions
from batch_parse_exams import extract_text_hwp, parse_with_ai, resolve_answer

print("Extracting main file...")
text = extract_text_hwp(TARGET_FILE)
print("Extracting answer file...")
ans_text = extract_text_hwp(ANS_FILE)

full_text = text + "\n\n[별도 파일 정답지 내용]\n" + ans_text

print("Sending to AI... (Will retry indefinitely until it succeeds)")

questions = []
attempts = 0
while len(questions) == 0 and attempts < 10:
    attempts += 1
    questions = parse_with_ai(full_text)
    if questions and len(questions) > 0:
        break
    print(f"Failed attempt {attempts}, waiting 15s...")
    time.sleep(15)

if questions and len(questions) > 0:
    final_questions = []
    for q_obj in questions:
        ans_idx = resolve_answer(q_obj)
        if ans_idx:
            q_obj["a"] = ans_idx
            final_questions.append(q_obj)
            
    print(f"Extracted {len(final_questions)} questions. Saving to DB...")
    
    with open(QUESTIONS_FILE, 'r', encoding='utf-8') as f:
        db = json.load(f)
        
    new_key = "오재을_hcook_070128.hwp"
    db[new_key] = final_questions
    
    with open(QUESTIONS_FILE, 'w', encoding='utf-8') as f:
        json.dump(db, f, ensure_ascii=False, indent=2)
        
    print("Done! Rebuilding JS...")
    
    # Rebuild JS
    js_content = "window.QUESTIONS_DATA = " + json.dumps(db, ensure_ascii=False) + ";"
    with open(QUESTIONS_FILE.replace(".json", ".js"), 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    # Also update courses if needed
    with open(COURSES_FILE, 'r', encoding='utf-8') as f:
        ec = json.load(f)
        
    for cat in ec:
        if cat.get('category') == '전체과정':
            ojae_course = next((c for c in cat.get('courses', []) if isinstance(c, dict) and c.get('name') == '오재을'), None)
            if ojae_course:
                existing_keys = [ex['key'] for ex in ojae_course.get('exams', [])]
                if new_key not in existing_keys:
                    ojae_course['exams'].append({"name": "hcook_070128", "key": new_key})
                    
    with open(COURSES_FILE, 'w', encoding='utf-8') as f:
        json.dump(ec, f, ensure_ascii=False, indent=2)
        
    print("All updated successfully!")
    
    # Deploy
    subprocess.run(["git", "add", "."], cwd="/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/public/sejong")
    subprocess.run(["git", "commit", "-m", "Add hcook_070128"], cwd="/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/public/sejong")
    subprocess.run(["npx", "vercel", "--prod", "--yes"], cwd="/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next")
else:
    print("Failed to extract questions after all attempts.")
