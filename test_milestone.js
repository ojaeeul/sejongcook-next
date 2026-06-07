const fs = require('fs');
// Mocking the environment
global.window = { currentState: { year: 2026, month: 1 } };

const tuitionScript = fs.readFileSync('./public/sejong/tuition_v4.js', 'utf8');
const members = JSON.parse(fs.readFileSync('./data/sejong/members.json', 'utf8'));
const attendance = JSON.parse(fs.readFileSync('./data/sejong/attendance.json', 'utf8'));

eval(tuitionScript);

const member = members.find(m => m.name === '오재을');
console.log('member:', member);
const result = getMemberEighthDayInMonth(member.id, member.course, 2026, 1, members, attendance);
console.log('Result for 2026-01:', result);
