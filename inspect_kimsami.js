const fs = require('fs');
const path = require('./Sejong/SejongAttendance/public/data/members.json');
const tDataPath = require('./Sejong/SejongAttendance/public/data/tuition.json');
const sDataPath = require('./Sejong/SejongAttendance/public/data/schedules.json');

const members = JSON.parse(fs.readFileSync('./Sejong/SejongAttendance/public/data/members.json'));
const tuitionData = JSON.parse(fs.readFileSync('./Sejong/SejongAttendance/public/data/tuition.json'));
const schedules = JSON.parse(fs.readFileSync('./Sejong/SejongAttendance/public/data/schedules.json'));

const tYear = 2026;
const tMonth = 6;

const m = members.find(m => m.name === '김삼이');
if (m) {
    console.log("Found Kim Sam-i");
    const c = "제과제빵기능사(10:00)";
    
    let allTimeline = [];
    if (m.attendances) {
        m.attendances.forEach(a => {
            let aDate = new Date(a.date);
            if (aDate.getFullYear() < tYear || (aDate.getFullYear() === tYear && (aDate.getMonth() + 1) <= tMonth)) {
                if (!a.status.includes('결석') && (!c || !a.course || a.course.includes(c.split('(')[0].trim()))) {
                    allTimeline.push({ date: aDate, type: 'real' });
                }
            }
        });
    }
    if (schedules.simulatedAttendances) {
        schedules.simulatedAttendances.forEach(sa => {
            if (sa.name === m.name && (sa.year < tYear || (sa.year === tYear && sa.month <= tMonth))) {
                if (!sa.course || sa.course.includes(c) || c.includes(sa.course)) {
                    allTimeline.push({ date: new Date(sa.year, sa.month - 1, sa.day), type: 'sim' });
                }
            }
        });
    }
    allTimeline.sort((a, b) => a.date - b.date);
    
    let currentMonthBoxes = [];
    allTimeline.forEach((box, idx) => {
        let attendanceIndex = idx + 1;
        
        if (box.date.getFullYear() === tYear && (box.date.getMonth() + 1) === tMonth) {
            box.attIdx = attendanceIndex;
            currentMonthBoxes.push(box);
        }
    });

    const paidThisMonth = (tuitionData || []).filter(p => p.memberId === m.id && p.year === tYear && p.month === tMonth && (!c || !p.course || p.course.includes(c.split('(')[0].trim())));
    const virtualPaymentsThisMonth = (schedules.milestones || []).filter(ms => ms.year === tYear && ms.month === tMonth);

    currentMonthBoxes.forEach(box => {
        box.isRealPayment = paidThisMonth.some(p => new Date(p.updatedAt || p.date).getDate() === box.date.getDate());
        box.isVirtualPayment = virtualPaymentsThisMonth.some(ms => ms.day === box.date.getDate());
    });
    
    console.log("Current Month Boxes for Kim Sam-i Baking:");
    currentMonthBoxes.forEach(b => console.log(`Day: ${b.date.getDate()}, Type: ${b.type}, RealPay: ${b.isRealPayment}, VirtPay: ${b.isVirtualPayment}, AttIdx: ${b.attIdx}`));
    
    let trigger = 9;
    let limit = 9;
    let validCutoffs = [];
    for (let i = 0; i < 100; i++) {
        validCutoffs.push(Math.round((trigger + limit * i) * 10) / 10);
    }
    
    let firstMarkerIdx = -1;
    for (let i = 0; i < currentMonthBoxes.length; i++) {
        let isCutoff = validCutoffs.includes(currentMonthBoxes[i].attIdx);
        if (currentMonthBoxes[i].isRealPayment || currentMonthBoxes[i].isVirtualPayment || isCutoff) {
            firstMarkerIdx = i;
            break;
        }
    }
    
    console.log("First Marker Idx:", firstMarkerIdx);
    if (firstMarkerIdx !== -1) {
        console.log("Calculated displayP:", currentMonthBoxes.length - firstMarkerIdx);
    } else {
        console.log("Calculated displayP: fallback math");
    }
}
