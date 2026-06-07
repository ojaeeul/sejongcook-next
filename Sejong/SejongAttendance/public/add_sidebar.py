import os
import glob

target_dir = "."
html_files = glob.glob(os.path.join(target_dir, "*.html"))

search_text = """                    <a href="class_days_admin.html" id="navClassDaysAdmin" class="nav-item">
                        <span class="material-icons" style="font-size: 1.2rem; margin-right: 8px;">settings</span>
                        수업 요일 설정
                    </a>"""

replace_text = search_text + """
                    <a href="course_time_admin.html" id="navCourseTimeAdmin" class="nav-item">
                        <span class="material-icons" style="font-size: 1.2rem; margin-right: 8px;">list_alt</span>
                        과목/시간 설정
                    </a>"""

for file in html_files:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    if search_text in content and "course_time_admin.html" not in content:
        content = content.replace(search_text, replace_text)
        with open(file, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {file}")
