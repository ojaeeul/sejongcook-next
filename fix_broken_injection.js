const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');

const brokenTarget = `                if (typeof 
        window.activeMonthBadgeFilter = null;
        window.toggleBadgeFilter = function(month) {
            if (window.activeMonthBadgeFilter === month) {
                window.activeMonthBadgeFilter = null;
            } else {
                window.activeMonthBadgeFilter = month;
            }
            loadAttendanceData();
        };
window.calculateRedBoxesForMonth === 'function') {`;

const fixedReplacement = `                if (typeof window.calculateRedBoxesForMonth === 'function') {`;

content = content.replace(brokenTarget, fixedReplacement);

const globalInjectionTarget = `    <script>
        let attendanceData = [];`;

const globalInjectionReplacement = `    <script>
        window.activeMonthBadgeFilter = null;
        window.toggleBadgeFilter = function(month) {
            if (window.activeMonthBadgeFilter === month) {
                window.activeMonthBadgeFilter = null;
            } else {
                window.activeMonthBadgeFilter = month;
            }
            // Trigger refresh
            loadAttendanceData();
        };

        let attendanceData = [];`;

content = content.replace(globalInjectionTarget, globalInjectionReplacement);

fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', content);

const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/sheet.html public/sejong/sheet.html');

