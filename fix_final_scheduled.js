const fs = require('fs');
let content = fs.readFileSync('public/sejong/tuition_v3.js', 'utf8');

content = content.replace('let finalScheduledDate = eighthDay || nextEighthDay;', 'let finalScheduledDate = eighthDay; // User request: strict parity with ledger.js (hide next month)');

fs.writeFileSync('public/sejong/tuition_v3.js', content, 'utf8');
fs.writeFileSync('Sejong/public/tuition_v3.js', content, 'utf8');
console.log("Fixed finalScheduledDate to exclude nextEighthDay");
