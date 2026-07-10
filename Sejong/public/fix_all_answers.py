import os
import subprocess
import shutil
import json
import unicodedata
from bs4 import BeautifulSoup

def normalize(s):
    return unicodedata.normalize('NFC', s)

HWP_DIR = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/기출문제/"
JSON_PATH = "questions_data.json"

with open(JSON_PATH, "r", encoding="utf-8") as f:
    qdata = json.load(f)

ans_map = {'가': 1, '나': 2, '다': 3, '라': 4, '1': 1, '2': 2, '3': 3, '4': 4, '①': 1, '②': 2, '③': 3, '④': 4}

updated_keys = 0

for filename in os.listdir(HWP_DIR):
    if not filename.endswith(".hwp"):
        continue
        
    file_path = os.path.join(HWP_DIR, filename)
    html_dir = f"temp_html_{filename}"
    
    cmd = [
        "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/hwp_env/bin/hwp5html",
        file_path,
        "--output",
        html_dir
    ]
    try:
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    except Exception as e:
        print(f"Failed to extract HTML for {filename}: {e}")
        continue
        
    index_path = os.path.join(html_dir, "index.xhtml")
    if not os.path.exists(index_path):
        print(f"index.xhtml not found for {filename}")
        shutil.rmtree(html_dir, ignore_errors=True)
        continue
        
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
            
        for i in range(len(grid) - 1):
            for j in range(len(grid[i])):
                val = grid[i][j]
                if val.isdigit() and 1 <= int(val) <= 60:
                    q_num = int(val)
                    if j < len(grid[i+1]):
                        ans_str = grid[i+1][j]
                        if ans_str in ans_map:
                            answers[q_num] = ans_map[ans_str]
    
    shutil.rmtree(html_dir, ignore_errors=True)
    
    if len(answers) == 0:
        print(f"No answers found in {filename}")
        continue
        
    print(f"Found {len(answers)} answers in {filename}")
    
    nfc_filename = normalize(filename)
    
    keys_to_update = []
    for qk in qdata.keys():
        if normalize(qk).endswith(nfc_filename):
            keys_to_update.append(qk)
            
    for qk in keys_to_update:
        for idx, item in enumerate(qdata[qk]):
            q_num = idx + 1
            if q_num in answers:
                item['a'] = answers[q_num]
        print(f"Updated answers for {qk}")
        updated_keys += 1

if updated_keys > 0:
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(qdata, f, ensure_ascii=False, indent=2)
    print(f"Updated {updated_keys} exam keys in questions_data.json!")
else:
    print("No updates made.")
