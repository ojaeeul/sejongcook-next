const fs = require('fs');

let content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');

// 1. Remove the hcSpan2.innerHTML update from loadAttendanceData
const removeTarget = `                const hcSpan2 = document.getElementById('currentHeadcount');
                if (hcSpan2) {
                    hcSpan2.innerHTML = \`(총 \${uniqueHeadcount}명) <span style="margin-left: 15px; color: #dc2626; font-weight: 900; background: #fee2e2; padding: 4px 12px; border-radius: 20px; border: 2px solid #ef4444; font-size: 0.95rem; display: inline-flex; align-items: center; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);"><span class="material-icons" style="font-size: 1.1rem; margin-right: 4px;">event_available</span> 결재일 건수: \${redBoxOccurrences}건</span>\`;
                }`;
const replaceRemove = `                const hcSpan2 = document.getElementById('currentHeadcount');
                if (hcSpan2) {
                    // 뱃지 렌더링 함수에서 정확한 shared_calc 값을 바탕으로 업데이트합니다.
                    hcSpan2.innerHTML = \`(총 \${uniqueHeadcount}명)\`;
                }`;
content = content.replace(removeTarget, replaceRemove);

// 2. Add the update inside renderMonthlyRedBoxPanel, right after monthCounts loop finishes
const target2 = `            // [수정] 모든 월을 shared_calc 기반으로 통일하여 월 이동 시 갯수 변동 방지`;
const replace2 = `            // [수정] 모든 월을 shared_calc 기반으로 통일하여 월 이동 시 갯수 변동 방지
            
            // "결재일 건수" 레이블을 shared_calc 결과인 monthCounts[displayMonth] 와 동일하게 동기화!
            const hcSpan2 = document.getElementById('currentHeadcount');
            if (hcSpan2) {
                hcSpan2.innerHTML += \` <span style="margin-left: 15px; color: #dc2626; font-weight: 900; background: #fee2e2; padding: 4px 12px; border-radius: 20px; border: 2px solid #ef4444; font-size: 0.95rem; display: inline-flex; align-items: center; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);"><span class="material-icons" style="font-size: 1.1rem; margin-right: 4px;">event_available</span> 결재일 건수: \${monthCounts[displayMonth] || 0}건</span>\`;
            }
`;
content = content.replace(target2, replace2);

fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', content);

const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/sheet.html public/sejong/sheet.html');

