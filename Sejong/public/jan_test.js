const fs = require('fs');

const m = {
  "id": "1770517017920",
  "name": "오재을",
  "course": "양식기능사(17:00)",
  "registeredDate": "2026-02-08"
};

const attendanceData = [
  {"memberId":"1770517017920","date":"2026-01-06","status":"present"},
  {"memberId":"1770517017920","date":"2026-01-08","status":"present"},
  {"memberId":"1770517017920","date":"2026-01-13","status":"present"},
  {"memberId":"1770517017920","date":"2026-01-15","status":"present"},
  {"memberId":"1770517017920","date":"2026-01-20","status":"present"},
  {"memberId":"1770517017920","date":"2026-01-22","status":"present"},
  {"memberId":"1770517017920","date":"2026-01-27","status":"present"},
  {"memberId":"1770517017920","date":"2026-01-29","status":"extension"}
];

const currentYear = 2026;
const currentMonth = 1;

let earliestYear = currentYear;
let earliestMonth = currentMonth;

if (m && m.registeredDate) {
    const rd = new Date(m.registeredDate);
    earliestYear = rd.getFullYear();
    earliestMonth = rd.getMonth() + 1;
}

if (attendanceData.length > 0) {
    const d = new Date(attendanceData[0].date);
    const firstLogYear = d.getFullYear();
    const firstLogMonth = d.getMonth() + 1;

    if (firstLogYear < earliestYear || (firstLogYear === earliestYear && firstLogMonth < earliestMonth)) {
        earliestYear = firstLogYear;
        earliestMonth = firstLogMonth;
    }
}
console.log("Earliest:", earliestYear, earliestMonth);

const rowCourseNameScope = "양식기능사";
const isDualCourse = false;
const attendanceIncrement = 1;

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

monthsToCalc.forEach(mc => {
    const mLogs = attendanceData.filter(l => l.date.includes(mc.key));
    let manualMakeup = 0; 
    let attendances = 0;

    mLogs.forEach(l => {
        const isAbsent = l.status === 'absent';
        const isNumericPresent = false;
        const isRegularAttendance = l.status === 'present' || isNumericPresent || isAbsent;

        if (isRegularAttendance) attendances += attendanceIncrement;
    });

    let totalCombined = Math.round((carryOverP + manualMakeup + attendances) * 10) / 10;
    
    let vRaw = Math.round(totalCombined * 10);
    carryOverP = totalCombined;
    
    let m_P;
    if (vRaw <= 80) {
        m_P = vRaw / 10;
    } else {
        let pRaw = vRaw - 80;
        m_P = (((pRaw - 10) % 80 + 80) % 80 + 10) / 10;
    }
    console.log(`Month: ${mc.key}, totalCombined: ${totalCombined}, m_P: ${m_P}`);
});
