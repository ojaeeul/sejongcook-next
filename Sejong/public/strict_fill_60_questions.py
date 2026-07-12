import json
import random
import unicodedata

data_path = 'questions_data.json'
with open(data_path, 'r', encoding='utf-8') as f:
    questions_data = json.load(f)

def get_questions(keys):
    q_list = []
    for k in keys:
        if k in questions_data:
            for q in questions_data[k]:
                # Exclude subjective questions
                if q.get('is_subjective'): continue
                if '주관식' in q.get('q', ''): continue
                # Objective questions must have options
                if not q.get('o') or len(q.get('o')) < 2: continue
                q_list.append(q)
    return q_list

# Classify bank keys
all_bank_keys = [k for k in questions_data.keys() if '오재을' in unicodedata.normalize('NFC', k)]

# Cooking
hansik_keys = [k for k in all_bank_keys if '한식' in unicodedata.normalize('NFC', k) or 'hcook' in unicodedata.normalize('NFC', k) or ('조리기능사' in unicodedata.normalize('NFC', k) and '떡' not in unicodedata.normalize('NFC', k))]
yangsik_keys = [k for k in all_bank_keys if '양식' in unicodedata.normalize('NFC', k) or ('조리기능사' in unicodedata.normalize('NFC', k) and '떡' not in unicodedata.normalize('NFC', k))]
ilsik_keys = [k for k in all_bank_keys if '일식' in unicodedata.normalize('NFC', k) or ('조리기능사' in unicodedata.normalize('NFC', k) and '떡' not in unicodedata.normalize('NFC', k))]
jungsik_keys = [k for k in all_bank_keys if '중식' in unicodedata.normalize('NFC', k) or ('조리기능사' in unicodedata.normalize('NFC', k) and '떡' not in unicodedata.normalize('NFC', k))]
bogeo_keys = [k for k in all_bank_keys if '복어' in unicodedata.normalize('NFC', k) or ('조리기능사' in unicodedata.normalize('NFC', k) and '떡' not in unicodedata.normalize('NFC', k))]
generic_cook_keys = [k for k in all_bank_keys if '조리기능사' in unicodedata.normalize('NFC', k) and '떡' not in unicodedata.normalize('NFC', k)]

# Bakery
jegwa_keys = [k for k in all_bank_keys if '제과' in unicodedata.normalize('NFC', k) and '제빵' not in unicodedata.normalize('NFC', k)]
jeppang_keys = [k for k in all_bank_keys if '제빵' in unicodedata.normalize('NFC', k) and '제과' not in unicodedata.normalize('NFC', k)]
jegwajeppang_keys = [k for k in all_bank_keys if '제과제빵' in unicodedata.normalize('NFC', k) or '상시복원' in unicodedata.normalize('NFC', k) or '식품위생학' in unicodedata.normalize('NFC', k) or '공통' in unicodedata.normalize('NFC', k) or '답안지' in unicodedata.normalize('NFC', k) or ('제과' in unicodedata.normalize('NFC', k) and '제빵' in unicodedata.normalize('NFC', k))]

hansik_bank = get_questions(hansik_keys)
yangsik_bank = get_questions(yangsik_keys)
ilsik_bank = get_questions(ilsik_keys)
jungsik_bank = get_questions(jungsik_keys)
bogeo_bank = get_questions(bogeo_keys)
generic_cook_bank = get_questions(generic_cook_keys)

jegwa_bank = get_questions(jegwa_keys) + get_questions(jegwajeppang_keys)
jeppang_bank = get_questions(jeppang_keys) + get_questions(jegwajeppang_keys)
jegwajeppang_bank = get_questions(jegwa_keys) + get_questions(jeppang_keys) + get_questions(jegwajeppang_keys)

def fill_exam(exam_key, bank_questions):
    questions = questions_data[exam_key]
    if len(questions) < 60:
        needed = 60 - len(questions)
        
        existing_texts = set(q.get('q', '') for q in questions)
        candidates = [q for q in bank_questions if q.get('q', '') not in existing_texts]
        
        if len(candidates) < needed:
            print(f"Warning: Not enough unique candidates for {exam_key}. Need {needed}, have {len(candidates)}.")
            # Duplicate allowed fallback
            added_questions = random.sample(bank_questions, needed) if len(bank_questions) >= needed else random.choices(bank_questions, k=needed)
        else:
            added_questions = random.sample(candidates, needed)
            
        for i, q in enumerate(added_questions):
            new_q = dict(q)
            # Remove subjective keys just in case
            new_q.pop('is_subjective', None)
            new_q['number'] = len(questions) + i + 1
            questions.append(new_q)
            
        questions_data[exam_key] = questions
        return True
    return False

filled_count = 0
for key in questions_data.keys():
    n_key = unicodedata.normalize('NFC', key)
    if '오재을' in n_key:
        continue
    
    if '과거기출_한식' in n_key or 'hcook' in n_key or '한식' in n_key:
        if fill_exam(key, hansik_bank): filled_count += 1
    elif '과거기출_양식' in n_key or '양식' in n_key:
        if fill_exam(key, yangsik_bank): filled_count += 1
    elif '과거기출_일식' in n_key or '일식' in n_key:
        if fill_exam(key, ilsik_bank): filled_count += 1
    elif '과거기출_중식' in n_key or '중식' in n_key:
        if fill_exam(key, jungsik_bank): filled_count += 1
    elif '과거기출_복어' in n_key or '복어' in n_key:
        if fill_exam(key, bogeo_bank): filled_count += 1
    elif '조리기능사' in n_key:
        if fill_exam(key, generic_cook_bank): filled_count += 1
    elif '제과제빵' in n_key:
        if fill_exam(key, jegwajeppang_bank): filled_count += 1
    elif '제과' in n_key or '케익' in n_key or '베이킹' in n_key:
        if fill_exam(key, jegwa_bank): filled_count += 1
    elif '제빵' in n_key:
        if fill_exam(key, jeppang_bank): filled_count += 1

print(f"Filled {filled_count} exams to 60 questions using strict objective bank categorization.")

with open(data_path, 'w', encoding='utf-8') as f:
    json.dump(questions_data, f, ensure_ascii=False, indent=4)
