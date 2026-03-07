const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:8000/api' : '/api/sejong';

let allMembers = [];
let paymentsData = [];
let attendanceData = [];
let holidaysData = [];
let attendanceByMember = {};

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

const KOREAN_HOLIDAYS_MAP = {
    "2025-01-01": "신정", "2025-01-28": "설날 연휴", "2025-01-29": "설날", "2025-01-30": "설날 연휴",
    "2025-03-01": "삼일절",
    "2025-05-05": "어린이날", "2025-05-07": "부처님오신날",
    "2025-06-06": "현충일", "2025-08-15": "광복절",
    "2025-10-03": "개천절", "2025-10-05": "추석 연휴", "2025-10-06": "추석", "2025-10-07": "추석 연휴", "2025-10-09": "한글날",
    "2025-12-25": "성탄절",
    "2026-01-01": "신정", "2026-02-16": "설날 연휴", "2026-02-17": "설날", "2026-02-18": "설날 연휴",
    "2026-03-01": "삼일절",
    "2026-05-05": "어린이날", "2026-05-24": "부처님오신날",
    "2026-06-06": "현충일", "2026-08-15": "광복절",
    "2026-09-24": "추석 연휴", "2026-09-25": "추석", "2026-09-26": "추석 연휴",
    "2026-10-03": "개천절", "2026-10-09": "한글날",
    "2026-12-25": "성탄절",
    "2027-01-01": "신정", "2027-02-06": "설날 연휴", "2027-02-07": "설날", "2027-02-08": "설날 연휴",
    "2027-03-01": "삼일절", "2027-05-05": "어린이날", "2027-05-13": "부처님오신날",
    "2027-06-06": "현충일", "2027-08-15": "광복절",
    "2027-09-14": "추석 연휴", "2027-09-15": "추석", "2027-09-16": "추석 연휴",
    "2027-10-03": "개천절", "2027-10-09": "한글날",
    "2027-12-25": "성탄절"
};
let storedTargets = localStorage.getItem('sejongSmsSelectedTargets');
let selectedTargets = storedTargets ? JSON.parse(storedTargets) : []; // Array of member objects
let currentMsgType = 'SMS';
let editingTemplateIndex = -1;
let isAddingNewTemplate = false;
let lastGeneratedPreviews = []; // Store for full preview modal
let smsHistory = JSON.parse(localStorage.getItem('sejongSmsHistory') || '[]');

let defaultTemplates = [
    { text: '반갑습니다.', type: 'SMS' },
    { text: '[세종요리제과학원] 안녕하세요! %%% 학생 오늘 수업 안내드립니다.', type: 'SMS' },
    { text: '[세종요리제과학원] 안녕하세요! %%% 학생, 이번 주 수업 일정 및 학원 안내입니다. 항상 저희 학원을 이용해 주셔서 진심으로 감사드리며 편안한 하루 되시길 바랍니다.', type: 'LMS' }
];

let storedTemplates = localStorage.getItem('sejongSmsTemplates');
let parsed = storedTemplates ? JSON.parse(storedTemplates) : defaultTemplates;

// Convert any legacy string templates into objects
let myTemplates = parsed.map(t => {
    if (typeof t === 'string') {
        let bytes = 0;
        for (let j = 0; j < t.length; j++) bytes += t.charCodeAt(j) > 128 ? 2 : 1;
        return { text: t, type: bytes > 90 ? 'LMS' : 'SMS' };
    }
    return t;
});
localStorage.setItem('sejongSmsTemplates', JSON.stringify(myTemplates));

document.addEventListener('DOMContentLoaded', () => {
    // Restore settings will happen in restoreAllDrafts below
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    document.getElementById('currentDateHeader').textContent = todayStr;

    // Default dates (will be overridden if saved data exists)
    document.getElementById('paymentRangeStart').value = todayStr;
    let daysUntilNextSat = 6 - today.getDay();
    if (daysUntilNextSat < 0) daysUntilNextSat += 7;
    const nextSat = new Date(today);
    nextSat.setDate(today.getDate() + daysUntilNextSat + 7);
    document.getElementById('paymentRangeEnd').value = nextSat.toISOString().split('T')[0];

    // Default settings for first load
    const pf = document.getElementById('usePaymentFilter');
    if (pf) pf.checked = false;
    const ii = document.getElementById('includeInactive');
    if (ii) ii.checked = true; // Show all by default

    fetchAllData();
    renderTemplates();
    filterTemplates();

    // Default: uncheck payment filter to show all students on load
    if (pf) pf.checked = false;

    // Event listeners
    document.querySelectorAll('input[name="targetType"]').forEach(radio => {
        radio.addEventListener('change', () => {
            syncSelectedPhones();
            saveAllDrafts();
            renderTargetList();
        });
    });
    document.getElementById('includeInactive').addEventListener('change', () => {
        saveAllDrafts();
        renderTargetList();
    });
    document.getElementById('usePaymentFilter').addEventListener('change', () => {
        saveAllDrafts();
        renderTargetList();
    });

    restoreAllDrafts();
});

function saveAllDrafts() {
    // 1. Core Settings
    const type = document.querySelector('input[name="targetType"]:checked')?.value || 'parent';
    const inactive = document.getElementById('includeInactive').checked;
    localStorage.setItem('sejongSmsTargetType', type);
    localStorage.setItem('sejongSmsIncludeInactive', inactive);

    // 2. Draft Message & Footer
    const message = document.getElementById('messageInput').value;
    const footer = document.getElementById('footerInput').value;
    const useFooter = document.getElementById('useFooter').checked;
    localStorage.setItem('sejongSmsDraftMessage', message);
    localStorage.setItem('sejongSmsDraftFooter', footer);
    localStorage.setItem('sejongSmsUseFooter', useFooter);

    // 3. Filters
    const rangeStart = document.getElementById('paymentRangeStart').value;
    const rangeEnd = document.getElementById('paymentRangeEnd').value;
    const useFilter = document.getElementById('usePaymentFilter').checked;
    localStorage.setItem('sejongSmsRangeStart', rangeStart);
    localStorage.setItem('sejongSmsRangeEnd', rangeEnd);
    localStorage.setItem('sejongSmsUseFilter', useFilter);

    // 4. Search State
    const searchVal = document.getElementById('memberSearchInputSide')?.value || '';
    localStorage.setItem('sejongSmsSearchValue', searchVal);
}

function restoreAllDrafts() {
    // Restore Core Settings
    const savedType = localStorage.getItem('sejongSmsTargetType');
    if (savedType) {
        const radio = document.querySelector(`input[name="targetType"][value="${savedType}"]`);
        if (radio) radio.checked = true;
    }
    const savedInactive = localStorage.getItem('sejongSmsIncludeInactive');
    if (savedInactive !== null) {
        document.getElementById('includeInactive').checked = savedInactive === 'true';
    }

    // Restore Drafts
    const draftMsg = localStorage.getItem('sejongSmsDraftMessage');
    if (draftMsg !== null) document.getElementById('messageInput').value = draftMsg;

    const draftFooter = localStorage.getItem('sejongSmsDraftFooter');
    if (draftFooter !== null) document.getElementById('footerInput').value = draftFooter;

    const useFooter = localStorage.getItem('sejongSmsUseFooter');
    if (useFooter !== null) {
        document.getElementById('useFooter').checked = (useFooter === 'true');
        document.getElementById('noFooter').checked = (useFooter !== 'true');
    }

    // Restore Filters
    const rStart = localStorage.getItem('sejongSmsRangeStart');
    const rEnd = localStorage.getItem('sejongSmsRangeEnd');
    const uFilter = localStorage.getItem('sejongSmsUseFilter');
    if (rStart) document.getElementById('paymentRangeStart').value = rStart;
    if (rEnd) document.getElementById('paymentRangeEnd').value = rEnd;
    if (uFilter !== null) document.getElementById('usePaymentFilter').checked = (uFilter === 'true');

    // Restore Search
    const savedSearch = localStorage.getItem('sejongSmsSearchValue');
    if (savedSearch !== null && document.getElementById('memberSearchInputSide')) {
        document.getElementById('memberSearchInputSide').value = savedSearch;
    }

    updateMockup();
}

// Custom Modal Helpers
function openModal(title, bodyHTML, onConfirm = null, confirmBtnText = '확인', confirmBtnColor = '#3b82f6') {
    const modalTitle = document.getElementById('smsModalTitle');
    const modalBody = document.getElementById('smsModalBody');
    const modal = document.getElementById('smsModal');
    let confirmBtn = document.querySelector('.modal-btn-confirm');
    let cancelBtn = document.querySelector('.modal-btn-cancel');

    if (!modal) return;

    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHTML;

    // Reset event listeners by cloning
    const newConfirmBtn = confirmBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    const closeFn = () => { modal.style.display = 'none'; };

    if (onConfirm) {
        newConfirmBtn.style.display = 'block';
        newConfirmBtn.textContent = confirmBtnText;
        newConfirmBtn.style.background = confirmBtnColor;
        newConfirmBtn.onclick = () => { closeFn(); onConfirm(); };

        newCancelBtn.textContent = '취소';
        newCancelBtn.style.background = '#e2e8f0';
        newCancelBtn.style.color = '#475569';
        newCancelBtn.onclick = closeFn;
    } else {
        newConfirmBtn.style.display = 'none';
        newCancelBtn.textContent = '확인';
        newCancelBtn.style.background = '#3b82f6';
        newCancelBtn.style.color = 'white';
        newCancelBtn.onclick = closeFn;
    }

    modal.style.display = 'flex';
}

