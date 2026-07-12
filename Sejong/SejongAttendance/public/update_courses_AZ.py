import json
import string

with open('exam_courses.json', 'r', encoding='utf-8') as f:
    courses = json.load(f)

letters = list(string.ascii_uppercase)

for cat in courses:
    cat_name = cat['category']
    for course in cat.get('courses', []):
        course_name = course['name']
        
        # Determine prefix for key based on course_name
        prefix = course_name
        
        # Generate A~Z
        new_exams = []
        for l in letters:
            new_exams.append({
                "name": f"{course_name} 시험지 {l} (60문항)",
                "key": f"{prefix}_A_Z_{l}"
            })
            
        course['exams'] = new_exams

with open('exam_courses.json', 'w', encoding='utf-8') as f:
    json.dump(courses, f, ensure_ascii=False, indent=2)

print("Updated exam_courses.json to A~Z successfully!")
