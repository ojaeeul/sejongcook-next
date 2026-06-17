import json
import os

base_dir = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/data"
members_path = os.path.join(base_dir, "members.json")
attendance_path = os.path.join(base_dir, "attendance.json")

# Load members
with open(members_path, 'r', encoding='utf-8') as f:
    members = json.load(f)

# Valid member IDs
valid_member_ids = set()
for m in members:
    status = m.get("status", "")
    if status not in ["delete", "trash"]:
        valid_member_ids.add(str(m.get("id")))

# Load attendance
with open(attendance_path, 'r', encoding='utf-8') as f:
    attendance = json.load(f)

print(f"Original attendance count: {len(attendance)}")

# Filter attendance
new_attendance = []
removed_for_member = 0
removed_for_sugi = 0

for record in attendance:
    member_id = str(record.get("memberId", ""))
    status = str(record.get("status", ""))
    
    if member_id not in valid_member_ids:
        removed_for_member += 1
        continue
        
    if "수기" in status or "수기출석" in status:
        removed_for_sugi += 1
        continue
        
    new_attendance.append(record)

print(f"Removed because member deleted/not found: {removed_for_member}")
print(f"Removed because status is 수기/수기출석: {removed_for_sugi}")
print(f"New attendance count: {len(new_attendance)}")

# Save attendance
with open(attendance_path, 'w', encoding='utf-8') as f:
    json.dump(new_attendance, f, indent=2, ensure_ascii=False)

print("Successfully cleaned attendance.json")
