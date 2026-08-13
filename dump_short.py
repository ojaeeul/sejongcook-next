import json

with open('Sejong/SejongAttendance/public/questions_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for k, qs in data.items():
    for i, q in enumerate(qs):
        opts = q.get('o', [])
        for j, opt in enumerate(opts):
            s = str(opt).strip()
            if len(s) == 1 and not s.isdigit() and not s.isalpha():
                print(f"[{k} Q{i+1}] {q.get('q')}")
                print(f"Options: {opts}")
                print("-" * 50)
