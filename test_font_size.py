def check_page_font(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    import re
    match = re.search(r'\.page\s*\{[^}]*\}', html)
    if match:
        print(match.group(0))

check_page_font('Sejong/SejongAttendance/public/expense.html')
