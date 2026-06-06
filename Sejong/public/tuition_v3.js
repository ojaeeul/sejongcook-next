
function getFetchUrl(endpoint, isPost = false) {
    const url = `/api/sejong/${endpoint}`;
    return isPost ? url : url + (url.includes('?') ? '&' : '?') + `t=${Date.now()}`;
}


// tuition_v3.js

let membersData = [];
let paymentsData = [];
let attendanceData = [];
let holidaysData = [];
let attendanceByMember = {}; // Optimized lookup for 8th attendance calculation
const GLOBAL_DATA_ADJUSTMENTS = {};

let COURSE_SCHEDULES = {
    '한식기능사': [1, 3],
    '양식기능사': [2, 4],
    '일식기능사': [2, 4],
    '중식기능사': [2, 4],
    '제과기능사': [1, 3],
    '제빵기능사': [2, 4],
    '제과제빵기능사': [1, 2, 3, 4],
    '복어기능사': [5],
    '산업기사': [5],
    '가정요리': [2, 4],
    '가정요리': [2, 4],
    '브런치': [5]
};

// [데이터] 한국 주요 공휴일 명칭 맵 (2025-2027) - 전역 스코프
const KOREAN_HOLIDAYS_MAP = {
    "2025-01-01": "신정", "2025-01-28": "설날 연휴", "2025-01-29": "설날", "2025-01-30": "설날 연휴",
    "2025-03-01": "삼일절", "2025-03-03": "대체공휴일",
    "2025-05-05": "어린이날", "2025-05-06": "대체공휴일", "2025-05-07": "부처님오신날",
    "2025-06-06": "현충일", "2025-08-15": "광복절",
    "2025-10-03": "개천절", "2025-10-05": "추석 연휴", "2025-10-06": "추석", "2025-10-07": "추석 연휴", "2025-10-08": "대체공휴일", "2025-10-09": "한글날",
    "2025-12-25": "성탄절",
    "2026-01-01": "신정", "2026-02-16": "설날 연휴", "2026-02-17": "설날", "2026-02-18": "설날 연휴",
    "2026-03-01": "삼일절", "2026-03-02": "대체공휴일",
    "2026-05-05": "어린이날", "2026-05-24": "부처님오신날", "2026-05-25": "대체공휴일",
    "2026-06-06": "현충일", "2026-08-15": "광복절",
    "2026-09-24": "추석 연휴", "2026-09-25": "추석", "2026-09-26": "추석 연휴",
    "2026-10-03": "개천절", "2026-10-09": "한글날",
    "2026-12-25": "성탄절",
    "2027-01-01": "신정", "2027-02-06": "설날 연휴", "2027-02-07": "설날", "2027-02-08": "설날 연휴", "2027-02-09": "대체공휴일",
    "2027-03-01": "삼일절", "2027-05-05": "어린이날", "2027-05-13": "부처님오신날",
    "2027-06-06": "현충일", "2027-08-15": "광복절", "2027-08-16": "대체공휴일",
    "2027-09-14": "추석 연휴", "2027-09-15": "추석", "2027-09-16": "추석 연휴",
    "2027-10-03": "개천절", "2027-10-04": "대체공휴일", "2027-10-09": "한글날",
    "2027-12-25": "성탄절"
};
window.currentState = {
    year: parseInt(localStorage.getItem('sejong_tuition_currentYear')) || new Date().getFullYear(),
    month: parseInt(localStorage.getItem('sejong_tuition_currentMonth')) || new Date().getMonth() + 1,
    course: 'all',
    statusFilter: 'all',
    tab: 'enrolled',
    viewMode: 'total' // 'total', 'card', 'grouped'
};

const DEFAULT_PRICE = 200000;
let courseFees = {
    'all': 200000,
    '한식기능사': 200000,
    '양식기능사': 200000,
    '일식기능사': 200000,
    '중식기능사': 200000,
    '제과기능사': 200000,
    '제빵기능사': 200000,
    '제과제빵기능사': 200000,
    '복어기능사': 200000,
    '산업기사': 200000,
    '가정요리': 200000,
    '브런치': 200000
};

function calculateTotalFee(courseStr) {
    if (!courseStr) return courseFees['all'] || DEFAULT_PRICE;
    let courses = courseStr.split(',').map(s => s.split('(')[0].trim());
    const hjg = courses.some(c => c.includes('제과') && !c.includes('제과제빵'));
    const hjp = courses.some(c => c.includes('제빵') && !c.includes('제과제빵'));
    if (hjg && hjp) {
        courses = courses.filter(c => !c.includes('제과') && !c.includes('제빵'));
        courses.push('제과제빵기능사');
    }
    let total = 0;
    courses.forEach(c => {
        total += (courseFees[c] || courseFees['all'] || DEFAULT_PRICE);
    });
    return total;
}

document.addEventListener('DOMContentLoaded', () => {
    handleUrlParams();
    initYearOptions();
    initFilters();
    initTabs();
    initUtilityButtons();
    loadData();
    console.log("Tuition Management v3 Initialized.");
});

function handleUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const yr = params.get('year');
    const mo = params.get('month');
    const mid = params.get('memberId');

    if (yr) window.currentState.year = parseInt(yr);
    if (mo) window.currentState.month = parseInt(mo);
    if (mid) window.currentState.targetMemberId = mid;
}

function initYearOptions() {
    const yearSelect = document.getElementById('yearSelect');
    if (!yearSelect) return;

    yearSelect.innerHTML = '';
    for (let y = 2025; y <= 3000; y++) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = `${y}년`;
        if (y === window.currentState.year) opt.selected = true;
        yearSelect.appendChild(opt);
    }
}

function initFilters() {
    const yearSelect = document.getElementById('yearSelect');
    if (yearSelect) {
        yearSelect.addEventListener('change', (e) => {
            window.currentState.year = parseInt(e.target.value);
            localStorage.setItem('sejong_tuition_currentYear', window.currentState.year);
            renderTable();
        });
    }

    const monthSelect = document.getElementById('monthSelect');
    if (monthSelect) {
        monthSelect.value = window.currentState.month;
        monthSelect.addEventListener('change', (e) => {
            window.currentState.month = parseInt(e.target.value);
            localStorage.setItem('sejong_tuition_currentMonth', window.currentState.month);
            renderTable();
        });
    }

    const courseSelect = document.getElementById('courseFilter');
    if (courseSelect) {
        courseSelect.addEventListener('change', (e) => {
            window.currentState.course = e.target.value;
            renderTable();
        });
    }

    const statusSelect = document.getElementById('statusFilter');
    if (statusSelect) {
        statusSelect.addEventListener('change', (e) => {
            window.currentState.statusFilter = e.target.value;
            renderTable();
        });
    }
}

