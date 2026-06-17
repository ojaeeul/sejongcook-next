import re
import os
import glob

target_dir = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public"
html_files = glob.glob(os.path.join(target_dir, "*.html"))

pattern = re.compile(r'([ \t]*<a href="exam\.html" id="navExam" class="[^"]*">필기시험</a>)(\s*</div>\s*)(<div class="nav-category toggle-category active" onclick="toggleNavSub\(this\)">수강료</div>)')

count = 0
for file_path in html_files:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    def repl(m):
        a_tag = m.group(1)
        div_end = m.group(2)
        next_cat = m.group(3)
        
        indent = "                "
        new_block = f"""{div_end}{indent}<div class="nav-category toggle-category active" onclick="toggleNavSub(this)">국가시험</div>
{indent}<div class="nav-sub-menu show">
{a_tag}
{indent}</div>
{indent}"""
        return new_block + next_cat

    new_content = pattern.sub(repl, content)
    
    if content != new_content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        count += 1
        print(f"Updated {file_path}")

print(f"Total updated: {count}")
