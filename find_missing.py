import json

FILE = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/questions_data.json"

with open(FILE, "r") as f:
    db = json.load(f)

for k, v in db.items():
    if 45 <= len(v) < 60:
        print(f"{k}: {len(v)}")
