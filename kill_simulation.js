const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');

const simStart = content.indexOf('let isSimulated = false;');
const simEnd = content.indexOf('return {', simStart);

if (simStart !== -1 && simEnd !== -1) {
    content = content.substring(0, simStart) + 
              '// SIMULATION COMPLETELY REMOVED\n            ' + 
              content.substring(simEnd);
}

content = content.replace(/v=\d+/g, 'v=' + Date.now());
fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', content);
const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/sheet.html public/sejong/sheet.html');
