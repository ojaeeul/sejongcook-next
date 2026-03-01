const fs = require('fs');

const m = {
  "id": "1770517693101",
  "name": "을",
  "course": "양식기능사(10:00), 제과제빵기능사(17:00)",
  "registeredDate": "2026-02-08"
}; // registration is FEB 2026

const attendanceData = JSON.parse(fs.readFileSync('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/data/attendance.json', 'utf8'));

// Find "을" logs in Jan
const janLogs = attendanceData.filter(l => String(l.memberId) === m.id && l.date.includes('2026-01'));
console.log("을's Jan Logs:", janLogs);

