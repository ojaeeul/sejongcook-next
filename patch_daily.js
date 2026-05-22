const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/attendance_daily.js', 'utf8');

const replacement = `
        let finalCourse = activeCourse;
        const existingLog = attendanceData.find(a => {
            if (String(a.memberId) !== String(memberId)) return false;
            if (!a.course) return true;
            const aCourseClean = a.course.replace(/\\([^)]*\\)/g, '').trim();
            const activeCourseClean = activeCourse.replace(/\\([^)]*\\)/g, '').trim();
            const aCoursesList = aCourseClean.split(',').map(c => c.trim());
            return aCoursesList.includes(activeCourseClean);
        });
        if (existingLog && existingLog.course) finalCourse = existingLog.course;

        await fetch(\`\${API_BASE}/attendance\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                memberId: memberId,
                date: currentDate,
                status: finalStatus,
                course: finalCourse
            })
        });

        const idx = attendanceData.findIndex(a => a === existingLog);
`;

content = content.replace(
    /await fetch\(`\$\{API_BASE\}\/attendance`, \{\s*method: 'POST',\s*headers: \{ 'Content-Type': 'application\/json' \},\s*body: JSON\.stringify\(\{\s*memberId: memberId,\s*date: currentDate,\s*status: finalStatus,\s*course: activeCourse\s*\}\)\s*\}\);\s*const idx = attendanceData\.findIndex\(a => String\(a\.memberId\) === String\(memberId\) && \(a\.course === activeCourse \|\| \(!a\.course && !activeCourse\)\)\);/s,
    replacement
);

// push logic also needs to use finalCourse
content = content.replace(
    /attendanceData\.push\(\{ memberId: memberId, date: currentDate, status: finalStatus, course: activeCourse \}\);/,
    `attendanceData.push({ memberId: memberId, date: currentDate, status: finalStatus, course: finalCourse });`
);

fs.writeFileSync('Sejong/SejongAttendance/public/attendance_daily.js', content);
