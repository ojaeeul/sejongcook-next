const fs = require('fs');
const file = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/sheet.html';
let content = fs.readFileSync(file, 'utf8');

// The member object in sheet.html is often accessible. Let's see how `getCycle` is defined.
// At line 1694:
// const getCycle = (val) => {
//     let vRaw = Math.round(val * 10);
//     let limits = window.getCourseLimits(courseFilter || "");

let search1 = `let limits = window.getCourseLimits(courseFilter || "");`;
let replace1 = `// member 객체가 scope에 있다면 type을 넘김
                let limits = window.getCourseLimits(courseFilter || "", typeof member !== 'undefined' ? member.type : undefined);`;
content = content.replace(search1, replace1);

let search2 = `let limits = window.getCourseLimits(effectiveCourseName);`;
let replace2 = `let limits = window.getCourseLimits(effectiveCourseName, typeof m !== 'undefined' ? m.type : (typeof member !== 'undefined' ? member.type : undefined));`;
content = content.replace(new RegExp(search2.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&'), 'g'), replace2);

fs.writeFileSync(file, content);
