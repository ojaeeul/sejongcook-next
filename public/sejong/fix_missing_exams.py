import json
import unicodedata

def normalize(s):
    return unicodedata.normalize('NFC', s)

with open('questions_data.json', 'r', encoding='utf-8') as f:
    qdata = json.load(f)

with open('exam_courses.json', 'r', encoding='utf-8') as f:
    cdata = json.load(f)

# Collect all available keys in qdata
q_keys = list(qdata.keys())

updates_made = 0

for cat in cdata:
    for course in cat.get('courses', []):
        for exam in course.get('exams', []):
            name = exam['name']
            key = exam['key']
            
            if key not in qdata:
                # 1. Check if there's an exact match under a different prefix (e.g. 과거기출_)
                name_nfc = normalize(name)
                found = False
                
                # Try to find exactly this name in qdata keys
                for qk in q_keys:
                    if normalize(qk).endswith(f"{name_nfc}.hwp"):
                        qdata[key] = qdata[qk]
                        print(f"Copied {qk} to {key}")
                        found = True
                        updates_made += 1
                        break
                        
                if not found:
                    # 2. Check if there are part1 and part2
                    part1_key = None
                    part2_key = None
                    for qk in q_keys:
                        if normalize(qk).endswith(f"{name_nfc}_part1.hwp") or normalize(qk).endswith(f"{name_nfc}_part1"):
                            part1_key = qk
                        if normalize(qk).endswith(f"{name_nfc}_part2.hwp") or normalize(qk).endswith(f"{name_nfc}_part2"):
                            part2_key = qk
                            
                    if part1_key and part2_key:
                        combined = qdata[part1_key] + qdata[part2_key]
                        qdata[key] = combined
                        print(f"Combined {part1_key} and {part2_key} into {key} ({len(combined)} questions)")
                        found = True
                        updates_made += 1
                    elif part1_key:
                        qdata[key] = qdata[part1_key]
                        print(f"Copied {part1_key} to {key}")
                        found = True
                        updates_made += 1
                        
                if not found:
                    print(f"STILL MISSING: {key} (name: {name})")

if updates_made > 0:
    with open('questions_data.json', 'w', encoding='utf-8') as f:
        json.dump(qdata, f, ensure_ascii=False, indent=2)
    print(f"Saved {updates_made} new keys to questions_data.json")
else:
    print("No updates made.")

