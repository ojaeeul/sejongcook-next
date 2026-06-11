import os
import re

files_to_patch = [
    "sheet.html",
    "ledger.js",
    "paid_list.js",
    "tuition_v4.js",
    "stats.js",
    "sms_v4.js"
]

base_dir = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public"

for fname in files_to_patch:
    path = os.path.join(base_dir, fname)
    if not os.path.exists(path):
        continue
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the first Promise.all([ and insert the loadCycleSettings logic
    if "loadCycleSettings" not in content:
        # Regex to find Promise.all([
        pattern = r'(Promise\.all\(\s*\[)'
        replacement = r'\1\n                    (typeof window.loadCycleSettings === "function" ? window.loadCycleSettings() : Promise.resolve()),'
        new_content = re.sub(pattern, replacement, content, count=1)
        
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Patched {fname}")
        else:
            print(f"Could not find Promise.all in {fname}")
    else:
        print(f"Already patched {fname}")

