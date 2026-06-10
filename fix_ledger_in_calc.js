const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/shared_calc.js', 'utf8');

const target = `    let monthsToCalc = [];
    let safetyCounter = 0;`;

const replacement = `    // [신규] 납부대장(ledger) 데이터도 결재일에 포함
    const ledgerDays = new Set();
    if (member.ledger && Array.isArray(member.ledger)) {
        member.ledger.forEach(l => {
            if (Number(l.year) === Number(targetYear) && Number(l.month) === Number(targetMonth)) {
                ledgerDays.add(Number(l.day));
            }
        });
    }

    let monthsToCalc = [];
    let safetyCounter = 0;`;

content = content.replace(target, replacement);

const target2 = `    return { redDays: Object.keys(redDaysObj).sort(), hasAnyAttendance: hasAnyAttendance, isSimulated: false };`;

const replacement2 = `    // Ledger에서 강제로 설정된 날짜 병합
    ledgerDays.forEach(day => {
        const dateStr = \`\${targetYear}-\${String(targetMonth).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
        redDaysObj[dateStr] = true;
    });

    return { redDays: Object.keys(redDaysObj).sort(), hasAnyAttendance: hasAnyAttendance, isSimulated: false };`;

content = content.replace(target2, replacement2);

fs.writeFileSync('Sejong/SejongAttendance/public/shared_calc.js', content);

const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/shared_calc.js public/sejong/shared_calc.js');

