import os
import re

directory = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public"

cycle_str = """                    <a href="cycle_settings.html" id="navCycleSettings" class="nav-item">
                        <span class="material-icons" style="font-size: 1.2rem; margin-right: 8px;">tune</span>
                        결재 주기 설정
                    </a>
"""

stats_str = """                    <a href="stats.html" class="nav-item">통계 및 납부</a>
"""

app_str = """
                <a href="app.html" id="navMobileApp" class="nav-item" target="_blank">📱 모바일 앱</a>
"""

def fix_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    
    # 1. Insert cycle_settings if missing
    if 'cycle_settings.html' not in content and 'index.html?filter=archive' in content:
        content = content.replace(
            '<a href="index.html?filter=archive"',
            cycle_str + '                    <a href="index.html?filter=archive"'
        )
        
    # 2. Insert stats.html if missing
    if 'href="stats.html"' not in content and 'href="index.html?filter=trash"' in content:
        # Find the line with trash and append stats_str after it
        content = re.sub(
            r'(<a href="index\.html\?filter=trash".*?</a>)',
            r'\1\n' + stats_str.rstrip('\n'),
            content
        )
        
    # 3. Insert app.html if missing
    if 'href="app.html"' not in content and 'href="kiosk_admin.html"' in content:
        content = re.sub(
            r'(<a href="kiosk_admin\.html".*?</a>)',
            r'\1\n' + app_str.rstrip('\n'),
            content
        )

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed navigation in {os.path.basename(filepath)}")

for filename in os.listdir(directory):
    if filename.endswith(".html"):
        fix_html(os.path.join(directory, filename))
