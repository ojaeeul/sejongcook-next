const fs = require('fs');
let sheetHtml = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');

const target1 = `                        if (typeof window.calculateRedBoxesForMonth === 'function') {
                            const result = window.calculateRedBoxesForMonth(m, currentYear, window.activeMonthBadgeFilter, attendanceData || [], cName, window.GLOBAL_DATA_ADJUSTMENTS || {});`;

const replacement1 = `                        if (typeof window.calculateLocalRedBoxesForMonth === 'function') {
                            const result = window.calculateLocalRedBoxesForMonth(m, currentYear, window.activeMonthBadgeFilter, attendanceData || [], cName, window.GLOBAL_DATA_ADJUSTMENTS || {});`;

const target2 = `                            const result = window.calculateRedBoxesForMonth(m, currentYear, currentMonth, attendanceData || [], rowCourseNameScope, window.GLOBAL_DATA_ADJUSTMENTS || {});`;

const replacement2 = `                            const result = window.calculateLocalRedBoxesForMonth(m, currentYear, currentMonth, attendanceData || [], rowCourseNameScope, window.GLOBAL_DATA_ADJUSTMENTS || {});`;

const target3 = `                    const result = window.calculateRedBoxesForMonth(m, currentYear, currentMonth, window.attendanceData || [], cName, window.GLOBAL_DATA_ADJUSTMENTS || {});`;

const replacement3 = `                    const result = window.calculateLocalRedBoxesForMonth(m, currentYear, currentMonth, window.attendanceData || [], cName, window.GLOBAL_DATA_ADJUSTMENTS || {});`;

const target4 = `                        if (typeof window.calculateRedBoxesForMonth === 'function') {
                            const result = window.calculateRedBoxesForMonth(m, targetYear, month, window.attendanceData || [], cName, window.GLOBAL_DATA_ADJUSTMENTS || {});`;

const replacement4 = `                        if (typeof window.calculateLocalRedBoxesForMonth === 'function') {
                            const result = window.calculateLocalRedBoxesForMonth(m, targetYear, month, window.attendanceData || [], cName, window.GLOBAL_DATA_ADJUSTMENTS || {});`;


sheetHtml = sheetHtml.replace(target1, replacement1);
sheetHtml = sheetHtml.replace(target2, replacement2);
sheetHtml = sheetHtml.replace(target3, replacement3);
sheetHtml = sheetHtml.replace(target4, replacement4);


