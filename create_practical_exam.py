import os
import shutil
import glob
import re

base_dir = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next"
public_dir = os.path.join(base_dir, "Sejong", "SejongAttendance", "public")

# 1. Create API route
exams_api_dir = os.path.join(base_dir, "app", "api", "sejong", "exams")
practical_api_dir = os.path.join(base_dir, "app", "api", "sejong", "practical_exams")
if not os.path.exists(practical_api_dir):
    os.makedirs(practical_api_dir)

exams_route = os.path.join(exams_api_dir, "route.ts")
practical_route = os.path.join(practical_api_dir, "route.ts")

with open(exams_route, "r", encoding="utf-8") as f:
    route_content = f.read()

route_content = route_content.replace("exam_data.json", "practical_exam_data.json")

with open(practical_route, "w", encoding="utf-8") as f:
    f.write(route_content)

print("Created practical_exams API route.")

# 2. Copy and modify practical_exam.js
exam_js_path = os.path.join(public_dir, "exam.js")
practical_js_path = os.path.join(public_dir, "practical_exam.js")

with open(exam_js_path, "r", encoding="utf-8") as f:
    js_content = f.read()

js_content = js_content.replace("getFetchUrl('exams'", "getFetchUrl('practical_exams'")
js_content = js_content.replace("getFetchUrl('exams', true)", "getFetchUrl('practical_exams', true)")
js_content = js_content.replace("'/api/sejong/exams'", "'/api/sejong/practical_exams'")
js_content = js_content.replace("'examCurrentPage'", "'practicalExamCurrentPage'")

with open(practical_js_path, "w", encoding="utf-8") as f:
    f.write(js_content)

print("Created practical_exam.js.")

# 3. Modify all HTML files to include nav item, and create practical_exam.html
html_files = glob.glob(os.path.join(public_dir, "*.html"))

nav_pattern = re.compile(r'([ \t]*<a href="exam\.html" id="navExam" class="[^"]*">필기시험</a>)')

for file_path in html_files:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # We add the new nav item after navExam
    def repl_nav(m):
        original = m.group(1)
        # extract indentation
        indent_match = re.match(r'([ \t]*)', original)
        indent = indent_match.group(1) if indent_match else ""
        new_item = f'\n{indent}<a href="practical_exam.html" id="navPracticalExam" class="nav-item">실기시험</a>'
        return original + new_item

    new_content = nav_pattern.sub(repl_nav, content)
    
    # Special modifications if this is exam.html to create practical_exam.html
    if os.path.basename(file_path) == "exam.html":
        # Create practical_exam.html
        pe_content = new_content.replace("<title>세종요리제과학원 - 필기시험 관리</title>", "<title>세종요리제과학원 - 실기시험 관리</title>")
        pe_content = pe_content.replace('<h1 class="page-title-text">필기시험</h1>', '<h1 class="page-title-text">실기시험</h1>')
        # We need to replace the script src carefully. Using regex
        pe_content = re.sub(r'src="exam\.js(.*?)"', r'src="practical_exam.js\1"', pe_content)
        
        # fix active state
        pe_content = pe_content.replace('<a href="exam.html" id="navExam" class="nav-item active">필기시험</a>', '<a href="exam.html" id="navExam" class="nav-item">필기시험</a>')
        pe_content = pe_content.replace('<a href="practical_exam.html" id="navPracticalExam" class="nav-item">실기시험</a>', '<a href="practical_exam.html" id="navPracticalExam" class="nav-item active">실기시험</a>')
        
        with open(practical_js_path.replace(".js", ".html"), "w", encoding="utf-8") as f:
            f.write(pe_content)
        print("Created practical_exam.html.")

    # Write the modified content back to the original file
    if content != new_content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated nav in {os.path.basename(file_path)}")

print("All tasks completed.")
