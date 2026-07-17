import os
import glob

# HTML files to update
files = glob.glob('*.html')

search_str = """                    <a href="exam_builder.html" id="navExamBuilder" class="nav-item">
                        <span class="material-icons" style="font-size: 1.2rem; margin-right: 8px;">construction</span>
                        시험지 조립소(재구성)
                    </a>\n"""

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if search_str in content:
        content = content.replace(search_str, "")
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Removed from {file}")
