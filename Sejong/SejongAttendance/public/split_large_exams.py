import json
import os

with open("questions_data.json", "r", encoding="utf-8") as f:
    q_data = json.load(f)

with open("exam_courses.json", "r", encoding="utf-8") as f:
    courses = json.load(f)

# Keep track of changes to update courses
new_exams_to_add = []
keys_to_delete = []

for key, questions in list(q_data.items()):
    if len(questions) > 60:
        print(f"Splitting {key} (length: {len(questions)})")
        
        # Determine how many parts
        num_parts = (len(questions) + 59) // 60
        
        for i in range(num_parts):
            part_q = questions[i*60 : (i+1)*60]
            part_key = key.replace(".hwp", f"_part{i+1}.hwp")
            q_data[part_key] = part_q
            
            # Record for courses update
            base_name = key.replace("오재을_", "").replace("제과제빵_", "").replace(".hwp", "")
            new_exams_to_add.append({
                "original_key": key,
                "new_key": part_key,
                "new_name": f"{base_name}_part{i+1}"
            })
            
        # Remove the original >60 exam from q_data
        keys_to_delete.append(key)
        del q_data[key]

# Update exam_courses.json
for cat in courses:
    for course in cat.get('courses', []):
        new_exams_list = []
        for ex in course.get('exams', []):
            if ex['key'] in keys_to_delete:
                # Add the split parts instead
                parts = [p for p in new_exams_to_add if p['original_key'] == ex['key']]
                for p in parts:
                    new_exams_list.append({"name": p['new_name'], "key": p['new_key']})
            else:
                new_exams_list.append(ex)
        course['exams'] = new_exams_list

with open("questions_data.json", "w", encoding="utf-8") as f:
    json.dump(q_data, f, ensure_ascii=False, indent=2)

with open("exam_courses.json", "w", encoding="utf-8") as f:
    json.dump(courses, f, ensure_ascii=False, indent=2)

print("Split completed! Re-generating questions_data.js...")
js_content = """function getFetchUrl(endpoint, isPost = false) {
    const url = `/api/sejong/${endpoint}`;
    return isPost ? url : url + (url.includes('?') ? '&' : '?') + `t=${Date.now()}`;
}

window.EXAM_DATA_DB = """
js_content += json.dumps(q_data, ensure_ascii=False, indent=2)
js_content += ";\n"

with open("questions_data.js", "w", encoding="utf-8") as f:
    f.write(js_content)
print("Updated questions_data.js")
