import os

path = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/cycle_settings.html"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Just print the renderUI function to see how I can modify it
import re
match = re.search(r'function renderUI\(\) \{.*?\n    \}', content, re.DOTALL)
if match:
    print("Found renderUI")
