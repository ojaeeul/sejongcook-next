const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');

const injectionTarget = `        let attendanceData = [];`;

const injectionReplacement = `        window.activeMonthBadgeFilter = null;
        window.toggleBadgeFilter = function(month) {
            if (window.activeMonthBadgeFilter === month) {
                window.activeMonthBadgeFilter = null;
            } else {
                window.activeMonthBadgeFilter = month;
            }
            loadAttendanceData();
        };

        let attendanceData = [];`;

content = content.replace(injectionTarget, injectionReplacement);

fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', content);

const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/sheet.html public/sejong/sheet.html');

