const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');

const oldFilter = `            sortedLogs.forEach(l => {
                if (String(l.memberId) !== String(member.id)) return;
                if (!l.course) return; 
                if (courseFilter && courseFilter !== 'all') {
                    const lCourseClean = l.course.replace(/\\([^)]*\\)/g, '').trim();
                    const rCourseClean = courseFilter.replace(/\\([^)]*\\)/g, '').trim();
                    if (lCourseClean !== rCourseClean) return;
                }
                uniqueLogsMap.set(l.date, l);
            });`;

const newFilter = `            sortedLogs.forEach(l => {
                if (String(l.memberId) !== String(member.id)) return;
                
                let isMatched = false;
                if (!l.course) {
                    isMatched = true; // Global logs are always included
                } else if (!courseFilter || courseFilter === 'all') {
                    isMatched = true;
                } else {
                    const lCourseClean = l.course.replace(/\\([^)]*\\)/g, '').trim();
                    const rCourseClean = courseFilter.replace(/\\([^)]*\\)/g, '').trim();
                    if (lCourseClean === rCourseClean) isMatched = true;
                }
                
                if (isMatched) {
                    uniqueLogsMap.set(l.date, l);
                }
            });`;

if (content.includes('if (!l.course) return;')) {
    content = content.replace(oldFilter, newFilter);
    content = content.replace(/v=\d+/g, 'v=' + Date.now());
    fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', content);
    console.log("Fixed filter logic!");
} else {
    console.log("Could not find the target code to replace.");
}
