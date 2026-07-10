const fs = require('fs');
const data = JSON.parse(fs.readFileSync('questions_data.json', 'utf-8'));
const examKey = '과거기출_한식조리기능사20070916(교사용).hwp';
const qInfo = data[examKey][0];
console.log(qInfo.o.length);
