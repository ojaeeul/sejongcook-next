                            latestMonth = lastD.getMonth() + 1;
                        }

                        let safetyCounter = 0;
                        while (safetyCounter < 300) {
                            safetyCounter++;
                            const key = `${iterYear}-${String(iterMonth).padStart(2, '0')}`;
                            monthsToCalc.push({ year: iterYear, month: iterMonth, key });
                            if (Number(iterYear) === Number(currentYear) && Number(iterMonth) === Number(currentMonth)) break;
                            iterMonth++;
                            if (iterMonth > 12) {
                                iterMonth = 1;
                                iterYear++;
                            }
                        }

                        let rollingExtCount = 0;
                        monthsToCalc.forEach(mc => {
                            // [수동 보정 적용] 해당 수강생의 특정 월에 보정값이 있으면 반영
                            const adjustment = GLOBAL_DATA_ADJUSTMENTS[String(m.id)]?.[mc.key];
                            if (adjustment && adjustment.carryOverride !== undefined) {
                                carryOverP = parseFloat(adjustment.carryOverride) || 0;
                            }

                            const mLogs = uniqueLogs.filter(l => {
                                const ld = new Date(l.date);
                                return ld.getFullYear() === mc.year && (ld.getMonth() + 1) === mc.month;
                            });

                            let manualMakeup = 0; // "그달 재고출석"
                            let attendances = 0;
                            let rawPresent = 0;

                            mc.carryFromPrevExtCount = rollingExtCount;

                            mLogs.forEach(l => {
                                const isMakeupMarker = ['[', ']'].includes(l.status);
                                const strStatus = String(l.status);
                                const isNumericPresent = ['10', '12', '2', '5', '7', '3', '9'].includes(strStatus);
                                const isAbsent = l.status === 'absent' || strStatus.startsWith('X') || strStatus.includes('결석');
                                const isEarly = l.status === 'early' || strStatus.includes('조퇴');
                                const isTardy = l.status === 'tardy' || l.status === 'late' || strStatus.includes('지각') || strStatus.includes('△');
                                const isFirstLast = strStatus.includes('첫') || strStatus.includes('종료') || strStatus === '[' || strStatus === ']';
                                const isExtension = l.status === 'extension' || strStatus.startsWith('연') || strStatus.includes('연장') || strStatus.startsWith('E');
                                const isPresent = l.status === 'present' || strStatus.startsWith('O') || strStatus.startsWith('o') || isNumericPresent;
                                const isRegularAttendance = isPresent || isAbsent || isEarly || isTardy || isFirstLast;

                                if (isMakeupMarker) manualMakeup += attendanceIncrement;

                                if (isRegularAttendance) {
                                    attendances += attendanceIncrement;
                                } else if (isExtension) {
                                    rollingExtCount++;
                                }

                                // Summary counts for the CURRENT VIEWED month only (for right-side totals)
                                if (mc.year === currentYear && mc.month === currentMonth) {
                                    if (isAbsent) sumA += attendanceIncrement;
                                    else if (isExtension) sumE += attendanceIncrement;
                                }

                                if (l.status === 'present' || isNumericPresent || isAbsent) rawPresent += attendanceIncrement;
                            });

                            // [수동 보정] 당월 출석 수 합계 오버라이드
                            if (adjustment && adjustment.presentOverride !== undefined) {
                                attendances = adjustment.presentOverride;
                            }

                            let totalCombined = Math.round((carryOverP + manualMakeup + attendances) * 10) / 10;
                            let vRaw = Math.round(totalCombined * 10);

                            if (m.id === '1770517017920') {
                                console.log(`[DEBUG] Month: ${mc.key}, carryOverP: ${carryOverP}, manualMakeup: ${manualMakeup}, attendances: ${attendances}, totalCombined: ${totalCombined}, rowCourseScope: ${rowCourseNameScope}`);
                            }

                            // 이월 로직에서 사용할 값 저장 (이전 달에서 넘어온 값)
                            mc.carryFromPrev = carryOverP;

                            // 요약 컬럼 계산을 위한 이전 달 로직 제거 (하단의 전체 누적 로직에서 처리됨)
                            // mc.m_J / mc.m_P 는 더 이상 여기서 계산하지 않습니다.

                            mc.m_Overflow = 0;
                            mc.manualMakeup = manualMakeup;
                            mc.attendances = attendances;

                            // 다음 달로 누적합 전체를 이월 (Summary는 계속 누적됨)
                            carryOverP = totalCombined;
                        });

                        const currentMC = monthsToCalc[monthsToCalc.length - 1];
                        if (currentMC) {
                            // m_J / m_P 는 아래에서 명확히 다시 계산하므로 여기서는 0으로 초기화
                            displayMakeup = 0;
                            displayP = 0;

                            // Calculate Red Box days for the current month
                            const currentMonthLogs = uniqueLogs.filter(l => {
                                const ld = new Date(l.date);
                                return ld.getFullYear() === currentMC.year && (ld.getMonth() + 1) === currentMC.month;
                            });

                            let runningTotal = currentMC.carryFromPrev;
                            let runningExtCount = currentMC.carryFromPrevExtCount || 0;

                            // [수정] 월 시작 시점의 Net 주기를 먼저 계산하여 문턱값(threshold)을 정확히 판정
                            const getCycle = (val) => {
                                const settings = getCycleSettings();
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
