const fs = require('fs');
const members = JSON.parse(fs.readFileSync('Sejong/SejongAttendance/public/data/members.json', 'utf8'));
const att = JSON.parse(fs.readFileSync('Sejong/SejongAttendance/public/data/attendance.json', 'utf8'));

const mils = members.filter(m => m.name === '길삼이' || m.name === '김삼이' || m.name === '길춘이');
mils.forEach(m => {
  console.log(`\n=== ${m.name} ===`);
  const ma = att.filter(a => a.memberId === m.id && a.date && a.date.startsWith('2026-06'));
  ma.forEach(a => {
    console.log(`${a.date}: course=${a.course}, status="${a.status}"`);
  });
});
