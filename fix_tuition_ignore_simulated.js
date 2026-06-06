const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/tuition_v3.js', 'utf8');

const target = `            if (rawSyncSim && rawSyncSim.length > 0) {
                const simDay = Array.isArray(rawSyncSim) ? rawSyncSim[0] : rawSyncSim;
                return { type: 'sim', dayObj: { year: y, month: m, day: simDay }, source: 'sync' };
            }`;

const replacement = `            // User requested parity with ledger.js: ignore _simulated from sejong_ledger_sync entirely
            /* if (rawSyncSim && rawSyncSim.length > 0) {
                const simDay = Array.isArray(rawSyncSim) ? rawSyncSim[0] : rawSyncSim;
                return { type: 'sim', dayObj: { year: y, month: m, day: simDay }, source: 'sync' };
            } */`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('Sejong/SejongAttendance/public/tuition_v3.js', content, 'utf8');
    console.log("Fixed tuition_v3.js to ignore _simulated");
} else {
    console.log("Target not found!");
}
