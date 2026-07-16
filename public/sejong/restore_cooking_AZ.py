import json
import random
import unicodedata
import os
import string

def normalize(text):
    return unicodedata.normalize('NFC', text)

def main():
    os.chdir('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public')
    
    with open('questions_data.json', 'r', encoding='utf-8') as f:
        q_data = json.load(f)
        
    banks = {
        '한식기능사': [],
        '양식기능사': [],
        '일식기능사': [],
        '중식기능사': [],
        '복어조리기능사': []  # in exam_courses.json, is it 복어조리기능사 or 복어기능사? Let me check exam_courses.json.
    }
    
    # Actually I need to know the exact course names in exam_courses.json.
    # From previous grep: "한식기능사", "양식기능사", "일식기능사", "중식기능사"
    # Let me dynamically extract course names from category '조리과정'
    with open('exam_courses.json', 'r', encoding='utf-8') as f:
        courses_data = json.load(f)
        
    cooking_courses = []
    for cat in courses_data:
        if cat.get('category') == '조리과정':
            cooking_courses = [c['name'] for c in cat.get('courses', [])]
            break
            
    print("Cooking courses:", cooking_courses)
    
    banks = {c: [] for c in cooking_courses}
    
    for key, questions in q_data.items():
        k = normalize(key)
        if '주관식' in k or '시험지' in k or 'A_Z' in k:
            continue
            
        valid_qs = [q for q in questions if not q.get('is_subjective', False)]
        
        if '한식' in k or ('과거기출_한식' in k):
            if '한식기능사' in banks:
                banks['한식기능사'].extend(valid_qs)
        elif '양식' in k:
            if '양식기능사' in banks:
                banks['양식기능사'].extend(valid_qs)
        elif '일식' in k:
            if '일식기능사' in banks:
                banks['일식기능사'].extend(valid_qs)
        elif '중식' in k:
            if '중식기능사' in banks:
                banks['중식기능사'].extend(valid_qs)
        elif '복어' in k:
            for c in banks:
                if '복어' in c:
                    banks[c].extend(valid_qs)
        elif '조리기능사' in k and '떡' not in k and '복어' not in k:
            # Common cooking questions
            if '한식기능사' in banks: banks['한식기능사'].extend(valid_qs)
            if '양식기능사' in banks: banks['양식기능사'].extend(valid_qs)
            if '일식기능사' in banks: banks['일식기능사'].extend(valid_qs)
            if '중식기능사' in banks: banks['중식기능사'].extend(valid_qs)
            
    letters = list(string.ascii_uppercase)
    
    generated_courses = {}
    
    for course_name, bank in banks.items():
        unique_qs = {}
        for q in bank:
            q_text = normalize(q.get('q', '').strip())
            if q_text not in unique_qs:
                unique_qs[q_text] = q
        bank = list(unique_qs.values())
        print(f"{course_name} unique questions: {len(bank)}")
        
        if not bank:
            generated_courses[course_name] = []
            continue
            
        random.seed(42)  # for reproducible A~Z
        random.shuffle(bank)
        
        max_exams = len(bank) // 60
        num_exams = min(26, max_exams)
        if num_exams < 26 and len(bank) > 60:
            num_exams = 26  # If we want exactly A~Z, we can reuse questions.
            # But wait, we shouldn't reuse if we don't have to.
            # Usually we just take 26, and if we run out, we cycle.
            pass
            
        # Actually to guarantee A~Z (26 exams), we will loop over the bank repeatedly
        course_exams = []
        for i in range(26):
            suffix = letters[i]
            exam_name = f"{course_name} 시험지 {suffix} (60문항)"
            exam_key = f"{course_name}_시험지_{suffix}"
            
            start_idx = (i * 60) % len(bank)
            end_idx = start_idx + 60
            
            if end_idx <= len(bank):
                chosen_qs = bank[start_idx:end_idx]
            else:
                chosen_qs = bank[start_idx:] + bank[:end_idx - len(bank)]
                
            formatted_qs = []
            for j, q in enumerate(chosen_qs):
                new_q = dict(q)
                new_q['q_num'] = j + 1
                new_q.pop('number', None) # keep q_num
                formatted_qs.append(new_q)
                
            q_data[exam_key] = formatted_qs
            course_exams.append({
                "name": exam_name,
                "key": exam_key
            })
            
        generated_courses[course_name] = course_exams
        print(f"Generated 26 exams for {course_name}")

    # Update exam_courses.json
    for cat in courses_data:
        if cat.get('category') == '조리과정':
            for course in cat.get('courses', []):
                course_name = course['name']
                # remove any existing '시험지' from this course to prevent duplicates
                course['exams'] = [e for e in course.get('exams', []) if '시험지' not in e['name']]
                
                # Prepend the new A~Z exams
                new_exams = generated_courses.get(course_name, [])
                course['exams'] = new_exams + course['exams']
                
    with open('exam_courses.json', 'w', encoding='utf-8') as f:
        json.dump(courses_data, f, ensure_ascii=False, indent=4)
        
    with open('questions_data.json', 'w', encoding='utf-8') as f:
        json.dump(q_data, f, ensure_ascii=False, indent=2)
        
    with open('questions_data.js', 'w', encoding='utf-8') as f:
        f.write("const questionsData = " + json.dumps(q_data, ensure_ascii=False, indent=2) + ";")
        
    print("Restore complete.")

if __name__ == '__main__':
    main()
