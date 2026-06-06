const fs = require('fs');

const sheet = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf-8');
const tuition = fs.readFileSync('Sejong/SejongAttendance/public/tuition_v3.js', 'utf-8');

const sheetKeyMatch = sheet.match(/const syncKeyNow = `\$\{m\.id\}_([^`]+)`/);
console.log('Sheet Sync Key:', sheetKeyMatch ? sheetKeyMatch[1] : 'Not Found');

const tuitionKeyMatch = tuition.match(/const syncKey = `\$\{memberId\}_([^`]+)`/);
console.log('Tuition Sync Key:', tuitionKeyMatch ? tuitionKeyMatch[1] : 'Not Found');

