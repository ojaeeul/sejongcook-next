import os
import re
import json
import subprocess
import shutil
import unicodedata
from bs4 import BeautifulSoup

TARGET_DIR = "/Users/ojaeeul/Downloads/제과제빵필기"
QUESTIONS_FILE = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/questions_data.json"
EXAM_COURSES_FILE = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/exam_courses.json"
HWP5TXT_BIN = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/hwp_env/bin/hwp5txt"
HWP5HTML_BIN = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/hwp_env/bin/hwp5html"

ans_map = {'가': 1, '나': 2, '다': 3, '라': 4, '1': 1, '2': 2, '3': 3, '4': 4, '①': 1, '②': 2, '③': 3, '④': 4}

def normalize(s):
    return unicodedata.normalize('NFC', s)

def extract_text(hwp_path):
    try:
        env = os.environ.copy()
        res = subprocess.run([HWP5TXT_BIN, hwp_path], capture_output=True, text=True, check=True, env=env)
        return res.stdout
    except Exception as e:
        print(f"Failed to extract text for {hwp_path}: {e}")
        return ""

def parse_text(text):
    text = text.replace('\xa0', ' ').replace('\u3000', ' ').replace('\r', '')
    
    parts = re.split(r'\n\s*(\d{1,2})\.\s+', text)
    if len(parts) < 3:
        parts = re.split(r'\n\s*(\d{1,2})\.', text)
    
    questions = []
    
    for i in range(1, len(parts), 2):
        try:
            q_num = int(parts[i])
            q_body = parts[i+1]
        except:
            continue
            
        opts_split = re.split(r'(?<![가-힣])\s*(?:가\.|나\.|다\.|라\.|가\)|나\)|다\)|라\)|①|②|③|④)\s*', q_body)
        
        if len(opts_split) >= 5:
            q_text = opts_split[0].strip()
            q_text = re.sub(r'\n+', ' ', q_text).strip()
            o1 = opts_split[1].strip()
            o2 = opts_split[2].strip()
            o3 = opts_split[3].strip()
            o4 = opts_split[4].strip()
            o4 = o4.split('\n')[0].strip()
            
            if q_text and o1 and o2 and o3 and o4:
                questions.append({"q": q_text, "o": [o1, o2, o3, o4], "a": 1})
        else:
            opts_split = re.split(r'(?<![가-힣0-9])\s*(?:1\)|2\)|3\)|4\)|1\.|2\.|3\.|4\.)\s*', q_body)
            if len(opts_split) >= 5:
                q_text = opts_split[0].strip()
                q_text = re.sub(r'\n+', ' ', q_text).strip()
                o1 = opts_split[1].strip()
                o2 = opts_split[2].strip()
                o3 = opts_split[3].strip()
                o4 = opts_split[4].strip()
                o4 = o4.split('\n')[0].strip()
                
                if q_text and o1 and o2 and o3 and o4:
                    questions.append({"q": q_text, "o": [o1, o2, o3, o4], "a": 1})

    
    return questions

def extract_answers_html(hwp_path, filename):
    html_dir = f"temp_html_{filename.replace(' ', '_')}"
    cmd = [HWP5HTML_BIN, hwp_path, "--output", html_dir]
    try:
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    except:
        return {}
        
    index_path = os.path.join(html_dir, "index.xhtml")
    if not os.path.exists(index_path):
        shutil.rmtree(html_dir, ignore_errors=True)
        return {}
        
    with open(index_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")
        
    tables = soup.find_all("table")
    answers = {}
    
    for table in tables:
        rows = table.find_all("tr")
        grid = []
        for row in rows:
            cells = row.find_all(["td", "th"])
            grid.append([c.get_text(strip=True) for c in cells])
            
        for i in range(len(grid)):
            for j in range(len(grid[i])):
                val = grid[i][j]
                if val.isdigit() and 1 <= int(val) <= 60:
                    q_num = int(val)
                    ans_found = False
                    
                    # Check next column in same row
                    if j + 1 < len(grid[i]):
                        ans_str = grid[i][j+1]
                        if ans_str in ans_map:
                            answers[q_num] = ans_map[ans_str]
                            ans_found = True
                    
                    # Check same column in next row
                    if not ans_found and i + 1 < len(grid):
                        if j < len(grid[i+1]):
                            ans_str = grid[i+1][j]
                            if ans_str in ans_map:
                                answers[q_num] = ans_map[ans_str]
    
    shutil.rmtree(html_dir, ignore_errors=True)
    return answers

def main():
    if os.path.exists(QUESTIONS_FILE):
        with open(QUESTIONS_FILE, 'r', encoding='utf-8') as f:
            qdata = json.load(f)
    else:
        qdata = {}

    processed_keys = []
    
    for root, _, files in os.walk(TARGET_DIR):
        for filename in files:
            if not filename.endswith(".hwp") or "답지" in filename or "정답" in filename:
                continue
                
            file_path = os.path.join(root, filename)
            key = f"오재을_제과제빵_{filename}"
            
            # Skip if already exists and has 50+ valid questions
            # REMOVED TO FORCE RE-PARSE
                
            print(f"Processing {filename}...")
            
            text = extract_text(file_path)
            questions = parse_text(text)
            
            if len(questions) < 10:
                print(f"  -> Failed to parse enough questions ({len(questions)} found).")
                continue
                
            answers = extract_answers_html(file_path, filename)
            
            if len(answers) == 0:
                ans_file = None
                base_name = filename.replace('.hwp', '')
                for f in os.listdir(root):
                    f_nfc = unicodedata.normalize('NFC', f)
                    if f != filename and ("답" in f_nfc or "정답" in f_nfc) and base_name[:4] in f:
                        ans_file = os.path.join(root, f)
                        break
                if ans_file:
                    answers = extract_answers_html(ans_file, "temp_ans.hwp")
            
            for idx, q_obj in enumerate(questions):
                q_num = idx + 1
                if q_num in answers:
                    q_obj['a'] = answers[q_num]
                    
            qdata[key] = questions
            processed_keys.append({"name": filename.replace('.hwp', ''), "key": key})
            print(f"  -> Successfully added {filename} with {len(questions)} questions and {len(answers)} answers.")
            
    # Save back
    with open(QUESTIONS_FILE, 'w', encoding='utf-8') as f:
        json.dump(qdata, f, ensure_ascii=False, indent=2)
        
    print(f"\nSaved {len(processed_keys)} exams to database.")
    
    # Update exam_courses.json
    if os.path.exists(EXAM_COURSES_FILE) and processed_keys:
        with open(EXAM_COURSES_FILE, 'r', encoding='utf-8') as f:
            ec = json.load(f)
            
        for cat in ec:
            if cat.get('category') == '전체과정':
                ojae_course = next((c for c in cat.get('courses', []) if isinstance(c, dict) and c.get('name') == '오재을(제과제빵)'), None)
                if not ojae_course:
                    ojae_course = {"name": "오재을(제과제빵)", "exams": []}
                    cat['courses'].insert(1, ojae_course)
                    
                existing_keys = [ex['key'] for ex in ojae_course.get('exams', [])]
                for pk in processed_keys:
                    if pk['key'] not in existing_keys:
                        ojae_course['exams'].append(pk)
                        existing_keys.append(pk['key'])
                        
        with open(EXAM_COURSES_FILE, 'w', encoding='utf-8') as f:
            json.dump(ec, f, ensure_ascii=False, indent=2)
            
    print("exam_courses.json updated successfully.")

if __name__ == "__main__":
    main()
