import re

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_label = "labelHtml = `가상출석<br>`;"
new_label = "labelHtml = `출석<br>`;"

if old_label in content:
    content = content.replace(old_label, new_label)
    print("Fixed labelHtml to just 출석")
else:
    print("Could not find old_label")

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'w', encoding='utf-8') as f:
    f.write(content)

