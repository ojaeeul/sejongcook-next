const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');

// 1. Completely strip out the local calculate function loop from renderMonthlyRedBoxPanel
const renderFuncStart = content.indexOf('function renderMonthlyRedBoxPanel');
const badgesHtmlStart = content.indexOf('let badgesHtml = `', renderFuncStart);

if (renderFuncStart !== -1 && badgesHtmlStart !== -1) {
    const originalBody = content.substring(renderFuncStart, badgesHtmlStart);
    
    // We replace everything between 'const monthCounts = ...' and the `if (displayMonth >= 1 ...)` block
    const simpleBody = `function renderMonthlyRedBoxPanel(filteredRows, targetYear, displayMonth, displayCountValue) {
            const monthCounts = {1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0, 11:0, 12:0};
            
            // [원장님 특별 요청] 뱃지 전용 별도 계산 코드(calculateLocalRedBoxesForMonth)를 전면 폐기하고,
            // 오직 실제 그리드(출석표) 화면에 찍혀있는 "결재일 건수(redBoxOccurrences)"만 100% 신뢰하여 표시합니다.
            
            if (displayMonth >= 1 && displayMonth <= 12 && displayCountValue !== null) {
                monthCounts[displayMonth] = displayCountValue;
            }

            const panel = document.getElementById('monthlyRedBoxPanel');
            if (!panel) return;

            `;
            
    content = content.substring(0, renderFuncStart) + simpleBody + content.substring(badgesHtmlStart);
}

// 2. Hide any month that has 0 counts and is not explicitly selected
const loopStart = content.indexOf('for (let month = 1; month <= 12; month++) {', badgesHtmlStart);
const loopEnd = content.indexOf('badgesHtml += `</div>`;', loopStart);

if (loopStart !== -1 && loopEnd !== -1) {
    const newLoop = `for (let month = 1; month <= 12; month++) {
                const count = monthCounts[month];
                const isSelected = window.activeMonthBadgeFilter === month;
                
                // [요청 반영] 결재일 건수가 0건인 달은 아예 숨김 처리
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

content = content.replace(/v=202606111040/g, 'v=202606111050');
fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', content);
const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/sheet.html public/sejong/sheet.html');
