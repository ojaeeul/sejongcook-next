const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/shared_calc.js', 'utf8');

const match = content.match(/parseFloat/g);
console.log(match);
