import re

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/sheet.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace renderSheet(); in saveAttendance
new_save = """            window.attendanceData = attendanceData;

            // Re-render immediately -> Debounced to prevent click dropping
            if (window.renderSheetDebounce) clearTimeout(window.renderSheetDebounce);
            window.renderSheetDebounce = setTimeout(() => {
                renderSheet();
            }, 30);

            // Queue the request"""

content = content.replace("            window.attendanceData = attendanceData;\n\n            // Re-render immediately\n            renderSheet();\n\n            // Queue the request", new_save)

# Let's also update toggleCell to do optimistic update for instant feedback
new_toggle = """            setCellSymbol(td, nextStatus);
            saveAttendance(memberId, dateStr, nextStatus, course);"""

# Replace in toggleCell (mode 2)
content = content.replace("            saveAttendance(memberId, dateStr, nextStatus, course);", new_toggle)

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/sheet.html', 'w', encoding='utf-8') as f:
    f.write(content)
