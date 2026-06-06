const fs = require('fs');
const ledger = fs.readFileSync('Sejong/SejongAttendance/public/ledger.js', 'utf-8');
const tuition = fs.readFileSync('Sejong/SejongAttendance/public/tuition_v3.js', 'utf-8');

const lMatch = ledger.match(/for \(const r of memberRecords\) \{([\s\S]*?)let prevCycle = getCycle\(prevNet/);
const tMatch = tuition.match(/for \(const r of memberRecords\) \{([\s\S]*?)const prevCycle = getCycle\(prevNet/);

console.log("LEDGER:");
console.log(lMatch ? lMatch[1] : 'Not found');
console.log("\nTUITION:");
console.log(tMatch ? tMatch[1] : 'Not found');
