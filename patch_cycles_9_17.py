import os
import re

def patch_file(filepath, replacements):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    modified = content
    for old, new in replacements:
        modified = modified.replace(old, new)
        
    if modified != content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(modified)
        print(f"Patched {filepath}")
    else:
        print(f"No changes in {filepath}")

# 1. shared_calc.js
patch_file("public/sejong/shared_calc.js", [
    ("return Math.floor((vRaw - 170) / 160) + 1;", "return Math.floor((vRaw - 170) / 170) + 1;"),
    ("return Math.floor((vRaw - 90) / 80) + 1;", "return Math.floor((vRaw - 90) / 90) + 1;")
])

# 2. sheet.html
patch_file("public/sejong/sheet.html", [
    ("isDualCourse ? 16.0 : 8.0", "isDualCourse ? 17.0 : 9.0"),
    ("return Math.floor((vRaw - 170) / 160) + 1;", "return Math.floor((vRaw - 170) / 170) + 1;"),
    ("return Math.floor((vRaw - 90) / 80) + 1;", "return Math.floor((vRaw - 90) / 90) + 1;")
])

# 3. sms_v3.js
patch_file("public/sejong/sms_v3.js", [
    ("isDualBakery ? 16 : 8", "isDualBakery ? 17 : 9"),
    ("return Math.floor((vRaw - 170) / 160) + 1;", "return Math.floor((vRaw - 170) / 170) + 1;"),
    ("return Math.floor((vRaw - 90) / 80) + 1;", "return Math.floor((vRaw - 90) / 90) + 1;")
])

# 4. tuition_v3.js
patch_file("public/sejong/tuition_v3.js", [
    ("const firstTargetCount = isDualBakeryLocal ? 17 : 9;", "const targetCount = isDualBakeryLocal ? 17 : 9;"),
    ("const subTargetCount = isDualBakeryLocal ? 16 : 8;", ""),
    ("let isFirstCycleForThisCourse = true;", ""),
    ("const currentTargetCount = isFirstCycleForThisCourse ? firstTargetCount : subTargetCount;", "const currentTargetCount = targetCount;"),
    ("isFirstCycleForThisCourse = false;", "")
])

# 5. tuition_v4.js
patch_file("public/sejong/tuition_v4.js", [
    ("const firstTargetCount = isDualBakeryLocal ? 17 : 9;", "const targetCount = isDualBakeryLocal ? 17 : 9;"),
    ("const subTargetCount = isDualBakeryLocal ? 16 : 8;", ""),
    ("let isFirstCycleForThisCourse = true;", ""),
    ("const currentTargetCount = isFirstCycleForThisCourse ? firstTargetCount : subTargetCount;", "const currentTargetCount = targetCount;"),
    ("isFirstCycleForThisCourse = false;", "")
])

