const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:8000/api' : '/api/sejong';

let allMembers = [];
let groupedCourses = {};
let activeCourse = '';
let currentDate = new Date().toISOString().split('T')[0];

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('attendanceDate').value = currentDate;
    document.getElementById('attendanceDate').addEventListener('change', (e) => {
        currentDate = e.target.value;
        const cDateObj = new Date(currentDate);
        if (isNaN(cDateObj.getTime())) {
            currentDate = new Date().toISOString().split('T')[0];
            e.target.value = currentDate;
        }
        renderAttendanceTbody();
    });

    document.getElementById('includeInactive').addEventListener('change', renderCourseList);

    fetchMembers();
});

let attendanceData = [];

async function fetchMembers() {
    try {
        const [resMembers, resAttendance] = await Promise.all([
            fetch(`${API_BASE}/members`),
            fetch(`${API_BASE}/attendance?date=${currentDate}`)
        ]);
        allMembers = await resMembers.json();
        attendanceData = await resAttendance.json();
        processCourses();
        renderCourseList();
    } catch (err) {
        console.error('Failed to fetch data:', err);
    }
}

async function fetchAttendance() {
    try {
        const res = await fetch(`${API_BASE}/attendance?date=${currentDate}`);
        attendanceData = await res.json();
        renderAttendanceTbody();
    } catch (err) {
        console.error('Failed to fetch attendance:', err);
    }
}

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

    courseNames.forEach(cName => {
        let membersInCourse = groupedCourses[cName];
        if (!includeInactive) {
            membersInCourse = membersInCourse.filter(m => m.status !== 'trash' && m.status !== 'delete');
        }

        if (membersInCourse.length === 0) return;

        if (cName === activeCourse) activeCourseHasMembers = true;

        const cDiv = document.createElement('div');
        cDiv.className = `course-item ${cName === activeCourse ? 'active' : ''}`;
        cDiv.innerHTML = `<span>${cName}</span><i class="material-icons" style="font-size:1rem;">chevron_right</i>`;

        cDiv.onclick = () => {
            activeCourse = cName;
            renderCourseList(); // Re-render to update active styling
            renderAttendanceTbody(); // Re-render table
        };

        listDiv.appendChild(cDiv);
    });

    // If the active course became empty due to filtering, switch to the first available
    if (!activeCourseHasMembers && listDiv.children.length > 0) {
        activeCourse = listDiv.children[0].querySelector('span').textContent;
        listDiv.children[0].classList.add('active');
        renderAttendanceTbody();
    } else if (listDiv.children.length === 0) {
        activeCourse = '';
        renderAttendanceTbody();
    } else {
        renderAttendanceTbody(); // Initial render for active course
    }

    document.getElementById('courseCount').textContent = `${listDiv.children.length}개`;
}

// Temporary store for UI changes before saving
let currentAttendanceState = {}; // { memberId: 'present'|'absent'... }

