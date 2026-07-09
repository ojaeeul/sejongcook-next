import os
import json
import time
import subprocess
import requests

QUESTIONS_FILE = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/public/sejong/questions_data.json"
COURSES_FILE = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/public/sejong/exam_courses.json"
TARGET_DIR = "/Users/ojaeeul/Downloads/제과제빵필기"

import sys
sys.path.append("/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public")
from batch_parse_exams import extract_text_hwp, parse_with_ai, resolve_answer

def main():
    if not os.path.exists(QUESTIONS_FILE):
        db = {}
    else:
        with open(QUESTIONS_FILE, 'r', encoding='utf-8') as f:
            db = json.load(f)

    all_files = []
    for root, _, files in os.walk(TARGET_DIR):
        for file in files:
            if file.lower().endswith('.hwp'):
                all_files.append(os.path.join(root, file))

    def find_answer_file(main_file, all_files):
        base = os.path.basename(main_file).replace('.hwp', '')
        if "답지" in base or "정답" in base or "&답" in base:
            return None
        for f in all_files:
            f_base = os.path.basename(f)
            if ("답지" in f_base or "정답" in f_base or "&답" in f_base) and (base[:5] in f_base):
                if f != main_file:
                    return f
        return None

    added = 0
    total_files = len(all_files)
    
    for idx, filepath in enumerate(all_files):
        filename = os.path.basename(filepath)
        if "답지" in filename or "정답" in filename or "&답" in filename:
            continue
            
        new_key = f"오재을_제과제빵_{filename}"
        if new_key in db and len(db[new_key]) > 0:
            continue

        print(f"[{idx+1}/{total_files}] Processing {filename}...")
        
        text = extract_text_hwp(filepath)
        if not text or len(text.strip()) < 50:
            print("  -> Too short or unreadable.")
            continue
            
        ans_filepath = find_answer_file(filepath, all_files)
        if ans_filepath:
            ans_text = extract_text_hwp(ans_filepath)
            text += "\n\n[별도 파일 정답지 내용]\n" + ans_text

        questions = []
        attempts = 0
        while len(questions) == 0 and attempts < 10:
            attempts += 1
            questions = parse_with_ai(text)
            if questions and len(questions) > 0:
                break
            print(f"  [WARN] Failed attempt {attempts}, waiting 15s...")
            time.sleep(15)

        if questions and len(questions) > 0:
            final_questions = []
            for q_obj in questions:
                ans_idx = resolve_answer(q_obj)
                if ans_idx:
                    q_obj["a"] = ans_idx
                    final_questions.append(q_obj)
            
            db[new_key] = final_questions
            added += 1
            print(f"  -> Extracted {len(final_questions)} questions!")
            
            # Save incrementally
            with open(QUESTIONS_FILE, 'w', encoding='utf-8') as f:
                json.dump(db, f, ensure_ascii=False, indent=2)
        else:
            print(f"  -> Failed to extract questions for {filename} after all attempts.")

    print(f"\nFinished! Added {added} missing baking exams.")
    
    if added > 0:
        js_content = "window.QUESTIONS_DATA = " + json.dumps(db, ensure_ascii=False) + ";"
        with open(QUESTIONS_FILE.replace(".json", ".js"), 'w', encoding='utf-8') as f:
            f.write(js_content)
            
        with open(COURSES_FILE, 'r', encoding='utf-8') as f:
            ec = json.load(f)
            
        for cat in ec:
            if cat.get('category') == '전체과정':
                ojae_course = next((c for c in cat.get('courses', []) if isinstance(c, dict) and c.get('name') == '오재을(제과제빵)'), None)
                if not ojae_course:
                    ojae_course = {"name": "오재을(제과제빵)", "exams": []}
                    cat['courses'].insert(1, ojae_course)
                
                existing_keys = [ex['key'] for ex in ojae_course.get('exams', [])]
                for filepath in all_files:
                    fname = os.path.basename(filepath)
                    if "답지" in fname or "정답" in fname or "&답" in fname: continue
                    nkey = f"오재을_제과제빵_{fname}"
                    if nkey in db and nkey not in existing_keys:
                        ojae_course['exams'].append({"name": fname.replace('.hwp', ''), "key": nkey})
                            
        with open(COURSES_FILE, 'w', encoding='utf-8') as f:
            json.dump(ec, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
