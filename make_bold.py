import re

def make_bold(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # Add font-weight: bold; to entry-line
    html = html.replace('.entry-line {\n            line-height: 24px;', '.entry-line {\n            font-weight: bold;\n            line-height: 24px;')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

make_bold('Sejong/SejongAttendance/public/expense.html')
print("Added bold to expense")
