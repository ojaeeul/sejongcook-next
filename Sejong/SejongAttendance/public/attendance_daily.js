
function getFetchUrl(endpoint, isPost = false) {
    const url = `/api/sejong/${endpoint}`;
    return isPost ? url : url + (url.includes('?') ? '&' : '?') + `t=${Date.now()}`;
}

const API_BASE = '/api/sejong';

let allMembers = [];
let groupedCourses = {};
let activeCourse = '';
let currentDate = localStorage.getItem('sejong_daily_date') || new Date().toISOString().split('T')[0];

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('attendanceDate').value = currentDate;
    document.getElementById('attendanceDate').addEventListener('change', (e) => {
        currentDate = e.target.value;
        const cDateObj = new Date(currentDate);
        if (isNaN(cDateObj.getTime())) {
            currentDate = new Date().toISOString().split('T')[0];
            e.target.value = currentDate;
        }
        localStorage.setItem('sejong_daily_date', currentDate);
        currentAttendanceState = {};
    currentMemoState = {};
        fetchAttendance();
    });

    document.getElementById('includeInactive').addEventListener('change', renderCourseList);

    fetchMembers();
});

let attendanceData = [];
let timetableData = {
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

async function fetchMembers() {
    try {
        const [resMembers, resAttendance, resTimetable] = await Promise.all([
            fetch(getFetchUrl('members')),
            fetch(getFetchUrl('attendance') + `&date=${currentDate}`),
            fetch(getFetchUrl('timetable'))
        ]);
        allMembers = await resMembers.json();
        attendanceData = await resAttendance.json();
        if (resTimetable.ok) {
            const apiData = await resTimetable.json();
            if (apiData && Object.keys(apiData).length > 0) {
                timetableData = { ...timetableData, ...apiData };
            }
        }
        
        // 당일 8시 이후 자동 결석 처리 로직 (공유 엔진)
        if (typeof window.autoMarkAbsences === 'function') {
            await window.autoMarkAbsences(allMembers, attendanceData, timetableData);
        }

        processCourses();
        renderCourseList();
    } catch (err) {
        console.error('Failed to fetch data:', err);
    }
}

let lastAttendanceHash = '';

async function fetchAttendance() {
    try {
        const res = await fetch(getFetchUrl('attendance') + `&date=${currentDate}`);
        const newData = await res.json();
        
        const newHash = JSON.stringify(newData);
        if (newHash !== lastAttendanceHash) {
            attendanceData = newData;
            lastAttendanceHash = newHash;
            currentAttendanceState = {};
    currentMemoState = {}; // Clear local state so new DB records take effect
            renderAttendanceTbody();
            return true;
        }
        return false;
    } catch (err) {
        console.error('Failed to fetch attendance:', err);
        return false;
    }
}

// Auto-refresh polling every 5 seconds
setInterval(async () => {
    // Check if any modal is open
    const modals = Array.from(document.querySelectorAll('.modal-overlay')).filter(m => window.getComputedStyle(m).display !== 'none');
    if (modals.length > 0) return;

    // --- Auto Absent Check ---
    const now = new Date();
    if (now.getHours() >= 20) {
        const todayStr = now.toISOString().split('T')[0];
        if (!localStorage.getItem('sejong_auto_absent_' + todayStr)) {
            try {
                const res = await fetch('/api/sejong/attendance/auto-absent', { method: 'POST' });
                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem('sejong_auto_absent_' + todayStr, 'true');
                    if (data.insertedCount > 0) {
                        console.log(`[Auto-Absent] Inserted ${data.insertedCount} absent records.`);
                        localStorage.setItem('sejong_attendance_sync', Date.now().toString()); // notify sheet.html
                    }
                }
            } catch(e) { console.error('[Auto-Absent]', e); }
        }
    }

    await fetchAttendance();
}, 5000);

