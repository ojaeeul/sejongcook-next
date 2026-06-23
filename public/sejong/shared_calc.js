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

window.getCourseAttendanceCutoff = function(courseNameScope, memberType) {
    let safeCourseKey = (courseNameScope || '').replace(/\s/g, '');
    let isDualCourse = courseNameScope && (
        (courseNameScope.includes('조리') && (courseNameScope.includes('제과') || courseNameScope.includes('제빵'))) ||
        (courseNameScope.includes('제과') && courseNameScope.includes('제빵'))
    );
    let maxP = isDualCourse ? 16.0 : 8.0;

    if (window.global_attendance_cutoffs && window.global_attendance_cutoffs[safeCourseKey] !== undefined) {
        maxP = parseFloat(window.global_attendance_cutoffs[safeCourseKey]);
        if (memberType === 'student' && window.global_attendance_cutoffs_student && window.global_attendance_cutoffs_student[safeCourseKey] !== undefined) {
            maxP = parseFloat(window.global_attendance_cutoffs_student[safeCourseKey]);
        }
    }
    return maxP;
};

window.getCourseLimits = function(courseNameScope, memberType) {
    let safeCourseKey = (courseNameScope || '').replace(/\s/g, '');
    
    // 1. 재고출석 커트라인 관리 (Limit)
    let limit = 8;
    let isLimitSet = false;
    if (window.global_makeup_cutoffs && window.global_makeup_cutoffs[safeCourseKey] !== undefined) {
        limit = parseFloat(window.global_makeup_cutoffs[safeCourseKey]);
        if (memberType === 'student' && window.global_makeup_cutoffs_student && window.global_makeup_cutoffs_student[safeCourseKey] !== undefined) {
            limit = parseFloat(window.global_makeup_cutoffs_student[safeCourseKey]);
        }
        isLimitSet = true;
    }
    
    // 2. 과정별 결재 주기 설정 (Trigger)
    let trigger = window.sejongCycleRules ? window.sejongCycleRules.default : 9;
    let isTriggerSet = false;
    
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
                isTriggerSet = true;
                break;
            }
        }
        
        // 제과제빵 키워드 폴백
        if (!matched && (safeCourseKey.includes('제과') || safeCourseKey.includes('제빵'))) {
            let bakingRule = window.sejongCycleRules.custom.find(r => r.keyword === "제과제빵");
            if (bakingRule) {
                trigger = bakingRule.cycle;
                isTriggerSet = true;
            }
        }
    }
    
    // Limit과 Trigger 간의 자동 보정 로직
    if (isLimitSet && !isTriggerSet) {
        trigger = limit + 1.0;
    }
    if (!isLimitSet && isTriggerSet) {
        limit = trigger > 1 ? trigger - 1.0 : trigger;
    }
    
    return { limit: limit, trigger: trigger };
};

