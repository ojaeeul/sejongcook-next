with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/sheet.html', 'r', encoding='utf-8') as f:
    content = f.read()

new_toggle_brush = """                setCellSymbol(td, nextStatus);
                saveAttendance(memberId, dateStr, nextStatus, targetCourse);"""
content = content.replace("                saveAttendance(memberId, dateStr, nextStatus, targetCourse);", new_toggle_brush)

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/sheet.html', 'w', encoding='utf-8') as f:
    f.write(content)
