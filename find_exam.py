import json

with open('Sejong/SejongAttendance/public/questions_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for k, qs in data.items():
    for q in qs:
        if '우유는 100g 중에' in q.get('q', ''):
            print(k)
            break
