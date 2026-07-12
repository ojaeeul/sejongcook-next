import json
import random
import string

with open('questions_data.json', 'r', encoding='utf-8') as f:
    q_data = json.load(f)

# Categories
categories = ['한식', '양식', '일식', '중식', '제빵', '제과']

pools = {cat: [] for cat in categories}

# Collect all valid questions
for key, questions in q_data.items():
    if not isinstance(questions, list):
        continue
    
    # Exclude subjective
    if '주관식' in key:
        continue
        
    for cat in categories:
        if cat in key:
            pools[cat].extend(questions)
            break

# Also, there's '제과제빵' which should be a mix of 제과 and 제빵
pools['제과제빵'] = pools['제과'] + pools['제빵']
categories.append('제과제빵')

# Generate A~Z (26 exams) for each category
letters = list(string.ascii_uppercase)

for cat in categories:
    pool = pools[cat]
    if not pool:
        continue
        
    for letter in letters:
        new_key = f"{cat}기능사_A_Z_{letter}"
        
        # We need 60 questions. If pool is larger, sample without replacement.
        # If pool is smaller, sample with replacement.
        if len(pool) >= 60:
            sampled = random.sample(pool, 60)
        else:
            sampled = random.choices(pool, k=60)
            
        q_data[new_key] = sampled

with open("questions_data.json", "w", encoding="utf-8") as f:
    json.dump(q_data, f, ensure_ascii=False, indent=2)

print("Generated A~Z exams successfully!")
