
function getFetchUrl(endpoint, isPost = false) {
    const url = `/api/sejong/${endpoint}`;
    return isPost ? url : url + (url.includes('?') ? '&' : '?') + `t=${Date.now()}`;
}

const API_BASE = '/api/sejong';

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

let membersData = [];
let paymentsData = [];
let attendanceData = [];
let holidaysData = [];
let courseFees = {};

let attendanceByMember = {}; // Optimized lookup
window.targetMemberId = null;

window.updateMemberField = async function(memberId, field, value) {
    try {
        const m = membersData.find(m => String(m.id) === String(memberId));
        if (!m) return;
        m[field] = value;
        await fetch(getFetchUrl('members', true), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(m)
        });
    } catch(e) { console.error(e); }
};

window.updateMemberCourse = async function(memberId, index, value) {
    try {
        const m = membersData.find(m => String(m.id) === String(memberId));
        if (!m) return;
        const courses = (m.course || '').split(',').map(c => c.trim()).filter(Boolean);
        courses[index] = value;
        const newCourse = courses.filter(Boolean).join(', ');
        m.course = newCourse;
        await fetch(getFetchUrl('members', true), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(m)
        });
        renderLedger(); 
    } catch(e) { console.error(e); }
};

window.deleteMemberCourse = async function(memberId, index, courseName) {
    if(!confirm(`정말 '${courseName}' 과정을 휴지통으로 이동하시겠습니까?`)) return;
    try {
        const m = membersData.find(m => String(m.id) === String(memberId));
        if (!m) return;
        const courses = (m.course || '').split(',').map(c => c.trim()).filter(Boolean);
        if (!courses[index].includes('[삭제]')) {
            courses[index] = courses[index] + '[삭제]';
        }
        m.course = courses.join(', ');
        await fetch(getFetchUrl('members', true), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(m)
        });
        renderLedger(); 
    } catch(e) { console.error(e); }
};

window.moveToTrash = async function(memberId) {
    if(!confirm('정말 휴지통으로 이동하시겠습니까? (이동 시 수강생 대장을 제외한 모든 화면에서 숨김 처리됩니다)')) return;
    try {
        const m = membersData.find(m => String(m.id) === String(memberId));
        if (m) {
            m.status = 'trash';
            await fetch(getFetchUrl('members', true), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(m)
            });
            membersData = membersData.filter(md => String(md.id) !== String(memberId));
            renderLedger();
        }
    } catch(e) { console.error(e); }
};

let currentYear = parseInt(localStorage.getItem('sejong_ledger_currentYear')) || new Date().getFullYear();
let currentMonth = parseInt(localStorage.getItem('sejong_ledger_currentMonth')) || (new Date().getMonth() + 1);

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get('memberId');
    const targetYear = params.get('year') || localStorage.getItem('sejong_ledger_currentYear') || new Date().getFullYear();
    const targetMonth = params.get('month') || localStorage.getItem('sejong_ledger_currentMonth') || (new Date().getMonth() + 1);
    currentYear = parseInt(targetYear);
    currentMonth = parseInt(targetMonth);

    if (typeof initializeYearSelect === 'function') {
        initializeYearSelect(targetYear);
    }
    if (typeof initializeMonthSelect === 'function') {
        initializeMonthSelect(targetMonth);
    }

    loadData(targetId, targetYear);
});

async function loadData(targetId) {
    const container = document.getElementById('ledgerTablesContainer');
    if (container) container.innerHTML = '<div style="padding:20px; text-align:center;">데이터를 불러오고 있습니다...</div>';

    try {
        const cacheBuster = `?t=${Date.now()}`;
        if(typeof window.loadCycleSettings === 'function') await window.loadCycleSettings();
        const [mRes, pRes, aRes, sRes, hRes, tRes] = await Promise.all([
            fetch(getFetchUrl('members')),
            fetch(getFetchUrl('payments')),
            fetch(getFetchUrl('attendance')),
            fetch(getFetchUrl('settings')),
            fetch(getFetchUrl('holidays')),
            fetch(getFetchUrl('timetable'))
        ]);

        if (!mRes.ok || !pRes.ok || !aRes.ok || !sRes.ok || !hRes.ok || !tRes.ok) {
            throw new Error('Failed to fetch data');
        }

        const rawMembers = await mRes.json();
        // Include 'hold' and 'completed' to ensure full visibility of all historical records
        membersData = Array.isArray(rawMembers) ? rawMembers.filter(m => !['delete', 'trash', 'hold', 'completed'].includes(m.status)) : [];

        paymentsData = await pRes.json();
        attendanceData = await aRes.json();
        holidaysData = await hRes.json();
        const rawSettings = await sRes.json();
        const timetableData = await tRes.json();

        if (timetableData && Object.keys(timetableData).length > 0) {
            COURSE_SCHEDULES = { ...COURSE_SCHEDULES, ...timetableData };
            window.COURSE_SCHEDULES = COURSE_SCHEDULES;
        }

        const settings = Array.isArray(rawSettings) ? rawSettings[0] : rawSettings;
        if (!Array.isArray(paymentsData)) paymentsData = [];
        if (!Array.isArray(attendanceData)) attendanceData = [];

        if (settings && settings.courseFees) {
            courseFees = settings.courseFees;
        }

        processAttendanceData();

        if (targetId) window.targetMemberId = targetId;

        renderLedger();

    } catch (e) {
        console.error("Failed to load data", e);
        if (container) container.innerHTML = '<div style="padding:20px; color:red; text-align:center;">데이터 로드 중 오류가 발생했습니다.<br>' + e.message + '</div>';
    }
}

function processAttendanceData() {
    attendanceByMember = {};
    if (!Array.isArray(attendanceData)) return;

    const deduped = new Map();
    attendanceData.forEach(a => {
        if (!a.memberId || !a.date) return;
        const key = `${a.memberId}_${a.date}_${a.course || ''}`;
        deduped.set(key, a);
    });

    const cleanData = Array.from(deduped.values());

    cleanData.forEach(a => {
        if (!attendanceByMember[a.memberId]) attendanceByMember[a.memberId] = [];
        a.dateObj = new Date(a.date);
        a.yearNum = a.dateObj.getFullYear();
        a.monthNum = a.dateObj.getMonth() + 1;
        attendanceByMember[a.memberId].push(a);
    });

    for (let id in attendanceByMember) {
        attendanceByMember[id].sort((a, b) => a.dateObj - b.dateObj);
    }
}


// sheet.html과 동일한 수동 보정 데이터
const GLOBAL_DATA_ADJUSTMENTS = {};

// [신규] 과거의 잘못된 시뮬레이션 캐시(찌꺼기)를 한 번 지워주기 위한 로직
if (!localStorage.getItem('cache_cleared_v2')) {
    localStorage.removeItem('sejong_ledger_sync');
    localStorage.setItem('cache_cleared_v2', 'true');
}

