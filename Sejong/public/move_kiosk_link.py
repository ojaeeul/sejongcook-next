import os
import glob
import re

directory = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/public/sejong/"
html_files = glob.glob(os.path.join(directory, "*.html"))

# Regex to remove existing navKioskAdmin links
remove_pattern = re.compile(r'\s*<a href="kiosk_admin\.html"[^>]*>키오스크 설정</a>')

# Regex to find monitor link
monitor_pattern = re.compile(r'(<a href="monitor\.html[^>]*>키오스크 모니터</a>)')

for file_path in html_files:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Remove existing navKioskAdmin
    new_content = remove_pattern.sub('', content)

    # 2. Insert navKioskAdmin right after monitor link
    # If the file is kiosk_admin.html, make it active
    class_str = 'class="nav-item active"' if os.path.basename(file_path) == 'kiosk_admin.html' else 'class="nav-item"'
    insert_str = f'\\1\n                <a href="kiosk_admin.html" id="navKioskAdmin" {class_str}>키오스크 설정</a>'
    
    new_content = monitor_pattern.sub(insert_str, new_content)

    if new_content != content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated {os.path.basename(file_path)}")

print("Done")
