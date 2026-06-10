const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');

const diagStart = content.indexOf('// [DIAGNOSTIC] Find mismatch between UI red boxes and shared_calc red boxes');
if (diagStart !== -1) {
    const diagEnd = content.indexOf('}, 2000);', diagStart);
    if (diagEnd !== -1) {
        content = content.substring(0, diagStart) + content.substring(diagEnd + 9);
    }
}

content = content.replace(/v=202606111050/g, 'v=202606111100');
fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', content);
const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/sheet.html public/sejong/sheet.html');