function processCourses() {
    groupedCourses = { '미지정': [] };
    allMembers.forEach(m => {
        if (!m.course || m.course.trim() === '') {
            groupedCourses['미지정'].push(m);
        } else {
            m.course.split(',').forEach(c => {
                const cName = c.trim();
                if (!groupedCourses[cName]) groupedCourses[cName] = [];
                groupedCourses[cName].push(m);
            });
        }
    });
}

function renderCourseList() {
    const includeInactive = document.getElementById('includeInactive').checked;
    const listDiv = document.getElementById('courseList');
    listDiv.innerHTML = '';

    const courseNames = Object.keys(groupedCourses).sort();

    // Auto-select first course if none is active
    if (!activeCourse && courseNames.length > 0) {
        activeCourse = courseNames[0];
    }

    let activeCourseHasMembers = false;
    let validCourseCount = 0;

    let selectMobile = document.getElementById('courseSelectMobile');
    if (!selectMobile) {
        // HTML이 캐시되어서 select가 없는 경우 동적 생성
        const header = document.querySelector('.course-list-header');
        if (header) {
            const wrapper = document.createElement('div');
            wrapper.style.padding = '0 15px';
            wrapper.innerHTML = `<select id="courseSelectMobile" class="mobile-course-select" style="display: none;" onchange="selectCourseFromMobile(this.value)"></select>`;
            header.parentNode.insertBefore(wrapper, header.nextSibling);
            selectMobile = document.getElementById('courseSelectMobile');
            
            // 동적 CSS 주입
            const style = document.createElement('style');
            style.innerHTML = `
                @media (max-width: 1024px) {
                    .daily-container { flex-direction: column; height: auto; padding: 10px; }
                    .daily-panel-left { width: 100%; margin-bottom: 10px; }
                    .course-list { display: none !important; }
                    .mobile-course-select { display: block !important; width: 100%; padding: 12px; font-size: 1.1rem; font-weight: bold; border: 1px solid #cbd5e1; border-radius: 8px; background-color: #f8fafc; margin: 10px 0; color: #1e3a8a; }
                    .top-action-bar { flex-direction: column; gap: 10px; }
                    .action-buttons { width: 100%; justify-content: center; flex-wrap: wrap; }
                    .stats-box { flex-wrap: nowrap; gap: 2px; justify-content: space-between; padding: 10px 5px; overflow-x: auto; }
                    .stat-item { flex: 1; text-align: center; }
                    .stat-label { font-size: 0.7rem; margin-bottom: 2px; }
                    .stat-value { font-size: 1.1rem; }
                    th, td { padding: 6px 2px !important; font-size: 0.85rem; }
                    .student-cell { min-width: auto; white-space: nowrap; font-size: 0.85rem; }
                    .status-btn-group { gap: 1px; }
                    .status-btn { padding: 4px 1px; font-size: 0.75rem; letter-spacing: -1px; white-space: nowrap; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    if (selectMobile) selectMobile.innerHTML = '';

    courseNames.forEach(cName => {
        let membersInCourse = groupedCourses[cName];
        if (!includeInactive) {
            membersInCourse = membersInCourse.filter(m => m.status !== 'trash' && m.status !== 'completed');
        }

        if (membersInCourse.length === 0) return;
        validCourseCount++;

        if (cName === activeCourse) activeCourseHasMembers = true;

        const displayName = `${cName} (${membersInCourse.length}명)`;

        const cDiv = document.createElement('div');
        cDiv.className = `course-item ${cName === activeCourse ? 'active' : ''}`;
        cDiv.setAttribute('data-course', cName);
        cDiv.innerHTML = `<span>${displayName}</span><i class="material-icons" style="font-size:1rem;">chevron_right</i>`;

        cDiv.onclick = () => {
            if (activeCourse !== cName) {
                activeCourse = cName;
                currentAttendanceState = {};
    currentMemoState = {}; // Clear state when switching tabs
                renderCourseList(); // Re-render to update active styling
                renderAttendanceTbody(); // Re-render table
            }
        };

        listDiv.appendChild(cDiv);

        if (selectMobile) {
            const option = document.createElement('option');
            option.value = cName;
            option.textContent = displayName;
            if (cName === activeCourse) option.selected = true;
            selectMobile.appendChild(option);
        }
    });

    // If the active course became empty due to filtering, switch to the first available
    if (!activeCourseHasMembers && listDiv.children.length > 0) {
        activeCourse = listDiv.children[0].getAttribute('data-course');
        listDiv.children[0].classList.add('active');
        renderAttendanceTbody();
    } else if (listDiv.children.length === 0) {
        activeCourse = '';
        renderAttendanceTbody();
    } else {
        renderAttendanceTbody(); // Initial render for active course
    }
    
    // update selectMobile again just in case activeCourse changed dynamically
    if (selectMobile && activeCourse) {
        selectMobile.value = activeCourse;
    }

    document.getElementById('courseCount').textContent = `${validCourseCount}개`;
}

function selectCourseFromMobile(cName) {
    if (activeCourse !== cName) {
        activeCourse = cName;
        currentAttendanceState = {};
    currentMemoState = {}; // Clear state when switching tabs
        renderCourseList(); // Re-render to update active styling
        renderAttendanceTbody(); // Re-render table
    }
}

// Temporary store for UI changes before saving
let currentAttendanceState = {};
    currentMemoState = {};
let currentMemoState = {}; // { memberId: 'present'|'absent'... }

function renderAttendanceTbody() {
    const tbody = document.getElementById('attendanceTbody');
    tbody.innerHTML = '';

    document.getElementById('totalStudentsCount').textContent = `총원 0명`;

    if (!activeCourse || !groupedCourses[activeCourse]) {
        tbody.innerHTML = '<tr><td colspan="2" style="text-align:center; padding:30px; color:#94a3b8;">선택된 반이 없거나 멤버가 없습니다.</td></tr>';
        updateStats();
        return;
    }

    // --- NEW: Check if the current date is a valid day for the active course ---
    let isValidDayForCourse = true;
    if (activeCourse && activeCourse !== '미지정') {
        const cDateObj = new Date(currentDate);
        const dayOfWeek = cDateObj.getDay();
        const cleanCourseName = activeCourse.replace(/\([^)]*\)/g, '').trim();
        
        if (timetableData[cleanCourseName]) {
            isValidDayForCourse = timetableData[cleanCourseName].includes(dayOfWeek);
        } else if (timetableData[cleanCourseName.replace(/\s/g, '')]) {
            isValidDayForCourse = timetableData[cleanCourseName.replace(/\s/g, '')].includes(dayOfWeek);
        }
    }

    if (!isValidDayForCourse) {
        tbody.innerHTML = `<tr><td colspan="2" style="text-align:center; padding:30px; color:#ef4444; font-weight:bold;">해당 요일은 '${activeCourse}' 과정의 수업 요일이 아닙니다.<br><span style="font-size:0.9rem; font-weight:normal; color:#94a3b8; display:block; margin-top:8px;">(전체 과정 수업 요일 설정 확인)</span></td></tr>`;
        updateStats();
        return;
    }
    // -------------------------------------------------------------------------

    const includeInactive = document.getElementById('includeInactive').checked;
    let membersToRender = groupedCourses[activeCourse];

    if (!includeInactive) {
        membersToRender = membersToRender.filter(m => m.status !== 'trash' && m.status !== 'completed');
    }

    document.getElementById('totalStudentsCount').textContent = `총원 ${membersToRender.length}명`;

    // Sort by name
    membersToRender.sort((a, b) => a.name.localeCompare(b.name, 'ko'));

    // Initialize from DB or preserve local changes
    membersToRender.forEach(m => {
        if (currentAttendanceState[m.id] === undefined) {
            const dbRecord = attendanceData.find(a => {
                if (String(a.memberId) !== String(m.id)) return false;
                if (a.date !== currentDate) return false; // MUST match current date!
                if (!a.course) return true; // Global logs are always included
                const aCourseClean = a.course.replace(/\([^)]*\)/g, '').trim();
                const activeCourseClean = activeCourse.replace(/\([^)]*\)/g, '').trim();
                const aCoursesList = aCourseClean.split(',').map(c => c.trim());
                return aCoursesList.includes(activeCourseClean);
            });
            let st = dbRecord ? dbRecord.status : null; // null means 'unset'
            let memo = '';
            if (st && typeof st === 'string' && st.includes('|')) {
                let parts = st.split('|');
                st = parts[0];
                memo = parts[1];
            }
            currentMemoState[m.id] = memo;
            
            if (st) {
                if (['10', '12', '2', '3', '5', '7', '9', 10, 12, 2, 3, 5, 7, 9, '출석', 'present'].includes(st) || (typeof st === 'string' && st.includes('출석'))) st = 'present';
                else if (st === 'X' || st === '결석' || st === 'absent' || (typeof st === 'string' && (st.startsWith('X') || st.includes('결석')))) st = 'absent';
                else if (st === '연' || st === 'extension' || (typeof st === 'string' && st.includes('연장'))) st = 'extension';
                else if (st === '지각' || st === 'late') st = 'late';
                else if (st === '조퇴' || st === 'early') st = 'early';
                else if (st === '[' || st === '첫출석' || st === '진입출석' || st === 'entry') st = 'entry';
                else if (st === ']' || st === '종료출석' || st === '마감출석' || st === 'exit') st = 'exit';
            }
            
            currentAttendanceState[m.id] = st;
        }
    });

    membersToRender.forEach(m => {
        const tr = document.createElement('tr');

        // Student Cell
        const tdStudent = document.createElement('td');
        tdStudent.style.borderRight = '1px solid #e2e8f0';
        tdStudent.innerHTML = `
            <div class="student-cell">
                <span>${m.name}</span>
                <button class="edit-btn" onclick="alert('학생 정보 수정 (추후 연결)')"><i class="material-icons">edit</i></button>
            </div>
        `;

        // Actions Cell
        const tdActions = document.createElement('td');
        const st = currentAttendanceState[m.id];
        const memo = currentMemoState[m.id] || '';
        const memoHtml = (st === 'absent' && memo) ? `<span style="font-size: 0.8rem; color: #ef4444; margin-left: 8px;">📝 ${memo}</span>` : '';
        tdActions.innerHTML = `
            <div class="status-btn-group">
                <button class="status-btn ${st === 'entry' ? 'active' : ''}" data-type="entry" style="${st === 'entry' ? 'background:#3b82f6;color:white;border-color:#3b82f6;' : ''}" onclick="setStatus(${m.id}, 'entry', this)">첫출석</button>
                <button class="status-btn ${st === 'present' ? 'active' : ''}" data-type="present" onclick="setStatus(${m.id}, 'present', this)">출석</button>
                <button class="status-btn ${st === 'absent' ? 'active' : ''}" data-type="absent" onclick="setStatus(${m.id}, 'absent', this)">결석</button>
                <button class="status-btn ${st === 'late' ? 'active' : ''}" data-type="late" onclick="setStatus(${m.id}, 'late', this)">지각</button>
                <button class="status-btn ${st === 'early' ? 'active' : ''}" data-type="early" onclick="setStatus(${m.id}, 'early', this)">조퇴</button>
                <button class="status-btn ${st === 'extension' ? 'active' : ''}" data-type="extension" onclick="setStatus(${m.id}, 'extension', this)">연장</button>
                <button class="status-btn ${st === 'exit' ? 'active' : ''}" data-type="exit" style="${st === 'exit' ? 'background:#6366f1;color:white;border-color:#6366f1;' : ''}" onclick="setStatus(${m.id}, 'exit', this)">종료출석</button>
                ${memoHtml}
            </div>
        `;

        tr.appendChild(tdStudent);
        tr.appendChild(tdActions);
        tbody.appendChild(tr);
    });

    updateStats();
}

window.setStatus = async function (memberId, statusType, btnElement) {
    const tr = btnElement.closest('tr');

    let finalStatus = statusType;
    if (currentAttendanceState[memberId] === statusType) {
        currentAttendanceState[memberId] = null;
        currentMemoState[memberId] = '';
        finalStatus = 'unchecked';
    } else {
        if (statusType === 'absent') {
            let currentMemo = currentMemoState[memberId] || '';
            let memo = prompt("결석 사유를 입력하세요 (선택사항):", currentMemo);
            if (memo !== null) {
                currentMemoState[memberId] = memo.trim();
            } else {
                return; // Cancelled
            }
        } else {
            currentMemoState[memberId] = '';
        }
        
        tr.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
        btnElement.classList.add('active');
        if (statusType === 'entry') {
            btnElement.style.background = '#3b82f6';
            btnElement.style.color = 'white';
            btnElement.style.borderColor = '#3b82f6';
        } else if (statusType === 'exit') {
            btnElement.style.background = '#6366f1';
            btnElement.style.color = 'white';
            btnElement.style.borderColor = '#6366f1';
        }
        currentAttendanceState[memberId] = statusType;
    }

    updateStats();

    // Auto-save silently in the background
    try {
        // Map back to display codes for saving if needed, but the server just stores the string
        let savedStatus = finalStatus;
        if (finalStatus === 'entry') savedStatus = '[';
        if (finalStatus === 'exit') savedStatus = ']';

        await fetch(getFetchUrl('attendance', true), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                memberId: memberId,
                date: currentDate,
                status: savedStatus,
                course: activeCourse
            })
        });

        // Update local array so it survives re-renders
        const idx = attendanceData.findIndex(a => String(a.memberId) === String(memberId) && a.date === currentDate && (a.course === activeCourse || (!a.course && !activeCourse)));

        if (idx > -1) {
            if (finalStatus === 'unchecked') attendanceData.splice(idx, 1);
            else attendanceData[idx].status = savedStatus;
        } else {
            if (finalStatus !== 'unchecked') attendanceData.push({ memberId: memberId, date: currentDate, status: savedStatus, course: activeCourse });
        }

        // Notify Monthly sheet to sync automatically
        localStorage.setItem('sejong_attendance_sync', Date.now().toString());
    } catch (err) {
        console.error('Failed auto-save:', err);
    }
};

window.changeDate = function (offset) {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + offset);
    currentDate = d.toISOString().split('T')[0];
    document.getElementById('attendanceDate').value = currentDate;
    localStorage.setItem('sejong_daily_date', currentDate);

    // Clear temporary state on date change and fetch DB
    currentAttendanceState = {};
    currentMemoState = {};
    fetchAttendance();
};

window.markAllPresent = function () {
    const tbody = document.getElementById('attendanceTbody');
    if (!tbody || tbody.children.length === 0 || !activeCourse) return;

    let membersToRender = groupedCourses[activeCourse];
    const includeInactive = document.getElementById('includeInactive').checked;
    if (!includeInactive) {
        membersToRender = membersToRender.filter(m => m.status !== 'trash' && m.status !== 'completed');
    }

    membersToRender.forEach(m => {
        // Only mark present if they don't already have a status
        if (!currentAttendanceState[m.id]) {
            currentAttendanceState[m.id] = 'present';
        }
    });

    renderAttendanceTbody(); // Re-render to show active buttons
};

function updateStats() {
    const stats = { present: 0, absent: 0, late: 0, early: 0, extension: 0, entry: 0, exit: 0 };

    if (activeCourse && groupedCourses[activeCourse]) {
        let membersToRender = groupedCourses[activeCourse];
        const includeInactive = document.getElementById('includeInactive').checked;
        if (!includeInactive) {
            membersToRender = membersToRender.filter(m => m.status !== 'trash' && m.status !== 'completed');
        }

        membersToRender.forEach(m => {
            const st = currentAttendanceState[m.id];
            if (st && stats[st] !== undefined) {
                stats[st]++;
            }
        });
    }

    if(document.getElementById('statEntry')) document.getElementById('statEntry').textContent = stats.entry;
    if(document.getElementById('statExit')) document.getElementById('statExit').textContent = stats.exit;
    document.getElementById('statPresent').textContent = stats.present;
    document.getElementById('statAbsent').textContent = stats.absent;
    document.getElementById('statLate').textContent = stats.late;
    document.getElementById('statEarly').textContent = stats.early;
    document.getElementById('statExtension').textContent = stats.extension;
}

window.saveDailyAttendance = async function () {
    const sendSms = document.getElementById('sendSmsOnSave').checked;

    if (!activeCourse) {
        alert('선택된 반이 없습니다.');
        return;
    }

    let membersToRender = groupedCourses[activeCourse];
    const includeInactive = document.getElementById('includeInactive').checked;
    if (!includeInactive) {
        membersToRender = membersToRender.filter(m => m.status !== 'trash' && m.status !== 'completed');
    }

    let savedCount = 0;

    try {
        // Prepare promises for all members in the current active course
        const promises = membersToRender.map(m => {
            let st = currentAttendanceState[m.id] === null ? 'unchecked' : currentAttendanceState[m.id];

            // [New] Automatically map 'present' to numeric hour if course time matches known slots (10, 12, 14, 15, 17, 19, 21)
            // This ensures numeric indicators (5, 7, etc.) show up in the Monthly Sheet automatically.
            if (st === 'present' && activeCourse) {
                const hourMatch = String(activeCourse).match(/\((10|12|14|15|17|19|21):00\)/);
                if (hourMatch) {
                    const h = hourMatch[1];
                    const hourMap = { '10': '10', '12': '12', '14': '2', '15': '3', '17': '5', '19': '7', '21': '9' };
                    if (hourMap[h]) st = hourMap[h];
                }
            } else if (st === 'entry') {
                st = '[';
            } else if (st === 'exit') {
                st = ']';
            }

            savedCount += (st !== 'unchecked' ? 1 : 0);

            return fetch(getFetchUrl('attendance', true), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    memberId: m.id,
                    date: currentDate,
                    status: st,
                    course: activeCourse
                })
            });
        });

        await Promise.all(promises);

        let msg = `[${currentDate}] ${activeCourse} 출석부 저장 완료.\n총 ${savedCount}건 기록됨.`;
        if (sendSms && savedCount > 0) {
            msg += `\n\n해당 학부모에게 출결 문자가 발송됩니다.`;
        }
        alert(msg);

        // Notify other tabs
        localStorage.setItem('sejong_attendance_sync', Date.now().toString());

        // Refresh from DB naturally
        await fetchAttendance();

    } catch (err) {
        console.error(err);
        alert('저장 중 오류가 발생했습니다.');
    }
};

window.sendDismissalSms = function () {
    const count = Object.values(currentAttendanceState).filter(st => st === 'present' || st === 'late').length;
    if (count === 0) {
        alert('오늘 출석/지각 처리된 학생이 없습니다.');
        return;
    }
    if (confirm(`출석/지각 처리된 ${count}명의 학부모에게 하원 문자를 발송하시겠습니까?`)) {
        alert('하원 문자가 전송되었습니다.');
    }
};

window.addEventListener('storage', async (e) => {
    if (e.key === 'sejong_attendance_sync') {
        currentAttendanceState = {};
    currentMemoState = {};
        await fetchAttendance();
    }
});

// 백그라운드 실행 (제거됨 - setInterval에서 처리)

