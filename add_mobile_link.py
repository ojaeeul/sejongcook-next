import os
import re

directories = [
    '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public',
    '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/public',
    '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/public/sejong',
    '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook_final_deploy/sejong'
]

pattern = re.compile(r'(\s*<a href="kiosk_admin\.html"[^>]*>키오스크 설정</a>)')

for directory in directories:
    if not os.path.exists(directory):
        continue
    for filename in os.listdir(directory):
        if filename.endswith('.html'):
            filepath = os.path.join(directory, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check if already added
            if 'href="app.html"' not in content and 'navMobileApp' not in content:
                # Replace pattern
                def repl(match):
                    original = match.group(1)
                    # Use the same indentation
                    indent = original[:len(original) - len(original.lstrip())]
                    return original + f'\n{indent}<a href="app.html" id="navMobileApp" class="nav-item" target="_blank">📱 모바일 앱</a>'
                
                new_content, count = pattern.subn(repl, content)
                if count > 0:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {filepath}")
