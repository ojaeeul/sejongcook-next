// AI ASSISTANT RULE: 원장님의 명시적인 허가 없이 이 파일(공통 계산 로직)을 절대 수정하지 마세요. 수정이 필요하다면 먼저 한국어로 질문하고 허가를 받아야 합니다.
/**
 * shared_calc.js
 * 
 * 월간 출석부(sheet.html)의 붉은 박스(결제일) 계산 로직을 
 * 수강료 대장(ledger.js), 수강료 관리(tuition_v3.js), 문자 발송(sms_v3.js) 등 
 * 모든 페이지에서 100% 동일하게 사용하기 위한 공통 계산 엔진입니다.
 */

window.calculateRedBoxesForMonth = function (member, targetYear, targetMonth, allAttendanceLogs, courseFilter, GLOBAL_DATA_ADJUSTMENTS) {
    if (!member) return { redDays: [], hasAnyAttendance: false, isSimulated: true };

    const isDualCourse = (courseFilter && String(courseFilter).replace(/\s/g, '').includes('제과제빵')) || (!courseFilter && String(member.course).replace(/\s/g, '').includes('제과제빵'));
    const attendanceIncrement = isDualCourse ? 1.0 : 1.0;

    let rowLogsRaw = allAttendanceLogs.filter(l => String(l.memberId) === String(member.id));
    if (courseFilter) {
        rowLogsRaw = rowLogsRaw.filter(l => {
            if (!l.course) return true; // global log
            
            if (isDualCourse) {
                const lCourse = String(l.course || '').replace(/\s/g, '');
                if (lCourse.includes('제과') || lCourse.includes('제빵')) return true;
                if (lCourse.includes('양식기능사')) return true;
            }
            
            const cClean = String(l.course).replace(/\([^)]*\)/g, '').trim();
            const fClean = String(courseFilter).replace(/\([^)]*\)/g, '').trim();
            return cClean === fClean;
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

    let globalRunningTotal = 0;
    let globalCurrentCycle = 0;
    let allMilestones = [];

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

            if (isRegularAttendance || isMakeupMarker) {
                const prevNet = globalRunningTotal;
                globalRunningTotal += attendanceIncrement;
                globalRunningTotal = Math.round(globalRunningTotal * 10) / 10;
                const prevCycle = getCycle(prevNet);
                const currCycle = getCycle(globalRunningTotal);
                
                const dateStr = l.date.split('T')[0];
                const isForced = adjustment && adjustment.forceRedBoxDates && adjustment.forceRedBoxDates.includes(dateStr);
                
                if (currCycle > prevCycle || isForced) {
                    allMilestones.push({ year: mc.year, month: mc.month, day: parseInt(dateStr.split('-')[2], 10), isReal: true });
                }
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

                if (shouldShowRedBox) {
                    redBoxDates.add(l.date);
                }

                if (adjustment && adjustment.forceRedBoxDates && adjustment.forceRedBoxDates.includes(l.date)) {
                    redBoxDates.add(l.date);
                }
            }
        });
    }

    let isSimulated = false;

    if (redBoxDates.size === 0 && currentMC && hasAnyAttendance) {
        const now = new Date();
        const limit = new Date(now.getFullYear(), now.getMonth() + 2, 0);
        
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
            // Fix timezone issue when getting YYYY-MM-DD
            const yy = simDate.getFullYear();
            const mm = String(simDate.getMonth() + 1).padStart(2, '0');
            const dd = String(simDate.getDate()).padStart(2, '0');
            const dateStr = `${yy}-${mm}-${dd}`;
            
            const isHolidayInSys = window.holidaysData && window.holidaysData.some(h => h.date === dateStr);
            const isNationalHoliday = window.KOREAN_HOLIDAYS_MAP && !!window.KOREAN_HOLIDAYS_MAP[dateStr];
            const isHoliday = isHolidayInSys || isNationalHoliday;
            const dayOfWeek = simDate.getDay();

            let isValidDay = false;
            if (courseFilter) {
                const cleanFilter = courseFilter.replace(/\([^)]*\)/g, '').trim();
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
                    if (simDate.getFullYear() === targetYear && (simDate.getMonth() + 1) === targetMonth) {
                        redBoxDates.add(dateStr);
                        isSimulated = true;
                    }
                    break; 
                }
            }
            simDate.setDate(simDate.getDate() + 1);
        }
    }

    const actualRedDays = Array.from(redBoxDates).map(d => parseInt(d.split('-')[2], 10));
    
    return {
        redDays: actualRedDays,
        hasAnyAttendance: hasAnyAttendance,
        isSimulated: isSimulated,
        allMilestones: allMilestones,
        currentCount: { count: carryOverP, target: isDualCourse ? 17 : 9 }
    };
};
