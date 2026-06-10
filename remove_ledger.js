const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');

const ledgerStartStr = 'const ledgerDays = new Set();';
const ledgerEndStr = 'const actualRedDays = Array.from(redBoxDates).map(d => parseInt(d.split(\'-\')[2], 10));';

const startIndex = content.indexOf(ledgerStartStr);
const endIndex = content.indexOf(ledgerEndStr);

if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
    content = content.substring(0, startIndex) + 
              '// member.ledger 완전 삭제 (실제 그리드와 완벽 일치하도록)\n            ' + 
              content.substring(endIndex);
    
    // Also fix the hasAnyAttendance check to not use member.ledger
    content = content.replace(
        'hasAnyAttendance: uniqueLogs.length > 0 || ledgerDays.size > 0 || (member.ledger && member.ledger.length > 0)',
        'hasAnyAttendance: uniqueLogs.length > 0'
    );

    content = content.replace(/v=\d+/g, 'v=' + Date.now());
    fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', content);
    console.log("Successfully removed ledger logic!");
} else {
    console.log("Failed to find boundaries");
}
