const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');

const oldCalcFilter = `            let rowLogsRaw = allAttendanceLogs.filter(l => String(l.memberId) === String(member.id));
            if (courseFilter) {
                rowLogsRaw = rowLogsRaw.filter(l => {
                    if (!l.course) return true;
                    if (isDualCourse) {
                        const lCourse = String(l.course || '').replace(/\\s/g, '');
                        if (lCourse.includes('제과') || lCourse.includes('제빵')) return true;
                        if (lCourse.includes('양식기능사')) return true;
                    }
                    const cClean = String(l.course).replace(/\\([^)]*\\)/g, '').trim();
                    const fClean = String(courseFilter).replace(/\\([^)]*\\)/g, '').trim();
                    const cList = cClean.split(',').map(c => c.trim());
                    return cList.includes(fClean);
                });
            }`;

const newCalcFilter = `            let rowLogsRaw = allAttendanceLogs.filter(l => String(l.memberId) === String(member.id));
            if (courseFilter) {
                rowLogsRaw = rowLogsRaw.filter(l => {
                    if (!l.course) return true; // Global logs are always included
                    
                    const lCourseClean = String(l.course).replace(/\\([^)]*\\)/g, '').trim();
                    const rCourseClean = String(courseFilter).replace(/\\([^)]*\\)/g, '').trim();
                    return lCourseClean === rCourseClean;
                });
            }`;

if (content.includes('cList.includes(fClean);')) {
    content = content.replace(oldCalcFilter, newCalcFilter);
    content = content.replace(/v=\d+/g, 'v=' + Date.now());
    fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', content);
    console.log("Successfully aligned filtering logic!");
} else {
    console.log("Could not find the target code to replace.");
}
