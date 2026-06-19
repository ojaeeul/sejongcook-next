const fs = require('fs');
const file = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/sheet.html';
let content = fs.readFileSync(file, 'utf8');

let search = `let limits = window.getCourseLimits(effectiveCourseName);`;
let replace = `let limits = window.getCourseLimits(effectiveCourseName, typeof m !== 'undefined' ? m.type : undefined);`;
content = content.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);

fs.writeFileSync(file, content);
