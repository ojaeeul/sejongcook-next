import re

def update_css(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # align-items: baseline -> align-items: center
    html = html.replace('align-items: baseline;', 'align-items: center;')

    # Add overflow hidden to text columns
    html = html.replace('.desc-col {\n            flex: 1;', '.desc-col {\n            flex: 1;\n            overflow: hidden;\n            text-overflow: ellipsis;')
    
    html = html.replace('.amount-col {\n            text-align: right;', '.amount-col {\n            text-align: right;\n            overflow: hidden;\n            text-overflow: ellipsis;')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

update_css('Sejong/SejongAttendance/public/expense.html')
print("Fixed CSS layout")
