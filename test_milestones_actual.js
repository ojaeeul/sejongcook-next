const fs = require('fs');
// Mocking the environment
global.window = { currentState: { year: 2026, month: 2 } };
global.holidaysData = [];
global.KOREAN_HOLIDAYS_MAP = {};
global.COURSE_SCHEDULES = {
    "양식기능사": [1, 2, 3, 4]
};
global.GLOBAL_DATA_ADJUSTMENTS = {};
global.localStorage = {
    getItem: () => '{}' // Empty sync data to see raw internal generation
};

const tuitionScript = fs.readFileSync('./public/sejong/tuition_v4.js', 'utf8');
// remove the first function getMemberEighthDayInMonth if it is redefined, or just eval the whole thing
eval(tuitionScript + "\n\n" + `
const membersData = JSON.parse(fs.readFileSync('./data/sejong/members.json', 'utf8'));
const attendanceData = JSON.parse(fs.readFileSync('./data/sejong/attendance.json', 'utf8'));

// build attendanceByMember
attendanceData.forEach(a => {
    if(!global.attendanceByMember[a.memberId]) global.attendanceByMember[a.memberId] = [];
    a.dateObj = new Date(a.date);
    a.yearNum = a.dateObj.getFullYear();
    a.monthNum = a.dateObj.getMonth() + 1;
    global.attendanceByMember[a.memberId].push(a);
});

const member = membersData.find(m => m.name === '오재을');
const stats = getMemberEighthDayInMonth(member.id, 2026, 2, member.course);
console.log('Stats:', JSON.stringify(stats, null, 2));
`);
