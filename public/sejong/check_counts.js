const fs = require('fs');

const members = JSON.parse(fs.readFileSync('./sejong_members.json', 'utf8'));
const attendance = JSON.parse(fs.readFileSync('./sejong_attendance.json', 'utf8'));
const payments = JSON.parse(fs.readFileSync('./sejong_payments.json', 'utf8'));
const holidays = JSON.parse(fs.readFileSync('./sejong_holidays.json', 'utf8'));

// Minimal KOREAN_HOLIDAYS_MAP from shared_calc.js
const KOREAN_HOLIDAYS_MAP = {};

let attendanceByMember = {};
attendance.forEach(r => {
    if (!attendanceByMember[r.memberId]) attendanceByMember[r.memberId] = [];
    r.dateObj = new Date(r.date);
    r.yearNum = r.dateObj.getFullYear();
    r.monthNum = r.dateObj.getMonth() + 1;
    attendanceByMember[r.memberId].push(r);
});
for (let m in attendanceByMember) attendanceByMember[m].sort((a, b) => a.dateObj - b.dateObj);

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

function calculateRedBoxesForMonth(memberObj, targetYear, targetMonth, courseNameScope) {
    const memberId = memberObj.id;
    let memberRecords = (attendanceByMember[memberId] || []).filter(r => {
        const dateStr = r.date.split('T')[0];
        const isHolidayInSys = holidays.some(h => h.date === dateStr);
        const isNationalHoliday = !!KOREAN_HOLIDAYS_MAP[dateStr];
        const dayOfWeek = r.dateObj.getDay();
        const strStatus = String(r.status || '');
        const isPresent = r.status === 'present' || strStatus.startsWith('O') || strStatus.startsWith('o') || ['10', '12', '2', '5', '7', '3', '9'].includes(strStatus);
        const isExtension = r.status === 'extension' || strStatus.startsWith('연') || strStatus.includes('연장') || strStatus.startsWith('E');
        const isAbsent = r.status === 'absent' || strStatus.startsWith('X') || strStatus.includes('결석');
        const isEarlyTardy = r.status === 'early' || r.status === 'tardy' || strStatus.includes('조퇴') || strStatus.includes('지각') || strStatus.includes('△');
        
        if (isPresent || isExtension || isAbsent || isEarlyTardy) return true;
        return !(isHolidayInSys || isNationalHoliday || dayOfWeek === 0);
    });

    const uniqueMap = new Map();
    memberRecords.forEach(r => {
        const dStr = r.date.split('T')[0];
        const cKey = r.course ? r.course.replace(/\([^)]*\)/g, '').trim() : 'all';
        uniqueMap.set(`${dStr}_${cKey}`, r);
    });
    memberRecords = Array.from(uniqueMap.values());
    memberRecords.sort((a, b) => a.dateObj - b.dateObj);

    // Hardcode adjustments parsing if needed, but for now assume 0 overrides for simplicity, OR parse it.
    // The user's carryOverride data is NOT in JSON, it's in localStorage normally!
    // WAIT. If carryOverride is in localStorage, I CANNOT compute this accurately without it!!!
    return []; 
}
