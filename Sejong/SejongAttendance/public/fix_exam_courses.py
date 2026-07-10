import json

with open("exam_courses.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Find the invalid category
for cat in data:
    if "exams" in cat:
        # Move exams inside a course
        exams = cat.pop("exams")
        # Fix keys
        fixed_exams = []
        for e in exams:
            fixed_exams.append({ "name": e.get("title", "Unknown"), "key": e.get("id", "") })
        cat["courses"] = [{
            "name": "한식기능사 (과거 기출복원)",
            "exams": fixed_exams
        }]
        cat["category"] = "과거기출"

with open("exam_courses.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("Fixed!")
