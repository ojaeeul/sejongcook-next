const fs = require('fs');

global.window = global;
global.allMembers = [
    { id: 1, name: 'Test User', course: '제과기능사' }
];
global.holidaysData = [];
global.attendanceData = [];
global.paymentsData = [];
global.GLOBAL_DATA_ADJUSTMENTS = {};

const sharedCalcCode = fs.readFileSync('public/sejong/shared_calc.js', 'utf8');
const smsCode = fs.readFileSync('public/sejong/sms_v3.js', 'utf8');

eval(sharedCalcCode);

// Extract getMemberAllMilestones
const match = smsCode.match(/function getMemberAllMilestones[\s\S]*?^}/m);
if (match) {
    eval(match[0]);
    console.log("getMemberAllMilestones defined.");
    try {
        const milestones = getMemberAllMilestones(1, '제과기능사', 2026, 8);
        console.log("Milestones:", milestones);
    } catch(e) {
        console.log("ERROR in getMemberAllMilestones:", e.message, e.stack);
    }
} else {
    console.log("Could not find getMemberAllMilestones");
}