function renderAttendanceTbody() {
    const tbody = document.getElementById('attendanceTbody');
    tbody.innerHTML = '';

    document.getElementById('totalStudentsCount').textContent = `총원 0명`;

    if (!activeCourse || !groupedCourses[activeCourse]) {
        tbody.innerHTML = '<tr><td colspan="2" style="text-align:center; padding:30px; color:#94a3b8;">선택된 반이 없거나 멤버가 없습니다.</td></tr>';
        updateStats();
        return;
    }

    const includeInactive = document.getElementById('includeInactive').checked;
    let membersToRender = groupedCourses[activeCourse];

    if (!includeInactive) {
        membersToRender = membersToRender.filter(m => m.status !== 'trash' && m.status !== 'delete');
    }

    document.getElementById('totalStudentsCount').textContent = `총원 ${membersToRender.length}명`;

    // Sort by name
    membersToRender.sort((a, b) => a.name.localeCompare(b.name, 'ko'));

    // Initialize from DB or preserve local changes
    membersToRender.forEach(m => {
        if (currentAttendanceState[m.id] === undefined) {
            const dbRecord = attendanceData.find(a => String(a.memberId) === String(m.id) && a.course === activeCourse);
            currentAttendanceState[m.id] = dbRecord ? dbRecord.status : null; // null means 'unset'
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
        tdActions.innerHTML = `
            <div class="status-btn-group">
                <button class="status-btn ${st === 'present' ? 'active' : ''}" data-type="present" onclick="setStatus(${m.id}, 'present', this)">출석</button>
                <button class="status-btn ${st === 'absent' ? 'active' : ''}" data-type="absent" onclick="setStatus(${m.id}, 'absent', this)">결석</button>
                <button class="status-btn ${st === 'late' ? 'active' : ''}" data-type="late" onclick="setStatus(${m.id}, 'late', this)">지각</button>
                <button class="status-btn ${st === 'early' ? 'active' : ''}" data-type="early" onclick="setStatus(${m.id}, 'early', this)">조퇴</button>
                <button class="status-btn ${st === 'makeup' ? 'active' : ''}" data-type="makeup" onclick="setStatus(${m.id}, 'makeup', this)">보강</button>
            </div>
        `;

        tr.appendChild(tdStudent);
        tr.appendChild(tdActions);
        tbody.appendChild(tr);
    });

    updateStats();
}

// Ensure the functions are available globally for onclick attributes
window.setStatus = function (memberId, statusType, btnElement) {
    const tr = btnElement.closest('tr');
    tr.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));

    // If clicking the already active button, toggle it off (set to null)
    if (currentAttendanceState[memberId] === statusType) {
        currentAttendanceState[memberId] = null;
    } else {
        btnElement.classList.add('active');
        currentAttendanceState[memberId] = statusType;
    }

    updateStats();
};

window.changeDate = function (offset) {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + offset);
    currentDate = d.toISOString().split('T')[0];
    document.getElementById('attendanceDate').value = currentDate;

    // Clear temporary state on date change and fetch DB
    currentAttendanceState = {};
    fetchAttendance();
};

window.markAllPresent = function () {
    const tbody = document.getElementById('attendanceTbody');
    if (!tbody || tbody.children.length === 0 || !activeCourse) return;

    let membersToRender = groupedCourses[activeCourse];
    const includeInactive = document.getElementById('includeInactive').checked;
    if (!includeInactive) {
        membersToRender = membersToRender.filter(m => m.status !== 'trash' && m.status !== 'delete');
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
    const stats = { present: 0, absent: 0, late: 0, early: 0, makeup: 0 };

    if (activeCourse && groupedCourses[activeCourse]) {
        let membersToRender = groupedCourses[activeCourse];
        const includeInactive = document.getElementById('includeInactive').checked;
        if (!includeInactive) {
            membersToRender = membersToRender.filter(m => m.status !== 'trash' && m.status !== 'delete');
        }

        membersToRender.forEach(m => {
            const st = currentAttendanceState[m.id];
            if (st && stats[st] !== undefined) {
                stats[st]++;
            }
        });
    }

    document.getElementById('statPresent').textContent = stats.present;
    document.getElementById('statAbsent').textContent = stats.absent;
    document.getElementById('statLate').textContent = stats.late;
    document.getElementById('statEarly').textContent = stats.early;
    document.getElementById('statMakeup').textContent = stats.makeup;
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
        membersToRender = membersToRender.filter(m => m.status !== 'trash' && m.status !== 'delete');
    }

    let savedCount = 0;

    try {
        // Prepare promises for all members in the current active course
        const promises = membersToRender.map(m => {
            const st = currentAttendanceState[m.id] === null ? 'unchecked' : currentAttendanceState[m.id];

            savedCount += (st !== 'unchecked' ? 1 : 0);

            return fetch(`${API_BASE}/attendance`, {
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
