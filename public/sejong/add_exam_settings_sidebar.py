import os
import glob

target_dir = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public"
html_files = glob.glob(os.path.join(target_dir, "*.html"))

search_text = """                    <a href="class_days_admin.html" id="navClassDaysAdmin" class="nav-item">"""

replace_text = """                    <a href="ai_analyzer.html?openSettings=true" id="navExamSettings" class="nav-item">
                        <span class="material-icons" style="font-size: 1.2rem; margin-right: 8px;">fact_check</span>
                        시험지 설정
                    </a>
                    <a href="class_days_admin.html" id="navClassDaysAdmin" class="nav-item">"""

for file in html_files:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    if search_text in content and "navExamSettings" not in content:
        content = content.replace(search_text, replace_text)
        with open(file, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {file}")