function showModalAlert(msg, isError = false) {
    const title = isError ? '오류' : '알림';
    const content = isError
        ? `<div style="text-align:center; padding: 30px 0; font-size:1.1rem; color:#ef4444; font-weight:700; display:flex; flex-direction:column; align-items:center; gap:10px;"><i class="material-icons" style="font-size:3rem;">error_outline</i>${msg}</div>`
        : `<div style="text-align:center; padding: 30px 0; font-size:1.05rem; color:#334155;">${msg}</div>`;
    openModal(title, content, null);
}

function showModalConfirm(msg, onConfirm) {
    const content = `<div style="text-align:center; padding: 30px 0; font-size:1.1rem; color:#334155; font-weight:500;">${msg}</div>`;
    openModal('확인', content, onConfirm);
}

async function fetchAllData() {
    try {
        const cacheBuster = `?t=${Date.now()}`;
        const fetchWithErrorHandling = async (url) => {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
            return res.json();
        };

        const results = await Promise.allSettled([
            fetchWithErrorHandling(`${API_BASE}/members${cacheBuster}`),
            fetchWithErrorHandling(`${API_BASE}/payments${cacheBuster}`),
            fetchWithErrorHandling(`${API_BASE}/attendance${cacheBuster}`),
            fetchWithErrorHandling(`${API_BASE}/holidays${cacheBuster}`),
            fetchWithErrorHandling(`${API_BASE}/timetable${cacheBuster}`),
            fetchWithErrorHandling(`${API_BASE}/settings${cacheBuster}`)
        ]);

        if (results[0].status === 'fulfilled') allMembers = results[0].value;
        if (results[1].status === 'fulfilled') paymentsData = results[1].value;
        if (results[2].status === 'fulfilled') attendanceData = results[2].value;
        if (results[3].status === 'fulfilled') holidaysData = results[3].value;

        if (results[4].status === 'fulfilled' && results[4].value) {
            COURSE_SCHEDULES = { ...COURSE_SCHEDULES, ...results[4].value };
        }

        // Settings handling
        if (results[5].status === 'fulfilled') {
            const rawSettings = results[5].value;
            const settings = Array.isArray(rawSettings) ? rawSettings[0] : rawSettings;
            // potential future settings use
        }

        processAttendanceData();
        processCourses();
        renderTargetList();
        updateSelectedTags();
    } catch (err) {
        console.error('Failed to fetch data for SMS:', err);
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

function getMemberScheduledDate(memberId, courseFilter) {
    const today = new Date();

    // [수정] 기 기록된 출석은 요일에 관계없이 모두 인정합니다. (시뮬레이션 시에만 요일 체크)
    let memberRecords = (attendanceByMember[memberId] || []).filter(r => true).sort((a, b) => a.dateObj - b.dateObj);

    let rollingTotal = 0;
    let lastRecordDate = null;
    let allMilestones = [];
    let hasAnyAttendance = false;

    const getCycle = (val) => {
        let vRaw = Math.round(val * 10);
        if (vRaw < 90) return 0;
        return Math.floor((vRaw - 90) / 80) + 1;
    };

    // [1] Check Sync Data
    try {
        const syncData = JSON.parse(localStorage.getItem('sejong_ledger_sync') || '{}');
        for (let mOffset = -6; mOffset <= 6; mOffset++) {
            const d = new Date(today.getFullYear(), today.getMonth() + mOffset, 1);
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            const syncKey = `${memberId}_${y}_${m}_${courseFilter || 'all'}`;
            if (syncData[syncKey]) {
                allMilestones.push({ year: y, month: m, day: syncData[syncKey] });
            }
        }
    } catch (e) { }

    for (const r of memberRecords) {
        if (courseFilter) {
            const rClean = (r.course || '').replace(/\([^)]*\)/g, '').trim();
            const fClean = courseFilter.replace(/\([^)]*\)/g, '').trim();
            if (rClean !== fClean) continue;
        }

        const inc = (r.course && r.course.includes('제과제빵')) ? 0.5 : 1.0;
        const isMarker = ['[', ']'].includes(r.status);
        const isNumericPresent = ['10', '12', '2', '5', '7', '3', '9'].includes(r.status);
        const isAbsent = r.status === 'absent' || (typeof r.status === 'string' && r.status.startsWith('X'));
        const isRegular = r.status === 'present' || isNumericPresent || isAbsent;

        if (isMarker || isRegular) {
            const prevCycle = getCycle(rollingTotal);
            rollingTotal += inc;
            const currCycle = getCycle(rollingTotal);
            if (currCycle > prevCycle || r.status === '9' || r.status === 9) {
                // [Sync Check] Priority to sheet.html's determined date
                try {
                    const syncData = JSON.parse(localStorage.getItem('sejong_ledger_sync') || '{}');
                    const syncKey = `${memberId}_${r.yearNum}_${r.monthNum}_${courseFilter || 'all'}`;
                    if (syncData[syncKey]) {
                        allMilestones.push({ year: r.yearNum, month: r.monthNum, day: syncData[syncKey] });
                    } else {
                        allMilestones.push({ year: r.yearNum, month: r.monthNum, day: r.dateObj.getDate() });
                    }
                } catch (e) {
                    allMilestones.push({ year: r.yearNum, month: r.monthNum, day: r.dateObj.getDate() });
                }
            }
            lastRecordDate = r.dateObj;
            hasAnyAttendance = true;
        }
    }

    // [Sync Check Part 2] Check for calculated but not yet reached months
    try {
        const syncData = JSON.parse(localStorage.getItem('sejong_ledger_sync') || '{}');
        for (let mOffset = 0; mOffset <= 2; mOffset++) {
            const d = new Date(today.getFullYear(), today.getMonth() + mOffset, 1);
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            const syncKey = `${memberId}_${y}_${m}_${courseFilter || 'all'}`;
            if (syncData[syncKey]) {
                const dayNum = syncData[syncKey];
                if (!allMilestones.some(ms => ms.year === y && ms.month === m)) {
                    allMilestones.push({ year: y, month: m, day: dayNum });
                }
            }
        }
    } catch (e) { }

    // Simulation like ledger.js
    if (hasAnyAttendance) {
        const firstDayOfSim = new Date(today.getFullYear(), today.getMonth() - 6, 1);
        let simDate = new Date(firstDayOfSim);
        if (lastRecordDate && lastRecordDate > firstDayOfSim) {
            simDate = new Date(lastRecordDate.getTime() + 86400000);
        }

        const limitDate = new Date(today.getFullYear(), today.getMonth() + 6, 0);
        let simRolling = rollingTotal;

        while (simDate <= limitDate) {
            const dayOfWeek = simDate.getDay();
            const y_sim = simDate.getFullYear();
            const m_sim = String(simDate.getMonth() + 1).padStart(2, '0');
            const d_sim = String(simDate.getDate()).padStart(2, '0');
            const dateStr = `${y_sim}-${m_sim}-${d_sim}`;
            const isHoliday = holidaysData.some(h => h.date === dateStr) || !!KOREAN_HOLIDAYS_MAP[dateStr];

            let isValidDay = false;
            if (courseFilter) {
                const cleanFilter = courseFilter.replace(/\([^)]*\)/g, '').trim();
                const schedule = COURSE_SCHEDULES[cleanFilter];
                if (schedule) {
                    if (schedule.includes(dayOfWeek)) isValidDay = true;
                } else {
                    if (dayOfWeek !== 0) isValidDay = true;
                }
            } else {
                if (dayOfWeek !== 0) isValidDay = true;
            }

            if (isValidDay && !isHoliday) {
                const prevSim = simRolling;
                const inc = (courseFilter && courseFilter.includes('제과제빵')) ? 0.5 : 1.0;
                simRolling += inc;
                if (getCycle(simRolling) > getCycle(prevSim)) {
                    allMilestones.push({ year: simDate.getFullYear(), month: simDate.getMonth() + 1, day: simDate.getDate() });
                    if (allMilestones.length > 10) break;
                }
            }
            simDate.setDate(simDate.getDate() + 1);
        }
    }

    if (allMilestones.length > 0) {
        allMilestones.sort((a, b) => new Date(a.year, a.month - 1, a.day) - new Date(b.year, b.month - 1, b.day));
        // For @@@, return the closest future (or current today) date
        const best = allMilestones.find(m => {
            const d = new Date(m.year, m.month - 1, m.day);
            return d >= today;
        });
        return best || allMilestones[allMilestones.length - 1];
    }
    return null;
}

