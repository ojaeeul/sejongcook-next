const fs = require('fs');
const file = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/kiosk_admin.js';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `            const isAttendedForCourse = todayAttendance.some(a => {
                if (String(a.memberId) !== String(m.id)) return false;
                const aCourse = a.course || 'ALL';
                return aCourse === 'ALL' || aCourse.includes(cName) || cName.includes(aCourse);
            });`;

const newStr = `            const isAttendedForCourse = todayAttendance.some(a => {
                if (String(a.memberId) !== String(m.id)) return false;
                const aCourse = String(a.course || 'ALL');
                const cNameStr = String(cName);
                return aCourse === 'ALL' || aCourse.includes(cNameStr) || cNameStr.includes(aCourse);
            });`;

content = content.replace(targetStr, newStr);

fs.writeFileSync(file, content, 'utf8');
console.log('Made attended check robust!');
