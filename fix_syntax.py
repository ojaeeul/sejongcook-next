with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/shared_calc.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("let isSimulated = false;\\n    let simulatedAttendances = [];", "let isSimulated = false;\n    let simulatedAttendances = [];")

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/shared_calc.js', 'w', encoding='utf-8') as f:
    f.write(content)
