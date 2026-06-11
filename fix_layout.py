import os

path = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/cycle_settings.html"

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_main = '<main class="main-content">'
new_main = '<main class="main-content" style="background-color: #f1f5f9; padding: 40px; display: flex; justify-content: center; align-items: flex-start; height: 100vh;">'

old_div = '<div style="background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 30px; max-width: 800px; margin: 0 auto;">'
new_div = '<div style="background: white; width: 100%; max-width: 900px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); padding: 40px; border: 1px solid #e2e8f0;">'

content = content.replace(old_main, new_main)
content = content.replace(old_div, new_div)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
    
print("Fixed layout in cycle_settings.html")
