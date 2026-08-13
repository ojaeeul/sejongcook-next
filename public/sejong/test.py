import json
import unicodedata

def normalize(text): return unicodedata.normalize('NFC', text)

with open('questions_data.json', 'r', encoding='utf-8') as f:
    q_data = json.load(f)

for k, questions in q_data.items():
    if '시험지' not in k:
        for q in questions:
            q_text = normalize(q.get('q', '').strip())
            if '우유를 응고시키는 요인과 거리가 먼 것은' in q_text:
                print(f"{k}: {q.get('a')}")
