const fs = require('fs');
const path = require('path');

const dataDir = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/data';
const members = JSON.parse(fs.readFileSync(path.join(dataDir, 'members.json'), 'utf8'));
const attendance = JSON.parse(fs.readFileSync(path.join(dataDir, 'attendance.json'), 'utf8'));
let settings = {};
try {
    settings = JSON.parse(fs.readFileSync(path.join(dataDir, 'settings.json'), 'utf8'));
} catch (e) {}
let adjustments = settings.global_adjustments || {};

global.window = {};
window.GLOBAL_DATA_ADJUSTMENTS = adjustments;

const sharedCalcCode = fs.readFileSync('./shared_calc.js', 'utf8');
eval(sharedCalcCode);

const discrepancies = [];
const targetYear = 2026;

for (let targetMonth = 1; targetMonth <= 12; targetMonth++) {
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
        
        let iterYear = earliestYear;
        let iterMonth = earliestMonth;
        let monthsToCalc = [];
        let safetyCounter = 0;
        while (safetyCounter < 300) {
            safetyCounter++;
            const key = `${iterYear}-${String(iterMonth).padStart(2, '0')}`;
            monthsToCalc.push({ year: iterYear, month: iterMonth, key });
            if (Number(iterYear) === Number(targetYear) && Number(iterMonth) === Number(targetMonth)) break;
            iterMonth++;
            if (iterMonth > 12) {
                iterMonth = 1;
                iterYear++;
            }
        }
        
        let rowCourseNameScope = "";
        let effectiveCourseName = rowCourseNameScope || String(m.course || '');
        let isDualCourse = effectiveCourseName.replace(/\s/g, '').includes('제과제빵');
        const attendanceIncrement = isDualCourse ? 1.0 : 1;
        
        const actualRowLogs = attendance.filter(l => String(l.memberId) === String(m.id));
        
        let uniqueLogsMap = new Map();
        actualRowLogs.forEach(l => {
            const dateStr = l.date.split('T')[0];
            if (!uniqueLogsMap.has(dateStr)) {
                uniqueLogsMap.set(dateStr, l);
            }
        });
        let uniqueLogs = Array.from(uniqueLogsMap.values()).sort((a,b)=>a.date.localeCompare(b.date));
        
        let carryOverP = 0;
        let tableRedBoxOccurrences = 0;
        const redBoxDates = new Set();
        let tableSimulated = false;
        let tableHasAnyAttendance = false;
        
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
                const strStatus = String(l.status);
                const isNumericPresent = ['10', '12', '2', '5', '7', '3', '9'].includes(strStatus);
                const isAbsent = l.status === 'absent' || strStatus.startsWith('X') || strStatus.includes('결석');
                const isEarly = l.status === 'early' || strStatus.includes('조퇴');
                const isTardy = l.status === 'tardy' || l.status === 'late' || strStatus.includes('지각') || strStatus.includes('△');
                const isFirstLast = strStatus.includes('첫') || strStatus.includes('종료') || strStatus === '[' || strStatus === ']';
                const isPresentExt = l.status === 'present' || strStatus.startsWith('O') || strStatus.startsWith('o') || strStatus.startsWith('O^') || strStatus.startsWith('o^');
                const isRegularAttendance = isPresentExt || isNumericPresent || isAbsent || isEarly || isTardy || isFirstLast;

                if (['[', ']'].includes(l.status)) manualMakeup += attendanceIncrement;
                if (isRegularAttendance) attendances += attendanceIncrement;
            });
            
            if (adjustment && adjustment.presentOverride !== undefined) {
                attendances = adjustment.presentOverride;
            }
            
            let totalCombined = Math.round((carryOverP + manualMakeup + attendances) * 10) / 10;
            let vRaw = Math.round(totalCombined * 10);
            
            let limits = window.getCourseLimits(effectiveCourseName);
            let triggerRaw = Math.round(limits.trigger * 10);
            let limitRaw = Math.round(limits.limit * 10);
            let cycle = 0;
            if (vRaw >= triggerRaw) {
                cycle = Math.floor((vRaw - triggerRaw) / limitRaw) + 1;
            }
            
            let pureAttendancesCount = 0;
            let runningTotal = carryOverP + manualMakeup;
            
            mLogs.forEach(l => {
                const strStatus = String(l.status);
                const isNumericPresent = ['10', '12', '2', '5', '7', '3', '9'].includes(strStatus);
                const isAbsent = l.status === 'absent' || strStatus.startsWith('X') || strStatus.includes('결석');
                const isEarly = l.status === 'early' || strStatus.includes('조퇴');
                const isTardy = l.status === 'tardy' || l.status === 'late' || strStatus.includes('지각') || strStatus.includes('△');
                const isFirstLast = strStatus.includes('첫') || strStatus.includes('종료') || strStatus === '[' || strStatus === ']';
                const isPresentExt = l.status === 'present' || strStatus.startsWith('O') || strStatus.startsWith('o') || strStatus.startsWith('O^') || strStatus.startsWith('o^');
                const isRegularAttendance = isPresentExt || isNumericPresent || isAbsent || isEarly || isTardy || isFirstLast;
                
                if (isRegularAttendance) {
                    pureAttendancesCount++;
                    runningTotal += attendanceIncrement;
                    
                    let runningRaw = Math.round(runningTotal * 10);
                    let currentCycle = 0;
                    if (runningRaw >= triggerRaw) {
                        currentCycle = Math.floor((runningRaw - triggerRaw) / limitRaw) + 1;
                    }
                    
                    if (currentCycle > 0 && currentCycle > Math.floor((Math.round((runningTotal - attendanceIncrement) * 10) - triggerRaw) / limitRaw + 1 >= 0 ? (Math.round((runningTotal - attendanceIncrement) * 10) - triggerRaw) / limitRaw + 1 : 0)) {
                        redBoxDates.add(l.date);
                    }
                }
                
                if (adjustment && adjustment.forceRedBoxDates && adjustment.forceRedBoxDates.includes(l.date)) {
                    redBoxDates.add(l.date);
                }
            });
            
            if (mc.year === targetYear && mc.month === targetMonth) {
                if (mLogs.length > 0) tableHasAnyAttendance = true;
                
                let simulated = false;
                if (redBoxDates.size === 0 && tableHasAnyAttendance) {
                    let totalVal = Math.round((carryOverP + manualMakeup + attendances) * 10) / 10;
                    let cCycle = 0;
                    if (Math.round(totalVal * 10) >= triggerRaw) {
                        cCycle = Math.floor((Math.round(totalVal * 10) - triggerRaw) / limitRaw) + 1;
                    }
                    if (cCycle > 0) {
                        const firstLogDate = mLogs[0].date;
                        redBoxDates.add(firstLogDate);
                        simulated = true;
                    }
                }
                
                let actualRedDays = Array.from(redBoxDates).map(d => parseInt(d.split('-')[2], 10));
                
                tableRedBoxOccurrences = actualRedDays.length;
                tableSimulated = simulated;
            }
            
            let nextCarry = totalCombined - (cycle > 0 ? (limits.trigger + (cycle - 1) * limits.limit) : 0);
            carryOverP = nextCarry < 0 ? 0 : nextCarry;
        });
        
        const result = window.calculateRedBoxesForMonth(m, targetYear, targetMonth, attendance, "", adjustments);
        const badgeRedBoxOccurrences = (result && result.redDays && result.redDays.length > 0 && !result.isSimulated) ? result.redDays.length : 0;
        const badgeSimulated = result ? result.isSimulated : false;

        let tableCount = tableRedBoxOccurrences;
        let badgeCount = badgeRedBoxOccurrences;

        if (tableSimulated && tableCount > 0) tableCount = 0;
        
        if (tableCount !== badgeCount) {
            discrepancies.push({
                member: m.name,
                course: effectiveCourseName,
                month: targetMonth,
                table: tableCount,
                badge: badgeCount,
                tableSimulated,
                badgeSimulated,
                redBoxDates: Array.from(redBoxDates),
                badgeDates: result ? result.redDays : []
            });
        }
    });
}

console.log(`Found ${discrepancies.length} discrepancies.`);
if (discrepancies.length > 0) {
    console.log(JSON.stringify(discrepancies, null, 2));
}
