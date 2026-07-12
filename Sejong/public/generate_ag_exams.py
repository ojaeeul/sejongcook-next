import json
import random
import unicodedata
import os

def normalize(text):
    return unicodedata.normalize('NFC', text)

def generate_exams():
    os.chdir('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public')
    
    with open('questions_data.json', 'r', encoding='utf-8') as f:
        q_data = json.load(f)
        
    with open('exam_courses.json', 'r', encoding='utf-8') as f:
        courses_data = json.load(f)
        
    # Build banks
    banks = {
        '한식기능사': [],
        '양식기능사': [],
        '일식기능사': [],
        '중식기능사': [],
        '제과기능사': [],
        '제빵기능사': []
    }
    
    for key, questions in q_data.items():
        k = normalize(key)
        if '오재을' not in k:
            continue
        if '주관식' in k:
            continue
            
        valid_qs = [q for q in questions if not q.get('is_subjective', False)]
        
        # 제과
        if '제과' in k and '제빵' not in k: # careful about 제과제빵 mixed keys
            banks['제과기능사'].extend(valid_qs)
        # 제빵
        elif '제빵' in k:
            banks['제빵기능사'].extend(valid_qs)
        elif '제과제빵' in k: # If there's mixed, add to both just in case
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
            pass # No bogeo requested specifically, but user said "한식,양식,일식,중식"
        elif '한식' in k or ('조리기능사' in k and '떡' not in k and '복어' not in k):
            # 조리기능사 공통 is added to all culinary
            banks['한식기능사'].extend(valid_qs)
            banks['양식기능사'].extend(valid_qs)
            banks['일식기능사'].extend(valid_qs)
            banks['중식기능사'].extend(valid_qs)
            
    # Remove duplicates from banks based on question text
    for course_name in banks:
        unique_qs = {}
        for q in banks[course_name]:
            # Normalize text to remove subtle whitespace diffs
            q_text = normalize(q.get('q', '').strip())
            if q_text not in unique_qs:
                unique_qs[q_text] = q
        banks[course_name] = list(unique_qs.values())
        print(f"{course_name} bank size: {len(banks[course_name])}")

    suffixes = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
    
    # Generate A~G for each course
    for cat in courses_data:
        for course in cat.get('courses', []):
            course_name = course['name']
            if course_name in banks:
                bank = banks[course_name]
                if len(bank) < 60:
                    print(f"Not enough questions for {course_name}: {len(bank)}")
                    continue
                    
                random.shuffle(bank)
                
                # Check if we have enough for completely distinct exams (60 * 7 = 420)
                # If not, we just sample 60 randomly for each, which might have overlap between exams
                # but no overlap WITHIN an exam.
                
                for suffix in suffixes:
                    exam_name = f"{course_name} 시험지 {suffix}"
                    exam_key = f"{course_name}_A_G_{suffix}"
                    
                    # check if exam_key exists, if not, add it
                    existing = [e for e in course['exams'] if e['key'] == exam_key]
                    if not existing:
                        course['exams'].append({
                            "name": exam_name,
                            "key": exam_key
                        })
                    
                    # Generate 60 questions
                    if len(bank) >= 420:
                        idx = suffixes.index(suffix)
                        chosen_qs = bank[idx*60 : (idx+1)*60]
                    else:
                        chosen_qs = random.sample(bank, 60)
                        
                    # Re-number and format
                    formatted_qs = []
                    for i, q in enumerate(chosen_qs):
                        new_q = dict(q)
                        new_q['number'] = i + 1
                        new_q.pop('is_subjective', None)
                        formatted_qs.append(new_q)
                        
                    q_data[exam_key] = formatted_qs

    # Save files
    with open('exam_courses.json', 'w', encoding='utf-8') as f:
        json.dump(courses_data, f, ensure_ascii=False, indent=4)
        
    with open('questions_data.json', 'w', encoding='utf-8') as f:
        json.dump(q_data, f, ensure_ascii=False, separators=(',', ':'))
        
    print("Generation complete.")

if __name__ == '__main__':
    generate_exams()
