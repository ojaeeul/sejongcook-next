import json
import os

os.chdir('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public')

with open('exam_courses.json', 'r', encoding='utf-8') as f:
    courses_data = json.load(f)

# Find '제과기능사' and '제빵기능사'
j_course = None
b_course = None
for cat in courses_data:
    for course in cat.get('courses', []):
        if course['name'] == '제과기능사':
            j_course = course
        elif course['name'] == '제빵기능사':
            b_course = course

if not j_course or not b_course:
    print("Could not find 제과기능사 or 제빵기능사")
    exit(1)

# Clean out generated exams from j_course and b_course
j_course['exams'] = [e for e in j_course.get('exams', []) if '_A_G_' not in e.get('key', '') and '_A_Z_' not in e.get('key', '') and '시험지 A' not in e.get('name', '') and '시험지 B' not in e.get('name', '') and '시험지 C' not in e.get('name', '')]
b_course['exams'] = [e for e in b_course.get('exams', []) if '_A_G_' not in e.get('key', '') and '_A_Z_' not in e.get('key', '') and '시험지 A' not in e.get('name', '') and '시험지 B' not in e.get('name', '') and '시험지 C' not in e.get('name', '')]

new_courses_data = []

for cat in courses_data:
    new_cat = {'category': cat['category'], 'courses': []}
    for course in cat.get('courses', []):
        if '과거기출' in course['name']:
            continue # Remove 과거기출조리기능사

        if course['name'] == '제과제빵은행':
            # Split these into 제과 and 제빵
            for exam in course.get('exams', []):
                if '_A_G_' in exam.get('key', '') or '_A_Z_' in exam.get('key', ''):
                    continue

                # Add to corresponding course if not present
                j_keys = [e['key'] for e in j_course['exams']]
                b_keys = [e['key'] for e in b_course['exams']]
                
                if '제과' in exam['name'] or '제과' in exam['key']:
                    if exam['key'] not in j_keys:
                        j_course['exams'].append(exam)
                elif '제빵' in exam['name'] or '제빵' in exam['key']:
                    if exam['key'] not in b_keys:
                        b_course['exams'].append(exam)
                else:
                    if exam['key'] not in j_keys:
                        j_course['exams'].append(exam)
                    if exam['key'] not in b_keys:
                        b_course['exams'].append(exam)
            continue # Do not add 제과제빵은행

        # For all other courses, clean out generated exams
        course['exams'] = [e for e in course.get('exams', []) if '_A_G_' not in e.get('key', '') and '_A_Z_' not in e.get('key', '') and '시험지 A' not in e.get('name', '') and '시험지 B' not in e.get('name', '') and '시험지 C' not in e.get('name', '')]

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

print("Updated exam_courses.json")
