const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');

// 1. Restore hcSpan2.innerHTML to use redBoxOccurrences
const labelRegex = /const hcSpan2 = document.getElementById\('currentHeadcount'\);\n\s*if \(hcSpan2\) {\n\s*\/\/ 뱃지 렌더링 함수에서 정확한 shared_calc 값을 바탕으로 업데이트합니다\.\n\s*hcSpan2\.innerHTML = `\(총 \${uniqueHeadcount}명\)`/g;

const restoreLabel = `const hcSpan2 = document.getElementById('currentHeadcount');
                if (hcSpan2) {
                    hcSpan2.innerHTML = \`(총 \${uniqueHeadcount}명) <span style="margin-left: 15px; color: #dc2626; font-weight: 900; background: #fee2e2; padding: 4px 12px; border-radius: 20px; border: 2px solid #ef4444; font-size: 0.95rem; display: inline-flex; align-items: center; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);"><span class="material-icons" style="font-size: 1.1rem; margin-right: 4px;">event_available</span> 결재일 건수: \${redBoxOccurrences}건</span>\`;`;

content = content.replace(labelRegex, restoreLabel);

// 2. Remove the forced label update inside renderMonthlyRedBoxPanel
const removeBadgeLabelRegex = /\/\/ "결재일 건수" 레이블을 shared_calc 결과인 monthCounts\[displayMonth\] 와 동일하게 동기화!\n\s*const hcSpan2 = document.getElementById\('currentHeadcount'\);\n\s*if \(hcSpan2\) {\n\s*hcSpan2\.innerHTML \+= ` <span[^>]*>.*?결재일 건수: \$\{monthCounts\[displayMonth\] \|\| 0\}건<\/span>`;\n\s*}/g;

content = content.replace(removeBadgeLabelRegex, '');

// 3. Restore the current month skip logic
const skipRegex = /\/\/ \[수정\] 모든 월을 shared_calc 기반으로 통일하여 월 이동 시 갯수 변동 방지/g;
let replacedSkip = false;
content = content.replace(skipRegex, (match) => {
    if (!replacedSkip) {
        replacedSkip = true;
        return `// [복구] 무조건 현재 표시중인 월의 뱃지는 화면상의 "결재일 건수"와 일치시킵니다.
                    if (month === displayMonth) continue;`;
    }
    // For the second occurrence
    return `// [복구] 무조건 현재 표시중인 월의 뱃지는 화면상의 "결재일 건수"와 일치시킵니다.
            if (displayMonth >= 1 && displayMonth <= 12) {
                monthCounts[displayMonth] = displayCountValue || 0;
            }`;
});

fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', content);

const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/sheet.html public/sejong/sheet.html');

