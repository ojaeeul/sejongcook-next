import json

with open('Sejong/SejongAttendance/public/questions_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

suspicious = set()
for qs in data.values():
    for q in qs:
        for opt in q.get('o', []):
            text = str(opt).strip()
            if not text: continue
            
            # Check other weird endings
            if text[-1] in ['되', '시키', '지', '르', '으', '치', '히', '기', '게', '에']:
                if len(text) > 1:
                    last_word = text.split()[-1]
                    suspicious.add(last_word)

print("Suspicious last words part 2:")
for w in sorted(list(suspicious)):
    print(w)
