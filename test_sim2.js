const fs = require('fs');
global.window = {};
const code = fs.readFileSync('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/shared_calc.js', 'utf8');
eval(code);
window.getCourseLimits = () => ({ limit: 8, trigger: 9 });
window.getCourseCycleLength = () => 9;
window.COURSE_SCHEDULES = { "제과기능사": [1, 2, 3, 4, 5] };
const member = { id: 1, course: "제과기능사", start_date: "2026-06-01" };
const logs = [];
for (let i=1; i<=9; i++) {
    logs.push({ memberId: 1, date: `2026-06-0${i}`, status: "present", course: "제과기능사" });
}
console.log("Month 6:", window.calculateRedBoxesForMonth(member, 2026, 6, logs, "제과기능사", {}));
