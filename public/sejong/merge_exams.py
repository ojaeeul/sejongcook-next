import json

with open('/tmp/old_exam_courses.json', 'r', encoding='utf-8') as f:
    old_data = json.load(f)

with open('exam_courses.json', 'r', encoding='utf-8') as f:
    new_data = json.load(f)

# Build a mapping from course name to new A~Z exams
new_course_map = {}
for cat in new_data:
    for course in cat.get('courses', []):
        new_course_map[course['name']] = course.get('exams', [])

for cat in old_data:
    for course in cat.get('courses', []):
        course_name = course['name']
        
        # Original exams, excluding the old generated A~G
        old_exams = [e for e in course.get('exams', []) if '시험지 ' not in e['name']]
        
        # Append new A~Z exams
        new_exams = new_course_map.get(course_name, [])
        
        course['exams'] = old_exams + new_exams

with open('exam_courses.json', 'w', encoding='utf-8') as f:
    json.dump(old_data, f, ensure_ascii=False, indent=2)

print("Restored original exams and appended A~Z exams successfully.")
