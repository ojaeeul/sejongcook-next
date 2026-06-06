const fs = require('fs');
const file = 'public/sejong/sms_v3.js';
let content = fs.readFileSync(file, 'utf8');

// Fix getMemberAllMilestones
content = content.replace(
    /function getMemberAllMilestones\(memberId, courseFilter, limitDate = null\) {\n    let milestones = \[\];\n    const today = new Date\(\);\n    const currentYear = today\.getFullYear\(\);\n    const currentMonth = today\.getMonth\(\) \+ 1;/,
    `function getMemberAllMilestones(memberId, courseFilter, anchorYear = null, anchorMonth = null) {
    let milestones = [];
    const today = new Date();
    const currentYear = anchorYear !== null ? anchorYear : today.getFullYear();
    const currentMonth = anchorMonth !== null ? anchorMonth : today.getMonth() + 1;`
);

// Fix getAllMilestonesForRange
content = content.replace(
    /const allDue = getMemberAllMilestones\(memberId, courseFilter\);/,
    `const allDue = getMemberAllMilestones(memberId, courseFilter, startRange.getFullYear(), startRange.getMonth() + 1);`
);

// Add bold styling to the day number
content = content.replace(
    /if \(paymentNamesByDay\[i\] && paymentNamesByDay\[i\]\.length > 0\) {/,
    `if (paymentNamesByDay[i] && paymentNamesByDay[i].length > 0) {
            d.style.fontWeight = '800';
            d.style.color = '#ef4444'; // Make the day number red as well`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Patch complete.');
