// Read data
const fs = require('fs');
const attendance = JSON.parse(fs.readFileSync('Sejong/data/attendance.json', 'utf8'));

// Find any member with '연'
const membersWithExt = new Set();
attendance.forEach(r => {
    if (String(r.status).includes('연') || r.status === 'extension') {
        membersWithExt.add(r.memberId);
    }
});

console.log("Members with extension:", Array.from(membersWithExt));

// Let's manually run the tuition_v3.js logic for member 1770556890568 for Year 2026, Month 3
const year = 2026;
const month = 3;
const memberRecords = attendance.filter(r => r.memberId == '1770556890568');

let rollingTotal = 0;
let rollingTotalUpToToday = 0;
const selectedDateEnd = new Date(year, month, 0); 
memberRecords.forEach(r => {
    const isMarker = ['[', ']'].includes(r.status) || (typeof r.status === 'string' && (r.status.includes('첫') || r.status.includes('종료')));
    const strStatus = String(r.status);
    const isNumericPresent = ['10', '12', '2', '5', '7', '3', '9'].includes(strStatus);
    const isAbsent = r.status === 'absent' || strStatus.startsWith('X') || strStatus.includes('결석');
    const isEarly = r.status === 'early' || strStatus.includes('조퇴');
    const isTardy = r.status === 'tardy' || strStatus.includes('지각') || strStatus.includes('△');
    const isFirstLast = strStatus.includes('첫') || strStatus.includes('종료') || strStatus === '[' || strStatus === ']';
    const isExtension = r.status === 'extension' || strStatus.startsWith('연') || strStatus.includes('연장') || strStatus.startsWith('E');
    const isRegular = r.status === 'present' || isNumericPresent || isAbsent || isEarly || isTardy || isFirstLast;

    if (isMarker || isRegular) {
        rollingTotal += 1;
        
        const rDate = new Date(r.date);
        if (rDate <= selectedDateEnd) {
            rollingTotalUpToToday = rollingTotal;
        }
    }
});

console.log(`Final rollingTotal: ${rollingTotal}, rollingTotalUpToToday: ${rollingTotalUpToToday}`);
