import json
import re

with open('Sejong/SejongAttendance/public/questions_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for exam_key, questions in data.items():
    for i, q in enumerate(questions):
        if 'e' not in q or not q['e'] or 'a' not in q or not q['o']:
            continue
            
        expl = q['e']
        
        # Look for instances where the explanation corrects an error
        if '오류' in expl or '올바른 정답은' in expl or '실제 정답은' in expl:
            print(f"[{exam_key} Q{i+1}] a={q['a']} | e={expl[:150]}...")
