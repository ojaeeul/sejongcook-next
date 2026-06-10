const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');

const renderFuncStart = content.indexOf('function renderMonthlyRedBoxPanel(filteredRows, targetYear, displayMonth, displayCountValue) {');
const badgesHtmlStart = content.indexOf('let badgesHtml = `', renderFuncStart);
const renderFuncEnd = content.indexOf('panel.innerHTML = badgesHtml;', renderFuncStart) + 'panel.innerHTML = badgesHtml;\n        }'.length;

if (renderFuncStart !== -1 && badgesHtmlStart !== -1 && renderFuncEnd !== -1) {
    const newRenderFunc = `function renderMonthlyRedBoxPanel(filteredRows, targetYear, displayMonth, displayCountValue) {
            const panel = document.getElementById('monthlyRedBoxPanel');
            if (!panel) return;

            let badgesHtml = \`
                <div style="display:flex; gap:6px; flex-wrap:wrap; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:6px 14px; align-items:center;">
                    <span style="font-size:0.75rem; font-weight:700; color:#64748b; white-space:nowrap; margin-right:8px;">
                        <span class="material-icons" style="font-size:0.9rem; vertical-align:middle; margin-right:2px;">calendar_month</span>
                        수강생결재일 미리보기
                    </span>
            \`;

            // 3달씩 미리보기 (현재 월, 다음 월, 다다음 월)
            let monthsToCheck = [];
            for (let i = 0; i < 3; i++) {
                let m = displayMonth + i;
                let y = targetYear;
                if (m > 12) {
                    m -= 12;
                    y += 1;
                }
                monthsToCheck.push({ month: m, year: y });
            }

            monthsToCheck.forEach(({month, year}, index) => {
                let count = 0;
                
                // 첫번째 달(현재 화면에 표시중인 달)은 하단의 결재일 건수(displayCountValue)를 그대로 100% 반영하여 불일치 원천 차단
                if (index === 0 && displayCountValue !== null) {
                    count = displayCountValue;
                } else {
                    // 미래의 달(2, 3번째 달)은 현재 화면의 필터조건(filteredRows)을 그대로 유지한 채로 계산
                    if (typeof window.calculateLocalRedBoxesForMonth === 'function') {
                        filteredRows.forEach(r => {
                            const mObj = r.member;
                            if (!mObj) return;
                            const cName = r.courseFull || r.courseName || "";
                            const result = window.calculateLocalRedBoxesForMonth(mObj, year, month, window.attendanceData || [], cName, window.GLOBAL_DATA_ADJUSTMENTS || {});
                            if (result && result.redDays && result.redDays.length > 0) {
                                count += result.redDays.length;
                            }
                        });
                    }
                }

                const isSelected = window.activeMonthBadgeFilter === month;
                
                // [요청 반영] 3달 중 결재일이 0건인 달은 아예 숨김 처리
                if (count === 0 && !isSelected) {
                    return; // continue for forEach
                }

                const displayCountLabel = count > 0 ? \`<span style="background:#2563eb; color:white; border-radius:12px; padding:2px 7px; font-size:0.7rem; font-weight:bold; margin-left:4px;">\${count}</span>\` : '';
                const borderStyle = count > 0 ? 'border:1px solid #93c5fd; background:#eff6ff;' : 'border:1px solid #cbd5e1; background:#fff;';
                const textStyle = count > 0 ? 'color:#1e3a8a;' : 'color:#475569;';
                
                const finalBorderStyle = isSelected ? 'border:2px solid #ef4444; background:#fee2e2; cursor:pointer;' : (count > 0 ? borderStyle + ' cursor:pointer; hover:bg-blue-50;' : borderStyle);
                
                badgesHtml += \`
                    <div onclick="if (\${count} > 0 || \${isSelected}) window.toggleBadgeFilter(\${month})" style="display:flex; align-items:center; padding:3px 10px; border-radius:20px; font-size:0.8rem; font-weight:700; margin-right:2px; \${finalBorderStyle} \${textStyle}; transition: all 0.2s;">
                        <span>\${month}월</span>
                        \${displayCountLabel}
                    </div>
                \`;
            });

            badgesHtml += \`</div>\`;
            panel.innerHTML = badgesHtml;
        }
`;

    content = content.substring(0, renderFuncStart) + newRenderFunc + content.substring(renderFuncEnd);
}

content = content.replace(/v=\d+/g, 'v=' + Date.now());
fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', content);
const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/sheet.html public/sejong/sheet.html');
