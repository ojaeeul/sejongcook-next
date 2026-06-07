const fs = require('fs');
const attendanceData = JSON.parse(fs.readFileSync('./public/sejong/data/attendance.json', 'utf8'));
const userAttendance = attendanceData.filter(a => a.memberId === '1770517017920');
userAttendance.sort((a, b) => new Date(a.date) - new Date(b.date));
console.log(userAttendance);
