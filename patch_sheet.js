const fs = require('fs');

let content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');

const helperFunc = `        function findCourseLog(logs, mId, dStr, scopeCourse) {
            return logs.find(l => {
                if (String(l.memberId) !== String(mId) || l.date !== dStr) return false;
                if (!l.course && !scopeCourse) return true;
                if (!l.course || !scopeCourse) return false;
                if (l.course === scopeCourse) return true;
                
                const lClean = l.course.replace(/\\([^)]*\\)/g, '').trim();
                const scopeClean = scopeCourse.replace(/\\([^)]*\\)/g, '').trim();
                const lList = lClean.split(',').map(c => c.trim());
                const scopeList = scopeClean.split(',').map(c => c.trim());
                return lList.some(lc => scopeList.includes(lc));
            });
        }
`;

if (!content.includes('function findCourseLog')) {
    content = content.replace('async function saveAttendance', helperFunc + '\n        async function saveAttendance');
}

// Replace saveAttendance findIndex logic
content = content.replace(
    /const idx = attendanceData\.findIndex\(l => l\.memberId === memberId && l\.date === dateStr && \(l\.course === course \|\| \(\!l\.course && \!course\)\)\);/g,
    `const existingLog = findCourseLog(attendanceData, memberId, dateStr, course);
            const finalCourse = existingLog ? existingLog.course : course;
            const idx = attendanceData.findIndex(l => l === existingLog);`
);

// Update saveAttendance fetch body to use finalCourse
content = content.replace(
    /body: JSON\.stringify\(\{ memberId, date: dateStr, status: status \|\| 'unchecked', course: course \}\)/g,
    `body: JSON.stringify({ memberId, date: dateStr, status: status || 'unchecked', course: finalCourse })`
);

// Update saveAttendance push logic to use finalCourse
content = content.replace(
    /if \(status !== 'unchecked'\) attendanceData\.push\(\{ memberId, date: dateStr, status, course \}\);/g,
    `if (status !== 'unchecked') attendanceData.push({ memberId, date: dateStr, status, course: finalCourse });`
);

// Update toggleCell find logic
content = content.replace(
    /const log = attendanceData\.find\(l => l\.memberId === memberId && l\.date === dateStr && \(l\.course === targetCourse \|\| \(\!l\.course && \!targetCourse\)\)\);/g,
    `const log = findCourseLog(attendanceData, memberId, dateStr, targetCourse);`
);
content = content.replace(
    /const log = attendanceData\.find\(l => l\.memberId === memberId && l\.date === dateStr && \(l\.course === course \|\| \(\!l\.course && \!course\)\)\);/g,
    `const log = findCourseLog(attendanceData, memberId, dateStr, course);`
);

fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', content);
