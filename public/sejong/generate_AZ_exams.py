import json
import os
import random

os.chdir('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public')

with open('questions_data.json', 'r', encoding='utf-8') as f:
    q_data = json.load(f)

# Collect all original questions from 제과제빵은행
j_questions = []
b_questions = []

for key, questions in q_data.items():
    if not key.startswith('제과제빵은행_'):
        continue
        
    # Check if this exam is 제과 or 제빵
    name = key.replace('제과제빵은행_', '')
    if '제과' in name and '제빵' not in name:
        for q in questions:
            # We don't want to modify the original dictionary, just reference it or copy
            j_questions.append(q)
    elif '제빵' in name and '제과' not in name:
        for q in questions:
            b_questions.append(q)

print(f"Found {len(j_questions)} 제과 questions and {len(b_questions)} 제빵 questions.")

# Shuffle questions
random.seed(42)
random.shuffle(j_questions)
random.shuffle(b_questions)

# Create A~Z exams
chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

j_generated_exams = []
b_generated_exams = []

# For 제과
idx = 0
char_idx = 0
while idx + 60 <= len(j_questions) and char_idx < len(chars):
    char = chars[char_idx]
    exam_key = f"제과기능사_시험지_{char}"
    exam_name = f"제과기능사 시험지 {char} (60문항)"
    
    # Take 60 questions
    exam_qs = j_questions[idx:idx+60]
    
    # Fix q_num
    new_exam_qs = []
    for i, q in enumerate(exam_qs):
        new_q = q.copy()
        new_q['q_num'] = i + 1
        new_exam_qs.append(new_q)
        
    q_data[exam_key] = new_exam_qs
    
    j_generated_exams.append({
        "name": exam_name,
        "key": exam_key
    })
    
    idx += 60
    char_idx += 1

print(f"Generated {len(j_generated_exams)} 제과 exams (A to {chars[char_idx-1] if char_idx > 0 else 'None'}).")

# For 제빵
idx = 0
char_idx = 0
while idx + 60 <= len(b_questions) and char_idx < len(chars):
    char = chars[char_idx]
    exam_key = f"제빵기능사_시험지_{char}"
    exam_name = f"제빵기능사 시험지 {char} (60문항)"
    
    exam_qs = b_questions[idx:idx+60]
    
    new_exam_qs = []
    for i, q in enumerate(exam_qs):
        new_q = q.copy()
        new_q['q_num'] = i + 1
        new_exam_qs.append(new_q)
        
    q_data[exam_key] = new_exam_qs
    
    b_generated_exams.append({
        "name": exam_name,
        "key": exam_key
    })
    
    idx += 60
    char_idx += 1

print(f"Generated {len(b_generated_exams)} 제빵 exams (A to {chars[char_idx-1] if char_idx > 0 else 'None'}).")

# Write questions_data.json
with open('questions_data.json', 'w', encoding='utf-8') as f:
    json.dump(q_data, f, ensure_ascii=False, indent=2)

with open('questions_data.js', 'w', encoding='utf-8') as f:
    f.write("const questionsData = " + json.dumps(q_data, ensure_ascii=False, indent=2) + ";")

# Update exam_courses.json
with open('exam_courses.json', 'r', encoding='utf-8') as f:
    courses_data = json.load(f)

for cat in courses_data:
    for course in cat.get('courses', []):
        # First, remove any generated exams we might have previously added just in case
        # (Though we cleaned them, let's be sure)
        course['exams'] = [e for e in course.get('exams', []) if '시험지' not in e['name']]
        
        if course['name'] == '제과기능사':
            # Append generated exams at the top
            course['exams'] = j_generated_exams + course['exams']
        elif course['name'] == '제빵기능사':
            course['exams'] = b_generated_exams + course['exams']

with open('exam_courses.json', 'w', encoding='utf-8') as f:
    json.dump(courses_data, f, ensure_ascii=False, indent=4)

print("Updated exam_courses.json")
