import json
import os

os.chdir('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public')

with open('exam_courses.json', 'r', encoding='utf-8') as f:
    courses_data = json.load(f)

def is_generated(exam):
    name = exam.get('name', '')
    key = exam.get('key', '')
    if '_A_G_' in key or '_A_Z_' in key:
        return True
    if '(60문항)' in name:
        return True
    for char in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
        if f'시험지 {char}' in name:
            return True
    return False

# First, let's load original exam_courses to restore
with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/exam_courses_original.json', 'r', encoding='utf-8') as f:
    orig_data = json.load(f)

j_course = None
b_course = None
# Find original courses
for cat in orig_data:
    for course in cat.get('courses', []):
        if course['name'] == '제과기능사':
            j_course = course
        elif course['name'] == '제빵기능사':
            b_course = course

new_courses_data = []

for cat in orig_data:
    new_cat = {'category': cat['category'], 'courses': []}
    for course in cat.get('courses', []):
        if '과거기출' in course['name']:
            continue

        if course['name'] == '제과제빵은행':
            for exam in course.get('exams', []):
                name = exam.get('name', '')
                j_keys = [e['key'] for e in j_course['exams']]
                b_keys = [e['key'] for e in b_course['exams']]
                
                # The name is like '2003년도_제과1회' or '2009년_2회제빵'
                # Check the name ONLY
                if '제과' in name and '제빵' not in name:
                    if exam['key'] not in j_keys:
                        j_course['exams'].append(exam)
                elif '제빵' in name and '제과' not in name:
                    if exam['key'] not in b_keys:
                        b_course['exams'].append(exam)
                else:
                    if exam['key'] not in j_keys:
                        j_course['exams'].append(exam)
                    if exam['key'] not in b_keys:
                        b_course['exams'].append(exam)
            continue

        if course['name'] == '제과기능사':
            new_cat['courses'].append(j_course)
            continue
            
        if course['name'] == '제빵기능사':
            new_cat['courses'].append(b_course)
            continue
        
        new_cat['courses'].append(course)
    
    new_courses_data.append(new_cat)

with open('exam_courses.json', 'w', encoding='utf-8') as f:
    json.dump(new_courses_data, f, ensure_ascii=False, indent=4)

print("Updated exam_courses.json from original and filtered correctly")
