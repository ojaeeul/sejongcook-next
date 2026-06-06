const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/tuition_v3.js', 'utf8');

content = content.replace('const prevCycle = getCycle(prevNet, isDualBakery);', 'const prevCycle = getCycle(prevNet, isDualBakeryRecord);');
content = content.replace('const currCycle = getCycle(currNet, isDualBakery);', 'const currCycle = getCycle(currNet, isDualBakeryRecord);');

fs.writeFileSync('Sejong/SejongAttendance/public/tuition_v3.js', content, 'utf8');
console.log("Fixed isDualBakeryRecord");
