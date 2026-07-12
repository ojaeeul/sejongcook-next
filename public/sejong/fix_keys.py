import json

with open('questions_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

fixed_count = 0

for k, v in data.items():
    if isinstance(v, list):
        for idx, q in enumerate(v):
            new_q = {}
            if 'question' in q:
                new_q['q'] = q['question']
                fixed_count += 1
            elif 'q' in q:
                new_q['q'] = q['q']
            else:
                new_q['q'] = "문제 없음"
                
            if 'options' in q:
                new_q['o'] = q['options']
            elif 'o' in q:
                new_q['o'] = q['o']
            else:
                new_q['o'] = ["보기 미제공", "보기 미제공", "보기 미제공", "보기 미제공"]
                
            if 'answer' in q:
                # the old questions had answer as an integer or string. My script put "정답 미제공".
                new_q['a'] = q['answer']
            elif 'a' in q:
                new_q['a'] = q['a']
            else:
                new_q['a'] = "정답 미제공"
                
            v[idx] = new_q

with open('questions_data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Fixed {fixed_count} questions keys to use q, o, a.")
