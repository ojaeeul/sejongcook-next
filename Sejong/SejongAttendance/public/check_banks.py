import json

with open('questions_data.json', 'r', encoding='utf-8') as f:
    q_data = json.load(f)

banks = {'제과': [], '제빵': []}

for key, questions in q_data.items():
    if '주관식' in key:
        continue
    if '제과' in key and '제빵' not in key:
        banks['제과'].extend([q for q in questions if not q.get('is_subjective')])
    elif '제빵' in key and '제과' not in key:
        banks['제빵'].extend([q for q in questions if not q.get('is_subjective')])
    elif '제과제빵' in key:
        banks['제과'].extend([q for q in questions if not q.get('is_subjective')])
        banks['제빵'].extend([q for q in questions if not q.get('is_subjective')])

for k in banks:
    # unique by question text
    unique = {q.get('q', '').strip(): q for q in banks[k]}
    print(f"{k} unique questions: {len(unique)}")

