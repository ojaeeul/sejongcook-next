const fs = require('fs');
const ledger = fs.readFileSync('Sejong/SejongAttendance/public/ledger.js', 'utf-8');

const match = ledger.match(/for \(const r of memberRecords\) \{([\s\S]*?)const prevCycle/);
console.log(match ? match[1] : 'Not found');
