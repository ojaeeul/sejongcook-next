import os
import glob

html_files = glob.glob('*.html')

search_str = '''                <div class="nav-category toggle-category active" onclick="toggleNavSub(this)">기타</div>
                <div class="nav-sub-menu show">'''

inject_str = '''                <div class="nav-category toggle-category active" onclick="toggleNavSub(this)">기타</div>
                <div class="nav-sub-menu show">
                    <a href="exam_settings.html" id="navExamSettings" class="nav-item">
                        <span class="material-icons" style="font-size: 1.2rem; margin-right: 8px;">fact_check</span>
                        시험지 설정
                    </a>'''

old_inject_str = '''                <div class="nav-category toggle-category active" onclick="toggleNavSub(this)">기타</div>
                <div class="nav-sub-menu show">
                    <a href="ai_analyzer.html?openSettings=true" id="navExamSettings" class="nav-item">
                        <span class="material-icons" style="font-size: 1.2rem; margin-right: 8px;">fact_check</span>
                        시험지 설정
                    </a>'''

for filepath in html_files:
    if filepath == 'exam_settings.html': continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if old_inject_str in content:
        content = content.replace(old_inject_str, inject_str)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")
    elif search_str in content and 'id="navExamSettings"' not in content:
        content = content.replace(search_str, inject_str)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Injected into {filepath}")
