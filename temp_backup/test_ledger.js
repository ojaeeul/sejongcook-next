const fs = require('fs');
const membersData = JSON.parse(fs.readFileSync('./data/sejong/members.json', 'utf8'));
const attendanceData = JSON.parse(fs.readFileSync('./data/sejong/attendance.json', 'utf8'));

// find user in 제과제빵
const testMember = membersData.find(m => m.course && m.course.includes('제과제빵'));
if (!testMember) {
    console.log("No bakery student found");
    process.exit();
}
console.log(`Found: ${testMember.name} (ID: ${testMember.id}), Course: ${testMember.course}`);

// let's mirror getLedgerMonthStats
let memberRecords = attendanceData.filter(a => a.memberId === testMember.id);
memberRecords.sort((a, b) => new Date(a.date) - new Date(b.date));

function simulate(month) {
    let eighthDay = null;
    let rollingTotal = 0;
    const incAmount = 0.5;
    let lastRecordDate = null;
    let year = 2026;

    for (const r of memberRecords) {
        if (!r.course) continue;
        const rCourse = r.course.split('(')[0].trim();
        const fCourse = '제과제빵기능사';
        if (rCourse !== fCourse && !rCourse.includes('제과제빵')) continue;

        let dateObj = new Date(r.date);
        let yearNum = dateObj.getFullYear();
        let monthNum = dateObj.getMonth() + 1;

        if (yearNum < year || (yearNum === year && monthNum < month)) {
            rollingTotal += incAmount;
            lastRecordDate = dateObj;
        } else if (yearNum === year && monthNum === month) {
            const prevRolling = rollingTotal;
            rollingTotal += incAmount;
            lastRecordDate = dateObj;
            if (Math.floor((prevRolling - 0.001) / 8) < Math.floor((rollingTotal - 0.001) / 8)) {
                eighthDay = dateObj.getDate();
                console.log(`[${month}월] Actual log hit! date: ${dateObj}, rolling: ${rollingTotal}`);
            }
        }
    }

    console.log(`[${month}월] After logs: rollingTotal=${rollingTotal}, eighthDay=${eighthDay}`);
}

simulate(2);
simulate(3);
