const fs = require('fs');

const sheet = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf-8');
const tuition = fs.readFileSync('Sejong/SejongAttendance/public/tuition_v3.js', 'utf-8');

const sheetFunc = sheet.substring(sheet.indexOf('const getSheetSimulatedScheduledDate'), sheet.indexOf('return {', sheet.indexOf('const getSheetSimulatedScheduledDate')) + 100);
const tuitionFunc = tuition.substring(tuition.indexOf('const getMemberEighthDayInMonth'), tuition.indexOf('return {', tuition.indexOf('const getMemberEighthDayInMonth')) + 100);

fs.writeFileSync('sheet_func.txt', sheetFunc);
fs.writeFileSync('tuition_func.txt', tuitionFunc);
