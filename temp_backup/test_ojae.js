const fs = require('fs');
const members = JSON.parse(fs.readFileSync('Sejong/SejongAttendance/data/members.json'));
const attendance = JSON.parse(fs.readFileSync('Sejong/SejongAttendance/data/attendance.json'));

const targets = members.filter(m => ['오재1', '오재을'].includes(m.name));

for (const m of targets) {
    const logs = attendance.filter(a => a.memberId === m.id);
    console.log(`\n\nMember: ${m.name} (${m.id})`);
    console.log(logs.map(l => `${l.date} ${l.status}`).sort().join('\n'));
}
