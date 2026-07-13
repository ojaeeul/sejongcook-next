import os
import re
import json
import subprocess
import shutil
import unicodedata
from bs4 import BeautifulSoup

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOWNLOADS_DIR = os.path.expanduser("~/Downloads/제과제빵필기")
DB_JSON_PATH = os.path.join(BASE_DIR, "questions_data.json")
COURSES_JSON_PATH = os.path.join(BASE_DIR, "exam_courses.json")

# Ensure correct path to python3 for virtualenv
HWP5TXT_BIN = os.path.abspath(os.path.join(BASE_DIR, "../../../hwp_env/bin/hwp5txt"))
HWP5HTML_BIN = os.path.abspath(os.path.join(BASE_DIR, "../../../hwp_env/bin/hwp5html"))

GLOBAL_ANSWERS = {}

def normalize_title(text):
    text = unicodedata.normalize("NFC", text)
    if "식품위생학" in text: return "식품위생학"
    if "최종모의고사" in text: return "최종모의고사"
    
    m_year = re.search(r"(20\d\d)", text)
    year = m_year.group(1) if m_year else ""
    
    if "상시" in text: subject = "상시"
    elif "제빵" in text: subject = "제빵"
    else: subject = "제과"
    
    t_no_year = re.sub(r"20\d\d", "", text)
    m_round = re.search(r"(\d+)", t_no_year)
    round_num = m_round.group(1) if m_round else ""
    
    if year and round_num:
        return f"{year}_{subject}_{round_num}"
    return text.replace(" ", "").replace("년", "").replace("도", "").replace("회", "")

