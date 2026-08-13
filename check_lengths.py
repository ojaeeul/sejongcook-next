import json

with open('Sejong/SejongAttendance/public/questions_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

short_exams = []
for k, qs in data.items():
    if len(qs) < 60:
        short_exams.append((k, len(qs)))

print(f"Total exams: {len(data)}")
print(f"Exams with < 60 questions: {len(short_exams)}")
for k, l in short_exams:
    print(f"- {k}: {l} questions")

