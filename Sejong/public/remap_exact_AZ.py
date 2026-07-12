import json
import string
import re

with open('questions_data.json', 'r', encoding='utf-8') as f:
    qdata = json.load(f)

with open('exam_courses.json', 'r', encoding='utf-8') as f:
    courses = json.load(f)

# Collect all keys
all_keys = list(qdata.keys())

letters = list(string.ascii_uppercase)

# Remove the randomly generated A_Z keys to clean up
keys_to_delete = [k for k in all_keys if '_A_Z_' in k]
for k in keys_to_delete:
    del qdata[k]

# Function to extract year and round for sorting
def extract_year_round(k):
    match = re.search(r'20(\d{2})년.*(\d+)회', k)
    if match:
        return (int(match.group(1)), int(match.group(2)))
    # fallback
    return (99, 99)

for cat in courses:
    cat_name = cat['category']
    for course in cat.get('courses', []):
        course_name = course['name'] # e.g. "제과기능사"
        
        # Determine mapping keyword
        kw = course_name.replace('기능사', '') # '제과', '제빵', '한식'...
        
        # Find exact HWP keys matching this keyword, excluding 주관식
        valid_keys = [k for k in qdata.keys() if kw in k and '주관식' not in k]
        
        # Sort them by year and round
        valid_keys.sort(key=extract_year_round)
        
        # Take up to 26
        selected_keys = valid_keys[:26]
        
        new_exams = []
        for i, key in enumerate(selected_keys):
            if i < 26:
                l = letters[i]
                new_exams.append({
                    "name": f"{course_name} 시험지 {l} (60문항)",
                    "key": key # Map directly to the original HWP key!
                })
                
        course['exams'] = new_exams

with open('exam_courses.json', 'w', encoding='utf-8') as f:
    json.dump(courses, f, ensure_ascii=False, indent=2)

with open('questions_data.json', 'w', encoding='utf-8') as f:
    json.dump(qdata, f, ensure_ascii=False, indent=2)

print("Restored exact mapping for A~Z exams!")
