const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');

// 1. Remove simulation block from calculateLocalRedBoxesForMonth
// Using a robust replace mechanism that only affects calculateLocalRedBoxesForMonth
const calcStart = content.indexOf('window.calculateLocalRedBoxesForMonth = function');
const calcEnd = content.indexOf('return {', calcStart);

if (calcStart !== -1 && calcEnd !== -1) {
    let calcBody = content.substring(calcStart, calcEnd);
    const simBlockStart = calcBody.indexOf('let isSimulated = false;');
    const ledgerStart = calcBody.indexOf('const ledgerDays = new Set();');
    
    if (simBlockStart !== -1 && ledgerStart !== -1) {
        calcBody = calcBody.substring(0, simBlockStart) + 
                   'let isSimulated = false;\n            ' + 
                   calcBody.substring(ledgerStart);
                   
        content = content.substring(0, calcStart) + calcBody + content.substring(calcEnd);
    }
}

// 2. Hide 0-count months in the second loop only
const renderFuncStart = content.indexOf('function renderMonthlyRedBoxPanel');
const badgesHtmlStart = content.indexOf('let badgesHtml = `', renderFuncStart);
const loopStart = content.indexOf('for (let month = 1; month <= 12; month++) {', badgesHtmlStart);
const loopEnd = content.indexOf('badgesHtml += `</div>`;', loopStart);

if (loopStart !== -1 && loopEnd !== -1) {
    const originalLoop = content.substring(loopStart, loopEnd);
    const newLoop = `for (let month = 1; month <= 12; month++) {
                const count = monthCounts[month];
                const isSelected = window.activeMonthBadgeFilter === month;
                
                // [요청 반영] 결재일(count)이 0건인 월은 아예 숨김 처리
                if (count === 0 && !isSelected) {
                    continue;
                }

                const displayCount = count > 0 ? \`<span style="background:#2563eb; color:white; border-radius:12px; padding:2px 7px; font-size:0.7rem; font-weight:bold; margin-left:4px;">\${count}</span>\` : '';
                const borderStyle = count > 0 ? 'border:1px solid #93c5fd; background:#eff6ff;' : 'border:1px solid #cbd5e1; background:#fff;';
                const textStyle = count > 0 ? 'color:#1e3a8a;' : 'color:#475569;';
                
                const finalBorderStyle = isSelected ? 'border:2px solid #ef4444; background:#fee2e2; cursor:pointer;' : (count > 0 ? borderStyle + ' cursor:pointer; hover:bg-blue-50;' : borderStyle);
                
                badgesHtml += \`
                    <div onclick="if (\${count} > 0 || \${isSelected}) window.toggleBadgeFilter(\${month})" style="display:flex; align-items:center; padding:3px 10px; border-radius:20px; font-size:0.8rem; font-weight:700; margin-right:2px; \${finalBorderStyle} \${textStyle}; transition: all 0.2s;">
                        <span>\${month}월</span>
                        \${displayCount}
                    </div>
                \`;
            }\n            `;
    content = content.substring(0, loopStart) + newLoop + content.substring(loopEnd);
}

// 3. Remove hasAnyAttendance from condition
const conditionRegex = /if \(result && result\.redDays && result\.redDays\.length > 0 && result\.hasAnyAttendance\) \{/g;
content = content.replace(conditionRegex, 'if (result && result.redDays && result.redDays.length > 0) {');

content = content.replace(/v=202606111020/g, 'v=202606111040');

fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', content);
const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/sheet.html public/sejong/sheet.html');
