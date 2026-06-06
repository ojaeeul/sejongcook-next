/**
 * shared_calc.js
 * 
 * 월간 출석부(sheet.html)의 붉은 박스(결제일) 계산 로직을 
 * 수강료 대장(ledger.js), 수강료 관리(tuition_v3.js), 문자 발송(sms_v3.js) 등 
 * 모든 페이지에서 100% 동일하게 사용하기 위한 공통 계산 엔진입니다.
 */

window.calculateRedBoxesForMonth = function (member, targetYear, targetMonth, allAttendanceLogs, courseFilter, GLOBAL_DATA_ADJUSTMENTS) {
    if (!member) return { redDays: [], hasAnyAttendance: false, isSimulated: true };

    const isDualCourse = (courseFilter && courseFilter.replace(/\s/g, '').includes('제과제빵')) || (!courseFilter && String(member.course).replace(/\s/g, '').includes('제과제빵'));
    const attendanceIncrement = isDualCourse ? 1.0 : 1.0;

    let rowLogsRaw = allAttendanceLogs.filter(l => String(l.memberId) === String(member.id));
    if (courseFilter) {
        rowLogsRaw = rowLogsRaw.filter(l => {
            if (!l.course) return true; // global log
            const cClean = l.course.replace(/\([^)]*\)/g, '').trim();
            const fClean = courseFilter.replace(/\([^)]*\)/g, '').trim();
            return cClean === fClean;
        });
    }

    const uniqueRowLogsMap = new Map();
    rowLogsRaw.forEach(l => {
        const dateStr = l.date ? (l.date.includes('T') ? l.date.split('T')[0] : l.date) : (l.dateObj ? l.dateObj.toISOString().split('T')[0] : '');
        uniqueRowLogsMap.set(`${dateStr}_${l.course || ''}`, { ...l, date: dateStr });
    });
    const uniqueLogs = Array.from(uniqueRowLogsMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    const hasAnyAttendance = uniqueLogs.length > 0;

    let earliestYear = Number(targetYear);
    let earliestMonth = Number(targetMonth);
    const displayStartDate = member.start_date || member.registeredDate;
    
    if (displayStartDate) {
        const rd = new Date(displayStartDate);
        if (!isNaN(rd)) {
            earliestYear = rd.getFullYear();
            earliestMonth = rd.getMonth() + 1;
        }
    }

    if (uniqueLogs.length > 0) {
        const d = new Date(uniqueLogs[0].date);
        const firstLogYear = d.getFullYear();
        const firstLogMonth = d.getMonth() + 1;
        if (firstLogYear < earliestYear || (firstLogYear === earliestYear && firstLogMonth < earliestMonth)) {
            earliestYear = firstLogYear;
            earliestMonth = firstLogMonth;
        }
    }

    if (Number(earliestYear) > Number(targetYear) || (Number(earliestYear) === Number(targetYear) && Number(earliestMonth) > Number(targetMonth))) {
        earliestYear = Number(targetYear);
        earliestMonth = Number(targetMonth);
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
            const isExtension = l.status === 'extension' || strStatus.startsWith('연') || strStatus.includes('연장') || strStatus.startsWith('E');
            const isPresent = l.status === 'present' || strStatus.startsWith('O') || strStatus.startsWith('o');
            
            const isRegularAttendance = isPresent || isNumericPresent || isAbsent || isEarly || isTardy || isFirstLast;

            if (isMakeupMarker) manualMakeup += attendanceIncrement;

            if (isRegularAttendance) {
                attendances += attendanceIncrement;
            }
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

    if (currentMC) {
        const currentMonthLogs = uniqueLogs.filter(l => {
            const ld = new Date(l.date);
            return ld.getFullYear() === currentMC.year && (ld.getMonth() + 1) === currentMC.month;
        });

        let runningTotal = currentMC.carryFromPrev;

        const getCycle = (val) => {
            let vRaw = Math.round(val * 10);
            if (isDualCourse) {
                if (vRaw < 170) return 0;
                return Math.floor((vRaw - 170) / 160) + 1;
            } else {
                if (vRaw < 90) return 0;
                return Math.floor((vRaw - 90) / 80) + 1;
            }
        };

        let currentCycle = getCycle(currentMC.carryFromPrev);
        if (isNaN(currentCycle)) currentCycle = 0;
        
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
                if (newCycle > currentCycle) {
                    shouldShowRedBox = true;
                    currentCycle = newCycle;
                }

                if (shouldShowRedBox) {
                    redBoxDates.add(l.date);
                }

                if (adjustment && adjustment.forceRedBoxDates && adjustment.forceRedBoxDates.includes(l.date)) {
                    redBoxDates.add(l.date);
                }
            }
        });
    }

    const actualRedDays = Array.from(redBoxDates).map(d => parseInt(d.split('-')[2], 10));
    
    return {
        redDays: actualRedDays,
        hasAnyAttendance: hasAnyAttendance,
        isSimulated: true
    };
};
