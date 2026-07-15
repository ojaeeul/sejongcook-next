import json
import random
import unicodedata
import os
import string

def normalize(text):
    return unicodedata.normalize('NFC', text)

def generate_exams():
    os.chdir('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public')
    
    with open('questions_data.json', 'r', encoding='utf-8') as f:
        q_data = json.load(f)
        
    banks = {
        '한식기능사': [],
        '양식기능사': [],
        '일식기능사': [],
        '중식기능사': [],
        '제과기능사': [],
        '제빵기능사': [],
        '복어기능사': []
    }
    
    for key, questions in q_data.items():
        k = normalize(key)
        if '주관식' in k:
            continue
            
        valid_qs = [q for q in questions if not q.get('is_subjective', False)]
        
        # 제과/제빵
        if '제과' in k and '제빵' not in k:
            banks['제과기능사'].extend(valid_qs)
        elif '제빵' in k and '제과' not in k:
            banks['제빵기능사'].extend(valid_qs)
        elif '제과제빵' in k:
            banks['제과기능사'].extend(valid_qs)
            banks['제빵기능사'].extend(valid_qs)
        
        # 조리
        elif '양식' in k:
            banks['양식기능사'].extend(valid_qs)
        elif '일식' in k:
            banks['일식기능사'].extend(valid_qs)
        elif '중식' in k:
            banks['중식기능사'].extend(valid_qs)
        elif '복어' in k:
            banks['복어기능사'].extend(valid_qs)
        elif '한식' in k or ('조리기능사' in k and '떡' not in k and '복어' not in k):
            banks['한식기능사'].extend(valid_qs)
            banks['양식기능사'].extend(valid_qs)
            banks['일식기능사'].extend(valid_qs)
            banks['중식기능사'].extend(valid_qs)
            
    # Remove duplicates from banks based on question text
    for course_name in banks:
        unique_qs = {}
        for q in banks[course_name]:
            q_text = normalize(q.get('q', '').strip())
            if q_text not in unique_qs:
                unique_qs[q_text] = q
        banks[course_name] = list(unique_qs.values())
        print(f"{course_name} unique questions: {len(banks[course_name])}")

    letters = list(string.ascii_uppercase)
    
    new_courses_data = []
    
    for course_name, bank in banks.items():
        if not bank:
            continue
            
        course_exams = []
        random.shuffle(bank)
        
        max_exams = len(bank) // 60
        num_exams = min(26, max_exams)
        
        if num_exams == 0:
            print(f"Not enough questions for {course_name} even for 1 exam.")
            continue
            
        for i in range(num_exams):
            suffix = letters[i]
            exam_name = f"{course_name} 모의고사 {suffix}"
            exam_key = f"{course_name}_A_Z_{suffix}"
            
            chosen_qs = bank[i*60 : (i+1)*60]
            
            formatted_qs = []
            for j, q in enumerate(chosen_qs):
                new_q = dict(q)
                new_q['number'] = j + 1
                new_q.pop('is_subjective', None)
                formatted_qs.append(new_q)
                
            q_data[exam_key] = formatted_qs
            
            course_exams.append({
                "name": exam_name,
                "key": exam_key
            })
            
        new_courses_data.append({
            "name": course_name,
            "exams": course_exams
        })
        print(f"Generated {num_exams} exams for {course_name}")

    final_courses_data = [{
        "category": "모의고사",
        "courses": new_courses_data
    }]
        
    with open('exam_courses.json', 'w', encoding='utf-8') as f:
        json.dump(final_courses_data, f, ensure_ascii=False, indent=4)
        
    with open('questions_data.json', 'w', encoding='utf-8') as f:
        json.dump(q_data, f, ensure_ascii=False, separators=(',', ':'))
        
    print("A~Z Generation complete.")

if __name__ == '__main__':
    generate_exams()
