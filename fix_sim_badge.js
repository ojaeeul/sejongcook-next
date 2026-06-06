const fs = require('fs');
let content = fs.readFileSync('public/sejong/tuition_v3.js', 'utf8');

content = content.replace('eighthDay = { year, month, day: foundSimulatedDay };', 'eighthDay = { year, month, day: foundSimulatedDay, isSimulated: true };');

fs.writeFileSync('public/sejong/tuition_v3.js', content, 'utf8');
fs.writeFileSync('Sejong/public/tuition_v3.js', content, 'utf8');
console.log("Fixed isSimulated flag");
