const fs = require('fs');

const GLOBAL_DATA_ADJUSTMENTS = {
    "1770517017920": { // 오재을
        "2026-02": { carryOverride: 8.0, forceRedBoxDates: ["2026-02-03"] },
        "2026-04": { carryOverride: 8.0, forceRedBoxDates: ["2026-04-30"] },
        "2026-06": { forceRedBoxDates: ["2026-06-02"] }
    }
};

const m = { id: "1770517017920", registeredDate: "2025-12-10", course: "양식기능사(17:00)", name: "오재을" };
const currentYear = 2026;
const currentMonth = 1;
const rowCourseNameScope = "양식기능사";
const isDualCourse = false;
const attendanceIncrement = 1;

let attendanceData = [
    { "memberId": "1770517017920", "date": "2026-01-06", "status": "present", "course": "양식기능사" },
    { "memberId": "1770517017920", "date": "2026-01-08", "status": "present", "course": "양식기능사" },
    { "memberId": "1770517017920", "date": "2026-01-13", "status": "present", "course": "양식기능사" },
    { "memberId": "1770517017920", "date": "2026-01-15", "status": "present", "course": "양식기능사" },
    { "memberId": "1770517017920", "date": "2026-01-20", "status": "present", "course": "양식기능사" },
    { "memberId": "1770517017920", "date": "2026-01-22", "status": "present", "course": "양식기능사" },
    { "memberId": "1770517017920", "date": "2026-01-27", "status": "present", "course": "양식기능사" },
    { "memberId": "1770517017920", "date": "2026-01-29", "status": "extension", "course": "양식기능사" }
];

const rowLogsRaw = attendanceData.filter(l => {
    if (String(l.memberId) !== String(m.id)) return false;
    if (!l.course) return true; 
    if (!rowCourseNameScope) return false;
    const lCourseClean = l.course.replace(/\([^)]*\)/g, '').trim();
    const rCourseClean = rowCourseNameScope.replace(/\([^)]*\)/g, '').trim();
    return lCourseClean === rCourseClean;
});

const uniqueRowLogsMap = new Map();
rowLogsRaw.forEach(l => {
    const dateStr = l.date.includes('T') ? l.date.split('T')[0] : l.date;
    uniqueRowLogsMap.set(`${dateStr}_${l.course || ''}`, { ...l, date: dateStr });
});
let uniqueLogs = Array.from(uniqueRowLogsMap.values()).sort((a, b) => a.date.localeCompare(b.date));

let earliestYear = currentYear;
let earliestMonth = currentMonth;

if (m && m.registeredDate) {
    const rd = new Date(m.registeredDate);
    if (!isNaN(rd)) {
        earliestYear = rd.getFullYear();
        earliestMonth = rd.getMonth() + 1;
    }
}

if (uniqueLogs.length > 0) {
    const d = new Date(uniqueLogs[0].date);
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

latestYear = earliestYear;
latestMonth = earliestMonth;
if (uniqueLogs.length > 0) {
    const lastD = new Date(uniqueLogs[uniqueLogs.length - 1].date);
    latestYear = lastD.getFullYear();
    latestMonth = lastD.getMonth() + 1;
}

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

console.log("Timeline:");
monthsToCalc.forEach(mc => {
    const adjustment = GLOBAL_DATA_ADJUSTMENTS[String(m.id)]?.[mc.key];
    if (adjustment && adjustment.carryOverride !== undefined) {
        carryOverP = adjustment.carryOverride;
    }

    const mLogs = uniqueLogs.filter(l => {
        const ld = new Date(l.date);
        return ld.getFullYear() === mc.year && (ld.getMonth() + 1) === mc.month;
    });

    let manualMakeup = 0; 
    let attendances = 0;

    mLogs.forEach(l => {
        const isMakeupMarker = ['[', ']'].includes(l.status);
        const isNumericPresent = ['10', '12', '2', '5', '7', '3', '9'].includes(l.status);
        const isAbsent = l.status === 'absent' || (typeof l.status === 'string' && l.status.startsWith('X'));
        const isExtension = l.status === 'extension' || (typeof l.status === 'string' && (l.status.startsWith('E') || l.status.includes('연장')));
        const isRegularAttendance = l.status === 'present' || isNumericPresent || isAbsent;

        if (isMakeupMarker) manualMakeup += attendanceIncrement;
        if (isRegularAttendance) attendances += attendanceIncrement;
    });

    if (adjustment && adjustment.presentOverride !== undefined) {
        attendances = adjustment.presentOverride;
    }

    let totalCombined = Math.round((carryOverP + manualMakeup + attendances) * 10) / 10;
    let vRaw = Math.round(totalCombined * 10);

    mc.carryFromPrev = carryOverP;

    if (vRaw <= 80) {
        mc.m_J = 0;
        mc.m_P = vRaw / 10;
    } else {
        mc.m_J = 8;
        let pRaw = vRaw - 80;
        mc.m_P = (((pRaw - 10) % 80 + 80) % 80 + 10) / 10;
    }

    console.log(`Month: ${mc.key}, prevCarryOver: ${carryOverP},  attendancesThisMonth: ${attendances}, endResultP: ${mc.m_P}`);

    carryOverP = totalCombined;
});

