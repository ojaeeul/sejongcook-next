const fs = require('fs');
let sheetHtml = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');
let sharedCalc = fs.readFileSync('Sejong/SejongAttendance/public/shared_calc.js', 'utf8');

console.log("Analyzing...");
