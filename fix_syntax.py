import os

files_to_patch = [
    "sheet.html",
    "ledger.js",
    "paid_list.js",
    "tuition_v4.js",
    "stats.js",
    "sms_v4.js"
]

base_dir = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public"

bad_string_1 = "if(typeof window.loadCycleSettings === 'function') await window.loadCycleSettings();\n        await Promise.all(["
bad_string_2 = "if(typeof window.loadCycleSettings === 'function') await window.loadCycleSettings();\n        await Promise.allSettled(["

for fname in files_to_patch:
    path = os.path.join(base_dir, fname)
    if not os.path.exists(path):
        continue
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Revert the bad replacement
    content = content.replace(bad_string_1, "await Promise.all([")
    content = content.replace(bad_string_2, "await Promise.allSettled([")
    
    # Now correctly inject it before the statement that contains await Promise.all
    # Let's use regex to find lines containing `await Promise.all([` and insert BEFORE that line.
    lines = content.split('\n')
    new_lines = []
    injected = False
    for line in lines:
        if "await Promise.all([" in line and not injected:
            # Check if it's assigned to a variable
            indent = line[:len(line) - len(line.lstrip())]
            new_lines.append(indent + "if(typeof window.loadCycleSettings === 'function') await window.loadCycleSettings();")
            new_lines.append(line)
            injected = True
        elif "await Promise.allSettled([" in line and not injected:
            indent = line[:len(line) - len(line.lstrip())]
            new_lines.append(indent + "if(typeof window.loadCycleSettings === 'function') await window.loadCycleSettings();")
            new_lines.append(line)
            injected = True
        else:
            new_lines.append(line)
            
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))
        
    print(f"Fixed syntax in {fname}")
