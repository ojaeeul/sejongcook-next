import json
with open('Sejong/SejongAttendance/data/attendance.json', 'r') as f:
    logs = json.load(f)

# Deduplicate based on memberId, date, and course. Keep the LAST one.
cleaned = []
seen = set()

# Process in reverse to keep the most recent update
for log in reversed(logs):
    member_id = str(log.get('memberId', ''))
    date = log.get('date', '')
    course = log.get('course') or ''
    
    key = f"{member_id}_{date}_{course}"
    if key not in seen:
        seen.add(key)
        cleaned.append(log)

# Reverse back to chronological order
cleaned.reverse()

with open('Sejong/SejongAttendance/data/attendance.json', 'w') as f:
    json.dump(cleaned, f, ensure_ascii=False, indent=4)

print(f"Original logs: {len(logs)}, Cleaned logs: {len(cleaned)}")
