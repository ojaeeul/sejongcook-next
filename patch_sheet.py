import os

filepath = 'public/sejong/sheet.html'
old_str = "const SHEET_API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:8000/api' : '../api.php?board=sejong_';"
new_str = "const SHEET_API_BASE = '/api/sejong';"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

if old_str in content:
    new_content = content.replace(old_str, new_str)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Patched sheet.html")
