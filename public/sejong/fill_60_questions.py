import json
import random
import os

data_path = 'questions_data.json'
with open(data_path, 'r', encoding='utf-8') as f:
    questions_data = json.load(f)

# Collect bank questions
cook_bank_keys = [k for k in questions_data.keys() if '오재을' in k and '제과제빵' not in k and '주관식' not in k]
bakery_bank_keys = [k for k in questions_data.keys() if '오재을_제과제빵' in k]

cook_bank_questions = []
for k in cook_bank_keys:
    cook_bank_questions.extend(questions_data[k])

bakery_bank_questions = []
for k in bakery_bank_keys:
    bakery_bank_questions.extend(questions_data[k])

def fill_exam(exam_key, bank_questions, bank_name):
    questions = questions_data[exam_key]
    if len(questions) < 60:
        needed = 60 - len(questions)
        print(f"Exam {exam_key} has {len(questions)} questions. Need {needed} more from {bank_name}.")
        
        # Keep track of existing question texts
        existing_texts = set(q.get('q', '') for q in questions)
        
        # Find candidates
        candidates = [q for q in bank_questions if q.get('q', '') not in existing_texts]
        
        if len(candidates) < needed:
            print(f"Warning: Not enough unique candidates for {exam_key}. Need {needed}, have {len(candidates)}.")
            added_questions = random.sample(bank_questions, needed)
        else:
            added_questions = random.sample(candidates, needed)
            
        # Re-number the added questions
        for i, q in enumerate(added_questions):
            new_q = dict(q)
            new_q['number'] = len(questions) + i + 1
            questions.append(new_q)
            
        questions_data[exam_key] = questions

cook_prefixes = ['한식', '양식', '일식', '중식', '복어', '과거기출_']
bakery_prefixes = ['제과', '제빵', '제과제빵', '케익디자이너', '베이킹']

for key in questions_data.keys():
    if any(key.startswith(p) for p in cook_prefixes) and '오재을' not in key:
        fill_exam(key, cook_bank_questions, "조리은행")
    elif any(key.startswith(p) for p in bakery_prefixes) and '오재을' not in key:
        fill_exam(key, bakery_bank_questions, "제과제빵은행")

with open(data_path, 'w', encoding='utf-8') as f:
    json.dump(questions_data, f, ensure_ascii=False, indent=4)

print("Finished processing questions_data.json")
