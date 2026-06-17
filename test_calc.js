const fs = require('fs');

// Mock window and global objects
global.window = global;
window.sejongCycleRules = { default: 9, custom: [{ keyword: "제과제빵", cycle: 17 }] };
window.global_makeup_cutoffs = {};
window.global_attendance_cutoffs = {};
window.holidaysData = [];
window.KOREAN_HOLIDAYS_MAP = {};
window.COURSE_SCHEDULES = {};
window.GLOBAL_DATA_ADJUSTMENTS = {};

// Load shared_calc.js
const sharedCalcCode = fs.readFileSync('./Sejong/SejongAttendance/public/shared_calc.js', 'utf8');
eval(sharedCalcCode);

// Load data
const attendanceData = JSON.parse(fs.readFileSync('./Sejong/SejongAttendance/data/attendance.json', 'utf8'));
const memberData = JSON.parse(fs.readFileSync('./Sejong/SejongAttendance/data/members.json', 'utf8'));

// Test
const targetYear = 2026;
const targetMonth = 6;
let count = 0;

memberData.forEach(m => {
    if (m.status !== 'registered') return;
    const result = window.calculateRedBoxesForMonth(m, targetYear, targetMonth, attendanceData, "", {});
    if (result.redDays && result.redDays.length > 0 && !result.isSimulated) {
        console.log(`Member ${m.name} (ID: ${m.id}) has redDays in 2026-06:`, result.redDays);
        count++;
    }
});
console.log('Total members with REAL redDays in 2026-06:', count);
