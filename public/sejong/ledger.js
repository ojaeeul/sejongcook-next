
let membersData = [];
let paymentsData = [];
let attendanceData = [];
let courseFees = {};
const API_BASE = '/api/sejong';
const DEFAULT_PRICE = 200000;

let attendanceByMember = {}; // Optimized lookup
window.targetMemberId = null;

let currentYear = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get('memberId');
    const targetYear = params.get('year') || new Date().getFullYear();
    currentYear = parseInt(targetYear);

    if (typeof initializeYearSelect === 'function') {
        initializeYearSelect(targetYear);
    }

    loadData(targetId, targetYear);
});

async function loadData(targetId, targetYear) {
    const container = document.getElementById('ledgerTablesContainer');
    if (container) container.innerHTML = '<div style="padding:20px; text-align:center;">데이터를 불러오고 있습니다...</div>';

    try {
        const cacheBuster = `?t=${Date.now()}`;
        const [mRes, pRes, aRes, sRes] = await Promise.all([
            fetch(`${API_BASE}/members${cacheBuster}`),
            fetch(`${API_BASE}/payments${cacheBuster}`),
            fetch(`${API_BASE}/attendance${cacheBuster}`),
            fetch(`${API_BASE}/settings${cacheBuster}`)
        ]);

        if (!mRes.ok || !pRes.ok || !aRes.ok || !sRes.ok) {
            throw new Error('Failed to fetch data');
        }

        const rawMembers = await mRes.json();
        membersData = Array.isArray(rawMembers) ? rawMembers.filter(m => !['delete', 'trash', 'hold', 'completed'].includes(m.status)) : [];

        paymentsData = await pRes.json();
        attendanceData = await aRes.json();
        const settings = await sRes.json();
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

function getLedgerMonthStats(memberId, year, month, courseFilter = null) {
    const memberRecords = attendanceByMember[memberId] || [];
    let eighthDay = null;
    let isSimulated = false;
    let rollingTotal = 0;

    const incAmount = (courseFilter && courseFilter.includes('제과제빵')) ? 0.5 : 1.0;
    let lastRecordDate = null;
    let hitTargetInMonth = false;

    for (const r of memberRecords) {
        if (courseFilter) {
            if (!r.course) continue;
            const rCourse = r.course.split('(')[0].trim();
            const fCourse = courseFilter.split('(')[0].trim();
            if (rCourse !== fCourse) continue;
        }

        if (r.yearNum < year || (r.yearNum === year && r.monthNum < month)) {
            // Count past months
            const isMarker = ['[', ']'].includes(r.status);
            const isNumericPresent = ['10', '12', '2', '5', '7'].includes(r.status);
            const isAbsent = r.status === 'absent' || (typeof r.status === 'string' && r.status.startsWith('X'));
            const isRegular = r.status === 'present' || r.status === 'extension' || isNumericPresent || isAbsent;
            if (isMarker || isRegular) {
                rollingTotal += incAmount;
                lastRecordDate = r.dateObj;
            }
        } else if (r.yearNum === year && r.monthNum === month) {
            // Count current month
            const isMarker = ['[', ']'].includes(r.status);
            const isNumericPresent = ['10', '12', '2', '5', '7'].includes(r.status);
            const isAbsent = r.status === 'absent' || (typeof r.status === 'string' && r.status.startsWith('X'));
            const isRegular = r.status === 'present' || r.status === 'extension' || isNumericPresent || isAbsent;

            const prevRolling = rollingTotal;
            if (isMarker || isRegular) {
                rollingTotal += incAmount;
                lastRecordDate = r.dateObj;
                if (Math.floor((prevRolling - 0.001) / 8) < Math.floor((rollingTotal - 0.001) / 8)) {
                    eighthDay = r.dateObj.getDate();
                    hitTargetInMonth = true;
                }
            }
        }
    }

    // --- Simulation Logic ---
    const now = new Date();
    // Simulate from the 1st of the PREVIOUS month to ensure last month's scheduled payments don't disappear
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    let eighthMonth = month;

    if (!hitTargetInMonth) {
        let simDate = new Date(firstDayOfLastMonth.getTime());
        if (lastRecordDate && lastRecordDate > firstDayOfLastMonth) {
            simDate = new Date(lastRecordDate.getTime() + (24 * 60 * 60 * 1000));
        } else if (!lastRecordDate) {
            simDate = new Date(firstDayOfLastMonth.getTime());
        }

        const limitDate = new Date(now.getFullYear(), now.getMonth() + 2, 0); // Last day of next month
        let simRolling = rollingTotal;
        let foundSimulatedDay = null;

        while (simDate <= limitDate) {
            const dayOfWeek = simDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                const prevSim = simRolling;
                simRolling += incAmount;

                if (Math.floor((prevSim - 0.001) / 8) < Math.floor((simRolling - 0.001) / 8)) {
                    if (simDate.getFullYear() === year && (simDate.getMonth() + 1) === month) {
                        foundSimulatedDay = simDate.getDate();
                        eighthMonth = simDate.getMonth() + 1;
                        break;
                    }
                }
            }
            simDate.setDate(simDate.getDate() + 1);
        }

        if (foundSimulatedDay) {
            eighthDay = foundSimulatedDay;
            isSimulated = true;
        }
    }

    return { eighthDay, eighthMonth, isSimulated };
}

function getAllLedgerMonthStats(memberId, year, month) {
    const member = membersData.find(m => String(m.id) === String(memberId));
    if (!member || !member.course) return [];

    const courses = member.course.split(',').map(c => c.split('(')[0].trim());
    const results = [];

    courses.forEach(courseName => {
        const stats = getLedgerMonthStats(memberId, year, month, courseName);
        if (stats.eighthDay) {
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
    const endYear = 2030;
    for (let y = startYear; y <= endYear; y++) {
        const opt = document.createElement('option');
        opt.value = y; opt.textContent = `${y}년`;
        if (y === currentYear) opt.selected = true;
        select.appendChild(opt);
    }
    select.onchange = (e) => {
        currentYear = parseInt(e.target.value);
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

    COURSE_LIST.forEach(course => {
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

    mainNavContainer.appendChild(topRow);
    mainNavContainer.appendChild(bottomRow);
    container.appendChild(mainNavContainer);

    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

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

function renderTable(container, title, members, id, isOther = false) {
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
            <td style="padding: 8px 10px; border-right: 1.5px solid #0f172a;">
                <div style="font-weight: 900; font-size: 0.9rem;">${m.name}</div>
                <div style="font-size: 0.7rem; color: #64748b;">${m.phone || ''}</div>
                <div style="font-size: 0.7rem; color: #2563eb; font-weight: 700; margin-top: 2px;">${m.course || ''}</div>
            </td>`;

        for (let month = 1; month <= 12; month++) {
            let schedules = getAllLedgerMonthStats(m.id, currentYear, month);

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

            let expectedHTML = schedules.map(s => {
                const dayText = `${s.eighthDay}일`;
                const color = s.isSimulated ? '#a855f7' : '#d946ef';
                return `
                <div style="font-size: 0.65rem; color: ${color}; font-weight: 800; display: flex; flex-direction: column; gap: 2px;">
                    <div>${dayText}</div>
                    <div style="font-size: 0.6rem;">${s.fee / 10000}만</div>
                    <div style="font-size: 0.55rem; color: #64748b; font-weight: 600; line-height: 1;">${s.course}</div>
                </div>
            `}).join('');

            let actualHTML = paid.map(p => `
                <div style="font-size: 0.65rem; font-weight: 900;">${new Date(p.updatedAt).getDate()}일 ${p.amount / 10000}만</div>
            `).join('');

            html += `<td style="text-align: center; border-right: 1px dotted #cbd5e1; padding: 4px;">${expectedHTML}</td>
                     <td style="text-align: center; border-right: 1.5px solid #0f172a; padding: 4px;">${actualHTML}</td>`;
        }
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
            onChange: function (selectedDates, dateStr, instance) {
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
