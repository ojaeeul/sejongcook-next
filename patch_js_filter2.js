const fs = require('fs');
const file = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/kiosk_admin.js';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `        courses.forEach(cName => {
            const isAttendedForCourse = todayAttendance.some(a => {`;

const newStr = `        courses.forEach(cName => {
            const courseFilterVal = document.getElementById('courseFilter') ? document.getElementById('courseFilter').value : 'ALL';
            if (courseFilterVal !== 'ALL' && cName !== courseFilterVal) return;
            
            const isAttendedForCourse = todayAttendance.some(a => {`;

content = content.replace(targetStr, newStr);

fs.writeFileSync(file, content, 'utf8');
console.log('Patched courseRowsHtml visibility!');
