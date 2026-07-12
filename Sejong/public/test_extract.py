import os, subprocess, shutil
from bs4 import BeautifulSoup

HWP5HTML_BIN = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/hwp_env/bin/hwp5html"
ans_map = {'가': 1, '나': 2, '다': 3, '라': 4, '1': 1, '2': 2, '3': 3, '4': 4, '①': 1, '②': 2, '③': 3, '④': 4}

def extract_answers_html(hwp_path, filename):
    html_dir = f"temp_html_{filename.replace(' ', '_')}"
    cmd = [HWP5HTML_BIN, hwp_path, "--output", html_dir]
    try:
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    except Exception as e:
        print(f"Error running hwp5html: {e}")
        
    index_path = os.path.join(html_dir, "index.xhtml")
    if not os.path.exists(index_path):
        print(f"No index.xhtml found in {html_dir}")
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
                    
                    if j + 1 < len(grid[i]):
                        ans_str = grid[i][j+1]
                        if ans_str in ans_map:
                            answers[q_num] = ans_map[ans_str]
                            ans_found = True
                    
                    if not ans_found and i + 1 < len(grid):
                        if j < len(grid[i+1]):
                            ans_str = grid[i+1][j]
                            if ans_str in ans_map:
                                answers[q_num] = ans_map[ans_str]
    
    shutil.rmtree(html_dir, ignore_errors=True)
    return answers

ans = extract_answers_html("/Users/ojaeeul/Downloads/제과제빵필기/2004년도/2004년답안.hwp", "test_ans.hwp")
print(f"Found {len(ans)} answers: {ans}")
