const fs = require('fs');

const globalMembers = JSON.parse(fs.readFileSync('./public/data/members.json', 'utf8'));
const activeMembers = globalMembers.filter(m => !['completed', 'trash', 'delete'].includes(m.status));

let dashNewCount = 0;
let dashLeaveCount = 0;
const selectedYear = 2026;
const selectedMonth = 6;

try {
    globalMembers.forEach(m => {
        if (m.status === 'completed') {
            if (m.completedDate) {
                const cDate = new Date(m.completedDate);
                if (cDate.getFullYear() === selectedYear && cDate.getMonth() + 1 === selectedMonth) {
                    dashLeaveCount++;
                }
            }
        } else if (!['trash', 'delete'].includes(m.status)) {
            let isNew = false;
            if (m.registeredDate) {
                const rDate = new Date(m.registeredDate);
                if (rDate.getFullYear() === selectedYear && rDate.getMonth() + 1 === selectedMonth) isNew = true;
            } else if (m.start_date) {
                const sDate = new Date(m.start_date);
                if (sDate.getFullYear() === selectedYear && sDate.getMonth() + 1 === selectedMonth) isNew = true;
            }
            if (isNew) {
                dashNewCount++;
            }
        }
    });

    const courseSet = new Set();
    let adults = 0;
    let students = 0;
    let children = 0;
    activeMembers.forEach(m => {
        if (m.course) {
            m.course.split(',').forEach(c => courseSet.add(c.split('(')[0].trim()));
        }
        
        let gradeType = '고등/일반';
        if (m.age) {
            const ageNum = parseInt(m.age);
            if (ageNum < 14) gradeType = '초등';
            else if (ageNum < 17) gradeType = '중등';
            else gradeType = '고등/일반';
        } else {
            const school = m.school || '';
            const gradeStr = m.grade || '';
            if (school.includes('초등') || gradeStr.includes('초등') || gradeStr.includes('초')) {
                gradeType = '초등';
            } else if (school.includes('중학교') || school.includes('중등') || gradeStr.includes('중등') || gradeStr.includes('중')) {
                gradeType = '중등';
            } else if (school.includes('고등') || school.includes('고교') || gradeStr.includes('고등') || gradeStr.includes('고')) {
                gradeType = '고등/일반';
            } else if (m.type === 'general') {
                gradeType = '고등/일반';
            } else {
                gradeType = '고등/일반'; // Default
            }
        }
        
        if (gradeType === '고등/일반') adults++;
        else if (gradeType === '중등') students++;
        else children++;
    });
    console.log("SUCCESS!", {dashNewCount, dashLeaveCount, adults, students, children});
} catch(e) {
    console.error("ERROR", e);
}
