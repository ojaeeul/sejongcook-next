const fs = require('fs');
const path = require('path');

const dataDir = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/data';
const publicDir = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public';

const members = JSON.parse(fs.readFileSync(path.join(dataDir, 'members.json'), 'utf8'));
const attendance = JSON.parse(fs.readFileSync(path.join(dataDir, 'attendance.json'), 'utf8'));
let settings = {};
try { settings = JSON.parse(fs.readFileSync(path.join(dataDir, 'settings.json'), 'utf8')); } catch (e) {}
let adjustments = settings.global_adjustments || {};

global.window = {};
window.GLOBAL_DATA_ADJUSTMENTS = adjustments;

const sharedCalcCode = fs.readFileSync(path.join(publicDir, 'shared_calc.js'), 'utf8');
eval(sharedCalcCode);

const discrepancies = [];

for (let targetMonth = 1; targetMonth <= 12; targetMonth++) {
    const targetYear = 2026;
    
    members.forEach(m => {
        let earliestYear = targetYear;
        let earliestMonth = 1;
        if (m.registrationDate) {
            const p = m.registrationDate.split('-');
            if (p.length >= 2) {
                earliestYear = parseInt(p[0], 10);
                earliestMonth = parseInt(p[1], 10);
            }
        }
        
        let rowCourseNameScope = '';
        let effectiveCourseName = rowCourseNameScope || String(m.course || '');
        let isDualCourse = effectiveCourseName.replace(/\s/g, '').includes('제과제빵');
        const attendanceIncrement = isDualCourse ? 1.0 : 1;
        
        const rowLogsRaw = attendance.filter(l => String(l.memberId) === String(m.id));
        let uniqueLogsMap = new Map();
        rowLogsRaw.forEach(l => {
            const dateStr = l.date.split('T')[0];
            if (!uniqueLogsMap.has(dateStr)) {
                uniqueLogsMap.set(dateStr, l);
            }
        });
        let uniqueLogs = Array.from(uniqueLogsMap.values()).sort((a,b)=>a.date.localeCompare(b.date));
        
        let latestYear = earliestYear;
        let latestMonth = earliestMonth;
        if (uniqueLogs.length > 0) {
            const lastD = new Date(uniqueLogs[uniqueLogs.length - 1].date);
            latestYear = lastD.getFullYear();
            latestMonth = lastD.getMonth() + 1;
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
        
        let carryOverP = 0;
        monthsToCalc.forEach(mc => {
            const adjustment = adjustments[String(m.id)]?.[mc.key];
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
        let tableRedBoxDates = new Set();
        let tableSimulated = false;
        let tableHasAnyAttendance = false;

        if (currentMC) {
            const currentMonthLogs = uniqueLogs.filter(l => {
                const ld = new Date(l.date);
                return ld.getFullYear() === currentMC.year && (ld.getMonth() + 1) === currentMC.month;
            });

            let runningTotal = currentMC.carryFromPrev;
            const getCycle = (val) => {
                let vRaw = Math.round(val * 10);
                let limits = window.getCourseLimits(effectiveCourseName, typeof m !== 'undefined' ? m.type : undefined);
                let triggerRaw = Math.round(limits.trigger * 10);
                let limitRaw = Math.round(limits.limit * 10);
                if (vRaw < triggerRaw) return 0;
                return Math.floor((vRaw - triggerRaw) / limitRaw) + 1;
            };
            
            let currentCycle = getCycle(currentMC.carryFromPrev);
            if (isNaN(currentCycle)) currentCycle = 0;
            const adjustment = adjustments[String(m.id)]?.[currentMC.key];

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
                    if (newCycle > currentCycle) {
                        shouldShowRedBox = true;
                        currentCycle = newCycle;
                    }
                    if (shouldShowRedBox) {
                        tableRedBoxDates.add(l.date);
                    }
                    if (adjustment && adjustment.forceRedBoxDates && adjustment.forceRedBoxDates.includes(l.date)) {
                        tableRedBoxDates.add(l.date);
                    }
                }
            });
            
            if (currentMonthLogs.length > 0) tableHasAnyAttendance = true;
            
            if (tableRedBoxDates.size === 0 && tableHasAnyAttendance) {
                // sheet.html simulated logic...
                // Actually sheet.html does NOT do simulated logic inline here!
                // Wait! Let's check sheet.html again!
            }
        }

        // Now run shared_calc
        const result = window.calculateRedBoxesForMonth(m, targetYear, targetMonth, attendance, '', adjustments);
        const badgeRedBoxOccurrences = (result && result.redDays && result.redDays.length > 0 && !result.isSimulated) ? result.redDays.length : 0;
        
        let tableCount = tableRedBoxDates.size;
        
        if (tableCount !== badgeCount) {
            discrepancies.push({
                member: m.name,
                course: effectiveCourseName,
                month: targetMonth,
                table: tableCount,
                badge: badgeCount,
                tableDates: Array.from(tableRedBoxDates),
                badgeDates: result ? result.redDays : []
            });
        }
    });
}
