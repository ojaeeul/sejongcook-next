import os

path = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/cycle_settings.html"

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_main = '<main class="main-content" style="background-color: #f1f5f9; padding: 40px; display: flex; justify-content: center; align-items: flex-start; height: 100vh;">'
new_main = '<main class="main-content" style="background-color: #f1f5f9; padding: 40px; display: flex; flex-direction: column; justify-content: flex-start; align-items: center; height: auto; min-height: 100vh;">'

content = content.replace(old_main, new_main)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
    
print("Fixed layout again in cycle_settings.html")
