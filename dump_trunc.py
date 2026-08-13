import json

with open('Sejong/SejongAttendance/public/questions_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

bad_endings = ['낮', '높', '많', '적', '없', '있', '같', '다르', '어렵', '쉽', '언', '않는', '되는', '하는', '받는', '맞', '틀리', '안']

for k, qs in data.items():
    for i, q in enumerate(qs):
        q_text = q.get('q', '').strip()
        if q_text and q_text[-1] in bad_endings:
            print(f"[{k} Q{i}] {q_text}")
            print(f"O: {q.get('o')}")
            print(f"A: {q.get('a')}")
            print(f"E: {q.get('e')}")
            print("-" * 50)
