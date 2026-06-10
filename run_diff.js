const fs = require('fs');
let sheetHtml = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');
let sharedCalc = fs.readFileSync('Sejong/SejongAttendance/public/shared_calc.js', 'utf8');

// I will write a script to check if the exact string replacement worked
console.log(sharedCalc.includes('// [HOTFIX] 글로벌 데이터를 기준으로 earliest 계산'));
