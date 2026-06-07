const fs = require('fs');

global.window = global;
const sharedCalcCode = fs.readFileSync('public/sejong/shared_calc.js', 'utf8');
const smsCode = fs.readFileSync('temp_getMember.js', 'utf8');

eval(sharedCalcCode);

// Inject a console log into getMemberAllMilestones
let modifiedSmsCode = smsCode.replace(
    /const result = window\.calculateRedBoxesForMonth.*/,
    `const result = window.calculateRedBoxesForMonth(memberObj, y, m, attendanceData || [], courseFilter, GLOBAL_DATA_ADJUSTMENTS);
     console.log("inner calculate for", y, m, "returned", result);`
);
eval(modifiedSmsCode);

async function run() {
    const API_BASE = 'http://localhost:3000/api/sejong';
    
    const [membersRes, attendanceRes, settingsRes] = await Promise.all([
        fetch(`${API_BASE}/members`).then(r => r.json()),
        fetch(`${API_BASE}/attendance`).then(r => r.json()),
        fetch(`${API_BASE}/settings`).then(r => r.json())
    ]);

    global.allMembers = Array.isArray(membersRes) ? membersRes.filter(m => !['trash', 'delete', 'completed', 'archive', 'hold'].includes(m.status)) : [];
    global.attendanceData = Array.isArray(attendanceRes) ? attendanceRes : [];
    
    global.GLOBAL_DATA_ADJUSTMENTS = {};
    const settingsArr = Array.isArray(settingsRes) ? settingsRes : [];
    const adjEntry = settingsArr.find(s => s.id === 'ledger_adjustments');
    if (adjEntry && adjEntry.data) {
        try {
            global.GLOBAL_DATA_ADJUSTMENTS = JSON.parse(adjEntry.data);
        } catch(e) {}
    }

    const mObj = global.allMembers.find(m => m.name === '오재을');
    const course = String(mObj.course).split(',').map(c => c.trim()).filter(Boolean)[0];
    
    console.log("Calling getMemberAllMilestones for", mObj.name, course);
    const ms = getMemberAllMilestones(mObj.id, course, 2026, 1);
    console.log("Result:", ms);
}
run().catch(e => console.error(e));
