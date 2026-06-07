const fs = require('fs');
const members = JSON.parse(fs.readFileSync('./data/sejong/members.json', 'utf8'));
const attendance = JSON.parse(fs.readFileSync('./data/sejong/attendance.json', 'utf8'));

const member = members.find(m => m.name === '오재을');
console.log('member:', member);

const records = attendance.filter(a => a.memberId === member.id);
console.log('Total records:', records.length);
records.forEach(r => {
    console.log(`${r.year}-${r.month}-${r.day} -> ${r.status}`);
});
