const fs = require('fs');

global.window = global;
const sharedCalcCode = fs.readFileSync('public/sejong/shared_calc.js', 'utf8');
eval(sharedCalcCode);

async function run() {
    const API_BASE = 'http://localhost:3000/api/sejong';
    
    const [membersRes, attendanceRes, settingsRes] = await Promise.all([
        fetch(`${API_BASE}/members`).then(r => r.json()),
        fetch(`${API_BASE}/attendance`).then(r => r.json()),
        fetch(`${API_BASE}/settings`).then(r => r.json())
    ]);

    const allMembers = Array.isArray(membersRes) ? membersRes.filter(m => !['trash', 'delete', 'completed', 'archive', 'hold'].includes(m.status)) : [];
    const attendanceData = Array.isArray(attendanceRes) ? attendanceRes : [];
    
    let GLOBAL_DATA_ADJUSTMENTS = {};
    const settingsArr = Array.isArray(settingsRes) ? settingsRes : [];
    const adjEntry = settingsArr.find(s => s.id === 'ledger_adjustments');
    if (adjEntry && adjEntry.data) {
        try {
            GLOBAL_DATA_ADJUSTMENTS = JSON.parse(adjEntry.data);
        } catch(e) {}
    }

    const y = 2026;
    const m = 1;

    for (const mObj of allMembers) {
        if (!mObj.course) continue;
        const courses = String(mObj.course).split(',').map(c => c.trim()).filter(Boolean);
        for (const c of courses) {
            try {
                // simulate the +/- 2 months loop
                for (let monthOffset = -2; monthOffset <= 2; monthOffset++) {
                    let iterY = y;
                    let iterM = m + monthOffset;
                    if (iterM > 12) { iterM -= 12; iterY++; }
                    if (iterM < 1) { iterM += 12; iterY--; }
                    
                    window.calculateRedBoxesForMonth(mObj, iterY, iterM, attendanceData, c, GLOBAL_DATA_ADJUSTMENTS);
                }
            } catch(e) {
                console.error(`ERROR for member ${mObj.name} (${mObj.id}), course ${c}:`, e.message);
            }
        }
    }
    console.log("Debug check finished.");
}
run().catch(e => console.error(e));
