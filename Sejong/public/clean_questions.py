import json
import os

os.chdir('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public')

with open('questions_data.json', 'r', encoding='utf-8') as f:
    q_data = json.load(f)

keys_to_delete = []
for key in q_data.keys():
    if '_A_G_' in key or '_A_Z_' in key:
        keys_to_delete.append(key)
    # Also delete if it matches A~Z single letter at the end, but wait, the keys were like 제과기능사_A_Z_A. So checking '_A_G_' and '_A_Z_' is enough.

for key in keys_to_delete:
    del q_data[key]

# We must also do this for questions_data.js!
# But questions_data.json is where data resides. Let's just regenerate questions_data.js from questions_data.json.
with open('questions_data.json', 'w', encoding='utf-8') as f:
    json.dump(q_data, f, ensure_ascii=False, indent=2)

with open('questions_data.js', 'w', encoding='utf-8') as f:
    f.write("const questionsData = " + json.dumps(q_data, ensure_ascii=False, indent=2) + ";")

print("Cleaned questions_data.json and questions_data.js")