function getLedgerMonthStats(memberId, targetYear, targetMonth, courseFilter = null) {
    const syncKey = `${memberId}_${targetYear}_${targetMonth}_${courseFilter || 'all'}`;
    let syncData = {};
    try {
        const parsed = JSON.parse(localStorage.getItem('sejong_ledger_sync') || '{}');
        syncData = window.ledgerSyncData || parsed || {};
    } catch(e) {
        syncData = {};
    }
    
    let realEighthDays = [];
    let hasRealFromSync = false;
    
    // 1. Check real milestone
    if (syncData && syncData[syncKey]) {
        const rawSync = syncData[syncKey];
        realEighthDays = Array.isArray(rawSync) ? rawSync : (typeof rawSync === 'number' ? [rawSync] : []);
        if (realEighthDays.length > 0) {
            hasRealFromSync = true;
        }
    }

    const m = membersData.find(m => String(m.id) === String(memberId));
    let simAtts = [];
    let calcHasAny = false;
    let monthMilestones = [];
    let calcEighthDays = [];
    let calcIsSimulated = false;

    if (typeof window.calculateRedBoxesForMonth === 'function') {
        const memberObj = m;
        if (memberObj) {
            const result = window.calculateRedBoxesForMonth(memberObj, targetYear, targetMonth, attendanceData || [], courseFilter, window.GLOBAL_DATA_ADJUSTMENTS || {});
            calcHasAny = result.hasAnyAttendance;
            simAtts = result.simulatedAttendances || [];
            if (result && result.allMilestones && result.allMilestones.length > 0) {
                monthMilestones = result.allMilestones.filter(ms => ms.year === targetYear && ms.month === targetMonth);
            }
            if (result && result.redDays && result.redDays.length > 0) {
                calcEighthDays = result.redDays;
                calcIsSimulated = result.isSimulated;
            }
        }
    }
    
    if (hasRealFromSync) {
        // We have real days from sync, but we also want to return simulated attendances and any simulated milestones
        return { 
            eighthDays: realEighthDays, 
            eighthMonth: targetMonth, 
            isSimulated: false, 
            hasAnyAttendance: true, 
            simulatedAttendances: simAtts,
            milestones: monthMilestones.length > 0 ? monthMilestones : realEighthDays.map(d => ({ year: targetYear, month: targetMonth, day: d, isReal: true }))
        };
    } else {
        if (monthMilestones.length > 0) {
            return { milestones: monthMilestones, hasAnyAttendance: calcHasAny, simulatedAttendances: simAtts };
        }
        if (calcEighthDays.length > 0) {
            return { eighthDays: calcEighthDays, eighthMonth: targetMonth, isSimulated: calcIsSimulated, hasAnyAttendance: calcHasAny, simulatedAttendances: simAtts };
        }
        if (simAtts.length > 0) {
            return { eighthDays: [], eighthMonth: targetMonth, isSimulated: calcIsSimulated, hasAnyAttendance: calcHasAny, simulatedAttendances: simAtts, milestones: [] };
        }
    }
    return { eighthDays: [], eighthMonth: targetMonth, isSimulated: false, hasAnyAttendance: false, milestones: [], simulatedAttendances: [] };
}

function getAllLedgerMonthStats(memberId, year, month) {
    const member = membersData.find(m => String(m.id) === String(memberId));
    if (!member || !member.course) return [];

    let courses = member.course.split(',').map(c => c.trim()).filter(c => c && !c.includes('[삭제]')).map(c => c.split('(')[0]);
    const hasJeggwa = courses.some(c => c.includes('제과') && !c.includes('제과제빵'));
    const hasJeppang = courses.some(c => c.includes('제빵') && !c.includes('제과제빵'));
    if (hasJeggwa && hasJeppang) {
        courses = courses.filter(c => !c.includes('제과') && !c.includes('제빵'));
        courses.push('제과제빵기능사');
    }
    courses = [...new Set(courses)];

    const results = [];
    let combinedSimulatedAttendances = [];

    courses.forEach(courseName => {
        const stats = getLedgerMonthStats(memberId, year, month, courseName);
        
        // 수강료 규칙 적용 로직 (학생, 대학생, 일반 구분 및 일식/중식기능사 고정 금액)
        let calcFee = courseFees[courseName];
        if (member.type === '대학생' || member.type === 'college') {
            calcFee = courseFees[courseName + '_대학생'];
        } else if (member.type === 'student' || member.type === '학생') {
            if (courseName === '일식기능사' || courseName === '중식기능사') {
                calcFee = 300000;
            } else {
                calcFee = courseFees[courseName + '_학생'];
            }
        }
        if (calcFee === undefined || isNaN(calcFee)) {
            calcFee = courseFees[courseName] || courseFees['all'] || 0;
        }

        if (stats.simulatedAttendances && stats.simulatedAttendances.length > 0) {
            stats.simulatedAttendances.forEach(sa => {
                sa.course = courseName;
                combinedSimulatedAttendances.push(sa);
            });
        }
        // 가상 결제(예정) 내역을 항상 표시하도록 조건 완화
        if (true) {
            if (stats.milestones && stats.milestones.length > 0) {
                stats.milestones.forEach(ms => {
                    results.push({
                        course: courseName,
                        eighthDay: ms.day,
                        eighthMonth: ms.month,
                        isSimulated: !ms.isReal,
                        fee: calcFee
                    });
                });
            } else if (stats.eighthDays && stats.eighthDays.length > 0) {
                stats.eighthDays.forEach(day => {
                    results.push({
                        course: courseName,
                        eighthDay: day,
                        eighthMonth: stats.eighthMonth,
                        isSimulated: stats.isSimulated,
                        fee: calcFee
                    });
                });
            }
        }
    });

    results.simulatedAttendances = combinedSimulatedAttendances;
    return results;
}

function initializeYearSelect() {
    const select = document.getElementById('yearSelect');
    if (!select) return;
    select.innerHTML = '';
    const startYear = 2024;
    const endYear = 3000;
    for (let y = startYear; y <= endYear; y++) {
        const opt = document.createElement('option');
        opt.value = y; opt.textContent = `${y}년`;
        if (y === currentYear) opt.selected = true;
        select.appendChild(opt);
    }
    select.onchange = (e) => {
        currentYear = parseInt(e.target.value);
        localStorage.setItem('sejong_ledger_currentYear', currentYear);
        renderLedger();
    };
}

function initializeMonthSelect() {
    const select = document.getElementById('monthSelect');
    if (!select) return;
    select.innerHTML = '';
    for (let m = 1; m <= 12; m++) {
        const opt = document.createElement('option');
        opt.value = m; opt.textContent = `${m}월`;
        if (m === currentMonth) opt.selected = true;
        select.appendChild(opt);
    }
    select.onchange = (e) => {
        currentMonth = parseInt(e.target.value);
        localStorage.setItem('sejong_ledger_currentMonth', currentMonth);
        renderLedger();
    };
}

const COURSE_LIST = [
    '한식기능사', '양식기능사', '일식기능사', '중식기능사', '제과기능사',
    '제빵기능사', '제과제빵기능사', '복어기능사', '산업기사', '가정요리', '브런치', '기타'
];

const COURSE_CATEGORIES = {
    '조리과정': ['한식기능사', '양식기능사', '일식기능사', '중식기능사', '산업기사', '복어기능사'],
    '제과제빵과정': ['제과기능사', '제빵기능사', '제과제빵기능사'],
    '일반과정': ['가정요리', '브런치', '기타']
};

let activeCategory = '전체';
let currentFilterDate = '';

