const fs = require('fs');
const file = 'public/sejong/sheet.html';
let content = fs.readFileSync(file, 'utf8');

// The problematic getCycle function inside sheet.html
const oldGetCycle = `
                            // [수정] 월 시작 시점의 Net 주기를 먼저 계산하여 문턱값(threshold)을 정확히 판정
                            const getCycle = (val) => {
                                let vRaw = Math.round(val * 10);
                                if (isDualCourse) {
                                    if (vRaw < 170) return 0;
                    return Math.floor((vRaw - 170) / 170) + 1;
                } else {
                    if (vRaw < 90) return 0;
                    return Math.floor((vRaw - 90) / 90) + 1;
                                }
                            };`;

const newGetCycle = `
                            const getCycle = (val) => {
                                let vRaw = Math.round(val * 10);
                                if (isDualCourse) {
                                    if (vRaw < 170) return 0;
                                    return Math.floor((vRaw - 170) / 160) + 1;
                                } else {
                                    if (vRaw < 90) return 0;
                                    return Math.floor((vRaw - 90) / 80) + 1;
                                }
                            };`;

content = content.replace(oldGetCycle, newGetCycle);

// The displayMakeup and displayP calculation:
const oldJPLogicRegex = /const startNet = currentMC\.carryFromPrev;[\s\S]*?displayP = Math\.round\(\(runningTotal \- baseStock\) \* 10\) \/ 10;\s*\}/;

const newJPLogic = `
                            // EXPORT REAL RED BOXES TO LEDGER SYNC DATA
                            const syncKeyNow = \`\${m.id}_\${currentMC.year}_\${currentMC.month}_\${rowCourseNameScope || 'all'}\`;
                            const actualRedDays = Array.from(redBoxDates).map(d => parseInt(d.split('-')[2], 10));
                            window.ledgerSyncData[syncKeyNow] = actualRedDays;

                            // 1. 당월 순수 출석 일수 (당월에 참석한 횟수)
                            let currentMonthAttendances = 0;
                            currentMonthLogs.forEach(l => {
                                const strStatus = String(l.status);
                                const isNumericPresent = ['10', '12', '2', '5', '7', '3', '9'].includes(strStatus);
                                const isAbsent = l.status === 'absent' || strStatus.startsWith('X') || strStatus.includes('결석');
                                const isEarly = l.status === 'early' || strStatus.includes('조퇴');
                                const isTardy = l.status === 'tardy' || l.status === 'late' || strStatus.includes('지각') || strStatus.includes('△');
                                const isFirstLast = strStatus.includes('첫') || strStatus.includes('종료') || strStatus === '[' || strStatus === ']';
                                const isPresentExt = l.status === 'present' || strStatus.startsWith('O') || strStatus.startsWith('o') || strStatus.startsWith('O^') || strStatus.startsWith('o^'); 
                                const isRegularAttendance = isPresentExt || isNumericPresent || isAbsent || isEarly || isTardy || isFirstLast;
                                if (isRegularAttendance) {
                                    currentMonthAttendances += attendanceIncrement;
                                }
                            });
                            displayP = Math.round(currentMonthAttendances * 10) / 10;
                            if (adjustment && adjustment.presentOverride !== undefined) {
                                displayP = adjustment.presentOverride;
                            }

                            // 2. 재고출석 (진행률) 계산: 사용자의 "재고출석은 진행률" 요청에 따라 계산.
                            let vRaw = Math.round(runningTotal * 10);
                            let cycleCount = 0;
                            let currentProgress = runningTotal;
                            
                            if (isDualCourse) {
                                if (vRaw >= 170) cycleCount = Math.floor((vRaw - 170) / 160) + 1;
                                currentProgress = currentProgress - (cycleCount * 16);
                            } else {
                                if (vRaw >= 90) cycleCount = Math.floor((vRaw - 90) / 80) + 1;
                                currentProgress = currentProgress - (cycleCount * 8);
                            }
                            displayMakeup = Math.round(currentProgress * 10) / 10;
`;

// It might be difficult to match using regex. Let's find exactly the chunk to replace.
// "const startNet = currentMC.carryFromPrev;" down to "displayP = Math.round((runningTotal - baseStock) * 10) / 10;\n                            }"
`;