function changeMonth(delta) {
    window.currentState.month += delta;
    if (window.currentState.month > 12) {
        window.currentState.month = 1;
        window.currentState.year += 1;
    } else if (window.currentState.month < 1) {
        window.currentState.month = 12;
        window.currentState.year -= 1;
    }

    const yearSelect = document.getElementById('yearSelect');
    const monthSelect = document.getElementById('monthSelect');
    if (yearSelect) yearSelect.value = window.currentState.year;
    if (monthSelect) monthSelect.value = window.currentState.month;

    localStorage.setItem('sejong_tuition_currentYear', window.currentState.year);
    localStorage.setItem('sejong_tuition_currentMonth', window.currentState.month);

    renderTable();
}

function initTabs() {
    const btnEnrolled = document.querySelector('.tab-enrolled');
    const btnUnpaid = document.querySelector('.tab-unpaid');
    const btnPaid = document.querySelector('.tab-paid');

    if (btnEnrolled) {
        btnEnrolled.addEventListener('click', () => {
            window.currentState.tab = 'enrolled';
            updateTabStyles();
            renderTable();
        });
    }

    if (btnUnpaid) {
        btnUnpaid.addEventListener('click', () => {
            window.currentState.tab = 'unpaid';
            updateTabStyles();
            renderTable();
        });
    }

    if (btnPaid) {
        btnPaid.addEventListener('click', () => {
            window.currentState.tab = 'paid';
            updateTabStyles();
            renderTable();
        });
    }

    updateTabStyles();
}

function initUtilityButtons() {
    // Utility Buttons by ID
    document.getElementById('btnViewPaidList')?.addEventListener('click', () => {
        window.location.href = `paid_list.html?year=${window.currentState.year}`;
    });
    document.getElementById('btnSaveExcel')?.addEventListener('click', exportToCSV);
    document.getElementById('btnPrint')?.addEventListener('click', () => window.print());
    document.getElementById('btnMail')?.addEventListener('click', () => sendBulkMail());
    document.getElementById('btnSMS')?.addEventListener('click', () => openMessageModal('SMS'));

    document.getElementById('btnTuitionSettings')?.addEventListener('click', openTuitionSettings);
    document.getElementById('btnAutoSendSettings')?.addEventListener('click', () => showResultModal('안내', '준비 중인 기능입니다.'));

    // View Switching by ID
    const totalBtn = document.getElementById('btnViewTotal');
    const cardBtn = document.getElementById('btnViewCard');
    const groupedBtn = document.getElementById('btnViewGrouped');

    [totalBtn, cardBtn, groupedBtn].forEach((btn, index) => {
        if (!btn) return;
        btn.addEventListener('click', () => {
            const modes = ['total', 'card', 'grouped'];
            window.currentState.viewMode = modes[index];

            [totalBtn, cardBtn, groupedBtn].forEach(b => b?.classList.remove('active'));
            btn.classList.add('active');

            renderTable();
        });
    });
}

function updateTabStyles() {
    const btnEnrolled = document.querySelector('.tab-enrolled');
    const btnUnpaid = document.querySelector('.tab-unpaid');
    const btnPaid = document.querySelector('.tab-paid');
    if (!btnEnrolled || !btnUnpaid || !btnPaid) return;

    // Reset styles (Dimensional Inactive State)
    [btnEnrolled, btnUnpaid, btnPaid].forEach(b => {
        b.style.opacity = '0.5';
        b.style.border = '1px solid #e2e8f0';
        b.style.transform = 'scale(0.96) translateY(0)';
        b.style.boxShadow = 'none';
        b.style.zIndex = '1';
    });

    let active;
    if (window.currentState.tab === 'enrolled') active = btnEnrolled;
    else if (window.currentState.tab === 'unpaid') active = btnUnpaid;
    else active = btnPaid;

    if (active) {
        // Active 3D State
        active.style.opacity = '1';
        active.style.zIndex = '10';
        active.style.transform = 'translateY(-5px)';

        let baseColor = '#cbd5e1';
        if (window.currentState.tab === 'unpaid') baseColor = '#b45309';
        else if (window.currentState.tab === 'paid') baseColor = '#059669';

        active.style.boxShadow = `0 8px 0 ${baseColor}, 0 10px 20px rgba(0,0,0,0.1)`;

        if (window.currentState.tab === 'enrolled') {
            active.style.border = '1px solid #94a3b8';
            active.style.background = 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)';
        } else if (window.currentState.tab === 'unpaid') {
            active.style.border = '1px solid #b45309';
            active.style.background = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
            active.style.color = '#92400e';
        } else {
            active.style.border = '1px solid #059669';
            active.style.background = 'linear-gradient(135deg, #34d399 0%, #10b981 100%)';
            active.style.color = 'white';
        }
    }
}

async function loadData() {
    try {
        
        
        const [mRes, pRes, sRes, aRes, hRes, tRes] = await Promise.all([
            fetch(getFetchUrl('members')),
            fetch(getFetchUrl('payments')),
            fetch(getFetchUrl('settings')),
            fetch(getFetchUrl('attendance')),
            fetch(getFetchUrl('holidays')),
            fetch(getFetchUrl('timetable'))
        ]);
        const rawMembers = await mRes.json();
        membersData = Array.isArray(rawMembers) ? rawMembers.filter(m => !['delete', 'trash', 'hold', 'completed'].includes(m.status)) : [];
        paymentsData = await pRes.json();
        attendanceData = await aRes.json();
        holidaysData = await hRes.json();
        const timetableData = await tRes.json();

        if (timetableData && Object.keys(timetableData).length > 0) {
            COURSE_SCHEDULES = { ...COURSE_SCHEDULES, ...timetableData };
        }
        const rawSettings = await sRes.json();
        const settings = Array.isArray(rawSettings) ? rawSettings[0] : rawSettings;

        if (settings && settings.courseFees) {
            courseFees = { ...courseFees, ...settings.courseFees };
        }

        processAttendanceData();

        // [신규] 특정 학생(targetMemberId)이 지정된 경우 해당 학생의 납부 상태에 맞게 탭 자동 전환
        if (window.currentState.targetMemberId) {
            const mId = window.currentState.targetMemberId;
            const pm = paymentsData.find(p => p.memberId == mId && p.year == window.currentState.year && p.month == window.currentState.month && p.status !== 'delete');
            window.currentState.tab = (pm && pm.status === 'paid') ? 'paid' : 'unpaid';
            updateTabStyles();
        }

        renderTable();
    } catch (e) {
        console.error("Failed to load data", e);
    }
}

