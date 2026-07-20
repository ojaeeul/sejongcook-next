import os
import glob

directory = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public"
search_str = '<a href="https://github.com/ojaeeul/sejongcook-next/archive/refs/heads/main.zip" class="nav-item">깃허브 백업 다운로드</a>'
replace_str = search_str + '\n                <a href="/admin" class="nav-item">관리자페이지</a>'

count = 0
for filepath in glob.glob(os.path.join(directory, "*.html")):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if search_str in content and '<a href="/admin" class="nav-item">관리자페이지</a>' not in content:
        content = content.replace(search_str, replace_str)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        count += 1
        print(f"Updated {filepath}")

print(f"Total files updated: {count}")
