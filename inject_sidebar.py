import os
import glob

base_path = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public'
html_files = glob.glob(os.path.join(base_path, '*.html'))

inject_str = """
                    <a href="attendance_manager.html" id="navAttendanceManager" class="nav-item">
                        <span class="material-icons" style="font-size: 1.2rem; margin-right: 8px;">person_remove</span>
                        학생별 출석 관리
                    </a>"""

target_str = '<a href="index.html?filter=archive" id="navArchive" class="nav-item">수료생 보관함</a>'

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if target_str in content and 'id="navAttendanceManager"' not in content:
        content = content.replace(target_str, target_str + inject_str)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Injected into {os.path.basename(file_path)}")

