const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/tuition_v4.js', 'utf8');

// Replace countUnpaidMilestonesForMonth with getUnpaidMilestoneDaysForMonth
let newFunc = `function getUnpaidMilestoneDaysForMonth(year, month) {
    let daysSet = new Set();
    membersData.forEach(m => {
        const courses = (m.course || "").split(",").map(c => c.trim()).filter(c => c && !c.includes("[삭제]"));
        courses.forEach(fullCourse => {
            const courseNameOnly = fullCourse.replace(/\\([^)]*\\)/g, "").trim();
            if (typeof window.calculateRedBoxesForMonth === "function") {
                const result = window.calculateRedBoxesForMonth(m, year, month, attendanceData, courseNameOnly, GLOBAL_DATA_ADJUSTMENTS);
                if (result && result.redDays && result.redDays.length > 0 && !result.isSimulated && result.hasAnyAttendance) {
                    result.redDays.forEach(d => daysSet.add(d));
                }
            }
        });
    });
    let daysArray = Array.from(daysSet).sort((a,b) => a-b);
    return daysArray;
}`;

content = content.replace(/function countUnpaidMilestonesForMonth[\s\S]*?return count;\n\}/, newFunc);

// Replace usage in updateMonthlyUnpaidPanel
let usageOld = `const cnt = countUnpaidMilestonesForMonth(year, m);
        if (cnt > 0) {
            badge.textContent = cnt;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }`;

let usageNew = `const days = getUnpaidMilestoneDaysForMonth(year, m);
        if (days && days.length > 0) {
            badge.textContent = days.join(', ');
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }`;

content = content.replace(usageOld, usageNew);

fs.writeFileSync('Sejong/SejongAttendance/public/tuition_v4.js', content);
const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/tuition_v4.js public/sejong/tuition_v4.js');
