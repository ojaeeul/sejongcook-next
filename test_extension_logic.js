const fs = require('fs');
const data = JSON.parse(fs.readFileSync('Sejong/data/attendance.json', 'utf8'));

let found = 0;
data.forEach(r => {
    const strStatus = String(r.status);
    if (strStatus.includes('연') || strStatus === 'extension') {
        const isNumericPresent = ['10', '12', '2', '5', '7', '3', '9'].includes(strStatus);
        const isAbsent = r.status === 'absent' || strStatus.startsWith('X') || strStatus.includes('결석');
        const isEarly = r.status === 'early' || strStatus.includes('조퇴');
        const isTardy = r.status === 'tardy' || strStatus.includes('지각') || strStatus.includes('△');
        const isFirstLast = strStatus.includes('첫') || strStatus.includes('종료') || strStatus === '[' || strStatus === ']';
        const isExtension = r.status === 'extension' || strStatus.startsWith('연') || strStatus.includes('연장') || strStatus.startsWith('E');
        const isRegularAttendance = r.status === 'present' || isNumericPresent || isAbsent || isEarly || isTardy || isFirstLast;
        
        console.log(`Member: ${r.memberId}, Date: ${r.date}, Status: ${r.status}`);
        console.log(`  isExtension: ${isExtension}, isRegular: ${isRegularAttendance}`);
        found++;
    }
});
console.log("Total extensions found: " + found);
