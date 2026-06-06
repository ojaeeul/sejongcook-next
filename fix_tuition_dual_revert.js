const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/tuition_v3.js', 'utf8');

content = content.replace('const prevCycle = getCycle(prevNet, isDualBakeryRecord);', 'const prevCycle = getCycle(prevNet, isDualBakery);');
content = content.replace('const currCycle = getCycle(currNet, isDualBakeryRecord);', 'const currCycle = getCycle(currNet, isDualBakery);');

fs.writeFileSync('Sejong/SejongAttendance/public/tuition_v3.js', content, 'utf8');
console.log("Reverted isDualBakeryRecord to isDualBakery in tuition_v3.js");
