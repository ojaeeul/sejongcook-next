const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/tuition_v3.js', 'utf8');

content = content.replace('totalAttendanceCount += incAmountVal; // 연장도 출석일수에 포함됨 (UI 표시용)', 'if (isMarker || isRegular) { totalAttendanceCount += incAmountVal; } // 연장은 0으로 처리 (유저 요청 반영)');

fs.writeFileSync('Sejong/SejongAttendance/public/tuition_v3.js', content, 'utf8');
console.log("Fixed totalAttendanceCount");
