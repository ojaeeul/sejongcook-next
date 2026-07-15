const fs = require('fs');

const examsData = JSON.parse(fs.readFileSync('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/exam_data.json', 'utf-8'));

const recordsByDay = {};
examsData.forEach(r => {
    const timeField = r.submitTime || r.startTime;
    if (!timeField) return;
    
    const dateStr = timeField.split('T')[0];
    
    if (!recordsByDay[dateStr]) recordsByDay[dateStr] = [];
    recordsByDay[dateStr].push(r);
});

console.log("Records for 2026-07-10:", recordsByDay['2026-07-10'] ? recordsByDay['2026-07-10'].length : 0);
console.log("Records for 2026-07-13:", recordsByDay['2026-07-13'] ? recordsByDay['2026-07-13'].length : 0);
