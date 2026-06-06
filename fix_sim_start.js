const fs = require('fs');
let content = fs.readFileSync('public/sejong/tuition_v3.js', 'utf8');

content = content.replace('simDate = new Date(year, month - 1, 1);', 'simDate = new Date(year, month - 2, 1);');

fs.writeFileSync('public/sejong/tuition_v3.js', content, 'utf8');
fs.writeFileSync('Sejong/public/tuition_v3.js', content, 'utf8');
console.log("Fixed sim start date");
