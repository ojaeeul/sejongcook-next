import os
import glob

target_dir = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public"
html_files = glob.glob(os.path.join(target_dir, "*.html"))

for file in html_files:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    if 'href="stats.html"' in content and 'href="expense.html"' not in content:
        lines = content.split('\n')
        new_lines = []
        for line in lines:
            new_lines.append(line)
            if 'href="stats.html"' in line and '통계 및 납부' in line:
                indent = len(line) - len(line.lstrip())
                new_lines.append(' ' * indent + '<a href="expense.html" class="nav-item">지출내역</a>')
                
        new_content = '\n'.join(new_lines)
        with open(file, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated {file}")
