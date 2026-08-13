import json

with open('Sejong/SejongAttendance/public/questions_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Find unique option endings that look like predicates ending in '는', '하', '이', '기'
# but are NOT full nouns.
suspicious = set()
for qs in data.values():
    for q in qs:
        for opt in q.get('o', []):
            text = str(opt).strip()
            if not text: continue
            
            # Check if it ends with '는', '하', '이'
            if text.endswith('는') or text.endswith('하') or text.endswith('위생적이') or text.endswith('무관하'):
                if len(text) > 2:
                    # Collect the last word
                    last_word = text.split()[-1]
                    suspicious.add(last_word)

print("Suspicious last words:")
for w in sorted(list(suspicious)):
    print(w)
