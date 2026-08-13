import json
import re

with open('Sejong/SejongAttendance/public/questions_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

trunc_q = []
trunc_o = []

# Typical Korean predicate stems that shouldn't appear at the very end without '다' or '음' etc.
bad_endings = ['낮', '높', '많', '적', '없', '있', '같', '다르', '어렵', '쉽', '언', '않는', '되는', '하는', '받는', '맞', '틀리', '안']

for k, qs in data.items():
    for i, q in enumerate(qs):
        q_text = q.get('q', '').strip()
        if q_text and q_text[-1] in bad_endings:
            trunc_q.append((k, i, q_text, q.get('o', [])))
        
        options = q.get('o', [])
        for j, opt in enumerate(options):
            opt_text = opt.strip()
            if opt_text and opt_text[-1] in bad_endings:
                trunc_o.append((k, i, j, opt_text))

print(f"Found {len(trunc_q)} truncated questions and {len(trunc_o)} truncated options.")

print("\n--- Truncated Questions ---")
for t in trunc_q[:20]:
    print(t)

print("\n--- Truncated Options ---")
for t in trunc_o[:20]:
    print(t)
