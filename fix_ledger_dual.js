const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/ledger.js', 'utf8');

// Add global isDualBakery for getLedgerMonthStats
content = content.replace('const getCycle = (val, isDual) => {', 
    'const isDualBakeryGlobal = (courseFilter && courseFilter.replace(/\\s/g, "").includes("제과제빵")) || (!courseFilter && membersData.find(m => String(m.id) === String(memberId))?.course?.replace(/\\s/g, "").includes("제과제빵"));\n    const getCycle = (val, isDual) => {');

// Replace isDualBakeryRecord with isDualBakeryGlobal for getCycle calls
content = content.replace('if (getCycle(currNet, isDualBakeryRecord) > getCycle(prevNet, isDualBakeryRecord)', 'if (getCycle(currNet, isDualBakeryGlobal) > getCycle(prevNet, isDualBakeryGlobal)');
content = content.replace('let prevCycle = getCycle(prevNet, isDualBakeryRecord);', 'let prevCycle = getCycle(prevNet, isDualBakeryGlobal);');
content = content.replace('let currCycle = getCycle(currNet, isDualBakeryRecord);', 'let currCycle = getCycle(currNet, isDualBakeryGlobal);');

fs.writeFileSync('Sejong/SejongAttendance/public/ledger.js', content, 'utf8');
console.log("Fixed ledger.js to use global cycle");
