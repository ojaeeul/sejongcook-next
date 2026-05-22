const fs = require('fs');
const content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
    if (l.includes('if (status === \'early\')')) {
        console.log("LINE:", i + 1, l);
        console.log(lines.slice(i - 2, i + 10).join('\n'));
    }
});
