import json

with open('Sejong/SejongAttendance/public/questions_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

empty_options = []
short_options = []
few_options = []

for k, qs in data.items():
    for i, q in enumerate(qs):
        opts = q.get('o', [])
        if len(opts) < 4:
            few_options.append(f"[{k} Q{i+1}] Has {len(opts)} options: {opts}")
        
        for j, opt in enumerate(opts):
            s = str(opt).strip()
            if not s:
                empty_options.append(f"[{k} Q{i+1}] Option {j+1} is completely empty.")
            elif len(s) == 1 and not s.isdigit() and not s.isalpha():
                short_options.append(f"[{k} Q{i+1}] Option {j+1} is very short: '{s}'")

print(f"Empty options: {len(empty_options)}")
print(f"Short options: {len(short_options)}")
print(f"Fewer than 4 options: {len(few_options)}")

for e in empty_options[:10]: print(e)
for s in short_options[:10]: print(s)
for f in few_options[:10]: print(f)

