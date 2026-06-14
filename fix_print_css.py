def fix_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # Find the print CSS block we just added
    old_css = """            .page {
                display: block !important;
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 20px !important;
                border: none !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                page-break-after: always;
                break-after: page;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                background-position: 0 20px !important; /* adjust for padding 20px */
            }"""

    new_css = """            .page {
                display: block !important;
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 20px !important;
                border: none !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                page-break-after: always;
                break-after: page;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                background-image: none !important; /* Hide background gradient to prevent misalignment */
            }
            .entry-line {
                border-bottom: 1px solid #cbd5e1 !important;
            }
            .right-col-half {
                border-right: 1px solid #cbd5e1 !important;
            }
            .right-col-half:last-child {
                border-right: none !important;
            }"""
            
    html = html.replace(old_css, new_css)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

fix_html('Sejong/SejongAttendance/public/expense.html')
print("Fixed print css to use border-bottom")
