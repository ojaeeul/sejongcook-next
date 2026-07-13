const fs = require('fs');

const membersData = JSON.parse(fs.readFileSync('./data/sejong/members.json', 'utf8'));
const attendanceData = JSON.parse(fs.readFileSync('./data/sejong/attendance.json', 'utf8'));

const eul = membersData.find(m => m.name === '을' || m.name.includes('을'));
const eulLogs = attendanceData.filter(l => l.memberId === eul.id).sort((a, b) => new Date(a.date) - new Date(b.date));

const currentYear = 2026;
const currentMonth = 3;
const rowCourseNameScope = eul.course;

let earliestYear = 2026;
let earliestMonth = 1;

if (eul.registeredDate) {
    const rd = new Date(eul.registeredDate);
    if (!isNaN(rd)) {
        earliestYear = rd.getFullYear();
        earliestMonth = rd.getMonth() + 1;
    }
}

if (eulLogs.length > 0) {
    const d = new Date(eulLogs[0].date);
    const firstLogYear = d.getFullYear();
    const firstLogMonth = d.getMonth() + 1;
    if (firstLogYear < earliestYear || (firstLogYear === earliestYear && firstLogMonth < earliestMonth)) {
        earliestYear = firstLogYear;
        earliestMonth = firstLogMonth;
    }
}

if (earliestYear > currentYear || (earliestYear === currentYear && earliestMonth > currentMonth)) {
    earliestYear = currentYear;
    earliestMonth = currentMonth;
}

let iterYear = earliestYear;
let iterMonth = earliestMonth;

let carryOverP = 0;

let monthsToCalc = [];
while (true) {
    const key = `${iterYear}-${String(iterMonth).padStart(2, '0')}`;
    monthsToCalc.push({ year: iterYear, month: iterMonth, key });
    if (iterYear === currentYear && iterMonth === currentMonth) break;
    iterMonth++;
    if (iterMonth > 12) {
        iterMonth = 1;
        iterYear++;
    }
}

const isDualCourse = eul.course && eul.course.includes('제과제빵');
const attendanceIncrement = isDualCourse ? 0.5 : 1;

monthsToCalc.forEach(mc => {
    const mLogs = eulLogs.filter(l => l.date.startsWith(mc.key));
    let manualMakeup = 0;
    let attendances = 0;

    mLogs.forEach(l => {
        const isMakeupMarker = ['[', ']'].includes(l.status);
        const isNumericPresent = ['10', '12', '2', '5', '7'].includes(l.status);
        const isAbsent = l.status === 'absent' || (typeof l.status === 'string' && l.status.startsWith('X'));
        const isRegularAttendance = l.status === 'present' || isNumericPresent || isAbsent;

        if (isMakeupMarker) manualMakeup += attendanceIncrement;
        if (isRegularAttendance) attendances += attendanceIncrement;
    });

    let totalCombined = carryOverP + manualMakeup + attendances;
    mc.m_J = Math.min(totalCombined, 8);
    mc.m_P = Math.max(totalCombined - 8, 0);
    mc.carryFromPrev = carryOverP;

    carryOverP = totalCombined === 0 ? 0 : ((totalCombined - 1) % 8) + 1;
});

const currentMC = monthsToCalc[monthsToCalc.length - 1];
const redBoxDates = new Set();
if (currentMC) {
    const currentMonthLogs = eulLogs.filter(l => l.date.startsWith(currentMC.key));
    let runningAttendances = 0;
    const carryForRedBox = currentMC.carryFromPrev;

    currentMonthLogs.forEach(l => {
        const isMakeupMarker = ['[', ']'].includes(l.status);
        const isNumericPresent = ['10', '12', '2', '5', '7'].includes(l.status);
        const isAbsent = l.status === 'absent' || (typeof l.status === 'string' && l.status.startsWith('X'));
        const isRegularAttendance = l.status === 'present' || isNumericPresent || isAbsent;

        const prevTotal = carryForRedBox + runningAttendances;

        if (isRegularAttendance || isMakeupMarker) {
            runningAttendances += attendanceIncrement;
        }

        const currTotal = carryForRedBox + runningAttendances;

        if (currTotal >= 9 && Math.floor((prevTotal - 1) / 8) < Math.floor((currTotal - 1) / 8)) {
            redBoxDates.add(l.date);
        }
        console.log(`Date: ${l.date}, prev: ${prevTotal}, curr: ${currTotal}, added? ${redBoxDates.has(l.date)}`);
    });
}
console.log('Final RedBoxDates:', Array.from(redBoxDates));
