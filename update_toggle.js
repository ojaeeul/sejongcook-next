const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');

const target = `        window.activeMonthBadgeFilter = null;
        window.toggleBadgeFilter = function(month) {
            if (window.activeMonthBadgeFilter === month) {
                window.activeMonthBadgeFilter = null;
            } else {
                window.activeMonthBadgeFilter = month;
            }
            loadAttendanceData();
        };`;

const replacement = `        window.activeMonthBadgeFilter = null;
        window.toggleBadgeFilter = function(month) {
            if (window.activeMonthBadgeFilter === month) {
                window.activeMonthBadgeFilter = null;
            } else {
                window.activeMonthBadgeFilter = month;
                // 해당 월의 결재자를 보기 위해 달력 자체를 해당 월로 이동합니다.
                if (window.currentMonth !== month) {
                    window.currentMonth = month;
                    localStorage.setItem('sejong_currentMonth', month);
                    
                    const el = document.getElementById('currentMonthDisplay');
                    if (el) {
                        el.textContent = \`\${window.currentYear}년 \${window.currentMonth}월\`;
                    }
                }
            }
            loadAttendanceData();
        };`;

content = content.replace(target, replacement);

fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', content);

const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/sheet.html public/sejong/sheet.html');

