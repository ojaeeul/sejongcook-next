const fs = require('fs');
const members = JSON.parse(fs.readFileSync('Sejong/SejongAttendance/public/data/members.json', 'utf8'));
const sched = JSON.parse(fs.readFileSync('Sejong/SejongAttendance/public/data/timetable_expected.json', 'utf8'));
const gil = members.find(m => m.name === '길삼이');
console.log("Gil-sam course:", gil.course);
const gilSched = sched.filter(l => l.memberId === gil.id && l.year === 2026 && l.month === 6);
console.log("June expected:", gilSched);
