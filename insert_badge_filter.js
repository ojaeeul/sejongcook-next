const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');

const target = `                // User Request: "월간 출석부 이름 정렬해줘" (Sort Alphabetically by Member Name)`;
const replacement = `                // [신규] 뱃지 클릭(월별 결재일) 필터
                if (window.activeMonthBadgeFilter) {
                    filteredRows = filteredRows.filter(r => {
                        const m = r.member;
                        if (!m) return false;
                        const cName = r.courseName || '';
                        let hasRedBox = false;
                        if (typeof window.calculateRedBoxesForMonth === 'function') {
                            const result = window.calculateRedBoxesForMonth(m, currentYear, window.activeMonthBadgeFilter, attendanceData || [], cName, window.GLOBAL_DATA_ADJUSTMENTS || {});
                            if (result && result.redDays && result.redDays.length > 0 && !result.isSimulated && result.hasAnyAttendance) {
                                hasRedBox = true;
                            }
                        }
                        return hasRedBox;
                    });
                }

                // User Request: "월간 출석부 이름 정렬해줘" (Sort Alphabetically by Member Name)`;

content = content.replace(target, replacement);

fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', content);

const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/sheet.html public/sejong/sheet.html');

