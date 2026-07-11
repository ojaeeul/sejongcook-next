import os
import re
import json
import subprocess
import shutil
import unicodedata
from bs4 import BeautifulSoup

QUESTIONS_FILE = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/questions_data.json"
EXAM_COURSES_FILE = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/exam_courses.json"
HWP5HTML_BIN = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/hwp_env/bin/hwp5html"

TARGET_FILES = [
    "/Users/ojaeeul/Downloads/제과제빵필기/중요문제정리(과목별로구분).hwp",
    "/Users/ojaeeul/Downloads/제과제빵필기/제과문제&답.hwp",
    "/Users/ojaeeul/Downloads/제과제빵필기/공통과목&답.hwp",
    "/Users/ojaeeul/Downloads/제과제빵필기/제빵문제&답.hwp",
    "/Users/ojaeeul/Downloads/제과제빵필기/공통과목-재료 숙제.hwp"
]

def normalize(s):
    return unicodedata.normalize('NFC', s)

def find_red_classes(styles_content):
    red_classes = set()
    lines = styles_content.split('\n')
    current_class = None
    for line in lines:
        match = re.match(r'^span\.([\w-]+)\s*\{', line)
        if match:
            current_class = match.group(1)
        if current_class and ('color: #ff0000' in line or 'color: red' in line):
            red_classes.add(current_class)
    return list(red_classes)

def extract_subjective(hwp_path):
    html_dir = "temp_subj_html"
    cmd = [HWP5HTML_BIN, hwp_path, "--output", html_dir]
    try:
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    except Exception as e:
        print("Error running hwp5html:", e)
        return []
        
    styles_path = os.path.join(html_dir, "styles.css")
    index_path = os.path.join(html_dir, "index.xhtml")
    if not os.path.exists(index_path) or not os.path.exists(styles_path):
        shutil.rmtree(html_dir, ignore_errors=True)
        return []
        
    with open(styles_path, "r", encoding="utf-8") as f:
        red_classes = find_red_classes(f.read())
        
    with open(index_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")
        
    questions = []
    current_q_text = ""
    current_a_text = ""
    
    for p in soup.find_all("p"):
        p_text_black = ""
        p_text_red = ""
        
        for span in p.find_all("span"):
            classes = span.get('class', [])
            is_red = any(c in red_classes for c in classes)
            text = span.get_text()
            
            if is_red:
                p_text_red += text
            else:
                p_text_black += text
                
        # Clean up
        p_text_black = p_text_black.replace('\r', '').replace('\n', '').strip()
        p_text_red = p_text_red.replace('\r', '').replace('\n', '').strip()
        
        # Determine if this starts a new question
        if re.match(r'^\d+\.', p_text_black):
            # Save the previous question if it has both Q and A
            if current_q_text and current_a_text:
                questions.append({
                    "q": current_q_text.strip(),
                    "a_text": current_a_text.strip(),
                    "is_subjective": True
                })
            current_q_text = p_text_black
            current_a_text = p_text_red
        else:
            if p_text_black:
                current_q_text += "\n" + p_text_black
            if p_text_red:
                if current_a_text:
                    current_a_text += "\n" + p_text_red
                else:
                    current_a_text = p_text_red
                    
    if current_q_text and current_a_text:
        questions.append({
            "q": current_q_text.strip(),
            "a_text": current_a_text.strip(),
            "is_subjective": True
        })
        
    shutil.rmtree(html_dir, ignore_errors=True)
    return questions

def main():
    if os.path.exists(QUESTIONS_FILE):
        with open(QUESTIONS_FILE, 'r', encoding='utf-8') as f:
            qdata = json.load(f)
    else:
        qdata = {}
        
    if os.path.exists(EXAM_COURSES_FILE):
        with open(EXAM_COURSES_FILE, 'r', encoding='utf-8') as f:
            ec = json.load(f)
    else:
        ec = []
        
    subj_exams = []
        
    for hwp_path in TARGET_FILES:
        filename = os.path.basename(hwp_path)
        print(f"Processing {filename}...")
        questions = extract_subjective(hwp_path)
        
        if len(questions) > 0:
            key = f"오재을(주관식)_{filename}"
            qdata[key] = questions
            subj_exams.append({"name": filename.replace(".hwp", ""), "key": key})
            print(f" -> Added {len(questions)} subjective questions.")
        else:
            print(f" -> No valid subjective questions found in {filename}.")
            
    with open(QUESTIONS_FILE, 'w', encoding='utf-8') as f:
        json.dump(qdata, f, ensure_ascii=False, indent=2)
        
    # Update exam_courses
    # Find or create "전체과정"
    cat_all = next((cat for cat in ec if cat.get('category') == '전체과정'), None)
    if not cat_all:
        cat_all = {"category": "전체과정", "courses": []}
        ec.append(cat_all)
        
    # Find or create "오재을(주관식)"
    subj_course = next((c for c in cat_all.get('courses', []) if c.get('name') == '오재을(주관식)'), None)
    if not subj_course:
        subj_course = {"name": "오재을(주관식)", "exams": []}
        cat_all['courses'].append(subj_course)
        
    # Add exams avoiding duplicates
    existing_keys = [ex['key'] for ex in subj_course['exams']]
    for ex in subj_exams:
        if ex['key'] not in existing_keys:
            subj_course['exams'].append(ex)
            
    with open(EXAM_COURSES_FILE, 'w', encoding='utf-8') as f:
        json.dump(ec, f, ensure_ascii=False, indent=2)
        
    print("Done processing subjective exams.")

if __name__ == "__main__":
    main()
