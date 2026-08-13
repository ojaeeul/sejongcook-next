import json

with open('Sejong/SejongAttendance/public/questions_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Quick fix for that specific hood question
for k, qs in data.items():
    for q in qs:
        opts = q.get('o', [])
        for j, opt in enumerate(opts):
            opt_str = str(opt).strip()
            if opt_str == '사방으로 약 15cm 정도 더 크게 설치한':
                q['o'][j] = opt_str + '다'
            elif opt_str == '불판과 정확히 같은 크기로 한':
                q['o'][j] = opt_str + '다'
            elif opt_str == '불판보다 약간 작게 하여 흡입력을 높인':
                q['o'][j] = opt_str + '다'

with open('Sejong/SejongAttendance/public/questions_data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