function renderLedger() {
    const container = document.getElementById('ledgerTablesContainer');
    if (!container) return;
    container.innerHTML = '';

    const mainNavContainer = document.createElement('div');
    mainNavContainer.style.cssText = `display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;`;

    // --- Top Row: Aggregate Tabs (Total & Categories) ---
    const topRow = document.createElement('div');
    topRow.style.cssText = `display: flex; gap: 8px; overflow-x: auto; padding: 5px 0;`;
    const topTabs = ['전체', ...Object.keys(COURSE_CATEGORIES)];

    topTabs.forEach(cat => {
        const btn = document.createElement('button');
        btn.textContent = cat;
        const isActive = activeCategory === cat;
        btn.style.cssText = `
            padding: 8px 20px; border-radius: 6px; border: none; cursor: pointer; font-weight: 800; font-size: 0.95rem;
            background: ${isActive ? '#2563eb' : '#fff'};
            color: ${isActive ? '#fff' : '#1e293b'};
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            border: 1.5px solid ${isActive ? '#2563eb' : '#cbd5e1'};
            white-space: nowrap;
            transition: all 0.2s;
        `;
        btn.onclick = () => { activeCategory = cat; renderLedger(); };
        topRow.appendChild(btn);
    });

    // --- Bottom Row: Individual Course Tabs ---
    const bottomRow = document.createElement('div');
    bottomRow.style.cssText = `display: flex; gap: 6px; overflow-x: auto; padding: 5px 0; border-top: 1px solid #e2e8f0; padding-top: 12px;`;

    ['전체', ...COURSE_LIST].forEach(course => {
        const btn = document.createElement('button');
        btn.textContent = course;
        const isActive = activeCategory === course;
        btn.style.cssText = `
            padding: 6px 12px; border-radius: 4px; border: none; cursor: pointer; font-weight: 700; font-size: 0.8rem;
            background: ${isActive ? '#475569' : '#f8fafc'};
            color: ${isActive ? '#fff' : '#64748b'};
            border: 1px solid ${isActive ? '#475569' : '#e2e8f0'};
            white-space: nowrap;
            transition: all 0.2s;
        `;
        btn.onclick = () => { activeCategory = course; renderLedger(); };
        bottomRow.appendChild(btn);
    });

    mainNavContainer.appendChild(bottomRow);
    container.appendChild(mainNavContainer);

    const filterByPeriod = (members) => {
        return members.filter(m => {
            const schedules = getAllLedgerMonthStats(m.id, currentYear, currentMonth);
            const hasMatch = schedules.length > 0;
            return hasMatch;
        });
    };

    // Case 1: Individual Course
    if (COURSE_LIST.includes(activeCategory)) {
        const courseName = activeCategory;
        let filteredMembers = membersData.filter(m => {
            if (courseName === '기타') {
                if (!m.course) return true; // Members with no course are '기타'
                const cList = m.course.split(',').map(c => c.trim()).filter(c => c && !c.includes('[삭제]'));
                if (cList.length === 0) return true;
                return !COURSE_LIST.filter(cl => cl !== '기타').some(cl => cList.some(c => c.includes(cl)));
            }
            if (!m.course) return false;
            const cList = m.course.split(',').map(c => c.trim()).filter(c => c && !c.includes('[삭제]'));
            return cList.some(c => {
                if (courseName === '제과기능사' || courseName === '제빵기능사') {
                    return c.includes(courseName) && !c.includes('제과제빵기능사');
                }
                return c.includes(courseName);
            });
        }).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        filteredMembers = filterByPeriod(filteredMembers);
        renderCourseSection(container, courseName, filteredMembers);

    }
    // Case 2: Total
    else if (activeCategory === '전체') {
        let allMembers = membersData.filter(m => m.course).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        allMembers = filterByPeriod(allMembers);
        renderUnifiedTable(container, "전체 수강생", allMembers);
    }
    // Case 3: Category
    else {
        const courses = COURSE_CATEGORIES[activeCategory];
        let categoryMembers = [];
        
        courses.forEach(courseName => {
            let filteredMembers = membersData.filter(m => {
                if (courseName === '기타') {
                    if (!m.course) return true;
                    const cList = m.course.split(',').map(c => c.trim()).filter(c => c && !c.includes('[삭제]'));
                    if (cList.length === 0) return true;
                    return !COURSE_LIST.filter(cl => cl !== '기타').some(cl => cList.some(c => c.includes(cl)));
                }
                return m.course && m.course.includes(courseName);
            }).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

            filteredMembers = filterByPeriod(filteredMembers);
            if (filteredMembers.length > 0) {
                // To avoid duplicate students in the badge panel if they take multiple courses in the same category
                // we'll just push them and let renderMonthlyRedBoxPanel's inner loop handle it
                // Actually, renderMonthlyRedBoxPanel iterates courses by itself if courseScope='all'.
                // So if we just deduplicate members and call renderMonthlyRedBoxPanel with 'all', it will count all courses!
                filteredMembers.forEach(m => {
                    if (!categoryMembers.some(cm => cm.id === m.id)) {
                        categoryMembers.push(m);
                    }
                });
            }
        });

        courses.forEach(courseName => {
            let filteredMembers = membersData.filter(m => {
                if (courseName === '기타') {
                    if (!m.course) return true;
                    const cList = m.course.split(',').map(c => c.trim()).filter(c => c && !c.includes('[삭제]'));
                    if (cList.length === 0) return true;
                    return !COURSE_LIST.filter(cl => cl !== '기타').some(cl => cList.some(c => c.includes(cl)));
                }
                return m.course && m.course.includes(courseName);
            }).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

            filteredMembers = filterByPeriod(filteredMembers);
            if (filteredMembers.length > 0) {
                renderCourseSection(container, courseName, filteredMembers);
            }
        });
    }

    // Always check for "Other" members (if any) if in "Total" view
    const otherMembers = membersData.filter(m => {
        if (!m.course) return true;
        const cList = m.course.split(',').map(c => c.trim()).filter(c => c && !c.includes('[삭제]'));
        if (cList.length === 0) return true;
        return !COURSE_LIST.filter(cl => cl !== '기타').some(cl => cList.some(c => c.includes(cl)));
    }).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    const filteredOthers = filterByPeriod(otherMembers);
    if (activeCategory === '전체' && filteredOthers.length > 0) {
        renderOtherMembersTable(container, filteredOthers);
    }
}

function renderCourseSection(container, courseName, members) {
    renderTable(container, courseName, members, `course-${courseName}`);
}

function renderUnifiedTable(container, title, members) {
    renderTable(container, title, members, 'unified-table');
}

function renderOtherMembersTable(container, members) {
    renderTable(container, "기타 수강생", members, 'other-members-table', true);
}