function processAttendanceData() {
    attendanceByMember = {};
    if (!Array.isArray(attendanceData)) return;

    const deduped = new Map();
    attendanceData.forEach(a => {
        if (!a.memberId || !a.date) return;
        const key = `${a.memberId}_${a.date}_${a.course || ''}`;
        if (!deduped.has(key)) deduped.set(key, a);
    });

    deduped.forEach(a => {
        const mid = a.memberId;
        if (!attendanceByMember[mid]) attendanceByMember[mid] = [];
        const dateObj = new Date(a.date);
        attendanceByMember[mid].push({
            ...a,
            dateObj: dateObj,
            yearNum: dateObj.getFullYear(),
            monthNum: dateObj.getMonth() + 1
        });
    });

    for (const mid in attendanceByMember) {
        attendanceByMember[mid].sort((a, b) => a.dateObj - b.dateObj);
    }
}

function getMemberEighthDayInMonth(memberId, year, month, courseFilter = null) {
    const syncKey = `${memberId}_${year}_${month}_${courseFilter || 'all'}`;
    const syncData = window.ledgerSyncData || JSON.parse(localStorage.getItem('sejong_ledger_sync') || '{}');
    
    // 1. Check real milestone
    if (syncData[syncKey]) {
        const rawSync = syncData[syncKey];
        const days = Array.isArray(rawSync) ? rawSync : (typeof rawSync === 'number' ? [rawSync] : []);
        if (days.length > 0) {
            return { eighthDays: days, eighthMonth: month, isSimulated: false, hasAnyAttendance: true };
        }
    }

    const m = membersData.find(m => String(m.id) === String(memberId));
    if (!m) return { eighthDays: [], eighthMonth: month, isSimulated: false, hasAnyAttendance: false };

    // Use shared engine
    const result = window.calculateRedBoxesForMonth(m, year, month, attendanceData, courseFilter, GLOBAL_DATA_ADJUSTMENTS);
    return { eighthDays: result.redDays, eighthMonth: month, isSimulated: result.isSimulated, hasAnyAttendance: result.hasAnyAttendance };
}

