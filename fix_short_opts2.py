import json

with open('Sejong/SejongAttendance/public/questions_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for k, qs in data.items():
    for q in qs:
        opts = q.get('o', [])
        if ')' in opts:
            q_text = q.get('q', '')
            if "발효시간을 3 시간으로 줄이려 한" in q_text:
                q['q'] = "3% 이스트를 사용하여 4 시간 발효시켜 좋은 결과를 얻는다고 가정할 때 발효시간을 3 시간으로 줄이려 한다. 이때 필요한 이스트 양은? (단, 다른 조건은 같다고 본다.)"
                q['o'] = ['5%', '4%', '6%', '7%']

with open('Sejong/SejongAttendance/public/questions_data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