function processCourses() {
    groupedCourses = { '미지정': [] };
    allMembers.forEach(m => {
        const rawCourse = (m.course || '').trim();
        if (rawCourse === '') {
            groupedCourses['미지정'].push(m);
        } else {
            // Split multiple courses and merge into subjects (strip times)
            rawCourse.split(',').forEach(c => {
                const trimmedC = c.trim();
                // Strip class times/times in parentheses like (19:00)
                const subjectName = trimmedC.replace(/\(\d{1,2}:\d{2}\)/g, '').trim() || '미지정';
                if (!groupedCourses[subjectName]) groupedCourses[subjectName] = [];
                // Prevent duplicate entries of the same student in the same merged group
                if (!groupedCourses[subjectName].some(em => em.id === m.id)) {
                    groupedCourses[subjectName].push(m);
                }
            });
        }
    });

    // Cleanup: Remove "미지정" group if it's empty
    if (groupedCourses['미지정'].length === 0) {
        delete groupedCourses['미지정'];
    }
}

let storedExpanded = localStorage.getItem('sejongSmsExpandedCourses');
let expandedCourses = new Set(storedExpanded ? JSON.parse(storedExpanded) : []);

function saveExpandedCourses() {
    localStorage.setItem('sejongSmsExpandedCourses', JSON.stringify(Array.from(expandedCourses)));
}

function saveSelectedTargets() {
    localStorage.setItem('sejongSmsSelectedTargets', JSON.stringify(selectedTargets));
}

function renderTargetList() {
    const includeInactive = document.getElementById('includeInactive').checked;
    const targetType = document.querySelector('input[name="targetType"]:checked').value;
    const usePaymentFilter = document.getElementById('usePaymentFilter').checked;
    const rangeStartVal = document.getElementById('paymentRangeStart').value;
    const rangeEndVal = document.getElementById('paymentRangeEnd').value;
    const searchVal = (document.getElementById('memberSearchInputSide') ? document.getElementById('memberSearchInputSide').value : '').toLowerCase();

    const rangeStart = rangeStartVal ? new Date(rangeStartVal + 'T00:00:00') : null;
    const rangeEnd = rangeEndVal ? new Date(rangeEndVal + 'T00:00:00') : null;

    const listDiv = document.getElementById('courseList');
    if (!listDiv) return;

    // Maintain old content if searching (optional, but here we rebuild)
    listDiv.innerHTML = '';

    saveAllDrafts(); // Save state (search, inactive toggle, etc)

    Object.keys(groupedCourses).sort().forEach(cName => {
        let membersInCourse = groupedCourses[cName];

        // 1. Filter active/inactive
        // If searching, we skip this early filter to look through everyone
        if (!includeInactive && !searchVal) {
            membersInCourse = membersInCourse.filter(m => m.status !== 'trash' && m.status !== 'delete');
        }

        // 2. Note: We NO LONGER filter by phone here, so students always show up.
        // We handle selection eligibility in the rendering loop.

        // 3. Filter by Payment Schedule (8th day) if enabled
        if (usePaymentFilter && rangeStart && rangeEnd) {
            membersInCourse = membersInCourse.filter(m => {
                const schedArr = getAllMilestonesForRange(m.id, cName === '미지정' ? null : cName, rangeStart, rangeEnd);
                return schedArr.length > 0;
            });
        }

        // 4. Search Filter
        if (searchVal) {
            membersInCourse = membersInCourse.filter(m => {
                const isInactive = m.status === 'trash' || m.status === 'delete';
                const statusTag = isInactive ? '휴원' : '재원';
                // Always search through both names and both potential phone numbers
                return m.name.toLowerCase().includes(searchVal) ||
                    (m.phone && m.phone.includes(searchVal)) ||
                    (m.phone_guardian && m.phone_guardian.includes(searchVal)) ||
                    cName.toLowerCase().includes(searchVal) ||
                    statusTag.includes(searchVal) ||
                    '수강생'.includes(searchVal) ||
                    '학부모'.includes(searchVal);
            });
        }

        if (membersInCourse.length === 0) return;

        const groupDiv = document.createElement('div');

        // Header
        const header = document.createElement('div');
        header.className = 'course-item';
        const isExpanded = expandedCourses.has(cName) || !!searchVal;
        const cleanCNameHeader = cName.replace(/\(\d{1,2}:\d{2}\)/, '').trim();
        header.innerHTML = `
            <span><i class="material-icons" style="font-size:1rem; vertical-align:middle; margin-right:5px; color:#cbd5e1;">folder</i> ${cleanCNameHeader} <span style="font-size:0.8rem; color:#94a3b8;">(${membersInCourse.length})</span></span>
            <i class="material-icons">${isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</i>
        `;

        // Member list
        const membersDiv = document.createElement('div');
        membersDiv.style.display = isExpanded ? 'block' : 'none';
        membersDiv.style.background = '#f8fafc';
        membersDiv.style.padding = '5px 0';

        membersInCourse.forEach(m => {
            const mDiv = document.createElement('div');
            mDiv.className = 'member-row';
            const phone = targetType === 'student' ? m.phone : m.phone_guardian;
            const hasPhone = !!(phone && phone.trim());

            mDiv.dataset.id = m.id;
            mDiv.dataset.phone = phone || '';

            mDiv.style.padding = '8px 20px 8px 40px';
            mDiv.style.fontSize = '0.9rem';
            mDiv.style.cursor = hasPhone ? 'pointer' : 'not-allowed';
            mDiv.style.display = 'flex';
            mDiv.style.justifyContent = 'space-between';
            mDiv.style.borderBottom = '1px solid #f1f5f9';
            if (!hasPhone) mDiv.style.opacity = '0.6';

            const isSelected = selectedTargets.some(t => String(t.id) === String(m.id));
            if (isSelected) mDiv.style.color = '#3b82f6';

            const isInactive = m.status === 'trash' || m.status === 'delete';
            const statusLabel = isInactive ? '<span style="color:#ef4444; font-size:0.75rem; margin-left:4px;">(휴원)</span>' : '';
            const typeLabel = targetType === 'student' ? '<span style="color:#94a3b8; font-size:0.7rem; margin-right:4px;">수강생:</span>' : '<span style="color:#94a3b8; font-size:0.7rem; margin-right:4px;">학부모:</span>';

            mDiv.innerHTML = `
                <span style="display:flex; align-items:center;">
                    <i class="material-icons" style="font-size:1rem; vertical-align:middle; margin-right:8px; color:${isSelected ? '#3b82f6' : '#cbd5e1'};">
                        ${isSelected ? 'check_circle' : (hasPhone ? 'radio_button_unchecked' : 'error_outline')}
                    </i>
                    <span style="font-weight:600;">${m.name}</span>
                    ${statusLabel}
                </span>
                <span style="font-size:0.8rem; color:${hasPhone ? '#64748b' : '#ef4444'};">
                    ${typeLabel}${hasPhone ? phone : '번호 없음'}
                </span>
            `;

            mDiv.onclick = (e) => {
                e.stopPropagation();
                if (!hasPhone) {
                    showModalAlert(`${m.name} 수강생의 ${targetType === 'student' ? '휴대폰' : '학부모'} 번호가 없습니다.`, true);
                    return;
                }
                toggleTarget(m, phone, cName);
            };
            membersDiv.appendChild(mDiv);
        });

        header.onclick = () => {
            const isHidden = membersDiv.style.display === 'none';
            membersDiv.style.display = isHidden ? 'block' : 'none';
            header.querySelector('i:last-child').textContent = isHidden ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
            if (isHidden) expandedCourses.add(cName);
            else expandedCourses.delete(cName);
            saveExpandedCourses();
        };

        groupDiv.appendChild(header);
        groupDiv.appendChild(membersDiv);
        listDiv.appendChild(groupDiv);
    });
}

function updateCheckmarks() {
    document.querySelectorAll('.member-row').forEach(mDiv => {
        const id = mDiv.dataset.id;
        const isSelected = selectedTargets.some(t => String(t.id) === id);

        mDiv.style.color = isSelected ? '#3b82f6' : '';
        const iTag = mDiv.querySelector('i');
        if (iTag) {
            iTag.style.color = isSelected ? '#3b82f6' : '#cbd5e1';
            iTag.textContent = isSelected ? 'check_circle' : 'radio_button_unchecked';
        }
    });
}

