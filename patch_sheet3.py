with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/sheet.html', 'r', encoding='utf-8') as f:
    content = f.read()

new_eraser = """                    setCellSymbol(td, 'unchecked');
                    await saveAttendance(memberId, dateStr, 'unchecked', 'ALL');"""
content = content.replace("                    await saveAttendance(memberId, dateStr, 'unchecked', 'ALL');", new_eraser)

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/sheet.html', 'w', encoding='utf-8') as f:
    f.write(content)
