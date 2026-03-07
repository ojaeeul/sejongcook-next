"use strict";

let membersData = [];
let attendanceData = [];
let paymentsData = [];
let holidaysData = [];
let currentYear = new Date().getFullYear();
let attendanceByMember = {};

const SHEET_API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : '/api';

async function loadData(targetMemberIdParam = null, targetYearParam = null) {
    if (targetYearParam) currentYear = targetYearParam;
    window.targetMemberId = targetMemberIdParam;

    try {
        const [mRes, aRes, pRes, hRes] = await Promise.all([
            fetch(`${SHEET_API_BASE}/members`).then(r => r.json()),
            fetch(`${SHEET_API_BASE}/attendance`).then(r => r.json()),
            fetch(`${SHEET_API_BASE}/payments`).then(r => r.json()),
            fetch(`${SHEET_API_BASE}/holidays`).then(r => r.json())
        ]);

        membersData = mRes;
        attendanceData = aRes;
        paymentsData = pRes;
        holidaysData = hRes;

        // Group attendance
        attendanceByMember = {};
        attendanceData.forEach(r => {
            if (!attendanceByMember[r.memberId]) attendanceByMember[r.memberId] = [];
            r.dateObj = new Date(r.date);
            r.yearNum = r.dateObj.getFullYear();
            r.monthNum = r.dateObj.getMonth() + 1;
            attendanceByMember[r.memberId].push(r);
        });

        initializeYearSelect();
        renderLedger();
    } catch (e) {
        console.error("Data load failed", e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
});

const KOREAN_HOLIDAYS_MAP = {
    "2024-01-01": "신정", "2024-02-09": "설날", "2024-02-10": "설날", "2024-02-11": "설날", "2024-02-12": "대체공휴일",
    "2024-03-01": "삼일절", "2024-04-10": "국회의원선거", "2024-05-05": "어린이날", "2024-05-06": "대체공휴일",
    "2024-05-15": "부처님오신날", "2024-06-06": "현충일", "2024-08-15": "광복절", "2024-09-16": "추석", "2024-09-17": "추석",
    "2024-09-18": "추석", "2024-10-03": "개천절", "2024-10-09": "한글날", "2024-12-25": "크리스마스",
    "2025-01-01": "신정", "2025-01-28": "설날", "2025-01-29": "설날", "2025-01-30": "설날", "2025-03-01": "삼일절",
    "2025-03-03": "대체공휴일", "2025-05-05": "어린이날", "2025-05-06": "부처님오신날", "2025-06-06": "현충일",
    "2025-08-15": "광복절", "2025-10-03": "개천절", "2025-10-05": "추석", "2025-10-06": "추석", "2025-10-07": "추석",
    "2025-10-08": "대체공휴일", "2025-10-09": "한글날", "2025-12-25": "크리스마스"
};

const COURSE_SCHEDULES = {
    "한식기능사": [1, 2, 3, 4, 5], "양식기능사": [1, 2, 3, 4, 5], "일식기능사": [1, 2, 3, 4, 5], "중식기능사": [1, 2, 3, 4, 5],
    "제과기능사": [1, 2, 3, 4, 5], "제빵기능사": [1, 2, 3, 4, 5], "제과제빵기능사": [1, 2, 3, 4, 5], "일반요리": [1, 2, 3, 4, 5]
};

const courseFees = {
    "한식기능사": 350000, "양식기능사": 350000, "일식기능사": 400000, "중식기능사": 400000,
    "제과기능사": 400000, "제빵기능사": 400000, "제과제빵기능사": 700000, "all": 350000
};

// sheet.html과 동일한 수동 보정 데이터
const GLOBAL_DATA_ADJUSTMENTS = {};

function getLedgerMonthStats(memberId, year, month, courseFilter = null) {
    // 1. 동기화 데이터 우선 확인 (sheet.html 계산값)
    try {
        const syncData = JSON.parse(localStorage.getItem('sejong_ledger_sync') || '{}');
        const syncKey = `${memberId}_${year}_${month}_${courseFilter || 'all'}`;
        if (syncData[syncKey]) {
            return { eighthDay: syncData[syncKey], eighthMonth: month, isSimulated: false, hasAnyAttendance: true };
        }
    } catch { }

    if (!attendanceByMember) return { eighthDay: null, eighthMonth: month, isSimulated: false, hasAnyAttendance: false };

    let rollingTotal = 0;
    let eighthDay = null;
    let isSimulated = false;
    let hasAnyAttendance = false;
    let lastRecordDate = null;
    const incAmount = (courseFilter && courseFilter.includes('제과제빵')) ? 0.5 : 1.0;

    const getCycle = (val) => {
        let vRaw = Math.round(val * 10);
        if (vRaw < 90) return 0;
        return Math.floor((vRaw - 90) / 80) + 1;
    };

    let memberRecords = (attendanceByMember[memberId] || []).sort((a, b) => a.dateObj - b.dateObj);

    // 시작 월 찾기
    let earliestYear = year;
    let earliestMonth = month;
    if (memberRecords.length > 0) {
        const firstLogYear = memberRecords[0].yearNum;
        const firstLogMonth = memberRecords[0].monthNum;
        if (firstLogYear < earliestYear || (firstLogYear === earliestYear && firstLogMonth < earliestMonth)) {
            earliestYear = firstLogYear;
            earliestMonth = firstLogMonth;
        }
    }

    // 월별 선행 계산 (타겟 월 이전까지)
    let iterYear = earliestYear;
    let iterMonth = earliestMonth;
    while (true) {
        const monthKey = `${iterYear}-${String(iterMonth).padStart(2, '0')}`;
        const adj = GLOBAL_DATA_ADJUSTMENTS[String(memberId)]?.[monthKey];
        if (adj && adj.carryOverride !== undefined) {
            rollingTotal = adj.carryOverride;
        }

        if (iterYear === year && iterMonth === month) break;

        const mLogs = memberRecords.filter(r => r.yearNum === iterYear && r.monthNum === iterMonth);
        const currentTargetCourse = courseFilter ? courseFilter.replace(/\([^)]*\)/g, '').trim() : null;

        for (const r of mLogs) {
            if (currentTargetCourse) {
                if (!r.course) continue;
                const rClean = r.course.replace(/\([^)]*\)/g, '').trim();
                if (rClean !== currentTargetCourse) continue;
            }
            const isMarker = ['[', ']'].includes(r.status);
            const isNumericPresent = ['10', '12', '2', '5', '7', '3', '9'].includes(r.status);
            const isAbsent = r.status === 'absent' || (typeof r.status === 'string' && r.status.startsWith('X'));
            const isRegular = r.status === 'present' || isNumericPresent || isAbsent;
            if (isMarker || isRegular) {
                rollingTotal += incAmount;
                lastRecordDate = r.dateObj;
                hasAnyAttendance = true;
            }
        }
        iterMonth++;
        if (iterMonth > 12) { iterMonth = 1; iterYear++; }
    }

    // 현재 타겟 월 처리
    const mLogsCurrent = memberRecords.filter(r => r.yearNum === year && r.monthNum === month);
    const currentTargetCourseCurrent = courseFilter ? courseFilter.replace(/\([^)]*\)/g, '').trim() : null;

    for (const r of mLogsCurrent) {
        if (currentTargetCourseCurrent) {
            if (!r.course) continue;
            const rClean = r.course.replace(/\([^)]*\)/g, '').trim();
            if (rClean !== currentTargetCourseCurrent) continue;
        }
        const isMarker = ['[', ']'].includes(r.status);
        const isNumericPresent = ['10', '12', '2', '5', '7', '3', '9'].includes(r.status);
        const isAbsent = r.status === 'absent' || (typeof r.status === 'string' && r.status.startsWith('X'));
        const isRegular = r.status === 'present' || isNumericPresent || isAbsent;

        if (isMarker || isRegular) {
            const prevRolling = rollingTotal;
            rollingTotal += incAmount;
            lastRecordDate = r.dateObj;
            hasAnyAttendance = true;
            if (getCycle(Math.round(rollingTotal * 10) / 10) > getCycle(Math.round(prevRolling * 10) / 10) || r.status === '9' || r.status === 9) {
                eighthDay = r.dateObj.getDate();
            }
        }
    }

    // 시뮬레이션
    if (!eighthDay && hasAnyAttendance) {
        let lastLog = null;
        for (let i = memberRecords.length - 1; i >= 0; i--) {
            const r = memberRecords[i];
            if (courseFilter) {
                if (!r.course) continue;
                if (r.course.replace(/\([^)]*\)/g, '').trim() !== courseFilter.replace(/\([^)]*\)/g, '').trim()) continue;
            }
            lastLog = r; break;
        }
        if (lastLog) {
            const mDiff = (year - lastLog.yearNum) * 12 + (month - lastLog.monthNum);
            // [사용자 요청] 수강 기록 마지막 달로부터 최대 1달 후(5월)까지만 예정일 표시
            if (mDiff > 1) return { eighthDay: null, eighthMonth: month, isSimulated: false, hasAnyAttendance };
        }

        const limitDate = new Date(year, month + 1, 0);
        let simDate = new Date(year, month - 1, 1);
        if (lastLog && lastLog.dateObj > simDate) {
            simDate = new Date(lastLog.dateObj.getTime() + 86400000);
        }

        let simRolling = rollingTotal;
        while (simDate <= limitDate) {
            const dateStr = simDate.toISOString().split('T')[0];
            const isHoliday = holidaysData.some(h => h.date === dateStr) || !!KOREAN_HOLIDAYS_MAP[dateStr];
            const dayOfWeek = simDate.getDay();
            let isValidDay = false;
            if (courseFilter) {
                const cleanFilter = courseFilter.replace(/\([^)]*\)/g, '').trim();
                const schedule = COURSE_SCHEDULES[cleanFilter];
                if (schedule) { if (schedule.includes(dayOfWeek)) isValidDay = true; }
                else if (dayOfWeek !== 0) isValidDay = true;
            } else if (dayOfWeek !== 0) isValidDay = true;

            if (isValidDay && !isHoliday) {
                const prevSim = simRolling;
                simRolling += incAmount;
                if (getCycle(Math.round(simRolling * 10) / 10) > getCycle(Math.round(prevSim * 10) / 10)) {
                    if (simDate.getFullYear() === year && (simDate.getMonth() + 1) === month) {
                        eighthDay = simDate.getDate();
                        isSimulated = true;
                        break;
                    }
                }
            }
            simDate.setDate(simDate.getDate() + 1);
        }
    }

    return { eighthDay, eighthMonth: month, isSimulated, hasAnyAttendance };
}