function renderTable() {
    const tbody = document.getElementById('tuitionListBody');
    const tableCard = document.querySelector('.table-card');
    if (!tbody || !tableCard) return;

    // Update Progress Header Text with Current Month
    const progressTh = document.getElementById('th-progress');
    if (progressTh) {
        progressTh.textContent = `${window.currentState.month}월 진행`;
    }

    const table = tableCard.querySelector('.tuition-table');
    let gridContainer = document.getElementById('tuitionGridContainer');
    let groupedContainer = document.getElementById('tuitionGroupedContainer');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (window.currentState.viewMode === 'total') {
        table.classList.remove('hidden');
    } else {
        table.classList.add('hidden');
    }

    if (gridContainer) {
        if (window.currentState.viewMode === 'card') {
            gridContainer.classList.remove('hidden');
        } else {
            gridContainer.classList.add('hidden');
        }
    }

    if (groupedContainer) {
        if (window.currentState.viewMode === 'grouped') {
            groupedContainer.classList.remove('hidden');
        } else {
            groupedContainer.classList.add('hidden');
        }
    }

    tbody.innerHTML = '';

    let countEnrolled = 0;
    let countUnpaid = 0;
    let countPaid = 0;

    const rows = [];
    membersData.forEach(m => {
        // Course Filter (UI Dropdown)
        if (window.currentState.course !== 'all') {
            if (!m.course || !m.course.includes(window.currentState.course)) return;
        }

        let myCourses = (m.course || '').split(',').map(c => c.trim()).filter(c => c !== '');
        const hasJeggwa = myCourses.some(c => c.includes('제과') && !c.includes('제과제빵'));
        const hasJeppang = myCourses.some(c => c.includes('제빵') && !c.includes('제과제빵'));
        if (hasJeggwa && hasJeppang) {
            myCourses = myCourses.filter(c => !c.includes('제과') && !c.includes('제빵'));
            myCourses.push('제과제빵기능사');
        }
        
        if (myCourses.some(c => c.includes('제과') && !c.includes('제과제빵')) && myCourses.some(c => c.includes('제빵') && !c.includes('제과제빵'))) {
            myCourses = myCourses.filter(c => !c.includes('제과') && !c.includes('제빵'));
            myCourses.push('제과제빵기능사');
        }
        
        if (myCourses.length === 0) {
            // 학생이 등록된 과정이 없는 경우 가상의 빈 과정을 하나 만들어서 처리할지 고려
            // 하지만 보통 수강관리에서는 과정이 있어야 의미가 있으므로 스킵하거나 기본 처리
            myCourses.push('');
        }

        myCourses.forEach(fullCourse => {
            const courseNameOnly = fullCourse ? fullCourse.split('(')[0].trim() : '';
            if (window.currentState.course !== 'all' && courseNameOnly !== window.currentState.course) return;

            const courseFee = courseFees[courseNameOnly] || courseFees['all'] || DEFAULT_PRICE;
            const stats = getMemberEighthDayInMonth(m.id, window.currentState.year, window.currentState.month, courseNameOnly);

            let isDueThisMonth = false;
            let scheduledDate = null;
            let imminentCourses = []; // 현재 이 과정 하나에 대한 임박/연체 정보만 배열로 담음 (호환성 유지)
            let totalDueAmount = 0;
            let currentProgressObj = stats && stats.currentCount ? stats.currentCount : { count: 0, target: 9 };
            let courseProgressList = []; // View에서 사용하기 위해 포맷 맞춤

            if (courseNameOnly) {
                
                let displayCount = currentProgressObj.count;
                let isDualLocal = (courseNameOnly && courseNameOnly.replace(/\s/g, '').includes('제과제빵')) || (!courseNameOnly && m.course && m.course.replace(/\s/g, '').includes('제과제빵'));
                let displayTarget = isDualLocal ? 17 : 9;
                
                let vRaw = Math.round(displayCount * 10);
                let cycleCount = 0;
                if (isDualLocal) {
                    if (vRaw >= 170) cycleCount = Math.floor((vRaw - 170) / 160) + 1;
                    displayCount = displayCount - (cycleCount * 16);
                } else {
                    if (vRaw >= 90) cycleCount = Math.floor((vRaw - 90) / 80) + 1;
                    displayCount = displayCount - (cycleCount * 8);
                }
                
                courseProgressList.push({ name: courseNameOnly, count: displayCount, target: displayTarget });
    
            }

            if (stats && stats.allMilestones) {
                let hasUnpaidInThisCourse = false;
                let paidMilestonesCount = 0;
                const normalizeCourse = (c) => (!c || c === 'null') ? null : String(c).trim();

                const isDualBakeryLocal = (courseNameOnly && courseNameOnly.replace(/\s/g, '').includes('제과제빵')) || (!courseNameOnly && m.course && m.course.replace(/\s/g, '').includes('제과제빵'));
                const firstTargetCount = isDualBakeryLocal ? 17 : 9;
                const subTargetCount = isDualBakeryLocal ? 16 : 8;
                let isFirstCycleForThisCourse = true;
                let remainingForLoop = currentProgressObj.count;
                stats.allMilestones.forEach(ms => {
                    let currentTargetCount = isFirstCycleForThisCourse ? firstTargetCount : subTargetCount;
                    const msPayment = paymentsData.find(p => p.memberId == m.id && p.year == ms.year && p.month == ms.month && normalizeCourse(p.course) === normalizeCourse(courseNameOnly) && p.status !== 'delete');
                    
                    if (msPayment && msPayment.status === 'paid') {
                        paidMilestonesCount++;
                        remainingForLoop -= currentTargetCount;
                            isFirstCycleForThisCourse = false;
                            
                    } else {
                        // 미납(unpaid) 또는 예약(future) 밀스톤
                        // 핵심: 실제 도장(출석 횟수)이 타겟에 도달했을 때만 미납 청구(핑크 날짜 박스 및 미납 표시)를 발생시킵니다!
                        const msDateObj = new Date(ms.year, ms.month - 1, ms.day);
                        if (remainingForLoop >= currentTargetCount || msDateObj <= today) {
                            if (ms.year === window.currentState.year && ms.month === window.currentState.month) {
                                isDueThisMonth = true;
                                imminentCourses.push({
                                    name: courseNameOnly,
                                    date: ms,
                                    fee: courseFee,
                                    isOverdue: true
                                });
                                totalDueAmount += courseFee;
                                hasUnpaidInThisCourse = true;
                            }
                            remainingForLoop -= currentTargetCount;
                            isFirstCycleForThisCourse = false;
                            
                        } else {
                            // 아직 횟수가 미달된 미래의 결제건은 미납으로 띄우지 않고 예약일로만 저장 (리스트에 추가 안 함)
                            if (!scheduledDate) {
                                scheduledDate = ms;
                            }
                        }
                    }
                });

                // 차감 로직은 getProgressInfo에서 sheet.html과 동일하게 처리하므로 여기서는 생략합니다.
                
                if (courseProgressList.length > 0) {
                    // courseProgressList[0].count = currentProgressObj.count; // Removed to preserve displayCount progress logic
                }

                if (!hasUnpaidInThisCourse && stats.scheduledDate) {
                    if (!scheduledDate) scheduledDate = stats.scheduledDate;
                }
            }

            // 개별 과정에 해당하는 리뷰 중인 달의 명시적 결제 기록 찾기 (휴지통 상태는 무시)
            const normalizeCourse = (c) => (!c || c === 'null') ? null : String(c).trim();
            const payment = paymentsData.find(p => p.memberId == m.id && p.year == window.currentState.year && p.month == window.currentState.month && normalizeCourse(p.course) === normalizeCourse(courseNameOnly) && p.status !== 'delete');
            const isPaidRecord = payment && payment.status === 'paid';
            let rowStatus = 'enrolled';
            let hasOverdue = imminentCourses.some(c => c.isOverdue);

            let isPaidToday = false;
            if (isPaidRecord) {
                const pDateStr = payment.updatedAt || payment.date;
                if (pDateStr) {
                    const pDate = new Date(pDateStr);
                    if (pDate.getFullYear() === today.getFullYear() && pDate.getMonth() === today.getMonth() && pDate.getDate() === today.getDate()) {
                        isPaidToday = true;
                    }
                }
            }

            if (m.status === 'completed' || m.status === 'trash') {
                rowStatus = m.status;
            } else if (payment && (payment.status === 'completed' || payment.status === 'trash')) {
                rowStatus = payment.status;
            } else if (hasOverdue) {
                rowStatus = 'unpaid';
            } else if (payment && payment.status === 'paid') {
                if (isPaidToday) {
                    rowStatus = 'paid';
                } else {
                    rowStatus = 'enrolled'; // 그날(오늘) 납부한 게 아니면 수강중으로 복귀
                }
            } else if (payment && payment.status) {
                rowStatus = payment.status;
            }

            // 수료생/휴지통은 모든 탭에서 완전히 제외 (카운트 및 목록 표시 안 함)
            if (rowStatus === 'completed' || rowStatus === 'trash') return;

            const amount = imminentCourses.length > 0 ? totalDueAmount : courseFee;
            const totalPaidInSelectedMonth = isPaidRecord ? (payment.amount || amount) : 0;

            // [추가] 탭별 카운팅 (필터링 전 수행)
            if (rowStatus === 'paid') {
                countPaid++;
                countEnrolled++; // 납부완료자도 '수강중' 탭에서 동시에 보이도록 포함
            } else if (rowStatus === 'unpaid') {
                if (isDueThisMonth) {
                    countUnpaid++;
                }
                countEnrolled++; // 미납자도 '수강중' 탭에서 동시에 보이도록 포함
            } else {
                countEnrolled++;
            }

            // 탭 필터링
            if (window.currentState.tab === 'enrolled') {
                // 수강중 탭은 '수강중', '미납', '납부완료' 등 수강 중인 모든 활성 상태를 다 보여줍니다.
                // 필터링 없이 그대로 진행
            } else if (window.currentState.tab === 'unpaid') {
                if (rowStatus !== 'unpaid' || !isDueThisMonth) return;
            } else if (window.currentState.tab === 'paid') {
                if (rowStatus !== 'paid') return; // 오늘 납부한 사람(rowStatus === 'paid')만 납부완료 탭에 표시
            }

            // 상태 필터 드롭다운 연동
            if (window.currentState.statusFilter !== 'all' && rowStatus !== window.currentState.statusFilter) return;

            const isPaid = isPaidRecord || (payment && payment.status === 'paid') || (imminentCourses.length === 0 && rowStatus === 'paid');

            rows.push({
                member: m,
                courseName: courseNameOnly, // 추가된 프로퍼티
                payment,
                isPaid,
                amount,
                totalPaidAmount: totalPaidInSelectedMonth,
                scheduledDate,
                imminentCourses,
                isDueThisMonth,
                rowStatus,
                currentProgressCount: currentProgressObj.count,
                courseProgressList
            });
        });
    });

    // [추가] 탭 엘리먼트 텍스트(카운트) 동적 갱신
    const btnEnrolled = document.querySelector('.tab-enrolled');
    const btnUnpaid = document.querySelector('.tab-unpaid');
    const btnPaid = document.querySelector('.tab-paid');
    if (btnEnrolled) btnEnrolled.innerHTML = `<span class="material-icons">person</span> 수강중 (${countEnrolled})`;
    if (btnUnpaid) btnUnpaid.innerHTML = `<span class="material-icons">priority_high</span> 미납 (${countUnpaid})`;
    if (btnPaid) btnPaid.innerHTML = `<span class="material-icons">check_circle</span> 납부완료 (${countPaid})`;

    if (rows.length === 0) {
        if (window.currentState.viewMode === 'total') {
            tbody.innerHTML = '<tr><td colspan="8" class="no-data-cell">데이터가 없습니다.</td></tr>';
        } else if (window.currentState.viewMode === 'card' && gridContainer) {
            gridContainer.innerHTML = '<div class="no-data-card">데이터가 없습니다.</div>';
        }
        return;
    }

    if (window.currentState.viewMode === 'total') renderTotalView(rows, tbody);
    else if (window.currentState.viewMode === 'card') renderCardView(rows, tableCard);
    else if (window.currentState.viewMode === 'grouped') renderGroupedView(rows, tableCard);
}

