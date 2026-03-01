const fs = require('fs');

const rawMembers = JSON.parse(fs.readFileSync('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/data/members.json', 'utf8'));
const myMember = rawMembers.find(m => m.id === "1770517017920");

console.log("Oh Jae-eul data:", myMember);

let allCourseRows = [];
const courses = (myMember.course || '').split(',').map(c => c.trim()).filter(c => c !== '');
courses.forEach(courseFull => {
    let courseName = courseFull.replace(/\([^)]*\)/g, '').trim();
    allCourseRows.push({ member: myMember, courseFull: courseFull, courseName: courseName });
});

console.log("Course Rows:", allCourseRows);
