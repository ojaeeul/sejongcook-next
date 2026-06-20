import glob

html_files = glob.glob('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/*.html')
script_tag = '<script src="ui_arrows.js?v=20260621"></script>'

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if 'id="monthSelect"' in content and script_tag not in content:
        new_content = content.replace('</body>', f'    {script_tag}\n</body>')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Patched {filepath}")

