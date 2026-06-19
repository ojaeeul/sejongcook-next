const fs = require('fs');
const file = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger.js';
let content = fs.readFileSync(file, 'utf8');

// Restore the courseLatestRealMonth object and logic
if (!content.includes('const courseLatestRealMonth = {};')) {
    content = content.replace('const coursesFoundSimulated = new Set();', `const courseLatestRealMonth = {};
        allMonthsSchedules.forEach((schedules, idx) => {
            const month = idx + 1;
            schedules.forEach(s => {
                if (!s.isSimulated && (!courseLatestRealMonth[s.course] || courseLatestRealMonth[s.course] < month)) {
                    courseLatestRealMonth[s.course] = month;
                }
            });
        });

        const coursesFoundSimulated = new Set();`);
}

if (!content.includes('if (courseLatestRealMonth[s.course] && month <= courseLatestRealMonth[s.course])')) {
    content = content.replace('if (s.isSimulated) {', `if (s.isSimulated) {
                        if (courseLatestRealMonth[s.course] && month <= courseLatestRealMonth[s.course]) {
                            return false;
                        }`);
}

fs.writeFileSync(file, content);
