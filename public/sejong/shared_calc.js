// AI ASSISTANT RULE: 원장님의 명시적인 허가 없이 이 파일(공통 계산 로직)을 절대 수정하지 마세요. 수정이 필요하다면 먼저 한국어로 질문하고 허가를 받아야 합니다.
/**
 * shared_calc.js
 * 
 * 월간 출석부(sheet.html)의 붉은 박스(결제일) 계산 로직을 
 * 수강료 대장(ledger.js), 수강료 관리(tuition_v3.js), 문자 발송(sms_v3.js) 등 
 * 모든 페이지에서 100% 동일하게 사용하기 위한 공통 계산 엔진입니다.
 */

window.sejongCycleRules = {
    default: 9,
    custom: [
        { keyword: "제과제빵", cycle: 17 }
    ]
};

window.loadCycleSettings = async function() {
    try {
        const res = await fetch(`/api/sejong/settings?t=${Date.now()}`);
        if (res.ok) {
            const dataArr = await res.json();
            const data = Array.isArray(dataArr) && dataArr.length > 0 ? dataArr[0] : (dataArr.key === "settings" ? dataArr.value : dataArr);
            if (data && data.cycleRules) {
                window.sejongCycleRules = data.cycleRules;
            }
            if (data && data.makeupCutoffs) {
                window.global_makeup_cutoffs = data.makeupCutoffs;
                window.global_makeup_cutoffs_student = data.makeupCutoffs_student || {};
            }
            if (data && data.attendanceCutoffs) {
                window.global_attendance_cutoffs = data.attendanceCutoffs;
                window.global_attendance_cutoffs_student = data.attendanceCutoffs_student || {};
            }
        }
    } catch(e) {
        console.error("Failed to load cycle settings:", e);
    }
};

window.getCourseCycleLength = function(courseNameScope, memberType) {
    let limits = window.getCourseLimits(courseNameScope, memberType);
    return limits.trigger; // Backward compatibility
};

window.getCourseLimits = function(courseNameScope, memberType) {
    let safeCourseKey = (courseNameScope || '').replace(/\s/g, '');
    
    // 1. 재고출석 커트라인 관리 (Limit 직접 설정, 우선순위 1)
    if (window.global_makeup_cutoffs && window.global_makeup_cutoffs[safeCourseKey] !== undefined) {
        let limit = parseFloat(window.global_makeup_cutoffs[safeCourseKey]);
        if (memberType === 'student' && window.global_makeup_cutoffs_student && window.global_makeup_cutoffs_student[safeCourseKey] !== undefined) {
            limit = parseFloat(window.global_makeup_cutoffs_student[safeCourseKey]);
        }
        return { limit: limit, trigger: limit + 1.0 };
    }
    
    // 2. 과정별 결재 주기 설정 (Trigger 직접 설정, 우선순위 2)
    let trigger = window.sejongCycleRules ? window.sejongCycleRules.default : 9;
    
    if (window.sejongCycleRules && window.sejongCycleRules.custom) {
        let matched = false;
        for (const rule of window.sejongCycleRules.custom) {
            if (courseNameScope && courseNameScope.includes(rule.keyword)) {
                if (memberType === 'student' && rule.cycle_student !== undefined) {
                    trigger = rule.cycle_student;
                } else {
                    trigger = rule.cycle;
                }
                matched = true;
                break;
            }
        }
        
        // 제과제빵 키워드 폴백
        if (!matched && (safeCourseKey.includes('제과') || safeCourseKey.includes('제빵'))) {
            let bakingRule = window.sejongCycleRules.custom.find(r => r.keyword === "제과제빵");
            if (bakingRule) trigger = bakingRule.cycle;
        }
    }
    
    return { limit: trigger - 1.0, trigger: trigger };
};

