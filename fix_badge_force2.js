const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');

const target = "            const panel = document.getElementById('monthlyRedBoxPanel');";
const replacement = `            // 무조건 현재 표시중인 월의 뱃지는 화면상의 "결재일 건수"와 일치시킵니다.
            if (displayMonth >= 1 && displayMonth <= 12) {
                monthCounts[displayMonth] = displayCountValue || 0;
            }

            const panel = document.getElementById('monthlyRedBoxPanel');`;

content = content.replace(target, replacement);

fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', content);

const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/sheet.html public/sejong/sheet.html');

