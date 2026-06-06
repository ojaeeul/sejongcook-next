const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const code = fs.readFileSync('Sejong/SejongAttendance/public/tuition_v3.js', 'utf8');

const html = `
<!DOCTYPE html>
<html>
<body>
<script>
window.membersData = [{id: 1, course: '제과제빵기능사'}];
window.currentState = { year: 2026, month: 5 };
window.attendanceData = [];
window.holidaysData = [];
window.COURSE_SCHEDULES = {};
</script>
<script>
${code}
</script>
<script>
window.testResult = getProgressInfo(0);
</script>
</body>
</html>
`;

const dom = new JSDOM(html, { runScripts: "dangerously" });
dom.window.localStorage.setItem('sejong_ledger_sync', JSON.stringify({
    '1_2026_5_제과제빵기능사': [15],
    '1_2026_6_제과제빵기능사_simulated': [5]
}));

try {
    const stats = dom.window.getMemberEighthDayInMonth(1, 2026, 5, '제과제빵기능사');
    console.log("Stats generated correctly:", JSON.stringify(stats));
    console.log("Success!");
} catch(e) {
    console.error("Error:", e);
}
