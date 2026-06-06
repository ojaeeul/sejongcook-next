const fs = require('fs');
let content = fs.readFileSync('public/sejong/tuition.html', 'utf8');

content = content.replace(/tuition_v3\.js(?:\?v=\d+)?/g, 'tuition_v3.js?v=' + Date.now());

fs.writeFileSync('public/sejong/tuition.html', content, 'utf8');
fs.writeFileSync('Sejong/public/tuition.html', content, 'utf8');
fs.writeFileSync('Sejong/SejongAttendance/public/tuition.html', content, 'utf8');
console.log("Forced cache bust on tuition.html");