function toggleTarget(member, phone, courseName) {
    if (!phone) {
        showModalAlert('전화번호가 없습니다.', true);
        return;
    }

    const index = selectedTargets.findIndex(t => String(t.id) === String(member.id));
    if (index > -1) {
        // Find current member to see if phone matches
        const activeTarget = selectedTargets[index];
        // If the number being clicked is the same as already selected, turn it off.
        if (activeTarget.phone === phone) {
            selectedTargets.splice(index, 1);
        } else {
            // If phone type was changed (e.g. was Parent, now clicking Trainee), update it.
            selectedTargets[index].phone = phone;
            selectedTargets[index].selectedCourse = courseName;
        }
    } else {
        selectedTargets.push({ ...member, phone: phone, selectedCourse: courseName });
    }

    updateCheckmarks();
    updateSelectedTags();
    saveSelectedTargets();
}

/**
 * Synchronizes all selected targets' phone numbers when the global targetType changes.
 * It looks up the original member data from allMembers to ensure accuracy.
 */
function syncSelectedPhones() {
    const targetType = document.querySelector('input[name="targetType"]:checked')?.value || 'student';

    selectedTargets = selectedTargets.map(t => {
        // Find the full member data to get both original phone numbers
        const original = allMembers.find(m => String(m.id) === String(t.id));
        if (original) {
            const newPhone = targetType === 'student' ? original.phone : original.phone_guardian;
            if (newPhone && newPhone.trim()) {
                return { ...t, phone: newPhone };
            }
        }
        return t;
    });

    updateSelectedTags();
    saveSelectedTargets();
}

function updateSelectedTags() {
    const tagsDiv = document.getElementById('targetTags');
    const countSpan = document.getElementById('targetCount');

    tagsDiv.innerHTML = '';
    countSpan.textContent = `${selectedTargets.length}명 / 발송예정 건수: ${selectedTargets.length}`;

    selectedTargets.forEach((t, index) => {
        const tag = document.createElement('div');
        tag.className = 'target-tag';
        tag.style.background = '#eff6ff';
        tag.style.color = '#3b82f6';
        tag.style.borderColor = '#93c5fd';
        tag.style.display = 'inline-flex';
        tag.style.alignItems = 'center';

        // Strip study time from course name
        const cleanCourse = (t.selectedCourse || '').replace(/\(\d{1,2}:\d{2}\)/, '').trim();

        // Get payment date
        let datePart = '';
        const usePaymentFilter = document.getElementById('usePaymentFilter') ? document.getElementById('usePaymentFilter').checked : false;
        const rangeStartVal = document.getElementById('paymentRangeStart') ? document.getElementById('paymentRangeStart').value : null;
        const rangeEndVal = document.getElementById('paymentRangeEnd') ? document.getElementById('paymentRangeEnd').value : null;
        const rangeStart = rangeStartVal ? new Date(rangeStartVal + 'T00:00:00') : null;
        const rangeEnd = rangeEndVal ? new Date(rangeEndVal + 'T00:00:00') : null;

        let sched = null;
        if (rangeStart && rangeEnd) {
            const milestones = getAllMilestonesForRange(t.id, t.selectedCourse === '미지정' ? null : t.selectedCourse, rangeStart, rangeEnd);
            if (milestones.length > 0) {
                sched = milestones[0];
            }
        }
        if (!sched) {
            sched = getMemberScheduledDate(t.id, t.selectedCourse === '미지정' ? null : t.selectedCourse);
        }

        if (sched) {
            const mm = String(sched.month).padStart(2, '0');
            const dd = String(sched.day).padStart(2, '0');
            datePart = `<span style="font-size:0.75rem; color:#2563eb; margin-left:6px; font-weight:700;">${mm}/${dd}</span>`;
        }

        tag.innerHTML = `
            <span style="font-weight:700;">${t.name}</span>
            <span style="font-size:0.65rem; color:#475569; margin-left:5px;">${cleanCourse}</span>
            ${datePart}
            <i class="material-icons" style="margin-left:4px; cursor:pointer; color:#94a3b8;" onclick="removeTarget(${index})">cancel</i>
        `;
        tagsDiv.appendChild(tag);
    });
}

function removeTarget(index) {
    selectedTargets.splice(index, 1);
    updateCheckmarks();
    updateSelectedTags();
    saveSelectedTargets();
}

/**
 * Resets all list filters (Search, Inactive, Payment) to show the full student list.
 * Triggered by clicking the 'Class List' (반목록) header.
 */
function resetFilters() {
    const pf = document.getElementById('usePaymentFilter');
    const ii = document.getElementById('includeInactive');
    const search = document.getElementById('memberSearchInputSide');

    if (pf) pf.checked = false;
    if (ii) ii.checked = true;
    if (search) search.value = '';

    renderTargetList();
    saveAllDrafts();
}

function selectAllCourses() {
    const includeInactive = document.getElementById('includeInactive').checked;
    const targetType = document.querySelector('input[name="targetType"]:checked').value;

    Object.keys(groupedCourses).forEach(cName => {
        let membersInCourse = groupedCourses[cName];
        if (!includeInactive) {
            membersInCourse = membersInCourse.filter(m => m.status !== 'trash' && m.status !== 'delete');
        }
        membersInCourse.forEach(m => {
            const phone = targetType === 'student' ? m.phone : m.phone_guardian;
            if (phone) {
                const alreadySelected = selectedTargets.some(t => String(t.id) === String(m.id) && t.phone === phone);
                if (!alreadySelected) {
                    selectedTargets.push({ ...m, phone: phone, selectedCourse: cName });
                }
            }
        });
    });

    updateCheckmarks();
    updateSelectedTags();
    saveSelectedTargets();
}

function selectFilteredCourses() {
    const includeInactive = document.getElementById('includeInactive').checked;
    const targetType = document.querySelector('input[name="targetType"]:checked').value;
    const rangeStartVal = document.getElementById('paymentRangeStart').value;
    const rangeEndVal = document.getElementById('paymentRangeEnd').value;
    const searchVal = (document.getElementById('memberSearchInputSide') ? document.getElementById('memberSearchInputSide').value : '').toLowerCase();

    const rangeStart = rangeStartVal ? new Date(rangeStartVal + 'T00:00:00') : null;
    const rangeEnd = rangeEndVal ? new Date(rangeEndVal + 'T00:00:00') : null;

    let totalSelectedNow = 0;
    selectedTargets = []; // Clear previous selections to strictly match the current filter


    Object.keys(groupedCourses).sort().forEach(cName => {
        let membersInCourse = groupedCourses[cName];

        // 1. Inactive Filter
        if (!includeInactive) {
            membersInCourse = membersInCourse.filter(m => m.status !== 'trash' && m.status !== 'delete');
        }

        // 2. Range Filter (Button always applies the range if one is selected)
        if (rangeStart && rangeEnd) {
            membersInCourse = membersInCourse.filter(m => {
                const schedArr = getAllMilestonesForRange(m.id, cName === '미지정' ? null : cName, rangeStart, rangeEnd);
                return schedArr.length > 0;
            });
        }

        // 3. Search Filter
        if (searchVal) {
            membersInCourse = membersInCourse.filter(m =>
                m.name.toLowerCase().includes(searchVal) ||
                (m.phone && m.phone.includes(searchVal)) ||
                (m.phone_guardian && m.phone_guardian.includes(searchVal)) ||
                cName.toLowerCase().includes(searchVal)
            );
        }

        // Apply selection
        membersInCourse.forEach(m => {
            const phone = targetType === 'student' ? m.phone : m.phone_guardian;
            if (phone && phone.trim()) {
                const alreadySelected = selectedTargets.some(t => String(t.id) === String(m.id) && t.phone === phone);
                if (!alreadySelected) {
                    selectedTargets.push({ ...m, phone: phone, selectedCourse: cName });
                    totalSelectedNow++;
                }
            }
        });
    });

    updateCheckmarks();
    updateSelectedTags();
    saveSelectedTargets();
    saveAllDrafts();

    showModalAlert(`필터링 구간에 해당하는 수강생 ${totalSelectedNow}명이 선택되었습니다.`);
}

function deselectAllCourses() {
    selectedTargets = [];
    updateCheckmarks();
    updateSelectedTags();
    saveSelectedTargets();
    resetFilters(); // This resets the sidebar list to show everything
}

// ----------------------------------------------------
// Right Panel Logic (Mockup & Editor)
// ----------------------------------------------------

let currentTab = 'all';

function switchTab(type) {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(b => {
        const btnText = b.textContent.trim();
        if (type === 'history' ? btnText === '발신 기록' : (btnText.toLowerCase() === type || (type === 'all' && btnText === '전체'))) {
            b.classList.add('active');
            b.style.background = '#3b82f6';
            b.style.color = 'white';
            b.style.fontWeight = 'bold';
        } else {
            b.classList.remove('active');
            b.style.background = 'white';
            b.style.color = '#3b82f6';
            b.style.fontWeight = 'normal';
        }
    });

    currentTab = type;

    // Toggle Editor vs History view
    const editorFlow = document.getElementById('editorFlow');
    const historyFlow = document.getElementById('historyFlow');
    const sendBtn = document.querySelector('.send-btn');

    if (type === 'history') {
        if (editorFlow) editorFlow.style.display = 'none';
        if (historyFlow) historyFlow.style.display = 'flex';
        if (sendBtn) sendBtn.style.visibility = 'hidden';
        renderSentHistory();
    } else {
        if (editorFlow) editorFlow.style.display = 'flex';
        if (historyFlow) historyFlow.style.display = 'none';
        if (sendBtn) sendBtn.style.visibility = 'visible';
        filterTemplates();
    }

    updateMockup(); // Sync preview when tab changes
}

