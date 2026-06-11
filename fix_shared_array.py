import os

path = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/shared_calc.js"

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_load = """            const data = await res.json();
            if (data && data.cycleRules) {
                window.sejongCycleRules = data.cycleRules;
            }"""
new_load = """            const data = await res.json();
            let target = Array.isArray(data) ? (data[0] || {}) : data;
            if (target && target.cycleRules) {
                window.sejongCycleRules = target.cycleRules;
            }"""
content = content.replace(old_load, new_load)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed array issue in shared_calc.js")
