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

    # Step 1: Remove all injected window.loadCycleSettings lines to start fresh
    content = re.sub(r'if\s*\(\s*typeof\s+window\.loadCycleSettings\s*===\s*[\'"]function[\'"]\s*\)\s*await\s+window\.loadCycleSettings\(\);\n*', '', content)
    
    # Step 2: Fix any broken const [a] ; assignments to be const [a] =
    content = re.sub(r'(const\s+\[[^\]]+\])\s*;\s*(await Promise\.all)', r'\1 = \2', content)

    # Step 3: Inject the loadCycleSettings logic cleanly BEFORE the assignment/Promise.all
    def inject_loader(match):
        return f"if(typeof window.loadCycleSettings === 'function') await window.loadCycleSettings();\n        {match.group(0)}"
    
    # We want to match `const [...] = await Promise.all` or `await Promise.all`
    # We will match the start of the line that has Promise.all and isn't already prefixed.
    # Wait, simple way: find `await Promise.all` and inject before the line that contains it.
    
    lines = content.split('\n')
    new_lines = []
    for line in lines:
        if 'await Promise.all' in line and 'loadCycleSettings' not in line:
            # find leading whitespace
            match = re.match(r'^(\s*)', line)
            indent = match.group(1) if match else ''
            new_lines.append(f"{indent}if(typeof window.loadCycleSettings === 'function') await window.loadCycleSettings();")
        new_lines.append(line)
        
    content = '\n'.join(new_lines)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Cleaned {fname}")

