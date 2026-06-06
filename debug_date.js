const fs = require('fs');

// We simulate what sheet.html and tuition_v3.js do for member 1770556890568
const attData = JSON.parse(fs.readFileSync('Sejong/data/attendance.json', 'utf8'));
const logs = attData.filter(r => r.memberId == '1770556890568');
logs.sort((a,b) => new Date(a.date) - new Date(b.date));

let rollingTotal = 0;
let lastRecordDate = null;
logs.forEach(l => {
    const isExtension = l.status === 'extension' || l.status.startsWith('연');
    const isRegular = l.status === 'present' || l.status === 'absent' || l.status === 'tardy' || l.status === 'early' || ['10', '12', '2', '5', '7', '3', '9'].includes(l.status) || ['[',']','첫','종료'].some(k=>l.status.includes(k));
    if (isExtension || isRegular) {
        if (isRegular) rollingTotal += 1;
        lastRecordDate = l.date;
        console.log(`Date: ${l.date}, Status: ${l.status}, Rolling: ${rollingTotal}, LastRecordDate: ${lastRecordDate}`);
    }
});
