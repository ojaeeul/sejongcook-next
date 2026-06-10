const fs = require('fs');
let sheetHtml = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');

const target1 = `            const ledgerDays = new Set();
            if (member.ledger && Array.isArray(member.ledger)) {`;

const simulationBlock = `            let isSimulated = false;
            if (redBoxDates.size === 0 && currentMC && (uniqueLogs.length > 0 || (member.ledger && member.ledger.length > 0))) {
                const now = new Date();
                const limit = new Date(targetYear, targetMonth, 0); // Simulate up to end of target month
                
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

sheetHtml = sheetHtml.replace(target1, simulationBlock);

const target2 = `            return {
                redDays: actualRedDays,
                hasAnyAttendance: uniqueLogs.length > 0 || ledgerDays.size > 0,
                isSimulated: false
            };`;

const replacement2 = `            return {
                redDays: actualRedDays,
                hasAnyAttendance: uniqueLogs.length > 0 || ledgerDays.size > 0 || (member.ledger && member.ledger.length > 0),
                isSimulated: isSimulated
            };`;
            
sheetHtml = sheetHtml.replace(target2, replacement2);

// Now we need to remove the `!result.isSimulated` condition from the badge rendering so it actually SHOWS the preview!
const target3 = `if (result && result.redDays && result.redDays.length > 0 && !result.isSimulated && result.hasAnyAttendance) {`;
const replacement3 = `if (result && result.redDays && result.redDays.length > 0 && result.hasAnyAttendance) {`;

sheetHtml = sheetHtml.replace(new RegExp(target3.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\\\$&'), 'g'), replacement3);

sheetHtml = sheetHtml.replace(/v=202606110900/g, 'v=202606110920');

fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', sheetHtml);
const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/sheet.html public/sejong/sheet.html');
