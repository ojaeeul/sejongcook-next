import os
import glob

target_dir = "."
html_files = glob.glob(os.path.join(target_dir, "*.html"))

search_text = '<a href="student/login.html" id="navStudentLogin" class="nav-item" target="_blank" style="color: #3b82f6; font-weight: bold; background: rgba(59, 130, 246, 0.1);">🎓 학생용 모바일 시험 열기</a>'
replace_text = '<a href="student/exam.html" id="navStudentLogin" class="nav-item" target="_blank" style="color: #3b82f6; font-weight: bold; background: rgba(59, 130, 246, 0.1);">🎓 학생용 모바일 시험 열기</a>'

for file in html_files:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    if search_text in content:
        content = content.replace(search_text, replace_text)
        with open(file, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {file}")
