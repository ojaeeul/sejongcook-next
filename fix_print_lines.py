import re

def fix_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # Find the print CSS block
    # We want to replace the conflicting .page::before rules
    
    old_css_1 = """            /* Hide the red vertical line if it's annoying, or adjust it */
            .page::before {
                left: 45px !important; /* adjusted for padding 20px instead of 40px */
            }"""
            
    old_css_2 = """            /* Adjust the red line and black middle line */
            .page::before, .right-page-columns::before {
                display: none !important; /* Hide vertical lines for clean printing */
            }"""

    html = html.replace(old_css_1, "")
    
    new_css_2 = """            /* Adjust the red line and any vertical lines */
            .page::before, .page::after, .right-page-columns::before, .right-page-columns::after {
                display: none !important; /* Hide vertical lines for clean printing */
                border: none !important;
                background: none !important;
                width: 0 !important;
            }
            .date-col, .desc-col, .amount-col, .method-col {
                border-right: none !important;
                border-left: none !important;
            }
            .right-col-half {
                border-right: none !important;
            }"""
            
    html = html.replace(old_css_2, new_css_2)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

fix_html('Sejong/SejongAttendance/public/expense.html')
print("Fixed print vertical lines")