window.calculateRedBoxesForMonth = function (member, targetYear, targetMonth, allAttendanceLogs, courseFilter, GLOBAL_DATA_ADJUSTMENTS) {
    if (!member) return { redDays: [], hasAnyAttendance: false, isSimulated: true };

    const isDualCourse = (courseFilter && String(courseFilter).replace(/\s/g, '').includes('제과제빵')) || (!courseFilter && String(member.course).replace(/\s/g, '').includes('제과제빵'));
    const attendanceIncrement = isDualCourse ? 1.0 : 1.0;

    let rowLogsRaw = allAttendanceLogs.filter(l => String(l.memberId) === String(member.id));
    if (courseFilter) {
        rowLogsRaw = rowLogsRaw.filter(l => {
            if (!l.course) return true; // global log
            
            const cClean = String(l.course).replace(/\([^)]*\)/g, '').trim();
            const fClean = String(courseFilter).replace(/\([^)]*\)/g, '').trim();
            const cList = cClean.split(',').map(c => c.trim());
            return cList.includes(fClean);
        });
    }

    const uniqueRowLogsMap = new Map();
    rowLogsRaw.forEach(l => {
        const dateStr = l.date ? (l.date.includes('T') ? l.date.split('T')[0] : l.date) : (l.dateObj ? l.dateObj.toISOString().split('T')[0] : '');
        // Deduplicate using date AND course to match sheet.html exactly
        uniqueRowLogsMap.set(`${dateStr}_${l.course || ''}`, { ...l, date: dateStr });
    });
    const uniqueLogs = Array.from(uniqueRowLogsMap.values()).sort((a,b) => a.date.localeCompare(b.date));

    const hasAnyAttendance = uniqueLogs.length > 0;

    let earliestYear = Number(targetYear);
    let earliestMonth = Number(targetMonth);

    // [중요 수정] 출석 로그의 첫 날짜뿐만 아니라 학생의 '등록일/시작일'도 확인하여 가장 이른 시점을 시작점으로 잡아야 합니다.
    // 그래야 등록월에 걸려 있는 '이월 조정(carryOverride)' 값을 놓치지 않고 적용할 수 있습니다.
    const displayStartDate = member ? (member.start_date || member.registeredDate) : null;
    if (displayStartDate) {
        const p = displayStartDate.split('-');
        if (p.length >= 2) {
            const regYear = parseInt(p[0], 10);
            const regMonth = parseInt(p[1], 10);
            if (regYear < earliestYear || (regYear === earliestYear && regMonth < earliestMonth)) {
                earliestYear = regYear;
                earliestMonth = regMonth;
            }
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
        let limits = window.getCourseLimits(courseFilter || String(member.course), member.type);
        
        let firstLimit = Math.round(limits.trigger * 10);
        let step = Math.round(limits.limit * 10);
        if (step <= 0) step = 10; // safety fallback
        
        if (vRaw < firstLimit) return 0;
        return Math.floor((vRaw - firstLimit) / step) + 1;
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
    let pureRedBoxDates = new Set();
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
                    pureRedBoxDates.add(l.date);
                }

                if (adjustment && adjustment.forceRedBoxDates && adjustment.forceRedBoxDates.includes(l.date)) {
                    redBoxDates.add(l.date);
                }
            }
        });
    }

    let isSimulated = false;
    let simulatedAttendances = [];
    const hasRealMilestonesThisMonth = redBoxDates.size > 0;

    if (currentMC) {
        const now = new Date();
        const limit = new Date(now.getFullYear(), now.getMonth() + 2, 0);
        
        let simDate = null;
        
        let lastRecordDateObj = null;
        let logsUpToMonth = uniqueLogs.filter(l => {
            const ld = new Date(l.date);
            return ld.getFullYear() < currentMC.year || (ld.getFullYear() === currentMC.year && (ld.getMonth() + 1) <= currentMC.month);
        });

        if (logsUpToMonth.length > 0) {
            lastRecordDateObj = new Date(logsUpToMonth[logsUpToMonth.length - 1].date);
        } else if (latestSyncedDateStr) {
            lastRecordDateObj = new Date(latestSyncedDateStr);
            // [수정] 수기 결제일(보라박스) 당일부터 가상출석 카운트 시작
            lastRecordDateObj.setDate(lastRecordDateObj.getDate() - 1);
        } else if (displayStartDate) {
            // [수정] 출석 기록이 없어도 등록일/시작일이 있으면 그 날짜부터 시뮬레이션 시작
            lastRecordDateObj = new Date(displayStartDate);
            // 시작일 당일부터 카운트할 수 있도록 -1일 해줌
            lastRecordDateObj.setDate(lastRecordDateObj.getDate() - 1);
        }
        
        if (lastRecordDateObj) {
            simDate = new Date(lastRecordDateObj.getTime() + 86400000);
        } else {
            // Fallback
            simDate = new Date(currentMC.year, currentMC.month - 1, 1);
        }

        let simTotal = runningTotal;
        let limitCounter = 0;
        
        while (simDate <= limit && limitCounter < 2000) {
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
            let coursesToCheck = [];
            
            if (courseFilter) {
                coursesToCheck = String(courseFilter).split(',').map(c => c.replace(/\([^)]*\)/g, '').trim()).filter(c => c && !c.includes('[삭제]'));
            } else if (member.course) {
                coursesToCheck = String(member.course).split(',').map(c => c.replace(/\([^)]*\)/g, '').trim()).filter(c => c && !c.includes('[삭제]'));
            }

            if (coursesToCheck.length > 0) {
                let allowedDays = new Set();
                let hasFallback = false;
                
                coursesToCheck.forEach(c => {
                    const schedule = window.COURSE_SCHEDULES ? window.COURSE_SCHEDULES[c] : null;
                    if (schedule && Array.isArray(schedule)) {
                        schedule.forEach(d => allowedDays.add(Number(d)));
                    } else {
                        hasFallback = true;
                    }
                });

                if (hasFallback) {
                    if (dayOfWeek !== 0) isValidDay = true;
                } else {
                    if (allowedDays.has(dayOfWeek)) isValidDay = true;
                }
            } else {
                if (dayOfWeek !== 0) isValidDay = true;
            }

            if (isValidDay && !isHoliday) {
                simulatedAttendances.push({
                    year: simDate.getFullYear(),
                    month: simDate.getMonth() + 1,
                    day: simDate.getDate()
                });
                const prevSimCycle = getCycle(simTotal);
                simTotal += attendanceIncrement;
                const newSimCycle = getCycle(simTotal);
                
                if (newSimCycle > prevSimCycle) {
                    if (!hasRealMilestonesThisMonth) {
                        if (simDate.getFullYear() === targetYear && (simDate.getMonth() + 1) === targetMonth) {
                            redBoxDates.add(dateStr);
                            isSimulated = true;
                        }
                    }
                    
                    // [중요 수정] 가상 결제일(예정일)을 allMilestones에 명시적으로 추가하여 납부대장(tuition_v3.js)에서 '결제 예정일'로 인식하도록 함
                    allMilestones.push({ 
                        year: simDate.getFullYear(), 
                        month: simDate.getMonth() + 1, 
                        day: simDate.getDate(), 
                        isReal: false 
                    });
                    
                    // break removed so simulation continues until the limit
                }
            }
            simDate.setDate(simDate.getDate() + 1);
        }
    }

    // [중요 수정] scheduledDate 명시적 반환
    let finalScheduledDate = null;
    const futureMilestone = allMilestones.find(ms => !ms.isReal || new Date(ms.year, ms.month - 1, ms.day) > new Date());
    if (futureMilestone) {
        finalScheduledDate = futureMilestone;
    }

    const actualRedDays = Array.from(redBoxDates).map(d => parseInt(d.split('-')[2], 10));
    const pureRedDaysList = Array.from(pureRedBoxDates).map(d => parseInt(d.split('-')[2], 10));
    
    return {
        redDays: actualRedDays,
        pureRedDays: pureRedDaysList,
        hasAnyAttendance: hasAnyAttendance,
        isSimulated: isSimulated,
        simulatedAttendances: simulatedAttendances,
        allMilestones: allMilestones,
        scheduledDate: finalScheduledDate,
        currentCount: { count: carryOverP, target: window.getCourseCycleLength(courseFilter || String(member.course), member.type) }
    };
};
