import re

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_code = """<div style="color: ${feeColor};">${labelHtml}${s.fee / 10000}만</div>"""
new_code = """<div style="color: ${feeColor};">${labelHtml}<span style="font-size: 0.4rem; opacity: 0.9;">${s.fee / 10000}만</span></div>"""

if old_code in content:
    content = content.replace(old_code, new_code)
    print("Fixed amount font size")
else:
    print("Could not find old_code")

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'w', encoding='utf-8') as f:
    f.write(content)

