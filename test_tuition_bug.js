const fs = require('fs');

// Read attendance data
const attendanceData = JSON.parse(fs.readFileSync('./public/sejong/data/attendance.json', 'utf8'));

// Filter for user 1770517017920
const userAttendance = attendanceData.filter(a => a.memberId === '1770517017920');

// Sort by date
userAttendance.sort((a, b) => new Date(a.date) - new Date(b.date));

// Simulate tuition_v4.js logic for January 2026
let rollingTotal = 0;
const year = 2026;
const month = 1;

let isDualBakery = true;

const getCycle = (val, isDual) => {
    let vRaw = Math.round(val * 10);
    if (isDual) {
        if (vRaw < 170) return 0;
        return Math.floor((vRaw - 170) / 160) + 1;
    } else {
        if (vRaw < 90) return 0;
        return Math.floor((vRaw - 90) / 80) + 1;
    }
};

userAttendance.forEach(r => {
    const rDate = new Date(r.date);
    const dateStr = rDate.toISOString().split('T')[0];
    const rYear = rDate.getFullYear();
    const rMonth = rDate.getMonth() + 1;
    
    const strStatus = String(r.status);
    const isNumericPresent = ['10', '12', '2', '5', '7', '3', '9'].includes(strStatus);
    const isAbsent = r.status === 'absent' || strStatus.startsWith('X') || strStatus.includes('결석');
    const isEarly = r.status === 'early' || strStatus.includes('조퇴');
    const isTardy = r.status === 'tardy' || r.status === 'late' || strStatus.includes('지각') || strStatus.includes('△');
    const isFirstLast = strStatus.includes('첫') || strStatus.includes('종료') || strStatus === '[' || strStatus === ']';
    const isMarker = ['[', ']'].includes(r.status) || (typeof r.status === 'string' && (r.status.includes('첫') || r.status.includes('종료')));
    const isPresentExt = r.status === 'present' || strStatus.startsWith('O') || strStatus.startsWith('o') || strStatus.startsWith('O^') || strStatus.startsWith('o^');
    const isRegular = isPresentExt || isNumericPresent || isAbsent || isEarly || isTardy || isFirstLast;

    const prevNet = rollingTotal;

    if (isMarker || isRegular) {
        rollingTotal += 1; // Assuming incAmountVal is 1
        rollingTotal = Math.round(rollingTotal * 10) / 10;
        const currNet = rollingTotal;

        const prevCycle = getCycle(prevNet, isDualBakery);
        const currCycle = getCycle(currNet, isDualBakery);

        if (currCycle > prevCycle) {
            console.log(`Milestone hit on ${dateStr}! Total: ${currNet}. prevCycle: ${prevCycle}, currCycle: ${currCycle}`);
        }
    }
});
