const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:/Users/세종요리/Desktop/sejk 4/sejongcook-next/Sejong/SejongAttendance/data/attendance.json', 'utf8'));
const target = "1770517017920";
const records = data.filter(r => r.memberId === target);
records.sort((a, b) => a.date.localeCompare(b.date));
records.forEach(r => console.log(`${r.date}: ${r.status}`));
