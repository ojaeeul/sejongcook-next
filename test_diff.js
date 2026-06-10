const fs = require('fs');
let sheetContent = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');
let sharedContent = fs.readFileSync('Sejong/SejongAttendance/public/shared_calc.js', 'utf8');

// Extract sheet.html drawing logic
const sheetLogicStart = sheetContent.indexOf('const isMakeupMarker = [\\'[\\', \\']\\'].includes(l.status);');
const sheetLogicEnd = sheetContent.indexOf('if (adjustment && adjustment.forceRedBoxDates', sheetLogicStart);
let sheetLogic = sheetContent.substring(sheetLogicStart, sheetLogicEnd);

// Extract shared_calc.js logic
const sharedLogicStart = sharedContent.indexOf('const isMakeupMarker = [\\'[\\', \\']\\'].includes(l.status);');
const sharedLogicEnd = sharedContent.indexOf('const isForced = adjustment', sharedLogicStart);
let sharedLogic = sharedContent.substring(sharedLogicStart, sharedLogicEnd);

console.log("=== SHEET LOGIC ===");
console.log(sheetLogic);
console.log("\\n=== SHARED LOGIC ===");
console.log(sharedLogic);

