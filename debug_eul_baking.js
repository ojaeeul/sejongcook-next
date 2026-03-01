const fs = require('fs');
const membersData = JSON.parse(fs.readFileSync('./data/sejong/members.json', 'utf8'));
const attendanceData = JSON.parse(fs.readFileSync('./data/sejong/attendance.json', 'utf8'));

const m = membersData.find(m => m.name === '을');
const course = '제과제빵기능사';
const logs = attendanceData.filter(l => l.memberId === m.id && l.course && l.course.includes(course)).sort((a, b) => new Date(a.date) - new Date(b.date));

let rolling = 0;
logs.forEach(l => {
    const isMarker = ['[', ']'].includes(l.status);
    const isNumericPresent = ['10', '12', '2', '5', '7'].includes(l.status);
    const isAbsent = l.status === 'absent' || (typeof l.status === 'string' && l.status.startsWith('X'));
    const isRegular = l.status === 'present' || l.status === 'extension' || isNumericPresent || isAbsent;

    if (isMarker || isRegular) {
        let prev = rolling;
        rolling += 0.5;
        let hit = Math.floor((prev - 0.001) / 9) < Math.floor((rolling - 0.001) / 9);
        console.log(`Date: ${l.date}, prev: ${prev}, curr: ${rolling}, hit: ${hit}`);
    }
});
