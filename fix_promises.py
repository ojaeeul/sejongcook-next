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

bad_string = '\n                    (typeof window.loadCycleSettings === "function" ? window.loadCycleSettings() : Promise.resolve()),'
bad_string_2 = '\n            (typeof window.loadCycleSettings === "function" ? window.loadCycleSettings() : Promise.resolve()),'

for fname in files_to_patch:
    path = os.path.join(base_dir, fname)
    if not os.path.exists(path):
        continue
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove the bad strings from inside the array
    modified = content.replace(bad_string, "")
    modified = modified.replace(bad_string_2, "")
    
    # Inject before Promise.all
    if "loadCycleSettings" not in modified:
        modified = modified.replace("await Promise.all([", "if(typeof window.loadCycleSettings === 'function') await window.loadCycleSettings();\n        await Promise.all([")
        modified = modified.replace("await Promise.allSettled([", "if(typeof window.loadCycleSettings === 'function') await window.loadCycleSettings();\n        await Promise.allSettled([")
        
        # sheet.html has Promise.all without await in initSheet sometimes? No, it has `await Promise.all([`
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(modified)
        
    print(f"Fixed {fname}")
