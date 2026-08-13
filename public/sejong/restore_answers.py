import json
import shutil

NEW_JSON = 'questions_data.json'
BAK_JSON = 'questions_data.json.bak'
BACKUP_OF_NEW = 'questions_data.json.with_e.bak'

# First, create a backup of the current state just in case!
shutil.copyfile(NEW_JSON, BACKUP_OF_NEW)

with open(NEW_JSON, 'r', encoding='utf-8') as f:
    d_new = json.load(f)

with open(BAK_JSON, 'r', encoding='utf-8') as f:
    d_old = json.load(f)

restored_count = 0
for course, v_old in d_old.items():
    if course in d_new:
        if isinstance(v_old, list) and isinstance(d_new[course], list):
            for i, q_old in enumerate(v_old):
                if i < len(d_new[course]):
                    a_old = q_old.get('a')
                    a_new = d_new[course][i].get('a')
                    if a_old is not None and a_old != a_new:
                        d_new[course][i]['a'] = a_old
                        restored_count += 1
                        
        elif isinstance(v_old, dict) and isinstance(d_new[course], dict):
            for exam_name, exam_old in v_old.items():
                if exam_name in d_new[course]:
                    l_old = exam_old.get('questions', [])
                    l_new = d_new[course][exam_name].get('questions', [])
                    for i in range(min(len(l_old), len(l_new))):
                        a_old = l_old[i].get('a')
                        a_new = l_new[i].get('a')
                        if a_old is not None and a_old != a_new:
                            d_new[course][exam_name]['questions'][i]['a'] = a_old
                            restored_count += 1

print(f"Successfully restored {restored_count} answers from original backup.")

with open(NEW_JSON, 'w', encoding='utf-8') as f:
    json.dump(d_new, f, ensure_ascii=False, indent=2)

print("Saved updated questions_data.json.")
