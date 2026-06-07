const fs = require('fs');

const members = JSON.parse(fs.readFileSync('public/sejong/data/members.json', 'utf8'));

let allCourseRows = [];
members.forEach(m => {
    if (m.status === 'trash' || m.status === 'delete' || m.status === 'completed' || m.status === 'hold') return;
    
    let courses = (m.course || '').split(',').map(c => c.trim()).filter(c => c !== '');
    const hasJeggwa = courses.some(c => c.includes('제과') && !c.includes('제과제빵'));
    const hasJeppang = courses.some(c => c.includes('제빵') && !c.includes('제과제빵'));
    if (hasJeggwa && hasJeppang) {
        courses = courses.filter(c => !c.includes('제과') && !c.includes('제빵'));
        courses.push('제과제빵기능사');
    }
    
    if (courses.length === 0) {
        allCourseRows.push({ member: m, courseFull: '', courseName: '' });
    } else {
        courses.forEach(courseFull => {
            let courseName = courseFull.replace(/\([^)]*\)/g, '').trim();
            allCourseRows.push({ member: m, courseFull: courseFull, courseName: courseName });
        });
    }
});

console.log("Total valid unique members:", new Set(allCourseRows.map(r => r.member.name)).size);
console.log("Course Rows:", allCourseRows.map(r => `${r.member.name} - ${r.courseName}`));