function renderTotalView(rows, tbody) {
    rows.forEach(row => {
        const m = row.member;
        const paidAmount = row.totalPaidAmount || 0;
        const isPaid = row.isPaid;

        const statusHtml = `
            <div style="display: flex; align-items: center; gap: 6px;">
                <select class="status-dropdown ${row.rowStatus}" onchange="confirmStatusChange('${m.id}', this.value, '${m.name}', ${row.courseName ? `'${row.courseName}'` : 'null'})" style="width: 85px;">
                    <option value="unpaid" ${row.rowStatus === 'unpaid' ? 'selected' : ''}>미납</option>
                    <option value="paid" ${row.rowStatus === 'paid' ? 'selected' : ''}>납부완료</option>
                    <option value="enrolled" ${row.rowStatus === 'enrolled' ? 'selected' : ''}>수강중</option>
                    <option value="" disabled>---</option>
                    <option value="completed">수료생</option>
                    <option value="trash">휴지통</option>
                </select>
                <div onclick="location.href='ledger.html?memberId=${m.id}&year=${window.currentState.year}'" 
                     title="출석부 상세 확인" 
                     style="color: #64748b; display: flex; align-items: center; cursor: pointer; padding: 2px; border-radius: 4px; transition: background 0.2s;"
                     onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">
                    <span class="material-icons" style="font-size: 1.2rem;">search</span>
                </div>
            </div>
        `;

        const isTarget = window.currentState.targetMemberId && String(m.id) === String(window.currentState.targetMemberId);

        const tr = document.createElement('tr');
        if (isTarget) {
            tr.style.background = '#fffbeb';
            tr.style.outline = '2px solid #fbbf24';
            tr.style.boxShadow = '0 0 10px rgba(251, 191, 36, 0.2)';
            setTimeout(() => {
                tr.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }

        const progressHtml = row.courseProgressList.map(cp => {
            const target = cp.target || 9;
            const progressPercent = Math.min(100, (cp.count / target) * 100);
            return `
                <div style="display: flex; flex-direction: column; gap: 1px; margin-bottom: 5px;">
                    <div style="font-size: 0.6rem; color: #64748b; font-weight: 700; display:flex; justify-content:space-between; align-items:center;">
                        <span>${cp.name}</span>
                        <span style="font-size: 0.72rem; color: #475569;">${cp.count}/${target}회</span>
                    </div>
                    <div class="progress-container" style="height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);">
                        <div class="progress-bar" style="width: ${progressPercent}%; height: 100%; background: ${cp.count >= target ? 'linear-gradient(90deg, #d946ef, #a21caf)' : 'linear-gradient(90deg, #3b82f6, #2563eb)'}; transition: width 0.5s ease;"></div>
                    </div>
                </div>
            `;
        }).join('') || `<div style="font-size: 0.8rem; color: #94a3b8;">수강 정보 없음</div>`;

        tr.innerHTML = `
            <td>${statusHtml}</td>
            <td><input type="checkbox"></td>
            <td>
                <div class="student-cell" style="display: flex; flex-direction: column; align-items: flex-start; gap: 0;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <div onclick="location.href='ledger.html?memberId=${m.id}&year=${window.currentState.year}'" 
                           style="cursor: pointer; display: flex; align-items: center;"
                           title="출석부 상세 확인">
                            <span class="s-name" style="${isTarget ? 'color:#b45309; font-weight:900;' : ''}">${m.name || '이름없음'}</span>
                        </div>
                        <span style="font-size: 0.8rem; font-weight: 700; color: #059669; background: #ecfdf5; padding: 2px 6px; border-radius: 4px; border: 1px solid #10b981;">
                            ${row.courseName || '과정 없음'}
                        </span>
                    </div>
                    ${(row.imminentCourses.length > 0 && !row.isPaid)
                ? row.imminentCourses.map(c => `
                            <div style="display: flex; align-items: center; gap: 4px; margin-top: 1px;">
                                <span style="font-size: 0.6rem; color: ${c.isOverdue ? '#e11d48' : '#64748b'}; font-weight: 600;">${c.name}${c.isOverdue ? '(미납)' : ''}</span>
                                <span style="font-size: 0.72rem; color: #d946ef; font-weight: 800; background: #fdf2f8; padding: 0px 4px; border-radius: 3px; border: 1px solid #fbcfe8;">${c.date.month}/${c.date.day}</span>
                                ${c.fee > 0 ? `<span style="font-size: 0.65rem; color: #0f172a; font-weight: 700;">(${(c.fee / 10000)}만)</span>` : ''}
                                <span onclick="confirmStatusChange('${m.id}', 'paid', '${m.name}', '${c.name}', ${c.fee}, ${c.date.year}, ${c.date.month})" 
                                      style="font-size: 0.6rem; color: #2563eb; cursor: pointer; text-decoration: underline; margin-left: 2px;">(결제)</span>
                            </div>
                        `).join('')
                : `<div style="font-size: 0.65rem; color: #94a3b8; font-weight: 500; margin-top: -1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;" title="${row.courseName || m.course || ''}">${row.courseName || m.course || ''}</div>`
            }
                </div>
            </td>
            <td class="text-right">${row.amount.toLocaleString()}</td>
            <td class="text-right">${paidAmount.toLocaleString()}</td>
            <td class="text-right">0</td>
            <td class="text-right">0</td>
            <td>${progressHtml}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderCardView(rows, tableCard) {
    let gridContainer = document.getElementById('tuitionGridContainer');
    if (!gridContainer) {
        gridContainer = document.createElement('div');
        gridContainer.id = 'tuitionGridContainer';
        gridContainer.className = 'tuition-grid';
        tableCard.appendChild(gridContainer);
    }
    gridContainer.style.display = 'grid';
    gridContainer.innerHTML = '';

    rows.forEach(row => {
        const m = row.member;
        let statusLabel = '수강중';
        if (row.rowStatus === 'paid') statusLabel = '납부완료';
        else if (row.rowStatus === 'unpaid') statusLabel = '미납';

        const card = document.createElement('div');
        card.className = `tuition-card ${row.rowStatus}`;

        // Date formatting strings
        let dateHtml = '';
        if (row.rowStatus === 'paid' && row.payment) {
            const paidDateObj = row.payment.updatedAt ? new Date(row.payment.updatedAt) : new Date(row.payment.date || Date.now());
            const m = paidDateObj.getMonth() + 1;
            const d = paidDateObj.getDate();
            dateHtml = `<div style="color:#059669; font-size:0.8rem; font-weight:700; margin-bottom:5px;">✅ 결제 완료일: ${m}/${d}</div>`;
        } else if (row.isDueThisMonth && row.scheduledDate) {
            dateHtml = `<div style="color:#d946ef; font-size:0.8rem; font-weight:700; margin-bottom:5px;">📅 결제 예정일: ${row.scheduledDate.month}/${row.scheduledDate.day}</div>`;
        }

        card.innerHTML = `
            <div class="card-status">${statusLabel}</div>
            <div class="card-name">${m.name}</div>
            <div class="card-course" style="display:flex; flex-direction:column; align-items:center; gap:2px;">
                <span>${row.courseName || getCourseShort(m.course)}</span>
                ${row.rowStatus === 'enrolled' ? `<span style="font-size: 0.75rem; color: #475569; font-weight: 700;">(청구금액: ${row.amount.toLocaleString()}원)</span>` : ''}
            </div>
            ${dateHtml}
            <div class="card-amount">청구: ${row.amount.toLocaleString()}원</div>
            <div style="margin-top:10px; display:flex; gap:5px;">
                <button class="card-toggle-btn" onclick="togglePayment('${m.id}', 'paid', '${row.courseName}')" style="flex:1; display:${row.rowStatus === 'paid' ? 'none' : 'block'}">납부</button>
                <button class="card-toggle-btn" onclick="togglePayment('${m.id}', 'unpaid', '${row.courseName}')" style="flex:1; display:${row.rowStatus === 'paid' ? 'block' : 'none'}; background:#94a3b8;">취소</button>
            </div>
        `;
        gridContainer.appendChild(card);
    });
}

function renderGroupedView(rows, tableCard) {
    let container = document.getElementById('tuitionGroupedContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'tuitionGroupedContainer';
        container.className = 'tuition-grouped';
        tableCard.appendChild(container);
    }
    container.style.display = 'grid';
    container.innerHTML = '';

    const statuses = [
        { id: 'unpaid', label: '미납', class: 'unpaid' },
        { id: 'enrolled', label: '수강중', class: 'enrolled' },
        { id: 'paid', label: '납부완료', class: 'paid' }
    ];

    statuses.forEach(status => {
        let statusRows;
        if (status.id === 'unpaid') {
            statusRows = rows.filter(r => r.rowStatus === 'unpaid' && r.isDueThisMonth);
        } else {
            statusRows = rows.filter(r => r.rowStatus === status.id);
        }

        const column = document.createElement('div');
        column.className = `grouped-column ${status.class}`;

        column.innerHTML = `
            <div class="grouped-header">
                <span>${status.label}</span>
                <span style="font-size: 0.8rem; opacity: 0.8;">${statusRows.length}명</span>
            </div>
            <div class="grouped-list">
                ${statusRows.map(r => {
            const m = r.member;
            const cName = r.courseName || getCourseShort(m.course);
            let infoText = '';

            if (r.rowStatus === 'enrolled') {
                const startDateStr = m.start_date ? new Date(m.start_date).toLocaleDateString() : '미상';
                infoText = `시작: ${startDateStr} | ${cName}`;
            } else if (r.rowStatus === 'unpaid') {
                const dStr = (r.isDueThisMonth && r.scheduledDate) ? `${r.scheduledDate.month}/${r.scheduledDate.day}` : '미상';
                infoText = `예정: ${dStr} | ${cName}`;
            } else if (r.rowStatus === 'paid') {
                let paidStr = '미상';
                if (r.payment) {
                    const pDate = r.payment.updatedAt ? new Date(r.payment.updatedAt) : new Date(r.payment.date || Date.now());
                    paidStr = `${pDate.getMonth() + 1}/${pDate.getDate()}`;
                }
                infoText = `완료: ${paidStr} | ${cName}`;
            }

            return `
                        <div class="grouped-item" onclick="location.href='ledger.html?memberId=${m.id}&year=${window.currentState.year}'" style="cursor:pointer;">
                            <div class="grouped-item-name">${m.name}</div>
                            <div class="grouped-item-info">${infoText}</div>
                        </div>
                    `;
        }).join('')}
                ${statusRows.length === 0 ? '<div style="text-align:center; padding:20px; color:#94a3b8; font-size:0.8rem;">해당 없음</div>' : ''}
            </div>
        `;
        container.appendChild(column);
    });
}

function getCourseShort(courseStr) {
    if (!courseStr) return '';
    return courseStr.split(',').map(s => s.split('(')[0].trim()).join(', ');
}

async function togglePayment(memberId, forcedStatus = null, courseName = null, amount = null, targetYear = null, targetMonth = null) {
    const member = membersData.find(m => m.id == memberId);
    if (!member) return;

    const year = targetYear || window.currentState.year;
    const month = targetMonth || window.currentState.month;

    const normalizeCourse = (c) => (!c || c === 'null') ? null : String(c).trim();
    const payment = paymentsData.find(p => p.memberId == memberId && p.year == year && p.month == month && normalizeCourse(p.course) === normalizeCourse(courseName) && p.status !== 'delete');
    const isPaid = payment && payment.status === 'paid';
    const newStatus = forcedStatus || (isPaid ? 'unpaid' : 'paid');

    try {
        
        await fetch(getFetchUrl('payments', true), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                memberId: memberId,
                year: year,
                month: month,
                course: courseName,
                status: newStatus,
                amount: amount || calculateTotalFee(courseName || member.course),
                updatedAt: new Date().toISOString()
            })
        });
        await loadData();
        localStorage.setItem('sejong_payment_sync', Date.now().toString());
    } catch (e) {
        console.error("Update failed", e);
        showResultModal('오류', '데이터 업데이트에 실패했습니다.');
    }
}

function confirmStatusChange(memberId, newStatus, memberName, courseName = null, amount = null, targetYear = null, targetMonth = null) {
    if (newStatus === 'completed' || newStatus === 'trash') {
        const actionName = newStatus === 'completed' ? '수료생 보관함' : '휴지통';
        showConfirmModal(
            '수강생 이동 확인',
            `<strong>${memberName}</strong> 수강생을 <strong>${actionName}</strong>(으)로 이동하시겠습니까?<br><span style="color:red;font-size:0.85rem;">이동 시 수강료 목록에서 완전히 제외됩니다.</span>`,
            async () => {
                try {
                    const member = membersData.find(m => String(m.id) === String(memberId));
                    if (member) {
                        member.status = newStatus;
                        
                        const res = await fetch(getFetchUrl('members', true), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(member)
                        });
                        if (res.ok) {
                            await loadData();
                            showResultModal('이동 완료', `${actionName}(으)로 이동되었습니다.`, true);
                        } else {
                            showResultModal('오류', '이동 중 서버 오류가 발생했습니다.', false);
                            renderTable();
                        }
                    }
                } catch(e) {
                    console.error(e);
                    showResultModal('오류', '이동 중 서버 오류가 발생했습니다.', false);
                    renderTable();
                }
            },
            () => {
                renderTable(); // Revert select value on cancel
            }
        );
        return;
    }

    let statusText = '미납';
    if (newStatus === 'paid') statusText = '납부완료';
    else if (newStatus === 'enrolled') statusText = '수강중';

    const targetDesc = courseName ? `[${courseName}] 과정` : '전체 수강료';
    const dateDesc = (targetYear && targetMonth) ? ` (${targetYear}년 ${targetMonth}월)` : '';

    showConfirmModal(
        '상태 변경 확인',
        `<strong>${memberName}</strong> 님의 <strong>${targetDesc}${dateDesc}</strong> 상태를<br><strong>[${statusText}]</strong>로 변경하시겠습니까?`,
        () => {
            togglePayment(memberId, newStatus, courseName, amount, targetYear, targetMonth);
        },
        () => {
            renderTable(); // Revert select value on cancel
        }
    );
}

function exportToCSV() {
    const rows = [];
    const headers = ["상태", "성명", "과정", "청구금액", "수납금액", "미수금액", "연체", "납부율"];
    rows.push(headers.join(","));

    membersData.forEach(m => {
        let myCourses = (m.course || '').split(',').map(c => c.trim()).filter(c => c !== '');
        const hasJeggwa = myCourses.some(c => c.includes('제과') && !c.includes('제과제빵'));
        const hasJeppang = myCourses.some(c => c.includes('제빵') && !c.includes('제과제빵'));
        if (hasJeggwa && hasJeppang) {
            myCourses = myCourses.filter(c => !c.includes('제과') && !c.includes('제빵'));
            myCourses.push('제과제빵기능사');
        }
        
        if (myCourses.some(c => c.includes('제과') && !c.includes('제과제빵')) && myCourses.some(c => c.includes('제빵') && !c.includes('제과제빵'))) {
            myCourses = myCourses.filter(c => !c.includes('제과') && !c.includes('제빵'));
            myCourses.push('제과제빵기능사');
        }
        if (myCourses.length === 0) myCourses.push('');

        myCourses.forEach(fullCourse => {
            const courseNameOnly = fullCourse ? fullCourse.split('(')[0].trim() : '';
            if (window.currentState.course !== 'all' && courseNameOnly !== window.currentState.course) return;

            const normalizeCourse = (c) => (!c || c === 'null') ? null : String(c).trim();
            const payment = paymentsData.find(p =>
                p.memberId == m.id &&
                p.year == window.currentState.year &&
                p.month == window.currentState.month &&
                normalizeCourse(p.course) === normalizeCourse(courseNameOnly) &&
                p.status !== 'delete'
            );
            const isPaid = payment && payment.status === 'paid';
            const amount = calculateTotalFee(courseNameOnly || m.course);

            rows.push([
                isPaid ? "납부완료" : "미납",
                m.name,
                courseNameOnly || "과정 없음",
                amount,
                isPaid ? amount : 0,
                isPaid ? 0 : amount,
                0,
                isPaid ? "100%" : "0%"
            ].join(","));
        });
    });

    if (rows.length <= 1) return alert('내보낼 데이터가 없습니다.');

    const csvContent = "\ufeff" + rows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `수강료대장_${window.currentState.year}년_${window.currentState.month}월.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show result modal after brief delay
    setTimeout(() => {
        showResultModal('저장 완료', '엑셀 파일(CSV) 다운로드가 생성되었습니다.');
    }, 500);
}

function openMessageModal(type) {
    const modal = document.getElementById('messageModal');
    if (!modal) return;
    document.getElementById('msgModalTitle').textContent = `${type} 발송 시뮬레이션`;
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function closeMessageModal() {
    const modal = document.getElementById('messageModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}

function openTuitionSettings() {
    const modal = document.getElementById('tuitionSettingModal');
    if (modal) {
        document.getElementById('fee_all').value = (courseFees['all'] || DEFAULT_PRICE).toLocaleString();
        document.getElementById('fee_hansik').value = (courseFees['한식기능사'] || 200000).toLocaleString();
        document.getElementById('fee_yangsik').value = (courseFees['양식기능사'] || 200000).toLocaleString();
        document.getElementById('fee_ilsik').value = (courseFees['일식기능사'] || 200000).toLocaleString();
        document.getElementById('fee_jungsik').value = (courseFees['중식기능사'] || 200000).toLocaleString();
        document.getElementById('fee_jegwa').value = (courseFees['제과기능사'] || 200000).toLocaleString();
        document.getElementById('fee_jebang').value = (courseFees['제빵기능사'] || 200000).toLocaleString();
        document.getElementById('fee_jegwajebang').value = (courseFees['제과제빵기능사'] || 200000).toLocaleString();
        document.getElementById('fee_bok-eo').value = (courseFees['복어기능사'] || 200000).toLocaleString();
        document.getElementById('fee_san-eop').value = (courseFees['산업기사'] || 200000).toLocaleString();
        document.getElementById('fee_gajeong').value = (courseFees['가정요리'] || 200000).toLocaleString();
        document.getElementById('fee_brunch').value = (courseFees['브런치'] || 200000).toLocaleString();
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
}

function closeTuitionSettings() {
    const modal = document.getElementById('tuitionSettingModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}

async function saveTuitionSettings() {
    courseFees['all'] = parseInt(document.getElementById('fee_all').value.replace(/,/g, '')) || DEFAULT_PRICE;
    courseFees['한식기능사'] = parseInt(document.getElementById('fee_hansik').value.replace(/,/g, '')) || DEFAULT_PRICE;
    courseFees['양식기능사'] = parseInt(document.getElementById('fee_yangsik').value.replace(/,/g, '')) || DEFAULT_PRICE;
    courseFees['일식기능사'] = parseInt(document.getElementById('fee_ilsik').value.replace(/,/g, '')) || DEFAULT_PRICE;
    courseFees['중식기능사'] = parseInt(document.getElementById('fee_jungsik').value.replace(/,/g, '')) || DEFAULT_PRICE;
    courseFees['제과기능사'] = parseInt(document.getElementById('fee_jegwa').value.replace(/,/g, '')) || DEFAULT_PRICE;
    courseFees['제빵기능사'] = parseInt(document.getElementById('fee_jebang').value.replace(/,/g, '')) || DEFAULT_PRICE;
    courseFees['제과제빵기능사'] = parseInt(document.getElementById('fee_jegwajebang').value.replace(/,/g, '')) || DEFAULT_PRICE;
    courseFees['복어기능사'] = parseInt(document.getElementById('fee_bok-eo').value.replace(/,/g, '')) || DEFAULT_PRICE;
    courseFees['산업기사'] = parseInt(document.getElementById('fee_san-eop').value.replace(/,/g, '')) || DEFAULT_PRICE;
    courseFees['가정요리'] = parseInt(document.getElementById('fee_gajeong').value.replace(/,/g, '')) || DEFAULT_PRICE;
    courseFees['브런치'] = parseInt(document.getElementById('fee_brunch').value.replace(/,/g, '')) || DEFAULT_PRICE;

    try {
        const currentSettingsRes = await fetch(getFetchUrl('settings'));
        let settingsArr = await currentSettingsRes.json();
        let settingsObj = Array.isArray(settingsArr) && settingsArr.length > 0 ? settingsArr[0] : { id: Date.now().toString() };
        settingsObj.courseFees = courseFees;

        await fetch(getFetchUrl('settings', true), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([settingsObj])
        });
        closeTuitionSettings();
        renderTable();
        showResultModal('저장 완료', '수강료 설정이 저장되었습니다.');
    } catch (e) {
        console.error("Failed to save settings", e);
        showResultModal('오류', '설정 저장에 실패했습니다.');
    }
}

function simulateSend() {
    const content = document.querySelector('#messageModal textarea').value;
    navigator.clipboard.writeText(content).then(() => {
        closeMessageModal();
        showResultModal('복사 완료', '메시지 내용이 성공적으로 복사되었습니다!\n원하는 곳에 붙여넣기(Ctrl+V) 하세요.');
    });
}

function sendBulkMail() {
    const emails = membersData.filter(m => m.email).map(m => m.email).join(',');
    if (!emails) return showResultModal('알림', '등록된 이메일이 없습니다.');
    const subject = encodeURIComponent('세종요리 수강료 안내');
    const body = encodeURIComponent('안녕하세요. 수강료 납부 안내 드립니다.');
    window.location.href = `mailto:${emails}?subject=${subject}&body=${body}`;

    setTimeout(() => {
        showResultModal('안내', '메일 클라이언트가 실행되었습니다.');
    }, 1000);
}

// Result Modal Functions
function showResultModal(title, message) {
    const modal = document.getElementById('resultModal');
    const titleEl = document.getElementById('resultModalTitle');
    const msgEl = document.getElementById('resultModalMessage');

    if (modal && titleEl && msgEl) {
        titleEl.textContent = title || '안내';
        msgEl.innerHTML = message.replace(/\n/g, '<br>');
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    } else {
        // Fallback to alert if modal structure is missing
        alert(message);
    }
}

function closeResultModal() {
    const modal = document.getElementById('resultModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}

// Confirm Modal Functions
function showConfirmModal(title, message, onConfirm, onCancel) {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('confirmModalTitle');
    const msgEl = document.getElementById('confirmModalMessage');
    const yesBtn = document.getElementById('confirmModalYes');

    if (modal && titleEl && msgEl && yesBtn) {
        titleEl.textContent = title || '확인';
        msgEl.innerHTML = message;
        modal.classList.remove('hidden');
        modal.style.display = 'flex';

        // Set up button handlers
        yesBtn.onclick = () => {
            window.currentOnCancel = null;
            if (onConfirm) onConfirm();
            closeConfirmModal();
        };

        window.currentOnCancel = onCancel;
    }
}

function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        if (window.currentOnCancel) {
            window.currentOnCancel();
            window.currentOnCancel = null;
        }
    }
}

// Sidebar Helpers
window.toggleNavSub = function (el) {
    el.classList.toggle('active');
    const subMenu = el.nextElementSibling;
    if (subMenu && subMenu.classList.contains('nav-sub-menu')) {
        subMenu.classList.toggle('show');
    }
};

window.loadExamView = function (key) {
    // Since tuition.html doesn't have the examBoardContainer, redirect to index.html
    window.location.href = `index.html?viewExam=${key}`;
};

// [신규 - 즉각 동기화] 다른 탭에서 예정일이 변경되면 즉시 반영
window.addEventListener('storage', (e) => {
    if (e.key === 'sejong_ledger_sync' || e.key === 'sejong_timetable_sync') {
        renderTable();
    } else if (e.key === 'sejong_payment_sync' || e.key === 'sejong_attendance_sync') {
        loadData();
    }
});
