import re

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix window.holidaysData mapping so shared_calc.js can use it
old_holidays = """        holidaysData = await hRes.json();
        const timetableData = await tRes.json();"""

new_holidays = """        holidaysData = await hRes.json();
        window.holidaysData = holidaysData; // Make it available for shared_calc.js
        const timetableData = await tRes.json();"""

if old_holidays in content:
    content = content.replace(old_holidays, new_holidays)
    print("Fixed holidaysData mapping.")

# Fix simulated attendances filter in generateMonthTableHTML
old_filter = """const simAttendanceToday = (schedules.simulatedAttendances || []).filter(sa => sa.day === day && (!sa.course || sa.course.includes(c) || c.includes(sa.course) || activeCourses.length === 0));"""

new_filter = """const simAttendanceToday = (schedules.simulatedAttendances || []).filter(sa => sa.year === tYear && sa.month === tMonth && sa.day === day && (!sa.course || sa.course.includes(c) || c.includes(sa.course) || activeCourses.length === 0));"""

if old_filter in content:
    content = content.replace(old_filter, new_filter)
    print("Fixed simulated filter.")

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'w', encoding='utf-8') as f:
    f.write(content)

