const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/sms.html', 'utf8');

// Replace monthCounts with monthDays logic
let target = `let monthCounts = {1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0, 11:0, 12:0};`;
let newLogic = `let monthDays = {};
                for(let m=1; m<=12; m++) monthDays[m] = new Set();`;

content = content.replace(target, newLogic);

let addLogicOld = `if (days && (Array.isArray(days) ? days.length > 0 : days > 0)) {
                                monthCounts[month] += (Array.isArray(days) ? days.length : 1);
                            }`;
let addLogicNew = `if (days && Array.isArray(days) && days.length > 0) {
                                days.forEach(d => monthDays[month].add(d));
                            }`;

content = content.replace(addLogicOld, addLogicNew);

let selectedMonthOld = `const selectedMonthCount = monthCounts[cm] || 0;`;
let selectedMonthNew = `const selectedMonthCount = monthDays[cm].size || 0;`;

content = content.replace(selectedMonthOld, selectedMonthNew);

let htmlLoopOld = `for (let month = 1; month <= 12; month++) {
                        const count = monthCounts[month];
                        const displayCount = count > 0 ? \`<span style="background:#2563eb; color:white; border-radius:12px; padding:2px 7px; font-size:0.7rem; font-weight:bold; margin-left:4px;">\${count}</span>\` : '';
                        
                        const borderStyle = count > 0 ? 'border:1px solid #93c5fd; background:#eff6ff;' : 'border:1px solid #cbd5e1; background:#fff;';
                        const textStyle = count > 0 ? 'color:#1e3a8a;' : 'color:#475569;';`;
                        
let htmlLoopNew = `for (let month = 1; month <= 12; month++) {
                        const daysArr = Array.from(monthDays[month]).sort((a,b)=>a-b);
                        const displayCount = daysArr.length > 0 ? \`<span style="background:#2563eb; color:white; border-radius:12px; padding:2px 7px; font-size:0.7rem; font-weight:bold; margin-left:4px;">\${daysArr.join(', ')}</span>\` : '';
                        
                        const borderStyle = daysArr.length > 0 ? 'border:1px solid #93c5fd; background:#eff6ff;' : 'border:1px solid #cbd5e1; background:#fff;';
                        const textStyle = daysArr.length > 0 ? 'color:#1e3a8a;' : 'color:#475569;';`;

content = content.replace(htmlLoopOld, htmlLoopNew);

fs.writeFileSync('Sejong/SejongAttendance/public/sms.html', content);
const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/sms.html public/sejong/sms.html');
