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

let allOverdue = [];

activeMembers.forEach(m => {
    let myCourses = (m.course || '').split(',').map(c => c.trim()).filter(c => c !== '');
    myCourses.forEach(fullCourse => {
        const courseNameOnly = fullCourse ? fullCourse.split('(')[0].trim() : '';
        const stats = window.calculateRedBoxesForMonth(m, now.getFullYear(), now.getMonth()+1, attendance, courseNameOnly, {});
        if (stats && stats.allMilestones) {
            let currentProgressObj = stats.currentCount || { count: 0, target: 9 };
            let remainingForLoop = currentProgressObj.count;
            const isDualBakeryLocal = (courseNameOnly && courseNameOnly.replace(/\s/g, '').includes('제과제빵')) || (!courseNameOnly && m.course && m.course.replace(/\s/g, '').includes('제과제빵'));
            const firstTargetCount = isDualBakeryLocal ? 17 : 9;
            const subTargetCount = isDualBakeryLocal ? 16 : 8;
            let isFirstCycleForThisCourse = true;
            const normalizeCourse = (c) => (!c || c === 'null') ? null : String(c).trim();

            stats.allMilestones.forEach(ms => {
                let currentTargetCount = isFirstCycleForThisCourse ? firstTargetCount : subTargetCount;
                const msPayment = payments.find(p => p.memberId == m.id && p.year == ms.year && p.month == ms.month && normalizeCourse(p.course) === normalizeCourse(courseNameOnly) && p.status !== 'delete');
                
                if (msPayment && msPayment.status === 'paid') {
                    remainingForLoop -= currentTargetCount;
                    isFirstCycleForThisCourse = false;
                } else {
                    const msDateObj = new Date(ms.year, ms.month - 1, ms.day);
                    const isActualOverdue = remainingForLoop >= currentTargetCount || (ms.isReal !== false && msDateObj <= now);
                    
                    if (isActualOverdue) {
                        allOverdue.push(`${m.name} - ${ms.year}년 ${ms.month}월`);
                    }
                    remainingForLoop -= currentTargetCount;
                    isFirstCycleForThisCourse = false;
                }
            });
        }
    });
});
console.log(`Found ${allOverdue.length} overdue items`);
if (allOverdue.length > 0) {
    console.log("Sample:", allOverdue.slice(0, 5));
}
