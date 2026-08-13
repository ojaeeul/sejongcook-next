import json
import random

with open('Sejong/SejongAttendance/public/questions_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Group exams by category
categories = {'한식': [], '양식': [], '일식': [], '중식': [], '제과': [], '제빵': []}

for k in data.keys():
    for cat in categories.keys():
        if cat in k and '제과제빵' not in k:
            categories[cat].append(k)
            break

# Print a couple of sample questions (preferably towards the end of the exam where specific questions lie)
print("=== 각 과목별 시험지 고유 문항 샘플 검사 ===\n")
for cat, keys in categories.items():
    if not keys:
        print(f"{cat}: 데이터 없음")
        continue
    
    # Pick a random exam from this category
    exam_key = random.choice(keys)
    questions = data[exam_key]
    
    # Pick a question from the latter half (where specific questions are)
    q_index = len(questions) - 5
    if q_index < 0: q_index = 0
    
    print(f"[{cat} 대표 샘플] 시험지명: {exam_key}")
    print(f"Q{q_index+1}: {questions[q_index]['q']}")
    for i, o in enumerate(questions[q_index].get('o', [])):
        print(f"  {i+1}) {o}")
    print()
    