function saveSentHistory() {
    if (!lastGeneratedPreviews || lastGeneratedPreviews.length === 0) return;

    const now = new Date();
    const dateKey = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const historyItem = {
        id: Date.now(),
        date: dateKey,
        time: timeStr,
        text: document.getElementById('messageInput').value,
        count: lastGeneratedPreviews.length,
        targets: lastGeneratedPreviews.map(p => p.name)
    };

    smsHistory.unshift(historyItem); // Add to top
    // Limit to 100 items for performance
    if (smsHistory.length > 100) smsHistory = smsHistory.slice(0, 100);

    localStorage.setItem('sejongSmsHistory', JSON.stringify(smsHistory));
}

function renderSentHistory() {
    const box = document.getElementById('sentHistoryBox');
    if (!box) return;

    if (smsHistory.length === 0) {
        box.innerHTML = `<div style="text-align:center; padding:40px; color:#94a3b8; font-size:0.9rem;">발신 기록이 없습니다.</div>`;
        return;
    }

    // Group by date
    const grouped = {};
    smsHistory.forEach(h => {
        if (!grouped[h.date]) grouped[h.date] = [];
        grouped[h.date].push(h);
    });

    const dates = Object.keys(grouped).sort().reverse();

    let html = '';
    dates.forEach(date => {
        html += `
            <div style="background: #1e3a8a; color: white; padding: 8px 15px; font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; gap: 8px;">
                <i class="material-icons" style="font-size:1.1rem;">calendar_today</i>
                ${date}
            </div>
        `;

        grouped[date].forEach(item => {
            const shortText = item.text.length > 50 ? item.text.substring(0, 50) + '...' : item.text;
            html += `
                <div style="padding: 12px 15px; border-bottom: 1px solid #f1f5f9; cursor: pointer;" onclick="loadHistoryItem(${item.id})">
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                        <span style="font-weight:700; color:#1e293b; font-size:0.85rem;">[${item.time}] ${item.count}명 발송</span>
                        <i class="material-icons" style="font-size:1.1rem; color:#cbd5e1;" onclick="event.stopPropagation(); deleteHistoryItem(${item.id})">delete_outline</i>
                    </div>
                    <div style="font-size: 0.8rem; color: #64748b; line-height: 1.4; white-space: pre-wrap;">${shortText}</div>
                </div>
            `;
        });
    });

    html += `
        <div style="padding: 20px; text-align: center;">
            <button onclick="clearSmsHistory()" style="background:none; border:none; color:#ef4444; font-size:0.8rem; cursor:pointer; text-decoration:underline;">전체 내역 삭제</button>
        </div>
    `;

    box.innerHTML = html;
}

function loadHistoryItem(id) {
    const item = smsHistory.find(h => h.id === id);
    if (!item) return;

    document.getElementById('messageInput').value = item.text;
    switchTab('all'); // Go back to editor
    showModalAlert(`[${item.date} ${item.time}] 발신 내용을 불러왔습니다.`);
}

function deleteHistoryItem(id) {
    showModalConfirm('이 발신 기록을 삭제하시겠습니까?', () => {
        smsHistory = smsHistory.filter(h => h.id !== id);
        localStorage.setItem('sejongSmsHistory', JSON.stringify(smsHistory));
        renderSentHistory();
    });
}

function clearSmsHistory() {
    showModalConfirm('전체 발신 내역을 삭제하시겠습니까?', () => {
        smsHistory = [];
        localStorage.setItem('sejongSmsHistory', JSON.stringify(smsHistory));
        renderSentHistory();
    });
}

function filterTemplates() {
    const searchInput = document.getElementById('searchTemplateInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const items = document.querySelectorAll('.template-item');

    items.forEach((item, index) => {
        const tmpl = myTemplates[index];
        if (!tmpl) return;
        const text = tmpl.text.toLowerCase();
        const typeBadge = tmpl.type.toLowerCase();

        let matchesTab = true;
        if (currentTab === 'sms' && typeBadge !== 'sms') matchesTab = false;
        if (currentTab === 'lms' && typeBadge !== 'lms') matchesTab = false;

        let matchesSearch = text.includes(searchTerm);

        if (matchesTab && matchesSearch) {
            item.style.display = 'flex'; // Use flex since the new items are flex containers
        } else {
            item.style.display = 'none';
        }
    });
}

function loadLocalFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;
        document.getElementById('messageInput').value = content;
        updateMockup();
        // Reset input so the same file can be picked again if needed
        event.target.value = '';
    };
    reader.readAsText(file);
}

function renderTemplates() {
    const box = document.getElementById('templateBox');
    if (!box) return;
    box.innerHTML = '';

    if (isAddingNewTemplate) {
        const div = document.createElement('div');
        div.className = 'template-item-new';
        div.style.background = '#e0f2fe';
        div.style.padding = '8px 10px';
        div.style.border = '1px solid #3b82f6';
        div.style.marginBottom = '10px';

        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                <div style="font-weight:700; font-size:0.85rem; color:#1e3a8a;">새 템플릿 등록</div>
                <select id="newTplType" style="padding:2px 5px; font-size:0.8rem; border-color:#93c5fd; border-radius:4px; outline:none;" onclick="event.stopPropagation()">
                    <option value="SMS" ${currentTab === 'lms' ? '' : 'selected'}>SMS (단문설정)</option>
                    <option value="LMS" ${currentTab === 'lms' ? 'selected' : ''}>LMS (장문설정)</option>
                </select>
            </div>
            <div style="display:flex; flex-direction:column; width:100%; gap:5px;">
                <textarea id="newTplInput" placeholder="여기에 내용을 입력하세요..." style="width:100%; height:80px; padding:8px; font-size:0.85rem; border:1px solid #93c5fd; border-radius:4px; resize:none;" onclick="event.stopPropagation()"></textarea>
                <div style="display:flex; justify-content:flex-end; gap:5px;">
                    <button onclick="event.stopPropagation(); confirmNewTemplate()" style="padding:4px 10px; background:#10b981; color:white; border:none; border-radius:3px; cursor:pointer;">저장</button>
                    <button onclick="event.stopPropagation(); cancelNewTemplate()" style="padding:4px 10px; background:#94a3b8; color:white; border:none; border-radius:3px; cursor:pointer;">취소</button>
                </div>
            </div>
        `;
        box.appendChild(div);
    }

    myTemplates.forEach((tmpl, i) => {
        const text = tmpl.text;
        const type = tmpl.type;
        const color = type === 'LMS' ? '#ef4444' : '#3b82f6';
        let shortText = text.replace(/\\n/g, ' ');
        if (shortText.length > 25) shortText = shortText.substring(0, 25) + '...';

        const div = document.createElement('div');
        div.className = 'template-item';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';

        if (editingTemplateIndex === i) {
            div.style.background = '#f8fafc';
            div.style.padding = '8px 10px';
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <div style="font-weight:700; font-size:0.85rem; color:#475569;">템플릿 수정</div>
                    <select id="editTplType_${i}" style="padding:2px 5px; font-size:0.8rem; border-color:#cbd5e1; border-radius:4px; outline:none;" onclick="event.stopPropagation()">
                        <option value="SMS" ${type === 'SMS' ? 'selected' : ''}>SMS 설정</option>
                        <option value="LMS" ${type === 'LMS' ? 'selected' : ''}>LMS 설정</option>
                    </select>
                </div>
                <div style="display:flex; flex-direction:column; width:100%; gap:5px;">
                    <textarea id="editTpl_${i}" style="width:100%; height:80px; padding:8px; font-size:0.85rem; border:1px solid #3b82f6; border-radius:4px; resize:none;" onclick="event.stopPropagation()">${text}</textarea>
                    <div style="display:flex; justify-content:flex-end; gap:5px;">
                        <button onclick="event.stopPropagation(); saveEditTemplate(${i})" style="padding:4px 10px; background:#10b981; color:white; border:none; border-radius:3px; cursor:pointer;">저장</button>
                        <button onclick="event.stopPropagation(); cancelEditTemplate()" style="padding:4px 10px; background:#94a3b8; color:white; border:none; border-radius:3px; cursor:pointer;">취소</button>
                    </div>
                </div>
            `;
        } else {
            div.innerHTML = `
                <div style="cursor:pointer; flex:1; padding-left: 5px;" onclick="loadTemplateByIndex(${i})">
                    <span class="type-badge" style="color:${color}; border-color:${color};">${type}</span> 
                    ${shortText}
                </div>
                <div style="display:flex; gap:8px;">
                    <i class="material-icons" style="font-size:1.1rem; color:#94a3b8; cursor:pointer;" title="수정" onclick="editTemplateInline(${i})">edit</i>
                    <i class="material-icons" style="font-size:1.1rem; color:#cbd5e1; cursor:pointer;" title="삭제" onclick="deleteTemplate(${i}, event)">close</i>
                </div>
            `;
        }

        box.appendChild(div);
    });
    filterTemplates();
}