window.calculateRedBoxesForMonth = function (member, targetYear, targetMonth, allAttendanceLogs, courseFilter, GLOBAL_DATA_ADJUSTMENTS, allPaymentsData) {
    if (!member) return { redDays: [], hasAnyAttendance: false, isSimulated: true };

    const isDualCourse = (courseFilter && String(courseFilter).replace(/\s/g, '').includes('제과제빵')) || (!courseFilter && String(member.course).replace(/\s/g, '').includes('제과제빵'));
    const attendanceIncrement = isDualCourse ? 1.0 : 1.0;

    let rowLogsRaw = allAttendanceLogs.filter(l => String(l.memberId) === String(member.id));
    if (courseFilter) {
        rowLogsRaw = rowLogsRaw.filter(l => {
            if (!l.course) {
                const memCourses = (member.course || '').split(',').map(c => c.replace(/\([^)]*\)/g, '').trim()).filter(Boolean);
                if (memCourses.length <= 1) return true;
                return false;
            }
            const cClean = String(l.course).replace(/\([^)]*\)/g, '').trim();
            const fClean = String(courseFilter).replace(/\([^)]*\)/g, '').trim();
            const cList = cClean.split(',').map(c => c.trim());
            return cList.includes(fClean);
        });
    }

    const uniqueRowLogsMap = new Map();
    rowLogsRaw.forEach(l => {
        const dateStr = l.date ? (l.date.includes('T') ? l.date.split('T')[0] : l.date) : (l.dateObj ? l.dateObj.toISOString().split('T')[0] : '');
        uniqueRowLogsMap.set(`${dateStr}_${l.course || ''}`, { ...l, date: dateStr });
    });
    let uniqueLogs = Array.from(uniqueRowLogsMap.values()).sort((a,b) => a.date.localeCompare(b.date));

    // [핵심 변경] 수납 대장(paymentsData)에서 이 학생/과정의 '가장 최근 결제일' 찾기
    let lastPaymentDateStr = null;
    if (allPaymentsData && Array.isArray(allPaymentsData)) {
        const paidRecords = allPaymentsData.filter(p => {
            if (String(p.memberId) !== String(member.id)) return false;
            if (p.status !== 'paid') return false;
            if (courseFilter && p.course) {
                const pCourse = String(p.course).replace(/\([^)]*\)/g, '').trim();
                const fClean = String(courseFilter).replace(/\([^)]*\)/g, '').trim();
                if (!pCourse.includes(fClean) && !fClean.includes(pCourse)) return false;
            }
            return true;
        });

        paidRecords.sort((a, b) => {
            const dateA = a.updatedAt ? new Date(a.updatedAt) : (a.date ? new Date(a.date) : new Date(`${a.year}-${String(a.month).padStart(2, '0')}-01`));
            const dateB = b.updatedAt ? new Date(b.updatedAt) : (b.date ? new Date(b.date) : new Date(`${b.year}-${String(b.month).padStart(2, '0')}-01`));
            return dateB - dateA; // Descending
        });

        if (paidRecords.length > 0) {
            const latestPayment = paidRecords[0];
            if (latestPayment.updatedAt) {
                lastPaymentDateStr = latestPayment.updatedAt.split('T')[0];
            } else if (latestPayment.date) {
                lastPaymentDateStr = latestPayment.date.split('T')[0];
            } else {
                lastPaymentDateStr = `${latestPayment.year}-${String(latestPayment.month).padStart(2, '0')}-01`;
            }
        }
    }

    // [핵심 변경] 결제일 이전의 모든 수기출석 기록은 강제로 무시 (자잘한 누적치 삭제 효과)
    if (lastPaymentDateStr) {
        uniqueLogs = uniqueLogs.filter(l => l.date >= lastPaymentDateStr);
    }

    const hasAnyAttendance = uniqueLogs.length > 0;

    let earliestYear = Number(targetYear);
    let earliestMonth = Number(targetMonth);

    let displayStartDate = lastPaymentDateStr; 
    if (!displayStartDate) {
        displayStartDate = member ? (member.start_date || member.registeredDate) : null;
    }
    
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
        if (step <= 0) step = 10;
        
        if (vRaw < firstLimit) return 0;
        return Math.floor((vRaw - firstLimit) / step) + 1;
    };

    let globalRunningTotal = 0;
    let allMilestones = [];

    // [핵심 변경] 수동 보정치 무시, 항상 결제일 이후 실제 기록으로만 카운트.
    let carryOverP = 0;

    monthsToCalc.forEach(mc => {
        const mLogs = uniqueLogs.filter(l => {
            const ld = new Date(l.date);
            return ld.getFullYear() === mc.year && (ld.getMonth() + 1) === mc.month;
        });

        let attendances = 0;

        mLogs.forEach(l => {
            const strStatus = String(l.status);
            const isMakeupMarker = ['[', ']'].includes(strStatus);
            const isNumericPresent = ['10', '12', '2', '5', '7', '3', '9'].includes(strStatus);
            const isAbsent = strStatus === 'absent' || strStatus.startsWith('X') || strStatus.includes('결석');
            const isEarly = strStatus === 'early' || strStatus.includes('조퇴');
            const isTardy = strStatus === 'tardy' || strStatus === 'late' || strStatus.includes('지각') || strStatus.includes('△');
            const isFirstLast = strStatus.includes('첫') || strStatus.includes('종료') || strStatus === '[' || strStatus === ']';
            const isPresent = strStatus === 'present' || strStatus.startsWith('O') || strStatus.startsWith('o');
            
            const isRegularAttendance = isPresent || isNumericPresent || isAbsent || isEarly || isTardy || isFirstLast || isMakeupMarker;

            if (isRegularAttendance) {
                attendances += attendanceIncrement;
                const prevNet = globalRunningTotal;
                globalRunningTotal += attendanceIncrement;
                globalRunningTotal = Math.round(globalRunningTotal * 10) / 10;
                const prevCycle = getCycle(prevNet);
                const currCycle = getCycle(globalRunningTotal);
                
                const dateStr = l.date.split('T')[0];
                
                // 결제일 당일의 출석은 사이클을 1로 만들기 때문에 박스가 생기지 않음 (trigger가 9이므로)
                if (currCycle > prevCycle) {
                    allMilestones.push({ year: mc.year, month: mc.month, day: parseInt(dateStr.split('-')[2], 10), isReal: true });
                }
            }
        });

        let totalCombined = Math.round((carryOverP + attendances) * 10) / 10;
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

        currentMonthLogs.forEach(l => {
            const strStatus = String(l.status);
            const isMakeupMarker = ['[', ']'].includes(strStatus);
            const isNumericPresent = ['10', '12', '2', '5', '7', '3', '9'].includes(strStatus);
            const isAbsent = strStatus === 'absent' || strStatus.startsWith('X') || strStatus.includes('결석');
            const isEarly = strStatus === 'early' || strStatus.includes('조퇴');
            const isTardy = strStatus === 'tardy' || strStatus === 'late' || strStatus.includes('지각') || strStatus.includes('△');
            const isFirstLast = strStatus.includes('첫') || strStatus.includes('종료') || strStatus === '[' || strStatus === ']';
            const isPresentExt = strStatus === 'present' || strStatus.startsWith('O') || strStatus.startsWith('o') || strStatus.startsWith('O^') || strStatus.startsWith('o^');
            
            const isRegularAttendance = isPresentExt || isNumericPresent || isAbsent || isEarly || isTardy || isFirstLast || isMakeupMarker;

            if (isRegularAttendance) {
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
        if (uniqueLogs.length > 0) {
            lastRecordDateObj = new Date(uniqueLogs[uniqueLogs.length - 1].date);
        } else if (lastPaymentDateStr) {
            lastRecordDateObj = new Date(lastPaymentDateStr);
            lastRecordDateObj.setDate(lastRecordDateObj.getDate() - 1);
        } else if (typeof latestSyncedDateStr !== 'undefined' && latestSyncedDateStr) {
            lastRecordDateObj = new Date(latestSyncedDateStr);
            lastRecordDateObj.setDate(lastRecordDateObj.getDate() - 1);
        } else if (displayStartDate) {
            lastRecordDateObj = new Date(displayStartDate);
            lastRecordDateObj.setDate(lastRecordDateObj.getDate() - 1);
        }
        
        if (lastRecordDateObj) {
            simDate = new Date(lastRecordDateObj.getTime() + 86400000);
        } else {
            simDate = new Date(currentMC.year, currentMC.month - 1, 1);
        }

        let simTotal = runningTotal;
        let limitCounter = 0;
        
        while (simDate <= limit && limitCounter < 2000) {
            limitCounter++;
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
                    allMilestones.push({ 
                        year: simDate.getFullYear(), 
                        month: simDate.getMonth() + 1, 
                        day: simDate.getDate(), 
                        isReal: false 
                    });
                }
            }
            simDate.setDate(simDate.getDate() + 1);
        }
    }

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

// --- [양방향 동기화 알림 기능] ---
(function() {
    if (typeof window === 'undefined' || window.sejongSyncInitialized) return;
    window.sejongSyncInitialized = true;

    const myTabId = Math.random().toString(36).substring(2, 15);
    let syncChannel;
    try {
        syncChannel = new BroadcastChannel('sejong_sync_channel');
    } catch(e) {
        return; // BroadcastChannel not supported
    }

    function createToast() {
        if (document.getElementById('sejong-sync-toast')) return;
        const style = document.createElement('style');
        style.textContent = `
            #sejong-sync-toast {
                position: fixed; bottom: 30px; right: 30px;
                background: #3b82f6; color: white; padding: 15px 20px;
                border-radius: 8px; box-shadow: 0 10px 15px rgba(0,0,0,0.2);
                z-index: 999999; display: none; align-items: center; gap: 15px;
                font-family: 'Pretendard', sans-serif; font-size: 0.95rem;
                animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }
            #sejong-sync-toast button {
                background: white; color: #3b82f6; border: none; padding: 8px 15px;
                border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.2s;
            }
            #sejong-sync-toast button:hover { background: #eff6ff; }
            @keyframes slideUp {
                from { transform: translateY(100px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        const toast = document.createElement('div');
        toast.id = 'sejong-sync-toast';
        toast.innerHTML = `
            <span>🔄 다른 탭에서 최신 데이터가 업데이트 되었습니다.</span>
            <button onclick="location.reload()">새로고침 (적용)</button>
        `;
        document.body.appendChild(toast);
    }

    syncChannel.onmessage = function(e) {
        if (e.data && e.data.type === 'DATA_MODIFIED' && e.data.tabId !== myTabId) {
            createToast();
            const toast = document.getElementById('sejong-sync-toast');
            if (toast) toast.style.display = 'flex';
        }
    };

    window.notifyGlobalDataChanged = function() {
        if (syncChannel) {
            syncChannel.postMessage({ type: 'DATA_MODIFIED', tabId: myTabId });
        }
    };

    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const response = await originalFetch.apply(window, args);
        try {
            const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
            const options = args[1] || {};
            const method = (options.method || (args[0] && args[0].method) || 'GET').toUpperCase();
            
            if (url) {
                const isApiCall = url.includes('api.php') || url.includes('/api/sejong/');
                const isModification = method === 'POST' || method === 'PUT' || method === 'DELETE' || method === 'PATCH';
                const isGetWithAction = method === 'GET' && (url.includes('action=save') || url.includes('action=delete') || url.includes('action=update'));

                if (isApiCall && (isModification || isGetWithAction)) {
                    if (response.ok) {
                        window.notifyGlobalDataChanged();
                    }
                }
            }
        } catch (e) {
            console.error('Sync interception error:', e);
        }
        return response;
    };

    /**
     * 당일 출석 누락자 8시 이후 자동 결석 처리 (일일/월간 출석부 연동)
     */
    window.autoMarkAbsences = async function(members, attendanceData, timetableData, holidaysData = []) {
        const now = new Date();
        const hours = now.getHours();
        if (hours < 20) return false; // 20:00 (오후 8시) 이전에는 동작 안 함

        const todayStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
        const dayOfWeek = now.getDay();
        
        // 일요일 또는 등록된 공휴일인 경우 당일은 제외
        if (dayOfWeek === 0) return false;
        if (holidaysData && holidaysData.some(h => h.date === todayStr)) return false;

        let hasChanges = false;
        let newAbsenceCount = 0;
        const postPromises = [];

        // 재원생만 필터링
        const activeMembers = members.filter(m => m.status !== 'trash' && m.status !== 'delete' && m.status !== 'completed' && m.status !== 'hold');

        for (const m of activeMembers) {
            if (!m.course || m.course.trim() === '') continue;

            const courses = m.course.split(',').map(c => c.trim());
            for (const cName of courses) {
                const cleanCourseName = cName.replace(/\([^)]*\)/g, '').trim();
                const tightCourseName = cleanCourseName.replace(/\s/g, '');

                let isClassDay = false;
                if (timetableData[cleanCourseName]) {
                    isClassDay = timetableData[cleanCourseName].includes(dayOfWeek);
                } else if (timetableData[tightCourseName]) {
                    isClassDay = timetableData[tightCourseName].includes(dayOfWeek);
                }

                if (isClassDay) {
                    // 해당 학생의 오늘 출석 기록이 있는지 확인
                    const dbRecord = attendanceData.find(a => {
                        if (String(a.memberId) !== String(m.id)) return false;
                        if (a.date !== todayStr) return false;
                        if (!a.course) return true; // 글로벌 기록인 경우 포함
                        const aCourseClean = a.course.replace(/\([^)]*\)/g, '').trim();
                        return aCourseClean.includes(cleanCourseName) || aCourseClean.includes(tightCourseName);
                    });

                    // 기록이 아예 없거나, status 속성이 비어있으면 '결석(X)' 삽입
                    if (!dbRecord || !dbRecord.status || dbRecord.status === 'unchecked') {
                        // 로컬 데이터에 즉시 반영
                        if (!dbRecord) {
                            attendanceData.push({
                                memberId: m.id,
                                date: todayStr,
                                status: 'X',
                                course: cName
                            });
                        } else {
                            dbRecord.status = 'X';
                        }
                        
                        hasChanges = true;
                        newAbsenceCount++;

                        // 서버로 POST 요청 큐에 추가
                        const API_BASE = window.location.href.includes('api.php') ? '/api.php?action=sejong_attendance' : '/api/sejong';
                        const fetchUrl = API_BASE + (API_BASE.includes('?') ? '&' : '/') + 'attendance?t=' + Date.now();
                        
                        postPromises.push(
                            fetch(fetchUrl, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    memberId: m.id,
                                    date: todayStr,
                                    status: 'X',
                                    course: cName
                                })
                            })
                        );
                    }
                }
            }
        }

        if (hasChanges && postPromises.length > 0) {
            try {
                await Promise.all(postPromises);
                console.log(`[Auto-Absence] Processed ${newAbsenceCount} new absences for today.`);
                window.notifyGlobalDataChanged();
                
                if (typeof showToast === 'function') {
                    showToast(`저녁 8시가 경과하여 누락된 ${newAbsenceCount}명의 당일 출석이 결석(X) 처리되었습니다.`);
                } else {
                    alert(`저녁 8시가 경과하여 누락된 ${newAbsenceCount}명의 당일 출석이 자동 결석 처리되었습니다.`);
                }
            } catch (e) {
                console.error('Failed to save auto-absences:', e);
            }
        }
        
        return hasChanges;
    };
})();
