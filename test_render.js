const fs = require('fs');
const content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');
const lines = content.split('\n');
let start = lines.findIndex(l => l.includes('if (status === \'early\') status = \'조퇴\';'));
console.log(lines.slice(start - 5, start + 15).join('\n'));
