import re
from bs4 import BeautifulSoup
import sys

def parse_ans(html_path):
    with open(html_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    ans_map = {'가': 1, '나': 2, '다': 3, '라': 4, '1': 1, '2': 2, '3': 3, '4': 4, '①': 1, '②': 2, '③': 3, '④': 4}
    
    exam_tables = {}
    
    # First, find all answer tables and their index in the document
    all_elements = soup.find_all(['p', 'table'])
    
    titles = []
    tables = []
    
    for el in all_elements:
        if el.name == 'p':
            pt = el.get_text(strip=True)
            # Find titles in the text
            found = re.findall(r"20\d\d\s*년?\s*상시\s*\d*회?|식품위생학|최종모의고사|20\d\d\s*년?\s*\d*회?\s*제[과빵]", pt)
            titles.extend([t.replace(" ", "") for t in found])
        elif el.name == 'table':
            rows = el.find_all("tr")
            grid = []
            for row in rows:
                cells = row.find_all(["td", "th"])
                grid.append([c.get_text(strip=True) for c in cells])
                
            answers = {}
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
            if len(answers) > 40:
                tables.append(answers)

    print(f"Found {len(titles)} titles and {len(tables)} answer tables")
    return list(zip(titles, tables))

print(parse_ans(sys.argv[1]))
