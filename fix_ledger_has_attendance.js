const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/shared_calc.js', 'utf8');

const target2 = `    // Ledger에서 강제로 설정된 날짜 병합
    ledgerDays.forEach(day => {
        const dateStr = \`\${targetYear}-\${String(targetMonth).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
        redDaysObj[dateStr] = true;
    });

    return { redDays: Object.keys(redDaysObj).sort(), hasAnyAttendance: hasAnyAttendance, isSimulated: false };`;

const replacement2 = `    // Ledger에서 강제로 설정된 날짜 병합
    ledgerDays.forEach(day => {
        const dateStr = \`\${targetYear}-\${String(targetMonth).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
        redDaysObj[dateStr] = true;
    });

    // Ledger 날짜가 있으면 화면에 렌더링되므로 hasAnyAttendance 취급하여 뱃지에 포함되도록 함
    const finalHasAttendance = hasAnyAttendance || ledgerDays.size > 0;

    return { redDays: Object.keys(redDaysObj).sort(), hasAnyAttendance: finalHasAttendance, isSimulated: false };`;

content = content.replace(target2, replacement2);

fs.writeFileSync('Sejong/SejongAttendance/public/shared_calc.js', content);

const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/shared_calc.js public/sejong/shared_calc.js');

