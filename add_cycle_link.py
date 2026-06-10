import os

directory = 'Sejong/SejongAttendance/public'
files = [f for f in os.listdir(directory) if f.endswith('.html')]

insert_str = """
                    <a href="cycle_settings.html" id="navCycleSettings" class="nav-item">
                        <span class="material-icons" style="font-size: 1.2rem; margin-right: 8px;">tune</span>
                        결재 주기 설정
                    </a>"""

for file in files:
    path = os.path.join(directory, file)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'navCycleSettings' in content:
        continue

    # Look for the insertion point
    target = '<a href="course_time_admin.html" id="navCourseTimeAdmin" class="nav-item">'
    if target in content:
        # Find the end of this anchor tag
        start_idx = content.find(target)
        end_idx = content.find('</a>', start_idx) + 4
        
        new_content = content[:end_idx] + insert_str + content[end_idx:]
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file}")

