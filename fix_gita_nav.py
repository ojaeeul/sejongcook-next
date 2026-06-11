import os

directory = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public"
target_files = ['stats.html', 'class_days_admin.html', 'course_time_admin.html', 'cycle_settings.html']

for filename in target_files:
    filepath = os.path.join(directory, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        old_str = '<div class="nav-category toggle-category" onclick="toggleNavSub(this)">기타</div>\n                <div class="nav-sub-menu">'
        new_str = '<div class="nav-category toggle-category active" onclick="toggleNavSub(this)">기타</div>\n                <div class="nav-sub-menu show">'
        
        if old_str in content:
            content = content.replace(old_str, new_str)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed '기타' category to be open by default in {filename}")
        else:
            print(f"Could not find exact string in {filename} or already open")
