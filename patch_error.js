const fs = require('fs');
const file = 'Sejong/SejongAttendance/public/sheet.html';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /alert\('저장 실패 \(Network Error\)'\);/g,
    "alert('저장 실패: ' + e.message + ' \\n' + e.stack);"
);

fs.writeFileSync(file, content);
