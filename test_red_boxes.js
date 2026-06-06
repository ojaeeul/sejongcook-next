const fs = require('fs');

global.window = global;
const sharedCalcCode = fs.readFileSync('public/sejong/shared_calc.js', 'utf8');
eval(sharedCalcCode);

const member = { id: 1, name: 'Test User', course: '제과기능사' };
const allAttendanceLogs = [
    { memberId: 1, course: '제과기능사', date: '2026-07-01', status: 'present' },
    { memberId: 1, course: '제과기능사', date: '2026-07-03', status: 'present' },
    { memberId: 1, course: '제과기능사', date: '2026-07-08', status: 'present' },
    { memberId: 1, course: '제과기능사', date: '2026-07-10', status: 'present' },
    { memberId: 1, course: '제과기능사', date: '2026-07-15', status: 'present' },
    { memberId: 1, course: '제과기능사', date: '2026-07-17', status: 'present' },
    { memberId: 1, course: '제과기능사', date: '2026-07-22', status: 'present' },
    { memberId: 1, course: '제과기능사', date: '2026-07-24', status: 'present' }
];

const GLOBAL_DATA_ADJUSTMENTS = {};

try {
    const result = window.calculateRedBoxesForMonth(member, 2026, 8, allAttendanceLogs, '제과기능사', GLOBAL_DATA_ADJUSTMENTS);
    console.log("Result for 2026-08:", result);
} catch(e) {
    console.log("ERROR:", e.message, e.stack);
}
