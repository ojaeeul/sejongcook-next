const fs = require('fs');

const m = {
  "id": "1770517693101",
  "name": "을",
  "course": "양식기능사(10:00), 제과제빵기능사(17:00)",
  "registeredDate": "2026-02-08"
};

const attendanceData = JSON.parse(fs.readFileSync('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/data/attendance.json', 'utf8'));

// If sheetFilter = '양식기능사'
const rowCourseNameScope = "양식기능사";
const isDualCourse = rowCourseNameScope && rowCourseNameScope.includes('제과제빵');
const attendanceIncrement = isDualCourse ? 0.5 : 1;

let mLogs = attendanceData.filter(l => {
    if (String(l.memberId) !== m.id) return false;
    if (!l.course) return true; 
    
    const lCourseClean = l.course.replace(/\([^)]*\)/g, '').trim();
    const rCourseClean = rowCourseNameScope.replace(/\([^)]*\)/g, '').trim();
    return lCourseClean === rCourseClean;
});

// Logs for Eul in Yangsik:
console.log("Filtered Logs for Eul in Yangsik:");
console.log(mLogs.filter(l => l.date.includes('2026-01')));

const rowCourseNameScope2 = "제과제빵기능사";
let mLogs2 = attendanceData.filter(l => {
    if (String(l.memberId) !== m.id) return false;
    if (!l.course) return true; 
    
    const lCourseClean = l.course.replace(/\([^)]*\)/g, '').trim();
    const rCourseClean = rowCourseNameScope2.replace(/\([^)]*\)/g, '').trim();
    return lCourseClean === rCourseClean;
});
console.log("Filtered Logs for Eul in Jegwa:");
console.log(mLogs2.filter(l => l.date.includes('2026-01')));
