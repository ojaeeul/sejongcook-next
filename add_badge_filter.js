const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');

// 1. Add window.activeMonthBadgeFilter and toggle function
const scriptStart = content.indexOf('window.calculateRedBoxesForMonth');
const insertScript = `
        window.activeMonthBadgeFilter = null;
        window.toggleBadgeFilter = function(month) {
            if (window.activeMonthBadgeFilter === month) {
                window.activeMonthBadgeFilter = null;
            } else {
                window.activeMonthBadgeFilter = month;
            }
            loadAttendanceData();
        };
`;
content = content.slice(0, scriptStart) + insertScript + content.slice(scriptStart);

// 2. Add filtering logic in loadAttendanceData
const filterRegex = /\/\/ 2\. Filter Rows\n\s*let filteredRows = allCourseRows;\n\s*if \(sheetFilter !== 'all'\) \{\n\s*const searchKey = sheetFilter\.replace\(\/\\s\/g, ''\);\n\s*filteredRows = filteredRows\.filter\(r => \{\n\s*const normalizedCourseName = r\.courseName\.replace\(\/\\s\/g, ''\);\n\s*return normalizedCourseName\.includes\(searchKey\);\n\s*\}\);\n\s*\}\n\s*if \(sheetTimeFilter !== 'all'\) \{\n\s*filteredRows = filteredRows\.filter\(r => r\.courseFull\.includes\(sheetTimeFilter\)\);\n\s*\}/g;

const applyFilter = `// 2. Filter Rows
                let filteredRows = allCourseRows;
                if (sheetFilter !== 'all') {
                    const searchKey = sheetFilter.replace(/\\s/g, ''); // Normalize search key
                    filteredRows = filteredRows.filter(r => {
                        const normalizedCourseName = r.courseName.replace(/\\s/g, ''); // Normalize target name
                        return normalizedCourseName.includes(searchKey);
                    });
                }
                if (sheetTimeFilter !== 'all') {
                    filteredRows = filteredRows.filter(r => r.courseFull.includes(sheetTimeFilter));
                }

                // [신규] 뱃지 클릭(월별 결재일) 필터
                if (window.activeMonthBadgeFilter) {
                    filteredRows = filteredRows.filter(r => {
                        const m = r.member;
                        if (!m) return false;
                        const cName = r.courseName || '';
                        let hasRedBox = false;
                        if (typeof window.calculateRedBoxesForMonth === 'function') {
                            const result = window.calculateRedBoxesForMonth(m, currentYear, window.activeMonthBadgeFilter, window.attendanceData || [], cName, window.GLOBAL_DATA_ADJUSTMENTS || {});
                            if (result && result.redDays && result.redDays.length > 0 && !result.isSimulated && result.hasAnyAttendance) {
                                hasRedBox = true;
                            }
                        }
                        return hasRedBox;
                    });
                }`;
content = content.replace(filterRegex, applyFilter);

// 3. Make badges clickable
const badgeHtmlRegex = /badgesHtml \+= `\n\s*<div style="display:flex; align-items:center; padding:3px 10px; border-radius:20px; font-size:0\.8rem; font-weight:700; margin-right:2px; \$\{borderStyle\} \$\{textStyle\}">\n\s*<span>\$\{month\}월<\/span>\n\s*\$\{displayCount\}\n\s*<\/div>\n\s*`;/g;

const applyBadgeHtml = `const isSelected = window.activeMonthBadgeFilter === month;
                const finalBorderStyle = isSelected ? 'border:2px solid #ef4444; background:#fee2e2; cursor:pointer;' : (count > 0 ? borderStyle + ' cursor:pointer; hover:bg-blue-50;' : borderStyle);
                
                badgesHtml += \`
                    <div onclick="if (\${count} > 0 || \${isSelected}) window.toggleBadgeFilter(\${month})" style="display:flex; align-items:center; padding:3px 10px; border-radius:20px; font-size:0.8rem; font-weight:700; margin-right:2px; \${finalBorderStyle} \${textStyle}; transition: all 0.2s;">
                        <span>\${month}월</span>
                        \${displayCount}
                    </div>
                \`;`;
content = content.replace(badgeHtmlRegex, applyBadgeHtml);

fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', content);

const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/sheet.html public/sejong/sheet.html');

