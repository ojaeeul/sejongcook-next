def fix_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # Find the print CSS block we just added
    old_css = """            /* Adjust the red line */
            .page::before {
                display: none !important; /* Hide red line for clean printing */
            }"""

    new_css = """            /* Adjust the red line and black middle line */
            .page::before, .right-page-columns::before {
                display: none !important; /* Hide vertical lines for clean printing */
            }"""
            
    html = html.replace(old_css, new_css)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

fix_html('Sejong/SejongAttendance/public/expense.html')
print("Fixed right-page-columns::before line")
