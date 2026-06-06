const fs = require('fs');
const sheet = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf-8');
const tuition = fs.readFileSync('Sejong/SejongAttendance/public/tuition_v3.js', 'utf-8');

const sMatch = sheet.match(/if \(r\.yearNum < year \|\| \(r\.yearNum === year && r\.monthNum < month\)\) \{([\s\S]*?)return/);
const tMatch = tuition.match(/for \(const r of memberRecords\) \{([\s\S]*?)\/\/ --- Simulation Logic ---/);

console.log("SHEET:");
console.log(sMatch ? sMatch[1].substring(0, 500) + '...' : 'Not found');
console.log("\nTUITION:");
console.log(tMatch ? tMatch[1].substring(0, 500) + '...' : 'Not found');
