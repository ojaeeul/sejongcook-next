const fs = require('fs');
const file = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/sheet.html';
let content = fs.readFileSync(file, 'utf8');

let search = `function calculateGlobalCarryOver(memberId, targetYear, targetMonth, targetDay, cutoffOverrides = {}, attendanceCutoffs = {}, courseFilter = null) {
            const mIdStr = String(memberId);`;

let replace = `function calculateGlobalCarryOver(memberId, targetYear, targetMonth, targetDay, cutoffOverrides = {}, attendanceCutoffs = {}, courseFilter = null) {
            const mIdStr = String(memberId);
            const m = window.membersData ? window.membersData.find(x => String(x.id) === mIdStr) : undefined;`;

content = content.replace(search, replace);
fs.writeFileSync(file, content);