function renderTable(container, title, members, id) {
    const section = document.createElement('div');
    section.id = id;
    section.style.cssText = `margin-bottom: 40px; display: flex; gap: 15px; overflow: auto; max-height: 65vh; max-width: 100%;`;

    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

    const html1 = generateMonthTableHTML(title, members, id + '-1', currentYear, currentMonth);
    const html2 = generateMonthTableHTML(title, members, id + '-2', nextYear, nextMonth);

    section.innerHTML = html1 + html2;
    container.appendChild(section);

    if (window.targetMemberId) {
        setTimeout(() => {
            const el = document.getElementById(`row-${id}-1-${window.targetMemberId}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 800);
    }
}

function generateMonthTableHTML(title, members, id, tYear, tMonth) {
    const getDisplayCourses = (mCourseStr) => {
        let baseCourses = (mCourseStr || '').split(',').map(c => c.trim()).filter(c => c && !c.includes('[삭제]'));
        if (activeCategory === '전체') return baseCourses;
        
        if (activeCategory === '기타') {
            const standardList = COURSE_LIST.filter(cl => cl !== '기타');
            return baseCourses.filter(c => !standardList.some(cl => c.includes(cl)));
        }
        
        if (typeof COURSE_LIST !== 'undefined' && COURSE_LIST.includes(activeCategory)) {
            return baseCourses.filter(c => {
                if (activeCategory === '제과기능사' || activeCategory === '제빵기능사') {
                    return c.includes(activeCategory) && !c.includes('제과제빵기능사');
                }
                return c.includes(activeCategory);
            });
        }
        
        if (typeof COURSE_CATEGORIES !== 'undefined' && COURSE_CATEGORIES[activeCategory]) {
            const catCourses = COURSE_CATEGORIES[activeCategory];
            return baseCourses.filter(c => catCourses.some(cat => c.includes(cat)));
        }
        
        return baseCourses;
    };

    const daysInMonth = new Date(tYear, tMonth, 0).getDate();

    const dayRedCounts = Array(daysInMonth + 1).fill(0);
    const dayBlueCounts = Array(daysInMonth + 1).fill(0);

    members.forEach(m => {
        const schedules = getAllLedgerMonthStats(m.id, tYear, tMonth);
        
        schedules.forEach(s => {
            if (!s.isSimulated && s.eighthDay && !isNaN(parseInt(s.eighthDay)) && Number(s.eighthDay) > 0) {
                const day = parseInt(s.eighthDay);
                if (day >= 1 && day <= daysInMonth) {
                    const isPaid = (typeof paymentsData !== 'undefined' ? paymentsData : window.paymentsData || []).some(p =>
                        String(p.memberId) === String(m.id) &&
                        String(p.year) === String(tYear) &&
                        String(p.month) === String(tMonth) &&
                        p.status === 'paid' &&
                        (!p.course || p.course === 'null' || p.course === 'undefined' || p.course === '' || !s.course || p.course.includes(s.course) || s.course.includes(p.course))
                    );

                    if (isPaid) {
                        dayBlueCounts[day]++;
                    } else {
                        dayRedCounts[day]++;
                    }
                }
            }
        });
    });

    const totalRedCount = dayRedCounts.reduce((sum, count) => sum + count, 0);

    let html = `
        <div style="flex: 0 0 auto; width: 980px; border: 1.5px solid #0f172a; border-radius: 4px; background: #fff; position: relative;">
            <div style="position: sticky; left: 0; z-index: 40; display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0f172a; padding: 10px 10px; background: #fff;">
                <h2 style="margin: 0; font-size: 1.2rem; font-weight: 900; display: flex; align-items: center;">
                    ${title} (${members.length}명) - ${tYear}년 ${tMonth}월
                    <span style="margin-left: 15px; color: #dc2626; font-weight: 900; background: #fee2e2; padding: 4px 12px; border-radius: 20px; border: 2px solid #ef4444; font-size: 0.95rem; display: inline-flex; align-items: center; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);">
                        <span class="material-icons" style="font-size: 1.1rem; margin-right: 4px;">event_available</span> 
                        결재일 건수 (${totalRedCount}건)
                    </span>
                </h2>
            </div>
            <table style="width: 100%; border-collapse: separate; border-spacing: 0; table-layout: fixed; font-family: 'Noto Sans KR', sans-serif; min-width: 980px;">
                <colgroup>
                    <col style="width: 30px;">
                    <col style="width: 95px;">
                    ${Array.from({ length: daysInMonth }, () => `<col style="width: 25px;">`).join('')}
                    <col style="width: 35px;">
                    <col style="width: 35px;">
                </colgroup>
                <thead>
                    <tr style="background: #f8fafc;">
                        <th style="position: sticky; top: 0; left: 0; z-index: 30; background: #f8fafc; border-bottom: 1.5px solid #0f172a; border-right: 1.5px solid #0f172a; font-size: 0.65rem;">NO</th>
                        <th style="position: sticky; top: 0; left: 30px; z-index: 30; background: #f8fafc; border-bottom: 1.5px solid #0f172a; border-right: 1.5px solid #0f172a; font-size: 0.65rem; text-align: left; padding: 5px 2px;">회원정보/과정</th>
                        ${Array.from({ length: daysInMonth }, (_, i) => {
                            const day = i + 1;
                            const rC = dayRedCounts[day];
                            const bC = dayBlueCounts[day];
                            const dateObj = new Date(tYear, tMonth - 1, day);
                            const dayOfWeek = dateObj.getDay();
                            const dateStr = `${tYear}-${String(tMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isHoliday = !!(typeof KOREAN_HOLIDAYS_MAP !== 'undefined' && KOREAN_HOLIDAYS_MAP[dateStr]);
                            let color = '#0f172a';
                            if (dayOfWeek === 0 || isHoliday) {
                                color = '#ef4444';
                            } else if (dayOfWeek === 6) {
                                color = '#2563eb';
                            }
                            
                            let contentHtml = `
                                <div style="display:flex; flex-direction:column; align-items:center; gap:1px; height: 38px; justify-content: flex-end;">
                                    ${rC > 0 ? `<span style="background:#ef4444; color:white; border-radius:10px; padding:1px 3px; font-size:0.55rem; min-width:10px; text-align:center; line-height: 1;">${rC}</span>` : `<span style="visibility:hidden; font-size:0.55rem; padding:1px 3px; min-width:10px; line-height: 1;">0</span>`}
                                    <span style="font-size:0.6rem; font-weight:800; color:${color}; line-height: 1.2;">${day}</span>
                                    ${bC > 0 ? `<span style="background:#2563eb; color:white; border-radius:10px; padding:1px 3px; font-size:0.55rem; min-width:10px; text-align:center; line-height: 1;">${bC}</span>` : `<span style="visibility:hidden; font-size:0.55rem; padding:1px 3px; min-width:10px; line-height: 1;">0</span>`}
                                </div>
                            `;
                            return `<th style="position: sticky; top: 0; z-index: 20; background: #f8fafc; border-bottom: 1.5px solid #0f172a; border-right: 1px solid #cbd5e1; padding: 2px 1px; vertical-align: bottom; height: 42px;">${contentHtml}</th>`;
                        }).join('')}
                        <th style="position: sticky; top: 0; right: 35px; z-index: 30; background: #f8fafc; border-bottom: 1.5px solid #0f172a; font-size: 0.65rem; border-left: 1px solid #0f172a; padding: 0;">
                            <div style="transform: scale(0.85); display: flex; flex-direction: column; align-items: center;">
                                <span>재고</span>
                                <span>출석</span>
                            </div>
                        </th>
                        <th style="position: sticky; top: 0; right: 0px; z-index: 30; background: #f8fafc; border-bottom: 1.5px solid #0f172a; font-size: 0.65rem; border-left: 1px solid #cbd5e1; padding: 0;">출석</th>
                    </tr>
                </thead>
                <tbody>
    `;

    members.forEach((m, idx) => {
        const isTarget = window.targetMemberId && String(m.id) === String(window.targetMemberId);
        const rowId = `row-${id}-${m.id}`;
        const trBg = isTarget ? '#fffbeb' : '#ffffff';
        html += `<tr id="${rowId}" style="background: ${trBg};">
            <td style="position: sticky; left: 0; z-index: 10; background: inherit; text-align: center; font-weight: 700; font-size: 0.65rem; border-right: 1.5px solid #0f172a; border-bottom: 1px solid #0f172a;">${idx + 1}</td>
            <td style="position: sticky; left: 30px; z-index: 10; background: inherit; padding: 0; border-right: 1.5px solid #0f172a; border-bottom: 1px solid #0f172a; width: 95px; max-width: 95px; overflow: hidden; vertical-align: top;">
                <div style="height: 36px; padding: 2px; display: flex; flex-direction: column; justify-content: center; box-sizing: border-box; border-bottom: 1px solid #e2e8f0;">
                    <div style="display: flex; align-items: center; gap: 2px;">
                        <span style="font-weight: 900; font-size: 0.75rem; color: #000; line-height: 1;">${m.name || ''}</span>
                    </div>
                    <div style="font-size: 0.55rem; color: #64748b; line-height: 1; margin-top: 2px;">${m.phone || ''}</div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0px; padding: 1px 2px;">
                    ${(() => {
                        const courses = getDisplayCourses(m.course);
                        if (courses.length === 0) return `<div style="height: 44px;"></div>`;
                        return courses.map(c => {
                            return `<div style="height: 44px; font-size: 0.55rem; color: #1d4ed8; background: #eff6ff; padding: 1px 2px; border-radius: 2px; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 1.1; overflow: hidden; word-break: keep-all; margin-bottom: 2px;">${c}</div>`;
                        }).join('');
                    })()}
                </div>
            </td>`;

        let schedulesRaw = getAllLedgerMonthStats(m.id, tYear, tMonth);
        let schedules = [...schedulesRaw];
        schedules.simulatedAttendances = schedulesRaw.simulatedAttendances || [];
        const coursesFoundSimulated = new Set();
        schedules = schedules.filter(s => {
            if (!s.eighthDay || isNaN(parseInt(s.eighthDay)) || Number(s.eighthDay) <= 0) return false;
            if (s.isSimulated) {
                if (coursesFoundSimulated.has(s.course)) return false;
                coursesFoundSimulated.add(s.course);
            }
            return true;
        });
        schedules.simulatedAttendances = schedulesRaw.simulatedAttendances || [];

        const paid = paymentsData.filter(p => String(p.memberId) === String(m.id) && String(p.year) === String(tYear) && String(p.month) === String(tMonth) && p.status === 'paid');

        const activeCourses = getDisplayCourses(m.course);
        const slotsCount = Math.max(1, activeCourses.length);

        for (let day = 1; day <= daysInMonth; day++) {
            let cellHTML = `
                <div style="height: 36px; border-bottom: 1px solid #e2e8f0; box-sizing: border-box;"></div>
                <div style="display: flex; flex-direction: column; gap: 0px; height: 100%; min-height: ${(slotsCount * 44) + (slotsCount * 2)}px; padding: 1px;">
            `;
            
            for (let slot = 0; slot < slotsCount; slot++) {
                const c = activeCourses[slot] || '';
                
                let slotBg = '#ffffff';
                const dayOfWeek = new Date(tYear, tMonth - 1, day).getDay();
                const dateStr = `${tYear}-${String(tMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isHolidayInSys = holidaysData.find(h => h.date === dateStr);
                const isNationalHoliday = !!(typeof KOREAN_HOLIDAYS_MAP !== 'undefined' && KOREAN_HOLIDAYS_MAP[dateStr]);
                
                if (isHolidayInSys || isNationalHoliday || dayOfWeek === 0) {
                    slotBg = '#f1f5f9'; // 휴일 회색
                } else {
                    let schedule = null;
                    if (c && window.COURSE_SCHEDULES) {
                        schedule = window.COURSE_SCHEDULES[c] || window.COURSE_SCHEDULES[c.split('(')[0].trim()];
                    }
                    if (schedule && !schedule.includes(dayOfWeek)) {
                        slotBg = '#f1f5f9'; // 수업 없는 요일 회색
                    }
                }

                const expectedToday = schedules.filter(s => parseInt(s.eighthDay) === day && (!s.course || s.course.includes(c) || c.includes(s.course) || activeCourses.length === 0));
                
                const matchC = c.split('(')[0].trim();
                const paidToday = paid.filter(p => {
                    const pdDay = new Date(p.updatedAt || p.date).getDate();
                    const pCourse = (p.course || '').split('(')[0].trim();
                    return pdDay === day && (!c || pCourse === matchC);
                });
                
                const simAttendanceToday = (schedules.simulatedAttendances || []).filter(sa => sa.year === tYear && sa.month === tMonth && sa.day === day && (!sa.course || sa.course.includes(c) || c.includes(sa.course) || activeCourses.length === 0));

                let slotContent = '';
                
                // 진짜 출석 렌더링 (attendanceData 활용)
                const realAttendanceToday = (window.attendanceData || []).filter(a => {
                    if (String(a.memberId) !== String(m.id)) return false;
                    const aDate = new Date(a.date);
                    if (aDate.getFullYear() !== tYear || (aDate.getMonth() + 1) !== tMonth || aDate.getDate() !== day) return false;
                    if (c && a.course) {
                        const aC = a.course.split('(')[0].trim();
                        const matchC = c.split('(')[0].trim();
                        return aC === matchC || a.course.includes(matchC) || c.includes(aC);
                    }
                    return true;
                });

                if (realAttendanceToday.length > 0) {
                    const attTextRaw = realAttendanceToday.map(a => a.status).join(',');
                    let attBg = '#d1fae5'; // 기본 연두색
                    let attColor = '#065f46';
                    
                    if (attTextRaw.includes('결석')) {
                        attBg = '#fee2e2';
                        attColor = '#991b1b';
                    } else if (attTextRaw.includes('지각')) {
                        attBg = '#ffedd5';
                        attColor = '#9a3412';
                    } else if (attTextRaw.includes('공결') || attTextRaw.includes('조퇴')) {
                        attBg = '#e0e7ff';
                        attColor = '#3730a3';
                    }
                    
                    // 텍스트가 길 경우 (예: "재고출석,출석") 칸에 맞게 줄바꿈 처리
                    const attTextFormatted = attTextRaw.replace(/,/g, '<br>');
                    
                    // 가상출석 대신 진짜 출석을 그림
                    slotContent += `
                    <div style="font-size: 0.45rem; font-weight: 800; display: flex; flex-direction: column; justify-content: center; align-items: center; background: ${attBg}; border: 1px solid ${attColor}; border-radius: 4px; padding: 1px; width: 100%; min-height: 20px; text-align: center; color: ${attColor}; line-height: 1; word-break: break-all; letter-spacing: -0.5px;">
                        ${attTextFormatted}
                    </div>`;
                } else if (simAttendanceToday.length > 0) {
                    // 가상출석 렌더링 (진짜 출석이 없을 때만)
                    
                    // 만약 이 날짜에 파란색 결재 예정일(expectedToday)이 함께 있다면 여기서 박스를 그리지 않고
                    // 금액 박스 안에 '가상출석' 글자를 합쳐서 그리도록 넘김.
                    let isAlsoSimulatedMilestone = false;
                    if (expectedToday.length > 0) {
                        isAlsoSimulatedMilestone = expectedToday.some(s => s.isSimulated);
                    }
                    
                    if (!isAlsoSimulatedMilestone) {
                        slotContent += `
                        <div style="font-size: 0.5rem; font-weight: 800; display: flex; flex-direction: column; align-items: center; background: #fef08a; border: 1px solid #eab308; border-radius: 4px; padding: 1px; width: 100%; text-align: center; color: #854d0e;">
                            가상<br>출석
                        </div>`;
                    }
                }

                if (expectedToday.length > 0) {
                    let uniqueExpected = [...expectedToday];
                    uniqueExpected.forEach(s => {
                        const feeColor = s.isSimulated ? '#3b82f6' : '#d946ef';
                        const feeBg = s.isSimulated ? '#eff6ff' : '#fdf4ff';
                        
                        let labelHtml = '';
                        // 가상출석이랑 겹치면 금액 박스 안에 가상출석 글자를 섞어줌
                        if (s.isSimulated && simAttendanceToday.length > 0 && realAttendanceToday.length === 0) {
                            labelHtml = `출석<br>`;
                        }

                        slotContent += `
                        <div style="font-size: 0.5rem; font-weight: 800; display: flex; flex-direction: column; align-items: center; background: ${feeBg}; border: 1px solid ${feeColor}; border-radius: 4px; padding: 1px; margin-top: 1px; width: 100%; text-align: center;">
                            <div style="color: ${feeColor};">${labelHtml}<span style="font-size: 0.4rem; opacity: 0.9;">${s.fee / 10000}만</span></div>
                        </div>`;
                    });
                }
                
                if (paidToday.length > 0) {
                    let uniquePaid = [...paidToday];
                    uniquePaid.forEach(p => {
                        const amt = p.amount ? (p.amount / 10000) + '만(실)' : '완료(실)';
                        slotContent += `
                        <div style="font-size: 0.5rem; font-weight: 800; display: flex; flex-direction: column; align-items: center; background: #ecfdf5; border: 1px solid #059669; border-radius: 4px; padding: 1px; margin-top: 1px;">
                            <div style="color: #059669;">${amt}</div>
                        </div>`;
                    });
                }
                
                cellHTML += `
                <div style="flex: 1; height: 44px; min-height: 44px; max-height: 44px; overflow: visible; display: flex; flex-direction: column; justify-content: center; align-items: center; background: ${slotBg}; border-radius: 0px; padding: 1px; margin-bottom: 2px;">
                    ${slotContent}
                </div>`;
            }
            cellHTML += `</div>`;

            const isToday = (tYear === new Date().getFullYear() && tMonth === new Date().getMonth() + 1 && day === new Date().getDate());
            const todayStyle = isToday ? 'border-right: 1px dotted #cbd5e1; background: #fef9c333;' : 'border-right: 1px dotted #cbd5e1;';

            html += `<td style="vertical-align: top; text-align: center; border-bottom: 1px solid #0f172a; ${todayStyle} padding: 0;">${cellHTML}</td>`;
        }

        let html1 = ``;
        let html2 = ``;

        html1 += `
            <div style="height: 36px; border-bottom: 1px solid #e2e8f0; box-sizing: border-box; background-color: #f8fafc;"></div>
            <div style="display: flex; flex-direction: column; gap: 0px; height: 100%; padding: 1px 0px;">
        `;
        html2 += `
            <div style="height: 36px; border-bottom: 1px solid #e2e8f0; box-sizing: border-box; background-color: #f8fafc;"></div>
            <div style="display: flex; flex-direction: column; gap: 0px; height: 100%; padding: 1px 0px;">
        `;

        for (let slot = 0; slot < slotsCount; slot++) {
            const c = activeCourses[slot] || '';
            let displayMakeup = 0;
            let displayP = 0;
            
            let isDualCourse = String(c).replace(/\\s/g, '').includes('제과제빵');
            let attendanceIncrement = isDualCourse ? 1.0 : 1.0;
            
            let runningTotal = 0;
            if (typeof window.calculateRedBoxesForMonth === 'function') {
                const result = window.calculateRedBoxesForMonth(m, tYear, tMonth, attendanceData || [], c, window.GLOBAL_DATA_ADJUSTMENTS || {});
                if (result && result.currentCount) {
                    runningTotal = result.currentCount.count;
                }
                if (result && result.simulatedAttendances) {
                    const simUpToThisMonth = result.simulatedAttendances.filter(sa => {
                        if (sa.year < tYear) return true;
                        if (sa.year === tYear && sa.month <= tMonth) return true;
                        return false;
                    }).length;
                    runningTotal += simUpToThisMonth * attendanceIncrement;
                }
            }

            let currentMonthAttendances = 0;
            if (typeof attendanceData !== 'undefined' && Array.isArray(attendanceData)) {
                attendanceData.forEach(l => {
                    if (String(l.memberId) !== String(m.id)) return;
                    if (l.course) {
                        const cClean = String(l.course).replace(/\([^)]*\)/g, '').trim();
                        const fClean = String(c).replace(/\([^)]*\)/g, '').trim();
                        const cList = cClean.split(',').map(course => course.trim());
                        if (!cList.includes(fClean)) return;
                    } else {
                        const memCourses = (m.course || '').split(',').map(course => course.replace(/\([^)]*\)/g, '').trim()).filter(Boolean);
                        if (memCourses.length > 1) return;
                    }

                    const dStr = l.date ? (l.date.includes('T') ? l.date.split('T')[0] : l.date) : (l.dateObj ? l.dateObj.toISOString().split('T')[0] : '');
                    if (!dStr) return;
                    const p = dStr.split('-');
                    if (p.length < 3) return;
                    const lYear = parseInt(p[0], 10);
                    const lMonth = parseInt(p[1], 10);
                    
                    if (lYear === tYear && lMonth === tMonth) {
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
                    }
                });
            }

            let adjustments = typeof window.GLOBAL_DATA_ADJUSTMENTS !== 'undefined' ? window.GLOBAL_DATA_ADJUSTMENTS[String(m.id)] : null;
            let currentMCKey = `${tYear}-${String(tMonth).padStart(2, '0')}`;
            let adjustment = adjustments ? adjustments[currentMCKey] : null;

            displayP = Math.round(currentMonthAttendances * 10) / 10;
            if (adjustment && adjustment.presentOverride !== undefined) {
                displayP = adjustment.presentOverride;
            }

            let vRaw = Math.round(runningTotal * 10);
            let limits = (typeof window.getCourseLimits !== 'undefined') ? window.getCourseLimits(c, m.type) : { limit: 9, trigger: 9 };
            let limit = limits.limit;
            let trigger = limits.trigger;
            let limitRaw = Math.round(limit * 10);
            let triggerRaw = Math.round(trigger * 10);

            let cycleCount = 0;
            if (vRaw >= triggerRaw) {
                cycleCount = Math.floor((vRaw - triggerRaw) / limitRaw) + 1;
            }

            if (cycleCount === 0) {
                displayMakeup = 0;
                displayP = runningTotal;
            } else {
                displayMakeup = Math.round((trigger + limit * (cycleCount - 1)) * 10) / 10;
                
                // 원장님의 "화면에 보이는 박스 개수 총합" 명령을 그대로 반영합니다.
                let simCountThisMonth = 0;
                if (schedules.simulatedAttendances) {
                    let simThisMonth = schedules.simulatedAttendances.filter(sa => sa.year === tYear && sa.month === tMonth && (!sa.course || sa.course.includes(c) || c.includes(sa.course) || activeCourses.length === 0));
                    simCountThisMonth = simThisMonth.length;
                }
                displayP = currentMonthAttendances + simCountThisMonth;
            }

            let maxJ = limit;
            let maxP = (typeof window.getCourseAttendanceCutoff !== 'undefined')
                ? window.getCourseAttendanceCutoff(c, m.type)
                : (isDualCourse ? 16.0 : 8.0);

            let htmlMakeup = '';
            let htmlP = '';

            if (displayMakeup === 0 && displayP === 0) {
                // blank
            } else {
                let formattedMakeup = '';
                if (displayMakeup > 0 && cycleCount > 0) {
                    formattedMakeup = cycleCount === 1 ? `${trigger}` : `${trigger}<span style="font-size: 0.45rem; position: relative; top: -0.2rem; margin-left: 1px;">${cycleCount}</span>`;
                }
                htmlMakeup = formattedMakeup;
                
                let formattedP = (displayP % 1 === 0 ? displayP : displayP.toFixed(1));
                if (displayP === 0) {
                    htmlP = '';
                } else if (displayP >= maxP) {
                    htmlP = `<span style="background: #16a34a; color: white; padding: 2px 6px; border-radius: 10px; font-weight: bold; display: inline-block; line-height: 1;">${formattedP}</span>`;
                } else {
                    htmlP = formattedP;
                }
            }
            
            html1 += `<div style="height: 44px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: bold; margin-bottom: 2px; color: #1e293b;">${htmlMakeup}</div>`;
            html2 += `<div style="height: 44px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: bold; margin-bottom: 2px; color: #1e293b;">${htmlP}</div>`;
        }
        
        html1 += `</div>`;
        html2 += `</div>`;

        html += `<td style="vertical-align: top; text-align: center; border-bottom: 1px solid #0f172a; padding: 0; min-width: 35px; border-left: 1px solid #0f172a; background-color: #f8fafc; position: sticky; right: 35px; z-index: 10;">${html1}</td>`;
        html += `<td style="vertical-align: top; text-align: center; border-bottom: 1px solid #0f172a; padding: 0; min-width: 35px; border-left: 1px solid #cbd5e1; background-color: #f8fafc; position: sticky; right: 0px; z-index: 10;">${html2}</td>`;
        html += `</tr>`;
    });

    html += `</tbody></table></div>`;
    return html;
}
window.toggleNavSub = function (el) { el.classList.toggle('active'); el.nextElementSibling?.classList.toggle('show'); };
window.loadExamView = function (key) { window.location.href = `index.html?viewExam=${key}`; };

// [신규 - 즉각 동기화] 다른 탭에서 예정일이 변경되면 즉시 반영
window.addEventListener('storage', (e) => {
    if (e.key === 'sejong_ledger_sync' || e.key === 'sejong_timetable_sync' || e.key === 'sejong_attendance_sync') {
        loadData(window.targetMemberId, currentYear);
    }
});

// ====== LEDGER MODAL ADDITIONS ======
let editModal = null;
let editForm = null;

function initEditModal() {
    editModal = document.getElementById('editStudentModal');
    editForm = document.getElementById('editStudentForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEditSubmit);
    }
}

let targetMemberIdForEdit = null;
function openEditConfirmModal(memberId) {
    const modal = document.getElementById('editConfirmModal');
    targetMemberIdForEdit = memberId;
    if (modal) {
        const member = membersData.find(m => m.id === memberId);
        const titleEl = document.getElementById('editConfirmTitle');
        if (titleEl && member) {
            titleEl.textContent = `${member.name} 학생의 정보를 수정하시겠습니까?`;
        }
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
    }
}
function closeEditConfirmModal() {
    const modal = document.getElementById('editConfirmModal');
    targetMemberIdForEdit = null;
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initEditModal();
    const yesBtn = document.getElementById('editConfirmYesBtn');
    if (yesBtn) {
        yesBtn.addEventListener('click', function () {
            if (targetMemberIdForEdit) {
                openEditModal(targetMemberIdForEdit);
                closeEditConfirmModal();
            }
        });
    }
});

function openEditModal(memberId) {
    const member = membersData.find(m => m.id === memberId);
    if (!member) return;

    if (editForm) {
        editForm.id.value = member.id;
        editForm.registeredDate.value = member.registeredDate || '';
        editForm.name.value = member.name || '';
        editForm.resident_num.value = member.resident_num || '';
        editForm.address.value = member.address || '';
        editForm.address_detail.value = member.address_detail || '';
        editForm.phone.value = member.phone || '';
        editForm.phone_guardian.value = member.phone_guardian || '';
        
        // Parse Start Date (20YY-MM-DD)
        if (member.start_date) {
            const parts = member.start_date.split('-');
            if (parts.length === 3) {
                editForm.start_yy.value = parts[0].length === 4 ? parts[0].slice(2) : parts[0];
                editForm.start_mm.value = parts[1];
                editForm.start_dd.value = parts[2];
            }
        } else {
            editForm.start_yy.value = '';
            editForm.start_mm.value = '';
            editForm.start_dd.value = '';
        }

        // Handle Multiple Courses
        const courseContainer = document.getElementById('edit_course_container');
        if (courseContainer) {
            courseContainer.innerHTML = ''; // Clear previous
            const courses = (member.course || '').split(',');
            let hasCourse = false;
            courses.forEach(c => {
                if (c.trim()) {
                    addCourseInput(c);
                    hasCourse = true;
                }
            });
            if (!hasCourse) addCourseInput('');
        }

        // Handle Remarks Type
        const type = member.type === 'student' ? 'student' : 'general';
        const remarkSelect = document.getElementById('edit_remark_type');
        if (remarkSelect) {
            remarkSelect.value = type;
            remarkSelect.dispatchEvent(new Event('change')); // Trigger toggle
        }

        // Split remarks or just load existing fields if they exist
        editForm.school.value = member.school || '';
        editForm.grade.value = member.grade || '';
        editForm.job.value = member.job || '';
        editForm.notes.value = member.notes || '';
    }

    if (editModal) {
        editModal.style.display = 'flex';
        editModal.classList.remove('hidden');
    }
}

function closeEditModal() {
    if (editModal) {
        editModal.style.display = 'none';
        editModal.classList.add('hidden');
    }
}

function addCourseInput(value = '') {
    const container = document.getElementById('edit_course_container');
    if (!container) return;

    let courseName = '';
    let courseTime = '';

    // Parse '과정명(시간)' format
    const match = value.match(/(.*?)(?:\((.*?)\))?$/);
    if (match) {
        courseName = match[1] ? match[1].trim() : '';
        courseTime = match[2] ? match[2].trim() : '';
    }

    const div = document.createElement('div');
    div.className = 'course-input-row';
    div.style.cssText = 'display: flex; gap: 5px; margin-bottom: 5px;';

    const courseSelect = document.createElement('select');
    courseSelect.className = 'course-edit-name full-width p-8 border-light rounded';
    courseSelect.style.flex = '2';

    const courses = ['', '한식기능사', '양식기능사', '일식기능사', '중식기능사', '제과기능사', '제빵기능사', '제과제빵기능사', '복어기능사', '산업기사', '가정요리', '브런치'];
    courses.forEach(c => {
        const option = document.createElement('option');
        option.value = c;
        option.textContent = c || '과정 선택';
        if (c === courseName) option.selected = true;
        courseSelect.appendChild(option);
    });

    if (courseName && !courses.includes(courseName)) {
        const option = document.createElement('option');
        option.value = courseName;
        option.textContent = courseName;
        option.selected = true;
        courseSelect.appendChild(option);
    }

    const timeSelect = document.createElement('select');
    timeSelect.className = 'course-edit-time full-width p-8 border-light rounded';
    timeSelect.style.flex = '1';

    const times = ['', '10:00', '12:00', '17:00', '19:00'];
    const timeLabels = { '10:00': '오전 10:00', '12:00': '오전 12:00', '17:00': '오후 05:00', '19:00': '오후 07:00' };
    times.forEach(t => {
        const option = document.createElement('option');
        option.value = t;
        option.textContent = t ? timeLabels[t] || t : '시간 선택';
        if (t === courseTime) option.selected = true;
        timeSelect.appendChild(option);
    });

    if (courseTime && !times.includes(courseTime)) {
        const option = document.createElement('option');
        option.value = courseTime;
        option.textContent = courseTime;
        option.selected = true;
        timeSelect.appendChild(option);
    }

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.textContent = '-';
    delBtn.style.cssText = 'padding: 0 15px; cursor: pointer; background: #ff4444; color: white; border: none; border-radius: 4px; font-weight: bold; font-size: 1.2rem;';
    delBtn.onclick = () => {
        div.remove();
    };

    div.appendChild(courseSelect);
    div.appendChild(timeSelect);
    div.appendChild(delBtn);

    container.appendChild(div);
}
function removeCourseInput(btn) { btn.parentElement.remove(); }

async function handleEditSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());

    // Combine course items for 'course' field
    const courseRows = document.querySelectorAll('#edit_course_container .course-input-row');
    const courseValues = Array.from(courseRows)
        .map(row => {
            const name = row.querySelector('.course-edit-name')?.value.trim();
            const time = row.querySelector('.course-edit-time')?.value.trim();
            if (name && time) return `${name}(${time})`;
            if (name) return name;
            return '';
        })
        .filter(v => v !== '');

    // --- Automatic Merging Exception Logic ---
    const jevaIdx = courseValues.findIndex(v => v.startsWith('제과기능사('));
    const jepangIdx = courseValues.findIndex(v => v.startsWith('제빵기능사('));

    if (jevaIdx !== -1 && jepangIdx !== -1) {
        const jevaStr = courseValues[jevaIdx];
        const jepangStr = courseValues[jepangIdx];

        const jevaTime = jevaStr.match(/\(([^)]+)\)/)?.[1] || '';
        const jepangTime = jepangStr.match(/\(([^)]+)\)/)?.[1] || '';

        const mergedTime = jevaTime === jepangTime ? jevaTime : `${jevaTime},${jepangTime}`;
        const newEntry = `제과제빵기능사(${mergedTime})`;

        if (jevaIdx > jepangIdx) {
            courseValues.splice(jevaIdx, 1);
            courseValues.splice(jepangIdx, 1, newEntry);
        } else {
            courseValues.splice(jepangIdx, 1);
            courseValues.splice(jevaIdx, 1, newEntry);
        }
    }
    // ------------------------------------------

    data.course = courseValues.join(', ');

    // Extract timeSlot from course strings
    const extractedTimes = [];
    courseValues.forEach(c => {
        const match = c.match(/\(([^)]+)\)/);
        if (match && match[1]) {
            extractedTimes.push(match[1]);
        }
    });
    data.timeSlot = extractedTimes.join(',');

    if (data.course_item) delete data.course_item;

    // Combine Start Date
    const yy = data.start_yy || '';
    const mm = data.start_mm || '';
    const dd = data.start_dd || '';
    if (yy && mm && dd) {
        data.start_date = `20${yy}-${mm}-${dd}`;
    } else {
        data.start_date = '';
    }
    delete data.start_yy;
    delete data.start_mm;
    delete data.start_dd;

    // Handle Remarks Type and Cleanup
    const selectedType = document.getElementById('edit_remark_type').value;
    data.type = selectedType;

    if (selectedType === 'student') {
        data.job = '';
    } else {
        data.school = '';
        data.grade = '';
    }

    // ------------------------------------------
    // Data Preservation Logic: Merge new data into existing member object 
    // to ensure no fields (like memo, status, etc.) are lost.
    const existingMember = membersData.find(m => m.id === data.id);
    let finalData = data;

    if (existingMember) {
        // Merge: form data takes precedence
        finalData = { ...existingMember, ...data };
    }
    // ------------------------------------------

    try {
        const res = await fetch(getFetchUrl('members', true), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalData)
        });
        const result = await res.json();
        if (result.success !== false) {
            closeEditModal();
            const idx = membersData.findIndex(m => m.id === finalData.id);
            if(idx !== -1) membersData[idx] = finalData;
            renderLedger(); 
        } else {
            alert("수정 실패");
        }
    } catch (err) {
        console.error(err);
        alert("통신 오류");
    }
}

function toggleEditMemberType() {
    const type = document.getElementById('edit_remark_type').value;
    const studentFields = document.getElementById('edit_student_fields');
    const generalFields = document.getElementById('edit_general_fields');
    if (type === 'student') {
        studentFields.classList.remove('hidden');
        generalFields.classList.add('hidden');
        document.querySelector('#editStudentForm select[name="job"]').value = '';
    } else {
        studentFields.classList.add('hidden');
        generalFields.classList.remove('hidden');
        document.querySelector('#editStudentForm input[name="school"]').value = '';
        document.querySelector('#editStudentForm input[name="grade"]').value = '';
    }
}

function openDaumPostcode(targetId) {
    if (typeof daum !== 'undefined' && daum.Postcode) {
        new daum.Postcode({
            oncomplete: function(data) {
                document.getElementById(targetId).value = data.roadAddress || data.jibunAddress;
                const detail = document.querySelector('input[name="address_detail"]');
                if (detail) detail.focus();
            }
        }).open();
    } else {
        alert("카카오 우편번호 서비스를 불러올 수 없습니다. 다시 시도해주세요.");
    }
}
window.openEditConfirmModal = openEditConfirmModal;
window.closeEditConfirmModal = closeEditConfirmModal;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.addCourseInput = addCourseInput;
window.removeCourseInput = removeCourseInput;
window.toggleEditMemberType = toggleEditMemberType;
window.openDaumPostcode = openDaumPostcode;

// Drag to scroll logic for the table container
document.addEventListener('mousedown', (e) => {
    const container = e.target.closest('div[style*="overflow: auto"]');
    if (!container) return;
    
    // Ignore if clicking on form elements or buttons
    if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(e.target.tagName)) return;

    let isDown = true;
    let startX = e.pageX - container.offsetLeft;
    let startY = e.pageY - container.offsetTop;
    let scrollLeft = container.scrollLeft;
    let scrollTop = container.scrollTop;

    const mouseMoveHandler = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const y = e.pageY - container.offsetTop;
        const walkX = (x - startX) * 1.5; 
        const walkY = (y - startY) * 1.5;
        container.scrollLeft = scrollLeft - walkX;
        container.scrollTop = scrollTop - walkY;
    };

    const mouseUpHandler = () => {
        isDown = false;
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
});
