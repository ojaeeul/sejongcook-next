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

    # Find the const [...] = if(...) bug
    pattern = r'(const\s+\[[^\]]+\]\s*=\s*)if\s*\(typeof window\.loadCycleSettings === \'function\'\)\s*await\s*window\.loadCycleSettings\(\);\n\s*(await Promise\.all(?:Settled)?\s*\[)'
    
    replacement = r"if(typeof window.loadCycleSettings === 'function') await window.loadCycleSettings();\n        \1\2"
    
    modified = re.sub(pattern, replacement, content)
    
    if modified != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(modified)
        print(f"Fixed syntax error in {fname}")

