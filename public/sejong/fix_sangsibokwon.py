import os
import re
import json
import subprocess
import shutil
import unicodedata
from bs4 import BeautifulSoup

QUESTIONS_FILE = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/questions_data.json"
HWP5HTML_BIN = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/hwp_env/bin/hwp5html"
TARGET_HWP = "/Users/ojaeeul/Downloads/제과제빵필기/상시복원2013~2018/답안지(2013~2017).hwp"

ans_map = {'가': 1, '나': 2, '다': 3, '라': 4, '1': 1, '2': 2, '3': 3, '4': 4, '①': 1, '②': 2, '③': 3, '④': 4}

def normalize(s):
    return unicodedata.normalize('NFC', s)

def extract_tables():
    html_dir = "temp_sangsibokwon_html"
    cmd = [HWP5HTML_BIN, TARGET_HWP, "--output", html_dir]
    try:
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    except Exception as e:
        print("Error running hwp5html:", e)
        return []
        
    index_path = os.path.join(html_dir, "index.xhtml")
    if not os.path.exists(index_path):
        return []
        
    with open(index_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")
        
    tables_data = []
    
    for table in soup.find_all("table"):
        answers = {}
        rows = table.find_all("tr")
        grid = []
        for row in rows:
            cells = row.find_all(["td", "th"])
            grid.append([c.get_text(strip=True) for c in cells])
            
        for i in range(len(grid) - 1):
            for j in range(len(grid[i])):
                val = grid[i][j]
                if val.isdigit() and 1 <= int(val) <= 60:
                    q_num = int(val)
                    if j < len(grid[i+1]):
                        ans_str = grid[i+1][j]
                        if ans_str in ans_map:
                            answers[q_num] = ans_map[ans_str]
        
        if len(answers) > 10:
            tables_data.append(answers)
            
    # Also find paragraphs just before the tables to get their names.
    # Actually, in hwp5html, paragraphs are <p class="Normal">. Let's just find text like "2013 상시1회"
    text_nodes = [p.get_text(strip=True) for p in soup.find_all("p")]
    titles = [t for t in text_nodes if "상시" in t or "모의고사" in t or "식품위생학" in t]
    print("Found titles:", titles)
    
    shutil.rmtree(html_dir, ignore_errors=True)
    return tables_data

def main():
    tables = extract_tables()
    print(f"Extracted {len(tables)} tables.")
        
    with open(QUESTIONS_FILE, 'r', encoding='utf-8') as f:
        qdata = json.load(f)

    # Let's map them manually based on the extracted tables and the known files
    # The order in the document is:
    # 0: 2013 상시1회 -> 오재을_제과제빵_2013 상시복원 1회.hwp
    # 1: 2013 상시2회 -> 오재을_제과제빵_2013 상시복원 2회.hwp
    # 2: 2014 상시1회 -> 오재을_제과제빵_2014 상시복원 1회.hwp
    # 3: 2014 상시2회 -> 오재을_제과제빵_2014 상시복원 2회.hwp
    # 4: 2015 상시1회 -> 오재을_제과제빵_2015 상시복원 1회.hwp
    # 5: 2016 상시1회 -> 오재을_제과제빵_2016 상시복원 1회.hwp
    # 6: 2017 최종모의고사 -> 오재을_제과제빵_2017 상시복원 1회.hwp
    # 7: 2018 식품위생학 -> 오재을_제과제빵_2018 식품위생학.hwp
    
    mapping = {
        0: normalize("오재을_제과제빵_2013 상시복원 1회.hwp"),
        1: normalize("오재을_제과제빵_2013 상시복원 2회.hwp"),
        2: normalize("오재을_제과제빵_2014 상시복원 1회.hwp"),
        3: normalize("오재을_제과제빵_2014 상시복원 2회.hwp"),
        4: normalize("오재을_제과제빵_2015 상시복원 1회.hwp"),
        5: normalize("오재을_제과제빵_2016 상시복원 1회.hwp"),
        6: normalize("오재을_제과제빵_2017 상시복원 1회.hwp"),
        7: normalize("오재을_제과제빵_2018 식품위생학.hwp")
    }
    
    # Wait, the last two tables: 6 has 24 answers, 7 has 60 answers.
    # "2018 식품위생학.hwp" has 20 questions. So table 6 is probably 식품위생학 (24 answers).
    # "2017 상시복원 1회.hwp" has 42 questions. So table 7 is probably 2017 최종모의고사.
    # Let's adjust mapping for 6 and 7 based on this.
    mapping[6] = normalize("오재을_제과제빵_2018 식품위생학.hwp")
    mapping[7] = normalize("오재을_제과제빵_2017 상시복원 1회.hwp")
    
    updated_keys = []
    
    for table_idx, key in mapping.items():
        if table_idx >= len(tables):
            break
            
        answers = tables[table_idx]
        
        # Check if the key exists in qdata
        # Because we used normalize, let's normalize all qdata keys to find a match
        actual_key = None
        for qk in qdata.keys():
            if normalize(qk) == key:
                actual_key = qk
                break
                
        if actual_key:
            questions = qdata[actual_key]
            for idx, q_obj in enumerate(questions):
                q_num = idx + 1
                if q_num in answers:
                    q_obj['a'] = answers[q_num]
            updated_keys.append({"name": actual_key.replace("오재을_제과제빵_", "").replace(".hwp", ""), "key": actual_key})
            print(f"Updated answers for {actual_key} ({len(answers)} answers provided)")
        else:
            print(f"Could not find key {key} in DB.")
            
    with open(QUESTIONS_FILE, 'w', encoding='utf-8') as f:
        json.dump(qdata, f, ensure_ascii=False, indent=2)
        
    print("Updated questions_data.json")
    
    # Also ensure these are in exam_courses.json under "오재을(제과제빵)"
    # Actually they should already be there since parse_baking_exams.py added them
    
if __name__ == "__main__":
    main()
