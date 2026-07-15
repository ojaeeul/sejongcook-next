import json
import os
import random
import unicodedata

def is_subjective(question):
    if "o" not in question or not isinstance(question["o"], list):
        return True
    if len(question["o"]) < 2:
        return True
    return False

def generate_exams():
    file_path = "questions_data.json"
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    hansik_pool = []
    generic_pool = []

    for key, questions in data.items():
        norm_key = unicodedata.normalize('NFC', key)
        
        if "주관식" in norm_key:
            continue
            
        if norm_key.startswith("오재을_"):
            for q in questions:
                if is_subjective(q):
                    continue
                if "한식" in norm_key:
                    hansik_pool.append(q)
                else:
                    generic_pool.append(q)

    def unique_pool(pool):
        seen = set()
        res = []
        for q in pool:
            txt = q.get('q', '').strip()
            if txt and txt not in seen:
                seen.add(txt)
                res.append(q)
        return res

    hansik_pool = unique_pool(hansik_pool)
    generic_pool = unique_pool(generic_pool)

    courses = {
        "한식기능사": hansik_pool + generic_pool,
        "양식기능사": generic_pool,
        "일식기능사": generic_pool,
        "중식기능사": generic_pool
    }

    letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    
    keys_to_delete = []
    for key in data.keys():
        norm_key = unicodedata.normalize('NFC', key)
        for course in courses:
            if norm_key.startswith(f"{course}_시험지_") and norm_key[-1] in letters:
                keys_to_delete.append(key)
    
    for key in keys_to_delete:
        del data[key]

    for course_name, pool in courses.items():
        random.seed(course_name) 
        shuffled = list(pool)
        random.shuffle(shuffled)
        
        num_exams = len(shuffled) // 60
        num_exams = min(num_exams, 26) 
        
        for i in range(num_exams):
            exam_name = f"{course_name}_시험지_{letters[i]}"
            start = i * 60
            end = start + 60
            exam_questions = shuffled[start:end]
            data[exam_name] = exam_questions

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    generate_exams()
