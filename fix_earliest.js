const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/shared_calc.js', 'utf8');

const target = `    if (uniqueLogs && uniqueLogs.length > 0) {
        uniqueLogs.forEach(l => {`;

const replacement = `    // [HOTFIX] 글로벌 데이터를 기준으로 earliest 계산 (sheet.html과 완벽하게 동일하게 맞춤)
    if (allAttendanceLogs && allAttendanceLogs.length > 0) {
        allAttendanceLogs.forEach(l => {`;

content = content.replace(target, replacement);

fs.writeFileSync('Sejong/SejongAttendance/public/shared_calc.js', content);
const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/shared_calc.js public/sejong/shared_calc.js');
