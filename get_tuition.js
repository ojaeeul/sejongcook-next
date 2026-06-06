const fs = require('fs');
const tuition = fs.readFileSync('Sejong/SejongAttendance/public/tuition_v3.js', 'utf-8');
const lines = tuition.split('\n');
lines.forEach((l, i) => {
    if(l.includes('sejong_ledger_sync')) {
        console.log("LINE " + (i+1) + ": " + l);
    }
});
