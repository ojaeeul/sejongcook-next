from bs4 import BeautifulSoup
import re

with open('test_html/index.xhtml', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f, 'html.parser')

tables = soup.find_all('table')
print(f"Found {len(tables)} tables.")

answers = {}
ans_map = {'가': 1, '나': 2, '다': 3, '라': 4, '1': 1, '2': 2, '3': 3, '4': 4, '①': 1, '②': 2, '③': 3, '④': 4}

for table in tables:
    # Try to extract text from all cells
    rows = table.find_all('tr')
    grid = []
    for row in rows:
        cells = row.find_all(['td', 'th'])
        grid.append([c.get_text(strip=True) for c in cells])
    
    # Heuristic: A row of numbers followed by a row of answers
    for i in range(len(grid) - 1):
        for j in range(len(grid[i])):
            val = grid[i][j]
            if val.isdigit() and 1 <= int(val) <= 60:
                q_num = int(val)
                ans_str = grid[i+1][j]
                if ans_str in ans_map:
                    answers[q_num] = ans_map[ans_str]

print(f"Extracted {len(answers)} answers.")
if len(answers) > 0:
    print("Answers preview:", {k: answers[k] for k in sorted(answers.keys())[:10]})
