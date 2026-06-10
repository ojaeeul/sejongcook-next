const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');

// 1. Uncomment the skip loop for current month
let target1 = `                    // [수정] 뱃지의 일관성을 위해 현재 월도 shared_calc 로직을 동일하게 탑니다.
                    // if (month === displayMonth) continue;`;
let replace1 = `                    // 무조건 현재 표시중인 월의 뱃지는 화면상의 "결재일 건수"와 일치시킵니다.
                    if (month === displayMonth) continue;`;
content = content.replace(target1, replace1);

// 2. Uncomment the assignment
let target2 = `            // [수정] 현재 보고 있는 월도 shared_calc 값을 그대로 사용하여 다른 달을 볼 때와 갯수가 변하지 않도록 고정
            // if (displayMonth >= 1 && displayMonth <= 12) {
            //     monthCounts[displayMonth] = displayCountValue || 0;
            // }`;
let replace2 = `            // 무조건 현재 표시중인 월의 뱃지는 화면상의 "결재일 건수"와 일치시킵니다.
            if (displayMonth >= 1 && displayMonth <= 12) {
                monthCounts[displayMonth] = displayCountValue || 0;
            }`;
content = content.replace(target2, replace2);

fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', content);
const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/sheet.html public/sejong/sheet.html');