function loadTemplateByIndex(i) {
    if (editingTemplateIndex !== -1) return; // Prevent loading while editing
    document.getElementById('messageInput').value = myTemplates[i].text;
    updateMockup();
}

function editTemplateInline(i, e) {
    if (e) e.stopPropagation();
    editingTemplateIndex = i;
    renderTemplates();
}

function saveEditTemplate(i) {
    const editArea = document.getElementById(`editTpl_${i}`);
    const typeSelect = document.getElementById(`editTplType_${i}`);
    if (!editArea) return;
    const newText = editArea.value.trim();
    if (!newText) {
        showModalAlert('내용을 입력해주세요.', true);
        return;
    }
    const newType = typeSelect ? typeSelect.value : myTemplates[i].type;

    myTemplates[i] = { text: newText, type: newType };
    localStorage.setItem('sejongSmsTemplates', JSON.stringify(myTemplates));
    editingTemplateIndex = -1;

    // MUST call renderTemplates BEFORE switchTab so DOM updates and hides the editor
    renderTemplates();

    if (currentTab !== 'all' && currentTab !== newType.toLowerCase()) {
        switchTab(newType.toLowerCase());
    }

    loadTemplateByIndex(i);
    showModalAlert('수정되었습니다.');
}

function cancelEditTemplate() {
    editingTemplateIndex = -1;
    renderTemplates();
}

function deleteTemplate(i, e) {
    e.stopPropagation();
    showModalConfirm('이 템플릿을 삭제하시겠습니까?', () => {
        myTemplates.splice(i, 1);
        localStorage.setItem('sejongSmsTemplates', JSON.stringify(myTemplates));
        renderTemplates();
    });
}

function openNewTemplateEditor() {
    isAddingNewTemplate = true;
    editingTemplateIndex = -1; // close any open edit
    const currentMsgText = document.getElementById('messageInput').value.trim();
    renderTemplates();

    // Focus the new input and carry over the typed text
    setTimeout(() => {
        const input = document.getElementById('newTplInput');
        if (input) {
            if (currentMsgText) input.value = currentMsgText;
            input.focus();
        }
    }, 50);
}

function confirmNewTemplate() {
    const input = document.getElementById('newTplInput');
    const typeSelect = document.getElementById('newTplType');
    if (!input) return;
    const text = input.value.trim();
    if (!text) {
        showModalAlert('등록할 내용을 입력해주세요.', true);
        return;
    }
    if (myTemplates.some(t => t.text === text)) {
        showModalAlert('이미 동일한 내용의 템플릿이 있습니다.', true);
        return;
    }

    const type = typeSelect ? typeSelect.value : 'SMS';
    myTemplates.unshift({ text, type }); // Add to top
    localStorage.setItem('sejongSmsTemplates', JSON.stringify(myTemplates));
    isAddingNewTemplate = false;

    // MUST render DOM to destroy editor before tab switch logic
    renderTemplates();

    if (currentTab !== 'all' && currentTab !== type.toLowerCase()) {
        switchTab(type.toLowerCase());
    }

    showModalAlert('새로운 템플릿이 등록되었습니다.');
}

function cancelNewTemplate() {
    isAddingNewTemplate = false;
    renderTemplates();
}

function loadTemplate(text) {
    document.getElementById('messageInput').value = text;
    updateMockup();
}

function updateMockup() {
    let text = document.getElementById('messageInput').value;
    const useFooter = document.getElementById('useFooter').checked;
    const footerInput = document.getElementById('footerInput').value;

    if (useFooter && footerInput.trim() !== '') {
        if (text.trim() === '') {
            text = footerInput;
        } else {
            text += '\n\n' + footerInput;
        }
    }

    const bubble = document.getElementById('mockupBubble');
    const topBar = document.getElementById('mockupTypeBar');

    // Replace %%% with a sample name for preview and @@@ for sample date
    let previewText = text.replace(/%%%/g, '김학생');
    previewText = previewText.replace(/@@@/g, '3월 15일');

    // Roughly calculate bytes
    let bytes = 0;
    for (let i = 0; i < text.length; i++) {
        bytes += text.charCodeAt(i) > 128 ? 2 : 1;
    }

    const detectedType = bytes > 90 ? 'LMS' : 'SMS';
    currentMsgType = detectedType;

    // Filter preview content based on currentTab? 
    // The user said "SMS 글만 나오기 해주세요" which could mean "If I'm on SMS tab, show it as SMS"
    if (previewText.trim() === '') {
        bubble.textContent = '메시지를 입력해주세요...';
        bubble.style.color = '#94a3b8';
    } else {
        bubble.textContent = previewText;
        bubble.style.color = '#334155';
    }

    // Update Top Bar with Alert color if doesn't match tab
    topBar.textContent = `${detectedType} ${bytes} bytes`;

    if (currentTab !== 'all' && currentTab.toUpperCase() !== detectedType) {
        topBar.style.background = '#f59e0b'; // Amber warning for mismatch
        topBar.textContent += ` (탭 미스매치)`;
    } else {
        topBar.style.background = detectedType === 'LMS' ? '#ef4444' : '#3b82f6';
    }

    saveAllDrafts(); // AUTO SAVE ON EVERY INPUT
}

