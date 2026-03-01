
import json
with open(r'c:\Users\세종요리\Desktop\sejk 4\sejongcook-next\Sejong\SejongAttendance\data\attendance.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

target = "1770517017920"
records = [r for r in data if r['memberId'] == target]
records.sort(key=lambda x: x['date'])

for r in records:
    print(f"{r['date']}: {r.get('status')} - {r.get('course')}")
