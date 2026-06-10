const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');

// 1. Remove the current month force skip in renderMonthlyRedBoxPanel
let target1 = `                    // 무조건 현재 표시중인 월의 뱃지는 화면상의 "결재일 건수"와 일치시킵니다.
                    if (month === displayMonth) continue;`;
let replace1 = `                    // [수정] 모든 월을 shared_calc 기반으로 통일하여 월 이동 시 갯수 변동 방지`;
content = content.replace(target1, replace1);

let target2 = `            // 무조건 현재 표시중인 월의 뱃지는 화면상의 "결재일 건수"와 일치시킵니다.
            if (displayMonth >= 1 && displayMonth <= 12) {
                monthCounts[displayMonth] = displayCountValue || 0;
            }`;
let replace2 = ``;
content = content.replace(target2, replace2);

// 2. Change the label to use the calculated badge total for the current month!
let target3 = `hcSpan2.innerHTML = \`(총 \${uniqueHeadcount}명) <span style="margin-left: 15px; color: #dc2626; font-weight: 900; background: #fee2e2; padding: 4px 12px; border-radius: 20px; border: 2px solid #ef4444; font-size: 0.95rem; display: inline-flex; align-items: center; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);"><span class="material-icons" style="font-size: 1.1rem; margin-right: 4px;">event_available</span> 결재일 건수: \${redBoxOccurrences}건</span>\`;`;

let replace3 = `hcSpan2.innerHTML = \`(총 \${uniqueHeadcount}명) <span style="margin-left: 15px; color: #dc2626; font-weight: 900; background: #fee2e2; padding: 4px 12px; border-radius: 20px; border: 2px solid #ef4444; font-size: 0.95rem; display: inline-flex; align-items: center; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);"><span class="material-icons" style="font-size: 1.1rem; margin-right: 4px;">event_available</span> 결재일 건수: \${monthCounts[displayMonth] || 0}건</span>\`;`;

// Wait, the label is updated BEFORE renderMonthlyRedBoxPanel finishes! 
// Let's look at the flow in sheet.html