function sendSms() {
    if (selectedTargets.length === 0) {
        showModalAlert('전송 대상을 먼저 추가해주세요.', true);
        return;
    }
    let text = document.getElementById('messageInput').value;
    const useFooter = document.getElementById('useFooter').checked;
    const footerInput = document.getElementById('footerInput').value;

    if (useFooter && footerInput.trim() !== '') {
        if (text.trim() === '') {
            text = footerInput;
        } else {
            text += '\n\n' + footerInput;
        }
    }

    if (text.trim() === '') {
        showModalAlert('메시지 내용을 입력해주세요.', true);
        return;
    }

    // Build personalized examples
    let personalizedMessages = [];
    const rangeStartVal = document.getElementById('paymentRangeStart').value;
    const rangeEndVal = document.getElementById('paymentRangeEnd').value;
    const usePaymentFilter = document.getElementById('usePaymentFilter').checked;
    const rangeStart = rangeStartVal ? new Date(rangeStartVal + 'T00:00:00') : null;
    const rangeEnd = rangeEndVal ? new Date(rangeEndVal + 'T00:00:00') : null;


    selectedTargets.forEach(t => {
        let msg = text.replace(/%%%/g, t.name);

        let tuitionDateStr = '지정';
        let sched = null;
        if (rangeStart && rangeEnd) {
            const milestones = getAllMilestonesForRange(t.id, t.selectedCourse === '미지정' ? null : t.selectedCourse, rangeStart, rangeEnd);
            if (milestones.length > 0) {
                sched = milestones[0];
            }
        }
        if (!sched) {
            sched = getMemberScheduledDate(t.id, t.selectedCourse === '미지정' ? null : t.selectedCourse);
        }

        if (sched) {
            const schedDate = new Date(sched.year, sched.month - 1, sched.day);
            let limitStart = new Date();
            limitStart.setHours(0, 0, 0, 0);
            let daysUntilNextSat = 6 - limitStart.getDay();
            if (daysUntilNextSat < 0) daysUntilNextSat += 7;
            let limitEnd = new Date(limitStart);
            limitEnd.setDate(limitStart.getDate() + daysUntilNextSat + 7);

            const finalStart = rangeStart ? rangeStart : limitStart;
            const finalEnd = rangeEnd ? rangeEnd : limitEnd;

            if (schedDate >= finalStart && schedDate <= finalEnd) {
                tuitionDateStr = `${sched.month}월 ${sched.day}일`;
            }
        }

        msg = msg.replace(/@@@/g, tuitionDateStr);
        personalizedMessages.push({ name: t.name, text: msg });
    });

    lastGeneratedPreviews = personalizedMessages; // Save for full view window

    // Slice first 2 for the small confirmation modal
    const smallPreviewOutput = personalizedMessages.slice(0, 3).map(item => {
        let textBytes = 0;
        for (let i = 0; i < item.text.length; i++) textBytes += item.text.charCodeAt(i) > 128 ? 2 : 1;
        const typeStr = textBytes > 90 ? 'LMS' : 'SMS';
        const isMismatch = currentTab !== 'all' && currentTab.toUpperCase() !== typeStr;

        return `
        <div style="background:${isMismatch ? '#fff7ed' : '#e0f2fe'}; border:1px solid ${isMismatch ? '#fdba74' : '#bae6fd'}; padding:12px; border-radius:8px; margin-bottom:10px; font-size:0.9rem; color:#1e293b; text-align:left; position:relative;">
            ${isMismatch ? `<div style="position:absolute; top:5px; right:10px; font-size:0.65rem; background:#f59e0b; color:white; padding:1px 4px; border-radius:3px; font-weight:800;">${typeStr} 전환됨</div>` : ''}
            <div style="font-weight:700; color:${isMismatch ? '#c2410c' : '#0369a1'}; margin-bottom:5px;">[${item.name}님 수신 화면]</div>
            ${item.text.replace(/\n/g, '<br>')}
        </div>
    `;
    }).join('');

    const extraCount = personalizedMessages.length > 3 ? `<div style="text-align:center; color:#64748b; font-size:0.85rem; margin-top:5px; font-weight:700;">...외 ${personalizedMessages.length - 3}명에게 동일한 형식으로 전송됩니다.</div>` : '';

    const title = `[${currentMsgType}] 전송 확인`;

    const bodyHTML = `
        <div style="margin-bottom:15px; text-align:center;">
            발송 대상: <strong style="color:#2563eb; font-size:1.2rem;">총 ${selectedTargets.length}명</strong>
        </div>
        
        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:15px; align-items:center;">
            <button onclick="
                const d = document.getElementById('smsPreviewContent');
                if (d.style.display === 'none') {
                    d.style.display = 'block';
                    this.innerHTML = '<i class=\\'material-icons\\' style=\\'font-size:1rem; vertical-align:middle;\\'>visibility_off</i> 미리보기 샘플 닫기';
                } else {
                    d.style.display = 'none';
                    this.innerHTML = '<i class=\\'material-icons\\' style=\\'font-size:1rem; vertical-align:middle;\\'>visibility</i> 미리보기 샘플 열기';
                }
            " style="width:200px; padding:6px 15px; font-size:0.9rem; background:#f8fafc; border:1px solid #cbd5e1; border-radius:5px; cursor:pointer; color:#475569; font-weight:700;">
                <i class="material-icons" style="font-size:1rem; vertical-align:middle;">visibility_off</i> 미리보기 샘플 닫기
            </button>
            <button onclick="showFullPreview()" style="width:200px; padding:6px 15px; font-size:0.9rem; background:#0369a1; border:none; border-radius:5px; cursor:pointer; color:white; font-weight:700; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                <i class="material-icons" style="font-size:1rem; vertical-align:middle;">open_in_new</i> 전체 상세 미리보기 (대화면)
            </button>
        </div>

        <div id="smsPreviewContent" style="display:block; max-height:250px; overflow-y:auto; padding:10px; background:#f1f5f9; border-radius:8px; margin-bottom:15px; box-shadow:inset 0 2px 4px rgba(0,0,0,0.05);">
            <div style="font-weight:700; margin-bottom:10px; color:#475569; border-bottom:2px solid #e2e8f0; padding-bottom:5px; text-align:center;">치환 결과 샘플 (3명분)</div>
            ${smallPreviewOutput}
            ${extraCount}
        </div>
        
        <div style="margin-top:15px; font-weight:700; color:#ef4444; text-align:center; font-size:1.1rem;">
            위의 수신인들에게 정말로 발송하시겠습니까?
        </div>
    `;

    openModal(title, bodyHTML, confirmSmsSend, '발송하기', '#3b82f6');
}

function showFullPreview() {
    // Show all messages but highlight the ones that don't match the active tab
    const listHtml = lastGeneratedPreviews.map((item, idx) => {
        let textBytes = 0;
        for (let i = 0; i < item.text.length; i++) textBytes += item.text.charCodeAt(i) > 128 ? 2 : 1;
        const typeStr = textBytes > 90 ? 'LMS' : 'SMS';
        const isMismatch = currentTab !== 'all' && currentTab.toUpperCase() !== typeStr;
        const headerBg = isMismatch ? '#fff7ed' : 'white';
        const typeColor = typeStr === 'LMS' ? '#ef4444' : '#3b82f6';

        return `
        <div style="background:${headerBg}; border:1px solid ${isMismatch ? '#fdba74' : '#e2e8f0'}; padding:15px; border-radius:10px; margin-bottom:15px; box-shadow:0 1px 3px rgba(0,0,0,0.05); position:relative;">
            ${isMismatch ? `<div style="position:absolute; top:10px; right:15px; font-size:0.7rem; background:#f59e0b; color:white; padding:2px 6px; border-radius:4px; font-weight:800;">탭 미스매치</div>` : ''}
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid #f1f5f9; padding-bottom:5px;">
                <span style="font-weight:800; color:#1e3a8a;">[${idx + 1}] 수신인: ${item.name}님</span>
                <span style="font-size:0.75rem; color:${typeColor}; font-weight:700;">${typeStr} (${textBytes} bytes)</span>
            </div>
            <div style="padding:10px; background:${isMismatch ? '#fffcf0' : '#f8fafc'}; border-radius:6px; font-size:0.95rem; line-height:1.5; color:#334155; word-break:break-all;">
                ${item.text.replace(/\n/g, '<br>')}
            </div>
        </div>
    `;
    }).join('');

    document.getElementById('fullPreviewBody').innerHTML = `
        <div style="padding:10px;">
            <div style="background:#f1f5f9; border:1px solid #e2e8f0; color:#475569; padding:10px; border-radius:6px; margin-bottom:20px; font-size:0.85rem; text-align:center;">
                <i class="material-icons" style="font-size:1rem; vertical-align:middle;">info</i> ${currentTab === 'all' ? '전체' : currentTab.toUpperCase()} 탭의 전송 대상 목록입니다. (총 ${lastGeneratedPreviews.length}건)
            </div>
            <div style="display:flex; flex-direction:column; gap:0;">
                ${listHtml}
            </div>
        </div>
    `;
    document.getElementById('fullPreviewModal').style.display = 'flex';
}

function confirmSmsSend() {
    saveSentHistory();
    closeSmsModal();
    showModalAlert('전송이 완료되었습니다. (발신 내역에 저장되었습니다)');

    // Optional: Reset targets after send? 
    // selectedTargets = [];
    // localStorage.removeItem('sejongSmsSelectedTargets');
    // renderSelectedTargets();
    // renderTargetList();
}

/* --- Range Selection Calendar Logic (Interactive Drag Support) --- */
let calendarYear = new Date().getFullYear();
let calendarMonth = new Date().getMonth();
let isDragging = false;
let dragStartDay = null;

function toggleRangeCalendar() {
    const body = document.getElementById('rangeFilterBody');
    const icon = document.getElementById('rangeToggleIcon');
    if (body.style.display === 'none') {
        body.style.display = 'block';
        icon.textContent = 'expand_less';
        renderRangeCalendar();
    } else {
        body.style.display = 'none';
        icon.textContent = 'expand_more';
    }
}

function renderRangeCalendar() {
    const grid = document.getElementById('calendarDays');
    const title = document.getElementById('calendarTitle');
    if (!grid) return;
    grid.innerHTML = '';
    title.textContent = `${calendarYear}.${String(calendarMonth + 1).padStart(2, '0')}`;

    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const lastDate = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const prevLastDate = new Date(calendarYear, calendarMonth, 0).getDate();

    const startVal = document.getElementById('paymentRangeStart').value;
    const endVal = document.getElementById('paymentRangeEnd').value;

    const startDate = startVal ? new Date(startVal) : null;
    const endDate = endVal ? new Date(endVal) : null;
    if (startDate) startDate.setHours(0, 0, 0, 0);
    if (endDate) endDate.setHours(0, 0, 0, 0);

    // Pre-calculate payment days for highlighting
    const paymentDays = new Set();
    allMembers.forEach(m => {
        if (!m.course) return;
        m.course.split(',').forEach(c => {
            const milestones = getAllMilestonesForMonth(m.id, c.trim(), calendarYear, calendarMonth + 1);
            milestones.forEach(ms => paymentDays.add(ms.day));
        });
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Padding prev month
    for (let i = firstDay; i > 0; i--) {
        const d = document.createElement('div');
        d.className = 'calendar-day other-month';
        d.textContent = prevLastDate - i + 1;
        grid.appendChild(d);
    }

    // Current month days
    for (let i = 1; i <= lastDate; i++) {
        const d = document.createElement('div');
        const currentD = new Date(calendarYear, calendarMonth, i);
        currentD.setHours(0, 0, 0, 0);

        d.className = 'calendar-day';
        d.textContent = i;

        const dayOfWeek = currentD.getDay();
        const y_cal = currentD.getFullYear();
        const m_cal = String(currentD.getMonth() + 1).padStart(2, '0');
        const d_cal = String(currentD.getDate()).padStart(2, '0');
        const dateStr = `${y_cal}-${m_cal}-${d_cal}`;
        const isHolidayInSys = holidaysData.some(h => h.date === dateStr);
        const isNationalHoliday = !!KOREAN_HOLIDAYS_MAP[dateStr];

        // Color rules: Sun/Holiday Red, Sat Blue, Others Black
        if (dayOfWeek === 0 || isHolidayInSys || isNationalHoliday) {
            d.style.color = '#ef4444';
        } else if (dayOfWeek === 6) {
            d.style.color = '#3b82f6';
        } else {
            d.style.color = '#000000';
        }

        if (currentD.getTime() === today.getTime()) d.classList.add('today');

        if (startDate && endDate) {
            if (currentD.getTime() === startDate.getTime()) d.classList.add('range-start');
            if (currentD.getTime() === endDate.getTime()) d.classList.add('range-end');
            if (currentD > startDate && currentD < endDate) d.classList.add('in-range');
        } else if (startDate && currentD.getTime() === startDate.getTime()) {
            d.classList.add('range-start');
        }

        // Highlight dates that have scheduled payments
        if (paymentDays.has(i)) {
            d.style.fontWeight = '800';
        }

        // Mouse Events for Drag
        d.onmousedown = (e) => {
            e.preventDefault();
            startDrag(new Date(currentD));
        };
        d.onmouseenter = (e) => {
            if (isDragging) updateDrag(new Date(currentD));
        };
        d.onmouseup = (e) => {
            endDrag(new Date(currentD));
        };

        grid.appendChild(d);
    }

    // Global mouseup to stop drag
    if (!window.hasGlobalMouseUp) {
        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                renderTargetList();
            }
        });
        window.hasGlobalMouseUp = true;
    }
}

