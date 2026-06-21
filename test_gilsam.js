const fs = require('fs');

const dataPath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/data.json';
if (!fs.existsSync(dataPath)) {
    console.log("No data.json");
    process.exit(1);
}
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

let target = null;
data.forEach(d => {
    if (d.name === '길삼이' && d.course && d.course.includes('일식기능사')) {
        target = d;
    }
});

if (target) {
    let runningTotal = 0;
    target.attendances.forEach(a => {
        if (!a.status.includes('결석')) {
            runningTotal += 1;
        }
    });
    console.log(`runningTotal: ${runningTotal}`);
    
    let cycleCount = Math.floor((runningTotal - 1) / 9); // wait, old logic
    // Let's use the actual getCycle logic
    // ...
}
