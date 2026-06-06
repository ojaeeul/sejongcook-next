const fs = require('fs');

const attData = JSON.parse(fs.readFileSync('Sejong/data/attendance.json', 'utf8'));

// Just print the exact counts for a member who has extensions
const mId = '1770556890568';
const logs = attData.filter(r => r.memberId == mId);
logs.sort((a,b) => new Date(a.date) - new Date(b.date));

let rollingTotal = 0;
let countEnrolled = 0;
let lastRecordDate = null;
let lastStatus = null;

for(const r of logs) {
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
        lastRecordDate = r.date;
        lastStatus = r.status;
    } else if (isExtension) {
        lastRecordDate = r.date; // Notice rollingTotal does not increase!
        lastStatus = r.status;
    }
}
console.log(`End rolling: ${rollingTotal}, Last Date: ${lastRecordDate}, Last Status: ${lastStatus}`);
