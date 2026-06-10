import os
import glob
import time

now = int(time.time() * 1000)
files = glob.glob("Sejong/SejongAttendance/public/*.html")
changed = 0

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "tuition_v4.js" in content and "shared_calc.js" not in content:
        # We need to inject shared_calc.js before tuition_v4.js
        target = '<script src="tuition_v4.js'
        if target in content:
            inject_str = f'<script src="shared_calc.js?v={now}"></script>\n    '
            content = content.replace(target, inject_str + target)
            with open(file, 'w', encoding='utf-8') as f:
                f.write(content)
            
            dest = file.replace("Sejong/SejongAttendance/public", "public/sejong")
            if os.path.exists(os.path.dirname(dest)):
                with open(dest, 'w', encoding='utf-8') as f:
                    f.write(content)
            changed += 1

print(f"Injected shared_calc.js into {changed} files.")