function startDrag(date) {
    isDragging = true;
    dragStartDay = date;
    const dateStr = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
    document.getElementById('paymentRangeStart').value = dateStr;
    document.getElementById('paymentRangeEnd').value = dateStr;
    renderRangeCalendar();
}

function updateDrag(date) {
    if (!isDragging || !dragStartDay) return;

    let start = new Date(Math.min(dragStartDay, date));
    let end = new Date(Math.max(dragStartDay, date));

    const startStr = start.getFullYear() + '-' + String(start.getMonth() + 1).padStart(2, '0') + '-' + String(start.getDate()).padStart(2, '0');
    const endStr = end.getFullYear() + '-' + String(end.getMonth() + 1).padStart(2, '0') + '-' + String(end.getDate()).padStart(2, '0');

    document.getElementById('paymentRangeStart').value = startStr;
    document.getElementById('paymentRangeEnd').value = endStr;
    renderRangeCalendar();
}

function endDrag(date) {
    isDragging = false;
    renderRangeCalendar();

    // Automatically check the filter if a range is selected to show filtered view
    const pf = document.getElementById('usePaymentFilter');
    if (pf) pf.checked = true;

    renderTargetList();

    // Auto-select if range filtering is active
    if (pf && pf.checked) {
        selectFilteredCourses();
    }
    saveAllDrafts();
}

function changeRangeMonth(offset) {
    calendarMonth += offset;
    if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
    if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
    renderRangeCalendar();
}

function setQuickRange(days) {
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + days);

    const startStr = start.getFullYear() + '-' + String(start.getMonth() + 1).padStart(2, '0') + '-' + String(start.getDate()).padStart(2, '0');
    const endStr = end.getFullYear() + '-' + String(end.getMonth() + 1).padStart(2, '0') + '-' + String(end.getDate()).padStart(2, '0');

    document.getElementById('paymentRangeStart').value = startStr;
    document.getElementById('paymentRangeEnd').value = endStr;

    calendarYear = start.getFullYear();
    calendarMonth = start.getMonth();

    renderRangeCalendar();
    renderTargetList();

    if (document.getElementById('usePaymentFilter').checked) {
        selectFilteredCourses();
    }
    saveAllDrafts();
}

function getAllMilestonesForRange(memberId, courseFilter, startRange, endRange) {
    // Re-use logic to get all milestones and filter
    const milestones = getMemberAllMilestones(memberId, courseFilter);
    return milestones.filter(m => {
        const d = new Date(m.year, m.month - 1, m.day);
        return d >= startRange && d <= endRange;
    });
}

function getAllMilestonesForMonth(memberId, courseFilter, year, month) {
    const milestones = getMemberAllMilestones(memberId, courseFilter);
    return milestones.filter(m => m.year === year && m.month === month);
}

function getMemberAllMilestones(memberId, courseFilter) {
    // Helper to get raw array without "best" logic
    let milestones = [];
    const today = new Date();

    // [수정] 기 기록된 출석은 요일에 관계없이 모두 인정합니다.
    let records = (attendanceByMember[memberId] || []).filter(r => true).sort((a, b) => a.dateObj - b.dateObj);

    let rollingTotal = 0;
    let lastRecordDate = null;
    let hasAnyAttendance = false;

    const getCycle = (val) => {
        let vRaw = Math.round(val * 10);
        if (vRaw < 90) return 0;
        return Math.floor((vRaw - 90) / 80) + 1;
    };

    // [1] Check Sync Data
    try {
        const syncData = JSON.parse(localStorage.getItem('sejong_ledger_sync') || '{}');
        for (let mOffset = -6; mOffset <= 6; mOffset++) {
            const d = new Date(today.getFullYear(), today.getMonth() + mOffset, 1);
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            const syncKey = `${memberId}_${y}_${m}_${courseFilter || 'all'}`;
            if (syncData[syncKey]) {
                milestones.push({ year: y, month: m, day: syncData[syncKey] });
            }
        }
    } catch (e) { }

    for (const r of records) {
        if (courseFilter) {
            const rClean = (r.course || '').replace(/\([^)]*\)/g, '').trim();
            const fClean = courseFilter.replace(/\([^)]*\)/g, '').trim();
            if (rClean !== fClean) continue;
        }

        const inc = (r.course && r.course.includes('제과제빵')) ? 0.5 : 1.0;
        const isMarker = ['[', ']'].includes(r.status);
        const isNumericPresent = ['10', '12', '2', '5', '7', '3', '9'].includes(r.status);
        const isAbsent = r.status === 'absent' || (typeof r.status === 'string' && r.status.startsWith('X'));
        const isRegular = r.status === 'present' || isNumericPresent || isAbsent;

        if (isMarker || isRegular) {
            const prevCycle = getCycle(rollingTotal);
            rollingTotal += inc;
            const currCycle = getCycle(rollingTotal);
            if (currCycle > prevCycle || r.status === '9' || r.status === 9) {
                milestones.push({ year: r.yearNum, month: r.monthNum, day: r.dateObj.getDate() });
            }
            lastRecordDate = r.dateObj;
            hasAnyAttendance = true;
        }
    }

    if (hasAnyAttendance) {
        const firstDayOfSim = new Date(today.getFullYear(), today.getMonth() - 6, 1);
        let simDate = new Date(firstDayOfSim);
        if (lastRecordDate && lastRecordDate > firstDayOfSim) {
            simDate = new Date(lastRecordDate.getTime() + 86400000);
        }

        const limitDate = new Date(today.getFullYear(), today.getMonth() + 6, 0);
        let simRolling = rollingTotal;

        while (simDate <= limitDate) {
            const dayOfWeek = simDate.getDay();
            const y_sim = simDate.getFullYear();
            const m_sim = String(simDate.getMonth() + 1).padStart(2, '0');
            const d_sim = String(simDate.getDate()).padStart(2, '0');
            const dateStr = `${y_sim}-${m_sim}-${d_sim}`;
            const isHoliday = holidaysData.some(h => h.date === dateStr) || !!KOREAN_HOLIDAYS_MAP[dateStr];

            let isValidDay = false;
            if (courseFilter) {
                const cleanFilter = courseFilter.replace(/\([^)]*\)/g, '').trim();
                const schedule = COURSE_SCHEDULES[cleanFilter];
                if (schedule) {
                    if (schedule.includes(dayOfWeek)) isValidDay = true;
                } else {
                    if (dayOfWeek !== 0) isValidDay = true;
                }
            } else {
                if (dayOfWeek !== 0) isValidDay = true;
            }

            if (isValidDay && !isHoliday) {
                const prevSim = simRolling;
                const inc = (courseFilter && courseFilter.includes('제과제빵')) ? 0.5 : 1.0;
                simRolling += inc;
                if (getCycle(simRolling) > getCycle(prevSim)) {
                    milestones.push({ year: simDate.getFullYear(), month: simDate.getMonth() + 1, day: simDate.getDate() });
                }
            }
            if (milestones.length > 20) break;
            simDate.setDate(simDate.getDate() + 1);
        }
    }
    return milestones;
}

function syncCalendarSelection() {
    renderRangeCalendar();
    saveAllDrafts(); // Auto save on date change
}
