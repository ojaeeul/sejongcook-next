import json
import random
import os

with open('questions_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

prefixes = ['한식', '양식', '일식', '중식', '제과', '제빵', '제과제빵', '복어']

def shuffle_options_with_constraint(questions):
    consecutive_count = 0
    last_answer = None
    
    for q in questions:
        options = q['o']
        if not options or len(options) < 4:
            continue
            
        correct_option_text = options[0]
        
        available_indices = [0, 1, 2, 3]
        if consecutive_count >= 3 and last_answer in available_indices:
            available_indices.remove(last_answer)
            
        new_correct_idx = random.choice(available_indices)
        
        other_options = options[1:4]
        random.shuffle(other_options)
        
        new_options = [None] * 4
        new_options[new_correct_idx] = correct_option_text
        
        ptr = 0
        for i in range(4):
            if i != new_correct_idx:
                new_options[i] = other_options[ptr]
                ptr += 1
                
        # Handle if there are more than 4 options (rare but just in case)
        if len(options) > 4:
            new_options.extend(options[4:])
            
        q['o'] = new_options
        q['a'] = new_correct_idx + 1  # 1-based index for the answer
        
        if last_answer == new_correct_idx:
            consecutive_count += 1
        else:
            last_answer = new_correct_idx
            consecutive_count = 1

modified = False
for key in data:
    if any(key.startswith(p + '_') for p in prefixes) or key.startswith('미분류_자동수집_'):
        # Verify if it actually has all 1s (or mostly 1s)
        answers = [q.get('a') for q in data[key] if q.get('a')]
        if answers and all(a == 1 for a in answers):
            shuffle_options_with_constraint(data[key])
            modified = True
            print(f"Shuffled {key}")

if modified:
    with open('questions_data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    js_header = """function getFetchUrl(endpoint, isPost = false) {
    const url = `/api/sejong/${endpoint}`;
    return isPost ? url : url + (url.includes('?') ? '&' : '?') + `t=${Date.now()}`;
}

window.EXAM_DATA_DB = """
    js_content = js_header + json.dumps(data, ensure_ascii=False, indent=2) + ";"
    with open('questions_data.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print("Successfully updated questions_data.json and questions_data.js")
else:
    print("No exams needed shuffling (none were all 1s).")