function getAllLedgerMonthStats(memberId, year, month) {
    const member = membersData.find(m => String(m.id) === String(memberId));
    if (!member || !member.course) return [];

    const courses = member.course.split(',').map(c => c.split('(')[0].trim());
    const results = [];

    courses.forEach(courseName => {
        const stats = getLedgerMonthStats(memberId, year, month, courseName);
        if (stats.eighthDay && stats.hasAnyAttendance) {
            results.push({
                course: courseName,
                eighthDay: stats.eighthDay,
                eighthMonth: stats.eighthMonth,
                isSimulated: stats.isSimulated,
                fee: courseFees[courseName] || courseFees['all'] || 0
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
        sessionStorage.setItem('sejong_ledger_currentYear', currentYear);
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

    const topRow = document.createElement('div');
    topRow.style.cssText = `display: flex; gap: 8px; overflow-x: auto; padding: 5px 0;`;
    ['전체', ...Object.keys(COURSE_CATEGORIES)].forEach(cat => {
        const btn = document.createElement('button');
        btn.textContent = cat;
        const isActive = activeCategory === cat;
        btn.style.cssText = `padding: 8px 20px; border-radius: 6px; border: none; cursor: pointer; font-weight: 800; font-size: 0.95rem; background: ${isActive ? '#2563eb' : '#fff'}; color: ${isActive ? '#fff' : '#1e293b'}; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border: 1.5px solid ${isActive ? '#2563eb' : '#cbd5e1'}; white-space: nowrap; transition: all 0.2s;`;
        btn.onclick = () => { activeCategory = cat; renderLedger(); };
        topRow.appendChild(btn);
    });
    mainNavContainer.appendChild(topRow);

    const bottomRow = document.createElement('div');
    bottomRow.style.cssText = `display: flex; gap: 6px; overflow-x: auto; padding: 5px 0; border-top: 1px solid #e2e8f0; padding-top: 12px;`;
    ['전체', ...COURSE_LIST].forEach(course => {
        const btn = document.createElement('button');
        btn.textContent = course;
        const isActive = activeCategory === course;
        btn.style.cssText = `padding: 6px 12px; border-radius: 4px; border: none; cursor: pointer; font-weight: 700; font-size: 0.8rem; background: ${isActive ? '#475569' : '#f8fafc'}; color: ${isActive ? '#fff' : '#64748b'}; border: 1px solid ${isActive ? '#475569' : '#e2e8f0'}; white-space: nowrap; transition: all 0.2s;`;
        btn.onclick = () => { activeCategory = course; renderLedger(); };
        bottomRow.appendChild(btn);
    });
    mainNavContainer.appendChild(bottomRow);
    container.appendChild(mainNavContainer);

    const filterByPeriod = (members) => {
        if (!currentFilterDate) return members;
        let startM, startD, endM, endD;
        if (currentFilterDate.includes('~')) {
            const parts = currentFilterDate.split('~').map(s => s.trim());
            startM = parseInt(parts[0].split('-')[1], 10); startD = parseInt(parts[0].split('-')[2], 10);
            endM = parseInt(parts[1].split('-')[1], 10); endD = parseInt(parts[1].split('-')[2], 10);
        } else {
            startM = parseInt(currentFilterDate.split('-')[1], 10); startD = parseInt(currentFilterDate.split('-')[2], 10);
            endM = startM; endD = startD;
        }
        return members.filter(m => {
            for (let month = 1; month <= 12; month++) {
                const results = getAllLedgerMonthStats(m.id, currentYear, month);
                const hasMatch = results.some(s => {
                    const sMonth = s.eighthMonth || month;
                    const sVal = sMonth * 100 + s.eighthDay;
                    const startVal = startM * 100 + startD;
                    const endVal = endM * 100 + endD;
                    if (sVal >= startVal && sVal <= endVal) {
                        const isPaid = paymentsData.some(p => String(p.memberId) === String(m.id) && String(p.year) === String(currentYear) && String(p.month) === String(month) && p.status === 'paid' && (p.course.includes(s.course) || s.course.includes(p.course)));
                        return !isPaid;
                    }
                    return false;
                });
                if (hasMatch) return true;
            }
            return false;
        });
    };

    if (COURSE_LIST.includes(activeCategory)) {
        const cName = activeCategory;
        let filtered = membersData.filter(m => {
            if (cName === '기타') {
                if (!m.course) return true;
                const cList = m.course.split(',').map(c => c.trim());
                return !cList.some(c => COURSE_LIST.filter(cl => cl !== '기타').some(cl => c.includes(cl)));
            }
            return m.course && m.course.includes(cName);
        }).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        renderTable(container, cName, filterByPeriod(filtered), `course-${cName}`);
    } else if (activeCategory === '전체') {
        let all = membersData.filter(m => m.course).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        renderTable(container, "전체 수강생", filterByPeriod(all), 'unified-table');
        const others = membersData.filter(m => {
            if (!m.course) return true;
            const cList = m.course.split(',').map(c => c.trim());
            return !cList.some(c => COURSE_LIST.filter(cl => cl !== '기타').some(cl => c.includes(cl)));
        }).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        if (others.length > 0) renderTable(container, "기타 수강생", filterByPeriod(others), 'other-members-table', true);
    } else {
        COURSE_CATEGORIES[activeCategory].forEach(cName => {
            let filtered = membersData.filter(m => {
                if (cName === '기타') {
                    if (!m.course) return true;
                    const cList = m.course.split(',').map(c => c.trim());
                    return !cList.some(c => COURSE_LIST.filter(cl => cl !== '기타').some(cl => c.includes(cl)));
                }
                return m.course && m.course.includes(cName);
            }).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            const fList = filterByPeriod(filtered);
            if (fList.length > 0) renderTable(container, cName, fList, `course-${cName}`);
        });
    }
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
                <input type="text" id="dateFilter-${id}" value="${currentFilterDate}" placeholder="날짜 범위" style="padding: 3px 6px; border-radius: 4px; border: 1px solid #cbd5e1; font-weight: 700; font-size: 0.8rem; width: 180px;">
            </div>
        </div>
        <div style="overflow-x: auto; border: 1.5px solid #0f172a; border-radius: 4px; background: #fff;">
            <table style="width: 100%; border-collapse: collapse; min-width: 1000px; font-family: 'Noto Sans KR', sans-serif;">
                <thead>
                    <tr style="background: #f8fafc; border-bottom: 1.5px solid #0f172a;">
                        <th rowspan="2" style="width: 40px; border-right: 1.5px solid #0f172a; font-size: 0.75rem;">NO</th>
                        <th rowspan="2" style="width: 180px; border-right: 1.5px solid #0f172a; font-size: 0.75rem; text-align: left; padding: 10px;">회원정보 / 과정</th>
                        ${Array.from({ length: 12 }, (_, i) => `<th colspan="2" style="border-right: 1.5px solid #0f172a; border-bottom: 1px solid #cbd5e1; font-size: 0.8rem; padding: 5px;">${i + 1}월</th>`).join('')}
                    </tr>
                    <tr style="background: #f8fafc; border-bottom: 1.5px solid #0f172a;">
                        ${Array.from({ length: 12 }, () => `<th style="width: 45px; font-size: 0.65rem; border-right: 1px dotted #cbd5e1;">예</th><th style="width: 45px; font-size: 0.65rem; border-right: 1.5px solid #0f172a;">실</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
    `;
    members.forEach((m, idx) => {
        const isTarget = window.targetMemberId && String(m.id) === String(window.targetMemberId);
        html += `<tr style="border-bottom: 1px solid #0f172a; ${isTarget ? 'background: #fffbeb;' : ''}">
            <td style="text-align: center; font-weight: 700; border-right: 1.5px solid #0f172a;">${idx + 1}</td>
            <td style="padding: 8px 10px; border-right: 1.5px solid #0f172a;">
                <div style="font-weight: 900; font-size: 0.9rem;">${m.name}</div>
                <div style="font-size: 0.7rem; color: #64748b;">${m.phone || ''}</div>
                <div style="font-size: 0.7rem; color: #2563eb; font-weight: 700; margin-top: 2px;">${m.course || ''}</div>
            </td>`;
        for (let mon = 1; mon <= 12; mon++) {
            const scheds = getAllLedgerMonthStats(m.id, currentYear, mon);
            const paid = paymentsData.filter(p => String(p.memberId) === String(m.id) && String(p.year) === String(currentYear) && String(p.month) === String(mon) && p.status === 'paid');
            let exHTML = scheds.map(s => `<div style="font-size: 0.65rem; color: ${s.isSimulated ? '#a855f7' : '#d946ef'}; font-weight: 800; text-align:center; margin-bottom:4px;">${s.eighthDay}일<br/>${s.fee / 10000}만<br/><span style="font-size:0.55rem; color:#64748b;">${s.course || ''}</span></div>`).join('');
            let acHTML = paid.map(p => `<div style="font-size: 0.65rem; font-weight: 900; text-align:center; margin-bottom:4px;">${new Date(p.updatedAt).getDate()}일<br/><span style="color:#059669;">${p.amount / 10000}만</span></div>`).join('');
            html += `<td style="border-right: 1px dotted #cbd5e1; padding: 4px;">${exHTML}</td><td style="border-right: 1.5px solid #0f172a; padding: 4px;">${acHTML}</td>`;
        }
        html += `</tr>`;
    });
    html += `</tbody></table></div>`;
    section.innerHTML = html;
    container.appendChild(section);
    if (typeof flatpickr !== 'undefined') flatpickr(`#dateFilter-${id}`, { mode: "range", locale: "ko", dateFormat: "Y-m-d", onClose: (sd, ds) => { currentFilterDate = ds; renderLedger(); } });
}

window.addEventListener('storage', (e) => { if (e.key === 'sejong_ledger_sync') loadData(window.targetMemberId, currentYear); });
