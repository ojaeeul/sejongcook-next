import os
import json
import subprocess
import unicodedata
from bs4 import BeautifulSoup
import re

def normalize(s):
    return unicodedata.normalize('NFC', s)

HWP5TXT_BIN = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/hwp_env/bin/hwp5txt"

ans_files = [
    '/Users/ojaeeul/Downloads/제과제빵필기/2004년도/2004년답안.hwp',
    '/Users/ojaeeul/Downloads/제과제빵필기/2005년도/2005년 답안.hwp',
    '/Users/ojaeeul/Downloads/제과제빵필기/2006년도/2006년 답안.hwp',
    '/Users/ojaeeul/Downloads/제과제빵필기/2007년도/2007년답안.hwp',
    '/Users/ojaeeul/Downloads/제과제빵필기/2008년도/답안.hwp',
    '/Users/ojaeeul/Downloads/제과제빵필기/2010년도/답안지.hwp',
    '/Users/ojaeeul/Downloads/제과제빵필기/2011년도/2011년도 답안.hwp'
]

html_dirs = [f'/tmp/ans_htmls/ans_{i}' for i in range(len(ans_files))]

JSON_PATH = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/questions_data.json'

with open(JSON_PATH, 'r', encoding='utf-8') as f:
    qdata = json.load(f)

ans_map = {'가': 1, '나': 2, '다': 3, '라': 4, '1': 1, '2': 2, '3': 3, '4': 4, '①': 1, '②': 2, '③': 3, '④': 4}
updated_count = 0

for i, hwp_file in enumerate(ans_files):
    # 1. Get hwp5txt output to find titles
    res = subprocess.run([HWP5TXT_BIN, hwp_file], capture_output=True, text=True)
    
    # Extract exam names
    exam_names = re.findall(r'(20\d{2})년\s*(\d+)회\s*(제과|제빵)', res.stdout)
    if not exam_names:
        exam_names = re.findall(r'(\d+)회\s*(제과|제빵)', res.stdout)
        year_match = re.search(r'20\d{2}', hwp_file)
        if year_match:
            year = year_match.group()
            exam_names = [(year, r, t) for r, t in exam_names]
            
    print(f"File {i}: found exam names: {exam_names}")

    # 2. Extract tables from HTML
    index_path = os.path.join(html_dirs[i], "index.xhtml")
    if not os.path.exists(index_path):
        continue
        
    with open(index_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")
        
    tables = soup.find_all("table")
    print(f"File {i}: found {len(tables)} tables")
    
    if len(tables) == len(exam_names):
        for t_idx, table in enumerate(tables):
            year, round_str, type_str = exam_names[t_idx]
            
            target_key = None
            search_str = f'{year}년{type_str}{round_str}회'
            for k in qdata.keys():
                if search_str in normalize(k):
                    target_key = k
                    break
                    
            if not target_key:
                print(f"Cannot find key for {search_str}")
                continue
                
            answers = {}
            rows = table.find_all("tr")
            grid = []
            for row in rows:
                cells = row.find_all(["td", "th"])
                grid.append([normalize(c.get_text(strip=True)) for c in cells])
                
            for r in range(len(grid)):
                for c in range(len(grid[r])):
                    val = grid[r][c]
                    if val.isdigit() and 1 <= int(val) <= 60:
                        q_num = int(val)
                        ans_val = None
                        if c + 1 < len(grid[r]) and grid[r][c+1] in ans_map:
                            ans_val = ans_map[grid[r][c+1]]
                        elif r + 1 < len(grid) and c < len(grid[r+1]) and grid[r+1][c] in ans_map:
                            ans_val = ans_map[grid[r+1][c]]
                            
                        if ans_val:
                            answers[q_num] = ans_val
                            
            print(f"Extracted {len(answers)} answers for {target_key}")
            
            if target_key in qdata and isinstance(qdata[target_key], list):
                for idx, item in enumerate(qdata[target_key]):
                    q_num = idx + 1
                    if q_num in answers:
                        item['a'] = answers[q_num]
                updated_count += 1
    else:
        print(f"Mismatch: {len(exam_names)} names vs {len(tables)} tables")

with open(JSON_PATH, "w", encoding="utf-8") as f:
    json.dump(qdata, f, ensure_ascii=False, indent=2)

print(f"Updated exact answers for {updated_count} exams total.")
