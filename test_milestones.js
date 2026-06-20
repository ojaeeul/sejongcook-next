const fs = require('fs');
const members = JSON.parse(fs.readFileSync('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/data/members.json', 'utf8'));
const payments = JSON.parse(fs.readFileSync('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/data/payments.json', 'utf8'));
const attendance = JSON.parse(fs.readFileSync('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/data/attendance.json', 'utf8'));
const settingsRaw = JSON.parse(fs.readFileSync('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/data/settings.json', 'utf8'));

const settings = Array.isArray(settingsRaw) ? settingsRaw[0] : settingsRaw;
global.window = { courseFees: settings.courseFees || {} };
require('./Sejong/SejongAttendance/public/shared_calc.js');

const activeMembers = members.filter(m => !['completed', 'trash', 'delete'].includes(m.status));
const now = new Date();
const todayYear = now.getFullYear();
const todayMonth = now.getMonth() + 1;

let allMilestonesArray = [];

activeMembers.forEach(m => {
    let myCourses = (m.course || '').split(',').map(c => c.trim()).filter(c => c !== '');
    myCourses.forEach(fullCourse => {
        const courseNameOnly = fullCourse ? fullCourse.split('(')[0].trim() : '';
        const stats = window.calculateRedBoxesForMonth(m, todayYear, todayMonth, attendance, courseNameOnly, {});
        if (stats && stats.allMilestones) {
            stats.allMilestones.forEach(ms => {
                allMilestonesArray.push({name: m.name, year: ms.year, month: ms.month, day: ms.day, isReal: ms.isReal});
            });
        }
    });
});

console.log("Total milestones calculated:", allMilestonesArray.length);
let juneMilestones = allMilestonesArray.filter(ms => ms.year === 2026 && ms.month === 6);
console.log("June 2026 milestones:", juneMilestones);
