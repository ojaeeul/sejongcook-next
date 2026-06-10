const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/shared_calc.js', 'utf8');

const target = `    const actualRedDays = Array.from(redBoxDates).map(d => parseInt(d.split('-')[2], 10));
    
    return {
        redDays: actualRedDays,
        hasAnyAttendance: hasAnyAttendance,`;

const replacement = `    // [HOTFIX] Ledger 날짜 병합
    if (typeof ledgerDays !== 'undefined' && ledgerDays.size > 0) {
        ledgerDays.forEach(day => {
            const dateStr = \`\${targetYear}-\${String(targetMonth).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
            redBoxDates.add(dateStr);
        });
        hasAnyAttendance = true; // Ledger가 있으면 뱃지에 표시되어야 하므로 출석이 있는 것으로 간주
    }

    const actualRedDays = Array.from(redBoxDates).map(d => parseInt(d.split('-')[2], 10));
    
    return {
        redDays: actualRedDays,
        hasAnyAttendance: hasAnyAttendance,`;

content = content.replace(target, replacement);
fs.writeFileSync('Sejong/SejongAttendance/public/shared_calc.js', content);

const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/shared_calc.js public/sejong/shared_calc.js');
