def fix_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    html = html.replace('<script src="expense_settings.js"></script>', '<script src="expense_settings.js?v=20260614-80"></script>')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

fix_html('Sejong/SejongAttendance/public/expense.html')
print("Fixed script version")
