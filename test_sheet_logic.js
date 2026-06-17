const fs = require('fs');

global.window = global;
window.sejongCycleRules = { default: 9, custom: [{ keyword: "제과제빵", cycle: 17 }] };
window.global_makeup_cutoffs = {};
window.global_attendance_cutoffs = {};
window.GLOBAL_DATA_ADJUSTMENTS = {};

const sharedCalcCode = fs.readFileSync('./Sejong/SejongAttendance/public/shared_calc.js', 'utf8');
eval(sharedCalcCode);

const attendanceData = JSON.parse(fs.readFileSync('./Sejong/SejongAttendance/data/attendance.json', 'utf8'));
const memberData = JSON.parse(fs.readFileSync('./Sejong/SejongAttendance/data/members.json', 'utf8'));

const targetYear = 2026;
const month = 6;
let count = 0;

memberData.forEach(m => {
    if (m.status !== 'registered') return;
    
    let days = [];
    if (typeof window.calculateRedBoxesForMonth === 'function') {
        const result = window.calculateRedBoxesForMonth(m, targetYear, month, attendanceData, "", window.GLOBAL_DATA_ADJUSTMENTS);
        if (result && result.redDays && result.redDays.length > 0 && !result.isSimulated) {
            days = [...result.redDays];
        }
    }
    
    let hasActualAttendanceInDB = false;
    if (attendanceData && attendanceData.length > 0) {
        hasActualAttendanceInDB = attendanceData.some(a => {
            if (String(a.memberId) !== String(m.id)) return false;
            const dateObj = new Date(a.date);
            return dateObj.getFullYear() === targetYear && (dateObj.getMonth() + 1) === month;
        });
    }
    
    if (hasActualAttendanceInDB && days.length > 0) {
        count += days.length;
        console.log(`Member ${m.name} has real red box in 6월! days:`, days);
    }
});

console.log('Final monthCount for 6월:', count);