def parse_all_answers(root_dir):
    print("Building global answers cache...")
    ans_map = {'가': 1, '나': 2, '다': 3, '라': 4, '1': 1, '2': 2, '3': 3, '4': 4, '①': 1, '②': 2, '③': 3, '④': 4}
    
    for root, dirs, files in os.walk(root_dir):
        for f in files:
            f_nfc = unicodedata.normalize('NFC', f)
            if f_nfc.endswith(".hwp") and ("답" in f_nfc or "정답" in f_nfc):
                file_path = os.path.join(root, f)
                html_dir = f"/tmp/hwp_html_{f.replace(' ', '_')}"
                shutil.rmtree(html_dir, ignore_errors=True)
                
                try:
                    subprocess.run([HWP5HTML_BIN, "--output", html_dir, file_path], 
                                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
                except Exception as e:
                    print(f"Failed to hwp5html {f_nfc}: {e}")
                    continue
                
                index_path = os.path.join(html_dir, "index.xhtml")
                if not os.path.exists(index_path):
                    continue
                    
                with open(index_path, "r", encoding="utf-8") as html_f:
                    soup = BeautifulSoup(html_f, "html.parser")
                
                all_elements = soup.find_all(['p', 'table'])
                titles_queue = []
                
                for el in all_elements:
                    # Also look for titles inside table cells or paragraphs
                    text_content = ""
                    if el.name == 'p':
                        text_content = el.get_text(strip=True)
                        parts = re.split(r'\s{2,}', text_content)
                        for part in parts:
                            if len(part) < 50 and ("20" in part and ("회" in part or "제과" in part or "제빵" in part or "상시" in part) or "식품위생학" in part or "최종모의고사" in part):
                                titles_queue.append(normalize_title(part))
                    elif el.name == 'table':
                        rows = el.find_all("tr")
                        grid = []
                        for row in rows:
                            cells = row.find_all(["td", "th"])
                            # Check if the row contains a title
                            row_text = row.get_text(strip=True)
                            if len(row_text) < 50 and ("20" in row_text and ("회" in row_text or "제과" in row_text or "제빵" in row_text or "상시" in row_text) or "식품위생학" in row_text or "최종모의고사" in row_text):
                                titles_queue.append(normalize_title(row_text))
                                
                            grid.append([c.get_text(strip=True) for c in cells])
                            
                        answers = {}
                        for i in range(len(grid)):
                            for j in range(len(grid[i])):
                                val = grid[i][j].replace(" ", "").replace("\n", "")
                                m = re.match(r"^(\d+)(.*)$", val)
                                if m:
                                    q_num = int(m.group(1))
                                    ans_str = m.group(2)
                                    
                                    right_str = grid[i][j+1].replace(" ", "").replace("\n", "") if j + 1 < len(grid[i]) else ""
                                    below_str = grid[i+1][j].replace(" ", "").replace("\n", "") if i + 1 < len(grid) and j < len(grid[i+1]) else ""
                                    
                                    if ans_str in ans_map:
                                        answers[q_num] = ans_map[ans_str]
                                    elif below_str in ans_map:
                                        answers[q_num] = ans_map[below_str]
                                    elif right_str in ans_map:
                                        answers[q_num] = ans_map[right_str]
                                            
                        if titles_queue and len(answers) > 40:
                            t = titles_queue.pop(0)
                            GLOBAL_ANSWERS[t] = answers
                            print(f"  -> Mapped answer key for {t} ({len(answers)} answers)")


def extract_questions(file_path):
    try:
        html_dir = f"/tmp/hwp_extract_{os.path.basename(file_path).replace(' ', '_')}"
        shutil.rmtree(html_dir, ignore_errors=True)
        subprocess.run([HWP5HTML_BIN, "--output", html_dir, file_path], 
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        
        index_path = os.path.join(html_dir, "index.xhtml")
        if not os.path.exists(index_path):
            return []
            
        with open(index_path, "r", encoding="utf-8") as html_f:
            soup = BeautifulSoup(html_f, "html.parser")
            
        text = soup.get_text('\n')
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return []

    lines = [l.strip() for l in text.split('\n') if l.strip()]
    questions = []
    current_q = None
    
    for l in lines:
        m_q = re.match(r'^(\d+)\.\s*(.*)', l)
        if m_q:
            num = int(m_q.group(1))
            if 1 <= num <= 60:
                if current_q:
                    questions.append(current_q)
                current_q = {'q': l, 'o': [], 'a': ''}
                continue
                
        if current_q:
            opt_matches = []
            if re.match(r'^\s*[①②③④가나다라]\s*\.', l):
                for m in re.finditer(r'(?:^|\s+)([①②③④가나다라]\s*\..*?)(?=(?:\s+[①②③④가나다라]\s*\.)|$)', l):
                    opt = m.group(1).strip()
                    if opt: opt_matches.append(opt)
            else:
                for m in re.finditer(r'(?:^|\s+)([①②③④가나다라]\s*\..*?)(?=(?:\s+[①②③④가나다라]\s*\.)|$)', l):
                    opt = m.group(1).strip()
                    if opt: opt_matches.append(opt)
                
            if opt_matches:
                for opt in opt_matches:
                    clean_opt = re.sub(r'^[①②③④가나다라]\s*\.\s*', '', opt).strip()
                    if len(current_q['o']) < 4:
                        current_q['o'].append(clean_opt)
            else:
                ans_match = re.search(r'\[정답\]\s*([가나다라1234①②③④])', l)
                if ans_match:
                    ans_map = {'가':1,'나':2,'다':3,'라':4,'1':1,'2':2,'3':3,'4':4,'①':1,'②':2,'③':3,'④':4}
                    current_q['a'] = ans_map.get(ans_match.group(1), '')
                elif not re.match(r'^[①②③④가나다라]\s*\.', l):
                    if not l.startswith("<표>") and "정답" not in l:
                        current_q['q'] += ' ' + l

    if current_q:
        questions.append(current_q)
        
    for q in questions:
        while len(q['o']) < 4:
            q['o'].append('')
            
    return questions

def main():
    parse_all_answers(DOWNLOADS_DIR)
    
    with open(DB_JSON_PATH, "r", encoding="utf-8") as f:
        db = json.load(f)
    with open(COURSES_JSON_PATH, "r", encoding="utf-8") as f:
        courses = json.load(f)
        
    bakery_course = None
    for category in courses:
        for c in category.get('courses', []):
            if c.get('name') == '제과제빵은행':
                bakery_course = c
                break
    if not bakery_course:
        print("bakery course not found")
        return
        
    # Remove old bakery exams from db and courses
    old_keys = [k for k in db.keys() if k.startswith("오재을_제과제빵_") or k.startswith("제과제빵은행_")]
    for k in old_keys:
        del db[k]
        
    bakery_course['exams'] = []
        
    for root, dirs, files in os.walk(DOWNLOADS_DIR):
        for f in files:
            f_nfc = unicodedata.normalize('NFC', f)
            if not f_nfc.endswith(".hwp") or "답" in f_nfc or "정답" in f_nfc:
                continue
                
            base_name = f_nfc.replace('.hwp', '')
            if base_name in ["중요문제정리(과목별로구분)", "공통과목-재료 숙제"]:
                continue
                
            file_path = os.path.join(root, f)
            
            exam_id = f"제과제빵은행_{base_name.replace(' ', '_')}"
            
            questions = extract_questions(file_path)
            if len(questions) < 10:
                continue
                
            # Find answer key
            norm_title = normalize_title(base_name)
            if norm_title in GLOBAL_ANSWERS:
                ans_dict = GLOBAL_ANSWERS[norm_title]
                for idx, q in enumerate(questions):
                    q_num = idx + 1
                    if q_num in ans_dict:
                        q['a'] = ans_dict[q_num]
            
            file_title = base_name.replace(' ', '_')
            
            db[exam_id] = questions
            
            found = False
            for exam in bakery_course.get('exams', []):
                if exam.get('key') == exam_id:
                    exam['name'] = file_title
                    found = True
                    break
            if not found:
                bakery_course['exams'].append({"key": exam_id, "name": file_title})
                
            print(f"Processed {base_name}: {len(questions)} questions")
            
    with open(DB_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)
    with open(COURSES_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(courses, f, ensure_ascii=False, indent=2)
        
    # Write to questions_data.js for client
    js_content = f"window.EXAM_DATA_DB = {json.dumps(db, ensure_ascii=False, indent=2)};"
    js_path = os.path.join(BASE_DIR, "questions_data.js")
    with open(js_path, "w", encoding="utf-8") as f:
        f.write(js_content)
        
    print("Done!")

if __name__ == "__main__":
    main()
