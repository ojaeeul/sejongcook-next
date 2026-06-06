const fs = require('fs');
const payments = JSON.parse(fs.readFileSync('./data/payments.json', 'utf8'));
const enrolledMay = payments.filter(p => p.month == 5 && p.status == 'enrolled');
console.log("Enrolled in May:", enrolledMay);
