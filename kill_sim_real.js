const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');

const simStartStr = 'let isSimulated = false;\n            if (redBoxDates.size === 0';
const ledgerStartStr = 'const ledgerDays = new Set();';

const startIndex = content.indexOf(simStartStr);
const endIndex = content.indexOf(ledgerStartStr);

if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
    content = content.substring(0, startIndex) + 
              'let isSimulated = false;\n            // 가상 결재일 계산(시뮬레이션) 완전 삭제 완료\n            ' + 
              content.substring(endIndex);
    
    content = content.replace(/v=\d+/g, 'v=' + Date.now());
    fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', content);
    console.log("Successfully removed simulation!");
} else {
    console.log("Failed to find boundaries");
}
