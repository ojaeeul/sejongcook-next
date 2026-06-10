const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');

// Find the filter location
const target = `                // [신규] 뱃지 클릭(월별 결재일) 필터
                if (window.activeMonthBadgeFilter) {`;

const replacement = `                // 뱃지용 원본 로우 (뱃지 숫자는 필터링과 무관하게 전체 학생 기준 유지)
                const rowsForBadges = [...filteredRows];

                // [신규] 뱃지 클릭(월별 결재일) 필터
                if (window.activeMonthBadgeFilter) {`;

content = content.replace(target, replacement);

const target2 = `                // [신규] 상단 수강생결재일(1~12월) 뱃지 렌더링
                renderMonthlyRedBoxPanel(filteredRows, currentYear, currentMonth, redBoxOccurrences);`;

const replacement2 = `                // [신규] 상단 수강생결재일(1~12월) 뱃지 렌더링
                // 뱃지는 선택된 월 필터링(filteredRows)에 영향을 받지 않고 전체 목록(rowsForBadges)을 기준으로 표시합니다.
                renderMonthlyRedBoxPanel(rowsForBadges, currentYear, currentMonth, window.activeMonthBadgeFilter ? null : redBoxOccurrences);`;

content = content.replace(target2, replacement2);

const target3 = `            // 무조건 현재 표시중인 월의 뱃지는 화면상의 "결재일 건수"와 일치시킵니다.
            if (displayMonth >= 1 && displayMonth <= 12) {
                monthCounts[displayMonth] = displayCountValue || 0;
            }`;

const replacement3 = `            // 무조건 현재 표시중인 월의 뱃지는 화면상의 "결재일 건수"와 일치시킵니다.
            // 단, 현재 뱃지 필터가 걸려있어서 displayCountValue가 null로 들어온 경우 덮어쓰지 않습니다.
            if (displayMonth >= 1 && displayMonth <= 12 && displayCountValue !== null) {
                monthCounts[displayMonth] = displayCountValue;
            }`;

content = content.replace(target3, replacement3);

// Force cache invalidation
content = content.replace(/src="shared_calc\.js"/g, 'src="shared_calc.js?v=202606110030"');

fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', content);

const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/sheet.html public/sejong/sheet.html');

