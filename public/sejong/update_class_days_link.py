import os
import glob
import re

directory = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/public/sejong/"
html_files = glob.glob(os.path.join(directory, "*.html"))

for file_path in html_files:
    if file_path.endswith("class_days_admin.html"):
        continue

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # We want to replace any variant of <a ... onclick="openSettingsModal()" ...> 수업 요일 설정 </a>
    # Let's use a regex that matches the whole <a> tag containing openSettingsModal()
    pattern = r'<a[^>]*onclick="openSettingsModal\(\)"[^>]*>.*?수업 요일 설정.*?</a>'
    replacement = '<a href="class_days_admin.html" id="navClassDaysAdmin" class="nav-item">\n                        <span class="material-icons" style="font-size: 1.2rem; margin-right: 8px;">settings</span>\n                        수업 요일 설정\n                    </a>'
    
    new_content, count = re.subn(pattern, replacement, content, flags=re.DOTALL)
    
    if count > 0:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated {os.path.basename(file_path)}")

print("Done")
