import os
import glob

target_dir = "."
html_files = glob.glob(os.path.join(target_dir, "*.html"))

search_text = '<a href="app.html" id="navMobileApp" class="nav-item" target="_blank" style="color: #4ade80; font-weight: bold; background: rgba(74, 222, 128, 0.1);">📱 모바일 앱 다운로드</a>'
replace_text = search_text + '\n                <a href="student/login.html" id="navStudentLogin" class="nav-item" target="_blank" style="color: #3b82f6; font-weight: bold; background: rgba(59, 130, 246, 0.1);">🎓 학생용 모바일 시험 열기</a>'

for file in html_files:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    if search_text in content and "학생용 모바일 시험 열기" not in content:
        content = content.replace(search_text, replace_text)
        with open(file, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {file}")
