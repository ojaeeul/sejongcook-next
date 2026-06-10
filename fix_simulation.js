const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');

const regex1 = /const ledgerDays = new Set\(\);\s*if \(member\.ledger && Array\.isArray\(member\.ledger\)\) \{/;

const simBlock = `            let isSimulated = false;
            if (redBoxDates.size === 0 && currentMC && (uniqueLogs.length > 0 || (member.ledger && member.ledger.length > 0))) {
                const now = new Date();
                const limit = new Date(targetYear, targetMonth, 0);
                let simDate = new Date(currentMC.year, currentMC.month - 1, 1);
                
                let lastRecordDateObj = null;
                if (uniqueLogs.length > 0) {
                    lastRecordDateObj = new Date(uniqueLogs[uniqueLogs.length - 1].date);
                }
                
                if (lastRecordDateObj && lastRecordDateObj > simDate) {
                    simDate = new Date(lastRecordDateObj.getTime() + 86400000);
                }

                let simTotal = runningTotal;
                let limitCounter = 0;
                
                while (simDate <= limit && limitCounter < 100) {
                    limitCounter++;
                    const yy = simDate.getFullYear();
                    const mm = String(simDate.getMonth() + 1).padStart(2, '0');
                    const dd = String(simDate.getDate()).padStart(2, '0');
                    const dateStr = \`\${yy}-\${mm}-\${dd}\`;
                    
                    const isHolidayInSys = window.holidaysData && window.holidaysData.some(h => h.date === dateStr);
                    const isNationalHoliday = window.KOREAN_HOLIDAYS_MAP && !!window.KOREAN_HOLIDAYS_MAP[dateStr];
                    const isHoliday = isHolidayInSys || isNationalHoliday;
                    const dayOfWeek = simDate.getDay();

                    let isValidDay = false;
                    if (courseFilter) {
                        const cleanFilter = courseFilter.replace(/\\([^)]*\\)/g, '').trim();
                        const schedule = window.COURSE_SCHEDULES ? window.COURSE_SCHEDULES[cleanFilter] : null;
                        if (schedule) {
                            if (schedule.includes(dayOfWeek)) isValidDay = true;
                        } else {
                            if (dayOfWeek !== 0) isValidDay = true;
                        }
                    } else {
                        if (dayOfWeek !== 0) isValidDay = true;
                    }

                    if (isValidDay && !isHoliday) {
                        const prevSimCycle = getCycle(simTotal);
                        simTotal += attendanceIncrement;
                        const newSimCycle = getCycle(simTotal);
                        
                        if (newSimCycle > prevSimCycle) {
                            if (simDate.getFullYear() === Number(targetYear) && (simDate.getMonth() + 1) === Number(targetMonth)) {
                                redBoxDates.add(dateStr);
                                isSimulated = true;
                            }
                            break; 
                        }
                    }
                    simDate.setDate(simDate.getDate() + 1);
                }
            }

            const ledgerDays = new Set();
            if (member.ledger && Array.isArray(member.ledger)) {`;

content = content.replace(regex1, simBlock);

const regex2 = /return \{\s*redDays: actualRedDays,\s*hasAnyAttendance: uniqueLogs\.length > 0 \|\| ledgerDays\.size > 0,\s*isSimulated: false\s*\};/;
const replacement2 = `return {
                redDays: actualRedDays,
                hasAnyAttendance: uniqueLogs.length > 0 || ledgerDays.size > 0 || (member.ledger && member.ledger.length > 0),
                isSimulated: isSimulated
            };`;
content = content.replace(regex2, replacement2);

content = content.replace(/v=202606110930/g, 'v=202606110950');

fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', content);
const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/sheet.html public/sejong/sheet.html');
