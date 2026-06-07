
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
        if (m) m[field] = value;
        await fetch(`/api/sejong/members/${memberId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [field]: value })
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
            body: JSON.stringify({ id: memberId, course: newCourse })
        });
        renderLedger(); 
    } catch(e) { console.error(e); }
};

window.moveToTrash = async function(memberId) {
    if(!confirm('정말 휴지통으로 이동하시겠습니까? (이동 시 수강생 대장을 제외한 모든 화면에서 숨김 처리됩니다)')) return;
    try {
        const m = membersData.find(m => String(m.id) === String(memberId));
        if (m) m.status = 'trash';
        await fetch(getFetchUrl('members', true), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: memberId, status: 'trash' })
        });
        renderLedger();
    } catch(e) { console.error(e); }
};

let currentYear = parseInt(localStorage.getItem('sejong_ledger_currentYear')) || new Date().getFullYear();

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get('memberId');
    const targetYear = params.get('year') || localStorage.getItem('sejong_ledger_currentYear') || new Date().getFullYear();
    currentYear = parseInt(targetYear);

    if (typeof initializeYearSelect === 'function') {
        initializeYearSelect(targetYear);
    }

    loadData(targetId, targetYear);
});

async function loadData(targetId) {
    const container = document.getElementById('ledgerTablesContainer');
    if (container) container.innerHTML = '<div style="padding:20px; text-align:center;">데이터를 불러오고 있습니다...</div>';

    try {
        const cacheBuster = `?t=${Date.now()}`;
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
    
    // 1. Check real milestone
    if (syncData && syncData[syncKey]) {
        const rawSync = syncData[syncKey];
        const days = Array.isArray(rawSync) ? rawSync : (typeof rawSync === 'number' ? [rawSync] : []);
        if (days.length > 0) {
            return { eighthDays: days, eighthMonth: targetMonth, isSimulated: false, hasAnyAttendance: true };
        }
    }

    const m = membersData.find(m => String(m.id) === String(memberId));
        if (typeof window.calculateRedBoxesForMonth === 'function') {
            const memberObj = membersData.find(m => String(m.id) === String(memberId));
            if (memberObj) {
                const result = window.calculateRedBoxesForMonth(memberObj, targetYear, targetMonth, attendanceData || [], courseFilter, window.GLOBAL_DATA_ADJUSTMENTS || {});
                if (result && result.redDays && result.redDays.length > 0) {
                    return { eighthDays: result.redDays, eighthMonth: targetMonth, isSimulated: result.isSimulated, hasAnyAttendance: result.hasAnyAttendance };
                }
            }
        }
    return { eighthDays: [], eighthMonth: targetMonth, isSimulated: false, hasAnyAttendance: false };
}

function getAllLedgerMonthStats(memberId, year, month) {
    const member = membersData.find(m => String(m.id) === String(memberId));
    if (!member || !member.course) return [];

    let courses = member.course.split(',').map(c => c.split('(')[0].trim());
    const hasJeggwa = courses.some(c => c.includes('제과') && !c.includes('제과제빵'));
    const hasJeppang = courses.some(c => c.includes('제빵') && !c.includes('제과제빵'));
    if (hasJeggwa && hasJeppang) {
        courses = courses.filter(c => !c.includes('제과') && !c.includes('제빵'));
        courses.push('제과제빵기능사');
    }

    const results = [];

    courses.forEach(courseName => {
        const stats = getLedgerMonthStats(memberId, year, month, courseName);
        // User Request: 출석 날짜가 없는 수강생은 수강료예정일 표시하지 마시고, 출석이 1개라도 있으면 표시하세요.
        if (stats.eighthDays && stats.eighthDays.length > 0 && stats.hasAnyAttendance) {
            stats.eighthDays.forEach(day => {
                results.push({
                    course: courseName,
                    eighthDay: day,
                    eighthMonth: stats.eighthMonth,
                    isSimulated: stats.isSimulated,
                    fee: courseFees[courseName] || courseFees['all'] || 0
                });
            });
        }
    });

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
        if (!currentFilterDate) {
            return members; // Show all if no date is picked
        }
        let startM, startD, endM, endD;
        if (currentFilterDate.includes('~')) {
            const parts = currentFilterDate.split('~').map(s => s.trim());
            startM = parseInt(parts[0].split('-')[1], 10);
            startD = parseInt(parts[0].split('-')[2], 10);
            endM = parseInt(parts[1].split('-')[1], 10);
            endD = parseInt(parts[1].split('-')[2], 10);
        } else {
            startM = parseInt(currentFilterDate.split('-')[1], 10);
            startD = parseInt(currentFilterDate.split('-')[2], 10);
            endM = startM;
            endD = startD;
        }

        return members.filter(m => {
            for (let month = 1; month <= 12; month++) {
                const schedules = getAllLedgerMonthStats(m.id, currentYear, month);
                const hasMatch = schedules.some(s => {
                    const sMonth = s.eighthMonth || month;
                    let isMatch = false;

                    if (currentFilterDate.includes('~')) {
                        const sVal = sMonth * 100 + s.eighthDay;
                        const startVal = startM * 100 + startD;
                        const endVal = endM * 100 + endD;
                        if (sVal >= startVal && sVal <= endVal) isMatch = true;
                    } else {
                        if (sMonth === startM && s.eighthDay === startD) isMatch = true;
                    }

                    if (!isMatch) return false;

                    const isPaid = paymentsData.some(p =>
                        String(p.memberId) === String(m.id) &&
                        String(p.year) === String(currentYear) &&
                        String(p.month) === String(month) &&
                        p.status === 'paid' &&
                        (p.course.includes(s.course) || s.course.includes(p.course))
                    );

                    return !isPaid;
                });
                if (hasMatch) return true;
            }
            return false;
        });
    };

    // Case 1: Individual Course
    if (COURSE_LIST.includes(activeCategory)) {
        const courseName = activeCategory;
        let filteredMembers = membersData.filter(m => {
            if (courseName === '기타') {
                if (!m.course) return true; // Members with no course are '기타'
                const cList = m.course.split(',').map(c => c.trim());
                // Return true if they ARE NOT in any defined course EXCEPT '기타' itself in the list
                return !cList.some(c => COURSE_LIST.filter(cl => cl !== '기타').some(cl => c.includes(cl)));
            }
            return m.course && m.course.includes(courseName);
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
        courses.forEach(courseName => {
            let filteredMembers = membersData.filter(m => {
                if (courseName === '기타') {
                    if (!m.course) return true;
                    const cList = m.course.split(',').map(c => c.trim());
                    return !cList.some(c => COURSE_LIST.filter(cl => cl !== '기타').some(cl => c.includes(cl)));
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
        const cList = m.course.split(',').map(c => c.trim());
        return !cList.some(c => COURSE_LIST.filter(cl => cl !== '기타').some(cl => c.includes(cl)));
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
    section.style.cssText = `margin-bottom: 40px;`;

    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0f172a; margin-bottom: 12px; padding: 10px 0;">
            <h2 style="margin: 0; font-size: 1.4rem; font-weight: 900;">${title} (${members.length}명)</h2>
            <div style="display: flex; align-items: center; gap: 10px;">
                <label style="font-size: 0.8rem; font-weight: 700;">결재 일정 필터:</label>
                <input type="text" id="dateFilter-${id}" value="${currentFilterDate}" placeholder="날짜 범위 (드래그)" style="padding: 3px 6px; border-radius: 4px; border: 1px solid #cbd5e1; font-weight: 700; font-size: 0.8rem; cursor: pointer; width: 180px;">
            </div>
        </div>
        <div style="overflow-x: auto; border: 1.5px solid #0f172a; border-radius: 4px; background: #fff;">
            <table style="width: 100%; border-collapse: collapse; min-width: 1000px; font-family: 'Noto Sans KR', sans-serif;">
                <thead>
                    <tr style="background: #f8fafc; border-bottom: 1.5px solid #0f172a;">
                        <th rowspan="2" style="width: 40px; border-right: 1.5px solid #0f172a; font-size: 0.75rem;">NO</th>
                        <th rowspan="2" style="width: 180px; border-right: 1.5px solid #0f172a; font-size: 0.75rem; text-align: left; padding: 10px;">회원정보 / 과정</th>
                        ${Array.from({ length: 12 }, (_, i) => `<th colspan="2" style="border-right: 1.5px solid #0f172a; border-bottom: 1px solid #cbd5e1; font-size: 0.8rem; padding: 5px;">${i + 1}월</th>`).join('')}
                        <th rowspan="2" style="width: 100px; font-size: 0.75rem;">비고</th>
                    </tr>
                    <tr style="background: #f8fafc; border-bottom: 1.5px solid #0f172a;">
                        ${Array.from({ length: 12 }, () => `<th style="width: 45px; font-size: 0.65rem; border-right: 1px dotted #cbd5e1;">예</th><th style="width: 45px; font-size: 0.65rem; border-right: 1.5px solid #0f172a;">실</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
    `;

    members.forEach((m, idx) => {
        const isTarget = window.targetMemberId && String(m.id) === String(window.targetMemberId);
        const rowId = `row-${id}-${m.id}`;
        html += `<tr id="${rowId}" style="border-bottom: 1px solid #0f172a; ${isTarget ? 'background: #fffbeb;' : ''}">
            <td style="text-align: center; font-weight: 700; border-right: 1.5px solid #0f172a;">${idx + 1}</td>
            <td style="padding: 6px 8px; border-right: 1.5px solid #0f172a;">
                <div style="display: flex; align-items: center; gap: 4px;">
                    <span onclick="moveToTrash('${m.id}')" style="cursor: pointer; color: #ef4444; font-size: 0.8rem; display: flex; align-items: center;" title="휴지통으로 이동"><span class="material-icons" style="font-size: 0.8rem;">delete</span></span>
                    <input type="text" value="${m.name || ''}" onchange="updateMemberField('${m.id}', 'name', this.value)" style="font-weight: 900; font-size: 0.9rem; border: 1px solid transparent; width: 65px; padding: 0 2px; background: transparent; color: #000;" onfocus="this.style.border='1px solid #cbd5e1'; this.style.background='#fff'" onblur="this.style.border='1px solid transparent'; this.style.background='transparent'">
                </div>
                <div style="margin-top: 2px;">
                    <input type="text" value="${m.phone || ''}" onchange="updateMemberField('${m.id}', 'phone', this.value)" style="font-size: 0.7rem; color: #64748b; border: 1px solid transparent; width: 95px; padding: 0 2px; background: transparent;" onfocus="this.style.border='1px solid #cbd5e1'; this.style.background='#fff'" onblur="this.style.border='1px solid transparent'; this.style.background='transparent'" placeholder="전화번호">
                </div>
                <div style="margin-top: 4px; display: flex; flex-direction: column; gap: 2px;">
                    ${(() => {
                        const courses = (m.course || '').split(',').map(c => c.trim()).filter(Boolean);
                        const c1 = courses[0] || '';
                        const c2 = courses[1] || '';
                        const c3 = courses[2] || '';

                        const renderInput = (val, idx) => {
                            if (!val) {
                                return `<input type="text" value="" readonly onclick="openEditConfirmModal('${m.id}')" placeholder="+ 과정 추가" style="cursor: pointer; font-size: 0.6rem; color: #1d4ed8; background: #eff6ff; border: 1px solid transparent; border-radius: 2px; width: 80px; padding: 1px 3px;">`;
                            } else {
                                return `<input type="text" value="${val}" onchange="updateMemberCourse('${m.id}', ${idx}, this.value)" placeholder="+ 과정 추가" style="font-size: 0.6rem; color: #1d4ed8; background: #eff6ff; border: 1px solid transparent; border-radius: 2px; width: 80px; padding: 1px 3px;" onfocus="this.style.border='1px solid #bfdbfe'" onblur="this.style.border='1px solid transparent'">`;
                            }
                        };

                        return `
                            <div style="display: flex; align-items: center; gap: 2px;">
                                <span onclick="updateMemberCourse('${m.id}', 0, '')" style="cursor: pointer; color: #ef4444; display: flex; align-items: center; visibility: ${c1 ? 'visible' : 'hidden'};" title="과정 삭제"><span class="material-icons" style="font-size: 0.75rem;">delete</span></span>
                                ${renderInput(c1, 0)}
                            </div>
                            <div style="display: flex; align-items: center; gap: 2px;">
                                <span onclick="updateMemberCourse('${m.id}', 1, '')" style="cursor: pointer; color: #ef4444; display: flex; align-items: center; visibility: ${c2 ? 'visible' : 'hidden'};" title="과정 삭제"><span class="material-icons" style="font-size: 0.75rem;">delete</span></span>
                                ${renderInput(c2, 1)}
                            </div>
                            <div style="display: flex; align-items: center; gap: 2px;">
                                <span onclick="updateMemberCourse('${m.id}', 2, '')" style="cursor: pointer; color: #ef4444; display: flex; align-items: center; visibility: ${c3 ? 'visible' : 'hidden'};" title="과정 삭제"><span class="material-icons" style="font-size: 0.75rem;">delete</span></span>
                                ${renderInput(c3, 2)}
                            </div>
                        `;
                    })()}
                </div>
            </td>`;

        const allMonthsSchedules = [];
        const courseLatestRealMonth = {};

        for (let month = 1; month <= 12; month++) {
            let schedules = getAllLedgerMonthStats(m.id, currentYear, month);
            allMonthsSchedules.push(schedules);
            
            schedules.forEach(s => {
                if (!s.isSimulated && s.eighthDay && !isNaN(parseInt(s.eighthDay)) && Number(s.eighthDay) > 0) {
                    if (!courseLatestRealMonth[s.course] || courseLatestRealMonth[s.course] < month) {
                        courseLatestRealMonth[s.course] = month;
                    }
                }
            });
        }

        const coursesFoundSimulated = new Set();
        
        allMonthsSchedules.forEach((schedules, idx) => {
            const month = idx + 1;

            if (currentFilterDate) {
                let startM, startD, endM, endD;
                if (currentFilterDate.includes('~')) {
                    const parts = currentFilterDate.split('~').map(s => s.trim());
                    startM = parseInt(parts[0].split('-')[1], 10);
                    startD = parseInt(parts[0].split('-')[2], 10);
                    endM = parseInt(parts[1].split('-')[1], 10);
                    endD = parseInt(parts[1].split('-')[2], 10);
                } else {
                    startM = parseInt(currentFilterDate.split('-')[1], 10);
                    startD = parseInt(currentFilterDate.split('-')[2], 10);
                    endM = startM;
                    endD = startD;
                }

                schedules = schedules.filter(s => {
                    const sMonth = s.eighthMonth || month;
                    let isMatch = false;

                    if (currentFilterDate.includes('~')) {
                        const sVal = sMonth * 100 + s.eighthDay;
                        const startVal = startM * 100 + startD;
                        const endVal = endM * 100 + endD;
                        if (sVal >= startVal && sVal <= endVal) isMatch = true;
                    } else {
                        if (sMonth === startM && s.eighthDay === startD) isMatch = true;
                    }

                    if (!isMatch) return false;

                    const isPaid = paymentsData.some(p =>
                        String(p.memberId) === String(m.id) &&
                        String(p.year) === String(currentYear) &&
                        String(p.month) === String(month) &&
                        p.status === 'paid' &&
                        (p.course.includes(s.course) || s.course.includes(p.course))
                    );

                    return !isPaid;
                });
            }

            const paid = paymentsData.filter(p => String(p.memberId) === String(m.id) && String(p.year) === String(currentYear) && String(p.month) === String(month) && p.status === 'paid');

            let expectedHTML = schedules
                .filter(s => {
                    if (!s.eighthDay || isNaN(parseInt(s.eighthDay)) || Number(s.eighthDay) <= 0) return false;
                    
                    if (s.isSimulated) {
                        if (courseLatestRealMonth[s.course] && month <= courseLatestRealMonth[s.course]) {
                            return false;
                        }
                        if (coursesFoundSimulated.has(s.course)) return false;
                        coursesFoundSimulated.add(s.course);
                    }
                    return true;
                })
                .map(s => {
                    const dayText = `${s.eighthDay}일`;
                    const feeColor = s.isSimulated ? '#3b82f6' : '#d946ef';
                    const dateColor = s.isSimulated ? '#3b82f6' : '#ff0000';
                    return `
                    <div style="font-size: 0.65rem; font-weight: 800; display: flex; flex-direction: column; gap: 2px; align-items: center; margin-bottom: 4px;">
                        <div style="color: ${dateColor};">${dayText}</div>
                        <div style="font-size: 0.6rem; color: ${feeColor};">${s.fee / 10000}만</div>
                        <div style="font-size: 0.55rem; color: #64748b; font-weight: 600; line-height: 1;">${s.course || ''}</div>
                    </div>
                `}).join('');

            let actualHTML = paid.map(p => `
                <div style="font-size: 0.65rem; font-weight: 900; display: flex; flex-direction: column; gap: 2px; align-items: center; margin-bottom: 4px;">
                    <div>${new Date(p.updatedAt).getDate()}일</div>
                    <div style="font-size: 0.6rem; color: #059669;">${p.amount / 10000}만</div>
                    ${p.course ? `<div style="font-size: 0.55rem; color: #64748b; font-weight: 600; line-height: 1;">${p.course}</div>` : ''}
                </div>
            `).join('');

            html += `<td style="text-align: center; border-right: 1px dotted #cbd5e1; padding: 4px;">${expectedHTML}</td>
                     <td style="text-align: center; border-right: 1.5px solid #0f172a; padding: 4px;">${actualHTML}</td>`;
        });
        html += `<td></td></tr>`;
    });

    html += `</tbody></table></div>`;
    section.innerHTML = html;
    container.appendChild(section);

    // Initialize Flatpickr for this table's date input
    if (typeof flatpickr !== 'undefined') {
        flatpickr(`#dateFilter-${id}`, {
            mode: "range",
            locale: "ko",
            dateFormat: "Y-m-d",
            maxRange: 7, // User requested 1~7 days
            onChange: function (selectedDates, dateStr) {
                if (selectedDates.length === 2) {
                    currentFilterDate = dateStr;
                    renderLedger();
                }
            },
            onClose: function (selectedDates, dateStr) {
                currentFilterDate = dateStr;
                renderLedger();
            }
        });
    }

    if (window.targetMemberId) {
        setTimeout(() => {
            const el = document.getElementById(`row-${id}-${window.targetMemberId}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 800);
    }
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
        if (member.start_date) {
            const parts = member.start_date.split('-');
            if (parts.length === 3) {
                editForm.start_yy.value = parts[0].length === 4 ? parts[0].slice(2) : parts[0];
                editForm.start_mm.value = parts[1];
                editForm.start_dd.value = parts[2];
            }
        } else {
            editForm.start_yy.value = ''; editForm.start_mm.value = ''; editForm.start_dd.value = '';
        }

        const courseContainer = document.getElementById('edit_course_container');
        if (courseContainer) {
            courseContainer.innerHTML = '';
            const courses = (member.course || '').split(',');
            let hasCourse = false;
            courses.forEach(c => {
                if (c.trim()) { addCourseInput(c); hasCourse = true; }
            });
            if (!hasCourse) addCourseInput('');
        }

        const type = member.type === 'student' ? 'student' : 'general';
        const remarkSelect = document.getElementById('edit_remark_type');
        if (remarkSelect) {
            remarkSelect.value = type;
            remarkSelect.dispatchEvent(new Event('change'));
        }

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

function addCourseInput(initialValue = '') {
    const container = document.getElementById('edit_course_container');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'flex-group gap-5 mb-5 course-input-row';
    
    let courseName = initialValue;
    let courseTime = '';
    const match = initialValue.match(/^(.*?)\((.*?)\)$/);
    if (match) {
        courseName = match[1].trim();
        courseTime = match[2].trim();
    }

    div.innerHTML = `
        <select class="flex-2 p-8 border-light rounded course-edit-name" title="과정명 선택">
            <option value="">직접입력</option>
            <option value="한식" ${courseName === '한식' ? 'selected' : ''}>한식</option>
            <option value="양식" ${courseName === '양식' ? 'selected' : ''}>양식</option>
            <option value="일식" ${courseName === '일식' ? 'selected' : ''}>일식</option>
            <option value="중식" ${courseName === '중식' ? 'selected' : ''}>중식</option>
            <option value="제과" ${courseName === '제과' ? 'selected' : ''}>제과</option>
            <option value="제빵" ${courseName === '제빵' ? 'selected' : ''}>제빵</option>
            <option value="바리스타" ${courseName === '바리스타' ? 'selected' : ''}>바리스타</option>
            <option value="원데이" ${courseName === '원데이' ? 'selected' : ''}>원데이</option>
        </select>
        <input type="text" value="${courseName}" class="flex-2 course-edit-name-custom ${courseName && ['한식', '양식', '일식', '중식', '제과', '제빵', '바리스타', '원데이'].includes(courseName) ? 'hidden' : ''}" placeholder="과정명 직접입력">
        <select class="flex-1 p-8 border-light rounded course-edit-time" title="시간 선택">
            <option value="">직접입력</option>
            <option value="10:00" ${courseTime === '10:00' ? 'selected' : ''}>10:00</option>
            <option value="14:00" ${courseTime === '14:00' ? 'selected' : ''}>14:00</option>
            <option value="18:30" ${courseTime === '18:30' ? 'selected' : ''}>18:30</option>
        </select>
        <input type="text" value="${courseTime}" class="flex-1 course-edit-time-custom ${courseTime && ['10:00', '14:00', '18:30'].includes(courseTime) ? 'hidden' : ''}" placeholder="시간">
        <button type="button" class="btn-danger p-8" onclick="removeCourseInput(this)" title="과정 삭제">
            <span class="material-icons fs-16">remove</span>
        </button>
    `;
    
    const nameSelect = div.querySelector('.course-edit-name');
    const nameCustom = div.querySelector('.course-edit-name-custom');
    nameSelect.addEventListener('change', (e) => {
        if (e.target.value === "") { nameCustom.classList.remove('hidden'); nameCustom.value = ''; }
        else { nameCustom.classList.add('hidden'); nameCustom.value = e.target.value; }
    });

    const timeSelect = div.querySelector('.course-edit-time');
    const timeCustom = div.querySelector('.course-edit-time-custom');
    timeSelect.addEventListener('change', (e) => {
        if (e.target.value === "") { timeCustom.classList.remove('hidden'); timeCustom.value = ''; }
        else { timeCustom.classList.add('hidden'); timeCustom.value = e.target.value; }
    });

    container.appendChild(div);
}
function removeCourseInput(btn) { btn.parentElement.remove(); }

async function handleEditSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());

    const courseRows = document.querySelectorAll('#edit_course_container .course-input-row');
    const courseValues = Array.from(courseRows).map(row => {
        const name = row.querySelector('.course-edit-name-custom')?.value.trim();
        const time = row.querySelector('.course-edit-time-custom')?.value.trim();
        if (name && time) return `${name}(${time})`;
        if (name) return name;
        return '';
    }).filter(v => v !== '');

    data.course = courseValues.join(', ');
    data.type = document.getElementById('edit_remark_type').value;

    if (data.start_yy && data.start_mm && data.start_dd) {
        data.start_date = `20${data.start_yy}-${data.start_mm.padStart(2, '0')}-${data.start_dd.padStart(2, '0')}`;
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
        if (result.success !== false) { // Assuming Next.js returns success or the object
            closeEditModal();
            fetchData(); 
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
