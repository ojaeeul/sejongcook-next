import os

filepath = "public/sejong/sheet.html"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. handleResetCurrentView
content = content.replace(
    "body: JSON.stringify({ memberId, dates, status: 'unchecked', course: null })",
    "body: JSON.stringify({ memberId, dates, status: 'unchecked', course: 'ALL' })"
)

# 2. toggleCell
old_toggle = """                if (activeStatusBrush === 'unchecked') {
                    await saveAttendance(memberId, dateStr, 'unchecked', null); // Clear arrow
                    await saveAttendance(memberId, dateStr, 'unchecked', course); // Clear course log
                    return;
                }"""
new_toggle = """                if (activeStatusBrush === 'unchecked') {
                    await saveAttendance(memberId, dateStr, 'unchecked', 'ALL');
                    return;
                }"""
content = content.replace(old_toggle, new_toggle)

# 3. saveAttendance
old_save = """        async function saveAttendance(memberId, dateStr, status, course) {
            // Find existing log to reuse its exact course string (prevents duplicates)
            const existingLog = findCourseLog(attendanceData, memberId, dateStr, course);
            const finalCourse = existingLog ? existingLog.course : course;

            // Remove existing record locally
            if (existingLog) {
                attendanceData = attendanceData.filter(l => l !== existingLog);
            }

            if (status && status !== 'unchecked') {
                attendanceData.push({ memberId, date: dateStr, status: status, course: finalCourse });
            }
            window.attendanceData = attendanceData;

            // Re-render immediately
            renderSheet();


            try {
                await fetch(`${SHEET_API_BASE}/attendance`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ memberId, date: dateStr, status: status || 'unchecked', course: finalCourse }),
                    
                });"""

new_save = """        async function saveAttendance(memberId, dateStr, status, course) {
            let reqCourse = course;
            if (status === 'unchecked' && course === 'ALL') {
                attendanceData = attendanceData.filter(l => !(l.memberId === memberId && l.date === dateStr));
            } else {
                const existingLog = findCourseLog(attendanceData, memberId, dateStr, course);
                const finalCourse = existingLog ? existingLog.course : course;
                reqCourse = finalCourse;
                
                if (existingLog) {
                    attendanceData = attendanceData.filter(l => l !== existingLog);
                }
                if (status && status !== 'unchecked') {
                    attendanceData.push({ memberId, date: dateStr, status: status, course: finalCourse });
                }
            }
            window.attendanceData = attendanceData;

            // Re-render immediately
            renderSheet();

            try {
                await fetch(`${SHEET_API_BASE}/attendance`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ memberId, date: dateStr, status: status || 'unchecked', course: reqCourse }),
                });"""

content = content.replace(old_save, new_save)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("Patched sheet.html")

