const fs = require('fs');
const html = fs.readFileSync('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/exam_management.html', 'utf8');
console.log("Script position in exam_management.html:", html.indexOf('<script>'));
console.log("Body end position in exam_management.html:", html.indexOf('</body>'));
