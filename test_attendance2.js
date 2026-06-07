const fs = require('fs');
const members = JSON.parse(fs.readFileSync('./data/sejong/members.json', 'utf8'));
const attendance = JSON.parse(fs.readFileSync('./data/sejong/attendance.json', 'utf8'));

const member = members.find(m => m.name === '오재을');

let count12 = 0;
let count1 = 0;
let count2 = 0;

attendance.forEach(a => {
    if (a.memberId === member.id && a.status === '출석') {
        if (a.year === 2025 && a.month === 12) count12++;
        if (a.year === 2026 && a.month === 1) count1++;
        if (a.year === 2026 && a.month === 2) count2++;
    }
});

console.log('12월 출석:', count12);
console.log('1월 출석:', count1);
console.log('2월 출석:', count2);
