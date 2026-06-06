const fs = require('fs');

const ledger = fs.readFileSync('Sejong/SejongAttendance/public/ledger.js', 'utf-8');
const tuition = fs.readFileSync('Sejong/SejongAttendance/public/tuition_v3.js', 'utf-8');

const ledgerSim = ledger.substring(ledger.indexOf('if (!hitTargetInMonth && hasAnyAttendance) {'), ledger.indexOf('simDate.setDate(simDate.getDate() + 1);') + 45);
const tuitionSim = tuition.substring(tuition.indexOf('if (!eighthDay) {'), tuition.indexOf('simDate.setDate(simDate.getDate() + 1);') + 45);

fs.writeFileSync('ledger_sim.txt', ledgerSim);
fs.writeFileSync('tuition_sim.txt', tuitionSim);