const localFunc = `
        // [신규 추가] 예전 shared_calc.js를 절대 불러오지 않고, 수기 출석표(sheet.html) 내장 논리와 100% 동일한 내장 함수
        window.calculateLocalRedBoxesForMonth = function (member, targetYear, targetMonth, allAttendanceLogs, courseFilter, GLOBAL_DATA_ADJUSTMENTS) {
            if (!member) return { redDays: [], hasAnyAttendance: false, isSimulated: true };

            let cleanFilter = String(courseFilter || '').replace(/\\s/g, '');
            let isDualCourse = cleanFilter.includes('제과제빵');
            let isBogeoCourse = cleanFilter.includes('복어') || cleanFilter.includes('산업기사');
            
            const courseStr = String(member.course || '').replace(/\\s/g, '');
            const hasJeggwa = courseStr.includes('제과') && !courseStr.includes('제과제빵');
            const hasJeppang = courseStr.includes('제빵') && !courseStr.includes('제과제빵');
            if (hasJeggwa && hasJeppang && (cleanFilter.includes('제과기능사') || cleanFilter.includes('제빵기능사'))) {
                isDualCourse = true;
            }

            const attendanceIncrement = isDualCourse ? 1.0 : 1;

            let rowLogsRaw = allAttendanceLogs.filter(l => String(l.memberId) === String(member.id));
            if (courseFilter) {
                rowLogsRaw = rowLogsRaw.filter(l => {
                    if (!l.course) return true;
                    if (isDualCourse) {
                        const lCourse = String(l.course || '').replace(/\\s/g, '');
                        if (lCourse.includes('제과') || lCourse.includes('제빵')) return true;
                        if (lCourse.includes('양식기능사')) return true;
                    }
                    const cClean = String(l.course).replace(/\\([^)]*\\)/g, '').trim();
                    const fClean = String(courseFilter).replace(/\\([^)]*\\)/g, '').trim();
                    const cList = cClean.split(',').map(c => c.trim());
                    return cList.includes(fClean);
                });
            }

            const uniqueRowLogsMap = new Map();
            rowLogsRaw.forEach(l => {
                const dateStr = l.date ? (l.date.includes('T') ? l.date.split('T')[0] : l.date) : (l.dateObj ? l.dateObj.toISOString().split('T')[0] : '');
                if (!uniqueRowLogsMap.has(dateStr)) {
                    uniqueRowLogsMap.set(dateStr, { ...l, date: dateStr });
                }
            });
            const uniqueLogs = Array.from(uniqueRowLogsMap.values()).sort((a, b) => a.date.localeCompare(b.date));

            let earliestYear = Number(targetYear);
            let earliestMonth = Number(targetMonth);
            
            if (allAttendanceLogs && allAttendanceLogs.length > 0) {
                allAttendanceLogs.forEach(l => {
                    const d = new Date(l.date);
                    const yy = d.getFullYear();
                    const mm = d.getMonth() + 1;
                    if (yy < earliestYear || (yy === earliestYear && mm < earliestMonth)) {
                        earliestYear = yy;
                        earliestMonth = mm;
                    }
                });
            }

            let iterYear = earliestYear;
            let iterMonth = earliestMonth;

            let monthsToCalc = [];
            let safetyCounter = 0;
            while (safetyCounter < 300) {
                safetyCounter++;
                const key = \`\${iterYear}-\${String(iterMonth).padStart(2, '0')}\`;
                monthsToCalc.push({ year: iterYear, month: iterMonth, key });
                if (Number(iterYear) === Number(targetYear) && Number(iterMonth) === Number(targetMonth)) break;
                iterMonth++;
                if (iterMonth > 12) {
                    iterMonth = 1;
                    iterYear++;
                }
            }

            const getCycleSettingsLocal = () => {
                let defaultVal = 9;
                let dualVal = 17;
                let bogeoVal = 17;
                if (typeof document !== 'undefined') {
                    const sd = document.getElementById('cycleStandard');
                    const dd = document.getElementById('cycleDual');
                    const bd = document.getElementById('cycleBogeo');
                    if (sd) defaultVal = parseFloat(sd.value) || 9;
                    if (dd) dualVal = parseFloat(dd.value) || 17;
                    if (bd) bogeoVal = parseFloat(bd.value) || 17;
                }
                return { default: defaultVal, dual: dualVal, bogeo: bogeoVal };
            };

            const getCycle = (val) => {
                const settings = getCycleSettingsLocal();
                let vRaw = Math.round(val * 10);
                if (isBogeoCourse) {
                    let target = settings.bogeo * 10;
                    if (vRaw < target) return 0;
                    return Math.floor((vRaw - target) / (target - 10)) + 1;
                } else if (isDualCourse) {
                    let target = settings.dual * 10;
                    if (vRaw < target) return 0;
                    return Math.floor((vRaw - target) / (target - 10)) + 1;
                } else {
                    let target = settings.default * 10;
                    if (vRaw < target) return 0;
                    return Math.floor((vRaw - target) / (target - 10)) + 1;
                }
            };

            let carryOverP = 0;

            monthsToCalc.forEach(mc => {
                const adjustment = GLOBAL_DATA_ADJUSTMENTS[String(member.id)]?.[mc.key];
                if (adjustment && adjustment.carryOverride !== undefined) {
                    carryOverP = parseFloat(adjustment.carryOverride) || 0;
                }

                const mLogs = uniqueLogs.filter(l => {
                    const ld = new Date(l.date);
                    return ld.getFullYear() === mc.year && (ld.getMonth() + 1) === mc.month;
                });

                let manualMakeup = 0;
                let attendances = 0;

                mLogs.forEach(l => {
                    const isMakeupMarker = ['[', ']'].includes(l.status);
                    const strStatus = String(l.status);
                    const isNumericPresent = ['10', '12', '2', '5', '7', '3', '9'].includes(strStatus);
                    const isAbsent = l.status === 'absent' || strStatus.startsWith('X') || strStatus.includes('결석');
                    const isEarly = l.status === 'early' || strStatus.includes('조퇴');
                    const isTardy = l.status === 'tardy' || l.status === 'late' || strStatus.includes('지각') || strStatus.includes('△');
                    const isFirstLast = strStatus.includes('첫') || strStatus.includes('종료') || strStatus === '[' || strStatus === ']';
                    const isPresentExt = l.status === 'present' || strStatus.startsWith('O') || strStatus.startsWith('o') || strStatus.startsWith('O^') || strStatus.startsWith('o^');
                    const isRegularAttendance = isPresentExt || isNumericPresent || isAbsent || isEarly || isTardy || isFirstLast;

                    if (isMakeupMarker) manualMakeup += attendanceIncrement;
                    if (isRegularAttendance) attendances += attendanceIncrement;
                });

                if (adjustment && adjustment.presentOverride !== undefined) {
                    attendances = adjustment.presentOverride;
                }

                let totalCombined = Math.round((carryOverP + manualMakeup + attendances) * 10) / 10;
                mc.carryFromPrev = carryOverP;
                carryOverP = totalCombined;
            });

            const currentMC = monthsToCalc[monthsToCalc.length - 1];
            let redBoxDates = new Set();
            
            let runningTotal = currentMC ? currentMC.carryFromPrev : 0;
            let currentCycleForMonth = currentMC ? getCycle(currentMC.carryFromPrev) : 0;
            if (isNaN(currentCycleForMonth)) currentCycleForMonth = 0;

            if (currentMC) {
                const currentMonthLogs = uniqueLogs.filter(l => {
                    const ld = new Date(l.date);
                    return ld.getFullYear() === currentMC.year && (ld.getMonth() + 1) === currentMC.month;
                });

                const adjustment = GLOBAL_DATA_ADJUSTMENTS[String(member.id)]?.[currentMC.key];

                currentMonthLogs.forEach(l => {
                    const isMakeupMarker = ['[', ']'].includes(l.status);
                    const strStatus = String(l.status);
                    const isNumericPresent = ['10', '12', '2', '5', '7', '3', '9'].includes(strStatus);
                    const isAbsent = l.status === 'absent' || strStatus.startsWith('X') || strStatus.includes('결석');
                    const isEarly = l.status === 'early' || strStatus.includes('조퇴');
                    const isTardy = l.status === 'tardy' || l.status === 'late' || strStatus.includes('지각') || strStatus.includes('△');
                    const isFirstLast = strStatus.includes('첫') || strStatus.includes('종료') || strStatus === '[' || strStatus === ']';
                    const isPresentExt = l.status === 'present' || strStatus.startsWith('O') || strStatus.startsWith('o') || strStatus.startsWith('O^') || strStatus.startsWith('o^');
                    
                    const isRegularAttendance = isPresentExt || isNumericPresent || isAbsent || isEarly || isTardy || isFirstLast;

                    if (isRegularAttendance || isMakeupMarker) {
                        runningTotal += attendanceIncrement;
                        runningTotal = Math.round(runningTotal * 10) / 10;
                        
                        let newCycle = getCycle(runningTotal);
                        if (isNaN(newCycle)) newCycle = 0;

                        let shouldShowRedBox = false;
                        if (newCycle > currentCycleForMonth) {
                            shouldShowRedBox = true;
                            currentCycleForMonth = newCycle;
                        }

                        if (shouldShowRedBox) redBoxDates.add(l.date);
                        if (adjustment && adjustment.forceRedBoxDates && adjustment.forceRedBoxDates.includes(l.date)) {
                            redBoxDates.add(l.date);
                        }
                    }
                });
            }

            const ledgerDays = new Set();
            if (member.ledger && Array.isArray(member.ledger)) {
                member.ledger.forEach(l => {
                    if (Number(l.year) === Number(targetYear) && Number(l.month) === Number(targetMonth)) {
                        ledgerDays.add(Number(l.day));
                    }
                });
            }
            if (ledgerDays.size > 0) {
                ledgerDays.forEach(day => {
                    const dateStr = \`\${targetYear}-\${String(targetMonth).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
                    redBoxDates.add(dateStr);
                });
            }

            const actualRedDays = Array.from(redBoxDates).map(d => parseInt(d.split('-')[2], 10));
            return {
                redDays: actualRedDays,
                hasAnyAttendance: uniqueLogs.length > 0 || ledgerDays.size > 0,
                isSimulated: false
            };
        };
`;

const insertTarget = `        async function fetchAttendanceData(year, month) {`;
sheetHtml = sheetHtml.replace(insertTarget, localFunc + '\n' + insertTarget);

sheetHtml = sheetHtml.replace(/v=202606110850/g, 'v=202606110900');

fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', sheetHtml);
const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/sheet.html public/sejong/sheet.html');
