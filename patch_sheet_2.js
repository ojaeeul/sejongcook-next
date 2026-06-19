const fs = require('fs');
const file = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/sheet.html';
let content = fs.readFileSync(file, 'utf8');

let search = `function getSheetSimulatedScheduledDate(memberId, year, month, courseFilter = null) {
            if (!attendanceData) return { scheduledDays: [], isSimulated: false, hasAnyAttendance: false };
            let memberRecords = attendanceData.filter(a => String(a.memberId) === String(memberId));`;

let replace = `function getSheetSimulatedScheduledDate(memberId, year, month, courseFilter = null) {
            if (!attendanceData) return { scheduledDays: [], isSimulated: false, hasAnyAttendance: false };
            const member = window.membersData ? window.membersData.find(m => String(m.id) === String(memberId)) : undefined;
            let memberRecords = attendanceData.filter(a => String(a.memberId) === String(memberId));`;

content = content.replace(search, replace);
fs.writeFileSync(file, content);
