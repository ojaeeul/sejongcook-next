const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/shared_calc.js', 'utf8');

const target = `    if (uniqueLogs.length > 0) {
        const d = new Date(uniqueLogs[0].date);
        const firstLogYear = d.getFullYear();
        const firstLogMonth = d.getMonth() + 1;
        if (firstLogYear < earliestYear || (firstLogYear === earliestYear && firstLogMonth < earliestMonth)) {
            earliestYear = firstLogYear;
            earliestMonth = firstLogMonth;
        }
    }`;

const replacement = `    // [HOTFIX] 글로벌 데이터를 기준으로 earliest 계산 (sheet.html과 완벽하게 동일하게 맞춤)
    if (allAttendanceLogs && allAttendanceLogs.length > 0) {
        allAttendanceLogs.forEach(l => {
            const d = new Date(l.date);
            const yy = d.getFullYear();
            const mm = d.getMonth() + 1;
            if (yy < earliestYear || (yy === earliestYear && mm < earliestMonth)) {
                earliestYear = yy;
                earliestMonth = mm;
            }
        });
    }`;

content = content.replace(target, replacement);

fs.writeFileSync('Sejong/SejongAttendance/public/shared_calc.js', content);
const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/shared_calc.js public/sejong/shared_calc.js');
