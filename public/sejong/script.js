const API_BASE = '/api/sejong';



// Control Test: Fetch a static file to check server reachability
fetch(`${window.location.origin}/sejong/questions_data.js?v=${Date.now()}`)
    .then(res => {

    })
    .catch(err => {

    });

// Daum Postcode Search Function
function execDaumPostcode(targetId, detailId) {
    new daum.Postcode({
        oncomplete: function (data) {
            // R: Road address, J: Jibun address
            let addr = '';
            if (data.userSelectedType === 'R') {
                addr = data.roadAddress;
            } else {
                addr = data.jibunAddress;
            }

            // Fill the target input
            document.getElementById(targetId).value = addr;

            // Focus detail address input
            if (detailId) {
                document.getElementById(detailId).focus();
            }
        }
    }).open();
}

// State
let currentDate = new Date().toISOString().split('T')[0];
let members = [];
let attendanceLogs = [];
let currentFilter = 'all';

// DOM Elements
let currentDateEl;
let memberListEl;
let totalMembersEl;
let presentCountEl;

// Function to format date to YYYY.MM.DD
function formatDateDisplay(dateStr) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

// Init
document.addEventListener('DOMContentLoaded', () => {

    // Determine page & Init elements
    currentDateEl = document.getElementById('currentDate');
    memberListEl = document.getElementById('memberList');
    totalMembersEl = document.getElementById('totalMembers');
    presentCountEl = document.getElementById('presentCount');

    console.log('DOMContentLoaded: memberListEl found?', !!memberListEl);


    if (memberListEl) initDashboard();

    // Filter logic
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderMembers();
            // Don't update summary for filter, usually summary shows total potential. 
            // Or should it? Let's refresh summary based on visible? 
            // Let's keep summary total but filter list.
        });
    });

    // Register page logic
    const regForm = document.getElementById('regForm');
    if (regForm) {
        regForm.addEventListener('submit', handleRegister);

        // Explicit listener for member type toggle
        const typeSelect = document.getElementById('type');
        if (typeSelect) {
            typeSelect.addEventListener('change', window.toggleMemberType);
        }
    }

    // Auto-formatting inputs
    setupAutoFormatting();

    // Register Modal Logic
    const registerModal = document.getElementById('registerModal');
    const btnOpenRegister = document.getElementById('btnOpenRegister');
    const btnCloseRegister = document.getElementById('btnCloseRegister');
    const modalRegForm = document.getElementById('modalRegForm');

    if (btnOpenRegister) {
        btnOpenRegister.addEventListener('click', () => {
            if (registerModal) registerModal.style.display = 'flex';
        });
    }

    if (btnCloseRegister) {
        btnCloseRegister.addEventListener('click', () => {
            if (registerModal) {
                registerModal.style.display = 'none';
                registerModal.classList.add('hidden');
            }
        });
    }

    if (modalRegForm) {
        modalRegForm.addEventListener('submit', handleModalRegister);
    }

    // Modal close on outside click
    if (registerModal) {
        window.addEventListener('click', (e) => {
            if (e.target == registerModal) {
                registerModal.style.display = 'none';
            }
        });
    }

    // Date navigation
    document.getElementById('prevDate')?.addEventListener('click', () => changeDate(-1));
    document.getElementById('nextDate')?.addEventListener('click', () => changeDate(1));

    // Search Input Listener
    const searchInput = document.getElementById('memberSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            window.memberSearchTerm = e.target.value.trim().toLowerCase();
            renderMembers();
        });
    }
    // --- Responsive Sidebar Logic ---
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) {
        overlay.addEventListener('click', toggleSidebar);
    }

    // Close sidebar when clicking a nav item on mobile
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                toggleSidebar();
            }
        });
    });
});

// Global Sidebar Toggle Function
window.toggleSidebar = function () {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
};

// Global search term
window.memberSearchTerm = '';

// New Function: handleModalRegister
async function handleModalRegister(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());

    // Course handling for Modal checkboxes
    const checkboxes = e.target.querySelectorAll('input[name="course_select"]:checked');
    let courses = Array.from(checkboxes).map(cb => cb.value);

    // --- Automatic Merging Exception Logic ---
    if (courses.includes('제과기능사') && courses.includes('제빵기능사')) {
        courses = courses.filter(c => c !== '제과기능사' && c !== '제빵기능사');
        courses.push('제과제빵기능사');
    }
    // ------------------------------------------

    data.course = courses.join(', ');

    // Basic Validation
    if (!data.name) return alert;

    try {
        const res = await fetch(`${API_BASE}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        if (json.success) {
            alert("등록되었습니다.");
            const modal = document.getElementById('registerModal');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.add('hidden');
            }
            e.target.reset();
            // Refresh data
            fetchData().then(() => {
                renderMembers();
                updateSummary();
            });
        } else {
            alert("등록 실패");
        }
    } catch (err) {
        alert("통신 오류");
    }
}

function changeDate(delta) {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + delta);
    currentDate = d.toISOString().split('T')[0];
    initDashboard();
}

async function initDashboard() {

    updateDateDisplay();
    await fetchData();
    renderMembers();
    updateSummary();

}

function updateDateDisplay() {
    if (currentDateEl) currentDateEl.textContent = formatDateDisplay(currentDate);
}

async function fetchData() {
    try {

        console.log('Fetching data from API:', API_BASE);

        // Fetch Members
        let mRes;
        try {
            mRes = await fetch(`${API_BASE}/members`, { cache: 'no-store' });
            if (!mRes.ok) throw new Error(`Status ${mRes.status}`);

        } catch (mErr) {

            throw mErr; // Re-throw to stop
        }

        // Fetch Attendance
        let aRes;
        try {
            aRes = await fetch(`${API_BASE}/attendance?date=${currentDate}`, { cache: 'no-store' });
            if (!aRes.ok) throw new Error(`Status ${aRes.status}`);

        } catch (aErr) {

            // Don't throw, maybe we can render members without attendance?
            // But current logic expects both. Let's throw for now to keep behavior consistent but known.
            throw aErr;
        }

        members = await mRes.json();
        attendanceLogs = await aRes.json();
        console.log('Fetch success: ', members.length, 'members');


        // Removed Debug Banner

    } catch (e) {
        console.error('Failed to fetch data', e);

        if (memberListEl) {
            memberListEl.innerHTML = `<div style="text-align:center; padding:20px; color:red;">데이터 로드 실패: ${e.message}</div>`;
        }
    }
}

function getStatus(memberId) {
    const log = attendanceLogs.find(l => l.memberId === memberId);
    return log ? log.status : 'unchecked';
}

function renderMembers_OLD() {
    memberListEl.innerHTML = '';

    let displayMembers = members;
    if (currentFilter !== 'all') {
        // Support multi-value course string "A,B"
        displayMembers = members.filter(m => m.course && m.course.includes(currentFilter));
    }

    if (displayMembers.length === 0) {
        memberListEl.innerHTML = '<div style="text-align:center; padding:20px; color:#888;">표시할 회원이 없습니다.</div>';
        return;
    }

    // Create Table Structure for Ledger View
    const table = document.createElement('table');
    table.className = 'ledger-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th rowspan="2">성명</th>
                <th rowspan="2">주민등록번호</th>
                <th rowspan="2">주소</th>
                <th colspan="3">연락처</th>
                <th rowspan="2">수강<br>시작일</th>
                <th rowspan="2">비고<br></th>
                <th rowspan="2">상태</th>
            </tr>
            <tr>
                <th>본인</th>
                <th>자택</th>
                <th>보호자</th>
            </tr>
        </thead>
        <tbody id="ledgerBody"></tbody>
    `;

    const tbody = table.querySelector('tbody');

    displayMembers.forEach(member => {
        // Enrollment Status: taking, completed, retaking, delete
        // If undefined, default to 'taking'
        const status = member.status || 'taking';
        const statusText = {
            'taking': '수강',
            'completed': '수료',
            'retaking': '재수강',
            'delete': '삭제'
        }[status] || '수강';

        const statusClass = {
            'taking': 'status-taking',
            'completed': 'status-completed',
            'retaking': 'status-retaking',
            'delete': 'status-delete'
        }[status] || 'status-taking';

        // Remarks: School or Job (No Course)
        let remarks = '';
        if (member.type === 'student') {
            const schoolName = member.school || '';
            const schoolLevel = member.school_level ? `(${member.school_level})` : '';
            const grade = member.grade ? `${member.grade}학년` : '';
            remarks = `${schoolName} ${grade}`.trim();
        } else if (member.type === 'general') {
            remarks = member.job || '';
        } else {
            // Fallback for legacy data or unspecified type
            remarks = member.school || member.job || '';
        }
        // If simple note exists, maybe append? (member.notes) - user asked for School/Course mainly in remarks col.

        const tr = document.createElement('tr');
        // Add click event to open edit modal (except when clicking status select or buttons)
        tr.onclick = (e) => {
            // Prevent triggering when clicking interactive elements
            if (e.target.tagName === 'SELECT' || e.target.tagName === 'BUTTON' || e.target.closest('select') || e.target.closest('button')) {
                return;
            }

            // User requested confirmation before editing
            if (confirm(`${member.name} 학생의 정보를 수정하시겠습니까?`)) {
                openEditModal(member.id);
            }
        };

        // Status Select Options
        const statuses = [
            { val: 'taking', text: '수강중' },
            { val: 'completed', text: '수료' },
            { val: 'retaking', text: '재수강' },
            { val: 'hold', text: '보류' },
            { val: 'trash', text: '휴지통' }
        ];

        const optionsHtml = statuses.map(s =>
            `<option value="${s.val}" ${status === s.val ? 'selected' : ''}>${s.text}</option>`
        ).join('');

        tr.innerHTML = `
            <td>${member.name}</td>
            <td>${member.resident_num || ''}</td>
            <td>${member.address || ''} ${member.address_detail || ''}</td>
            <td>${member.phone || ''}</td>
            <td>${member.phone_guardian || ''}</td>
            <td>${member.course || ''}</td>
            <td>${member.start_date || ''}</td>
            <td>${remarks}</td>
            <td onclick="event.stopPropagation()">
                <select class="status-select ${statusClass}" onchange="handleStatusChange(event, '${member.id}')">
                    ${optionsHtml}
                </select>
            </td>
        `;

        // Style the select based on selected value (initial)
        const selectEl = tr.querySelector('.status-select');
        selectEl.dataset.prev = status; // Store previous value for revert

        tbody.appendChild(tr);
    });

    memberListEl.appendChild(table);
}

// Edit Student Logic
const editModal = document.getElementById('editStudentModal');
const editForm = document.getElementById('editStudentForm');
const editRemarkType = document.getElementById('edit_remark_type');

if (editForm) {
    editForm.addEventListener('submit', handleEditSubmit);
}

// Remarks Type Toggle Logic
if (editRemarkType) {
    editRemarkType.addEventListener('change', function () {
        const val = this.value;
        const studentInputs = document.getElementById('edit_student_inputs');
        const generalInputs = document.getElementById('edit_general_inputs');

        if (studentInputs) {
            if (val === 'student') {
                studentInputs.style.display = 'flex';
                studentInputs.classList.remove('hidden');
            } else {
                studentInputs.style.display = 'none';
                studentInputs.classList.add('hidden');
            }
        }
        if (generalInputs) {
            if (val === 'general') {
                generalInputs.style.display = 'block';
                generalInputs.classList.remove('hidden');
            } else {
                generalInputs.style.display = 'none';
                generalInputs.classList.add('hidden');
            }
        }
    });
}

// Helper to add course input
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

function openEditModal(memberId) {
    const member = members.find(m => m.id === memberId);
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
        // editForm.course.value = member.course || ''; // Removed single input
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
    const existingMember = members.find(m => m.id === data.id);
    let finalData = data;

    if (existingMember) {
        // Merge: form data takes precedence
        finalData = { ...existingMember, ...data };
    }
    // ------------------------------------------

    try {
        const res = await fetch(`${API_BASE}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalData)
        });
        const json = await res.json();

        if (json.success) {
            alert("수정되었습니다.");
            closeEditModal();
            fetchData().then(() => {
                renderMembers();
            });
        } else {
            alert("저장 오류");
        }
    } catch (err) {
        alert("통신 오류");
    }
}

// Edit Confirmation Modal Logic
let targetMemberIdForEdit = null;

function openEditConfirmModal(memberId) {
    const modal = document.getElementById('editConfirmModal');
    targetMemberIdForEdit = memberId;
    if (modal) {
        // Find member to show name
        const member = members.find(m => m.id === memberId);
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

if (document.getElementById('editConfirmYesBtn')) {
    document.getElementById('editConfirmYesBtn').addEventListener('click', function () {
        if (targetMemberIdForEdit) {
            openEditModal(targetMemberIdForEdit);
            closeEditConfirmModal();
        }
    });
}


function updateSummary() {
    if (totalMembersEl) {
        // Exclude 'completed' (Archive) and 'trash'/'delete' (Trash) from total count
        const activeMembers = members.filter(m => m.status !== 'completed' && m.status !== 'trash' && m.status !== 'delete');
        totalMembersEl.textContent = activeMembers.length;
    }
    if (presentCountEl) presentCountEl.textContent = attendanceLogs.filter(l => l.status === 'present').length;
}

async function handleStatusChange_OLD(e, memberId) {
    const selectEl = e.target;
    const newStatus = selectEl.value;
    const prevStatus = selectEl.dataset.prev;
    const member = members.find(m => m.id === memberId);

    if (!member) {
        alert("수강생 정보를 찾을 수 없습니다.");
        return;
    }

    // Logic per user request
    if (newStatus === 'hold') { // 1. 보류
        const reason = prompt("보류 사유를 입력하세요:");
        if (reason) {
            // Save reason to notes (append or replace?) - Let's append with date
            const dateStr = new Date().toLocaleDateString();
            member.notes = (member.notes || '') + `\n ${reason}`;
            // Proceed to update status
        } else {
            // Cancel -> Revert
            selectEl.value = prevStatus;
            return;
        }
    }
    else if (newStatus === 'completed') { // 2. 수료
        if (confirm("수료 처리하시겠습니까?")) {
            // Confirm -> Completed (Archive) -> Proceed
        } else {
            // Cancel -> Delete Status
            selectEl.value = 'delete';
            // Trigger change event manually or call recursive? 
            // Better to just set member status directly to 'delete' and save?
            // User said "move to Delete text". It implies changing status to 'delete'.
            // Let's just proceed with 'delete' update.
            member.status = 'delete';
            return updateMemberStatus(member, 'delete');
        }
    }
    else if (newStatus === 'delete') { // 3. 삭제
        if (confirm("정말 삭제하시겠습니까? (복구 불가)")) {
            // Confirm -> Delete Data API
            try {
                await fetch(`${API_BASE}/members?id=${member.id}`, { method: 'DELETE' });
                alert("삭제되었습니다.");
                await fetchData();
                renderMembers();
                updateSummary();
                return;
            } catch (err) {
                alert("삭제 처리 중 오류 발생");
                selectEl.value = prevStatus;
                return;
            }
        } else {
            // Cancel -> Taking Status
            selectEl.value = 'taking';
            member.status = 'taking';
            return updateMemberStatus(member, 'taking');
        }
    }

    // Default Update (Taking, Retaking, Hold-confirmed, Completed-confirmed)
    updateMemberStatus(member, newStatus);
}

async function updateMemberStatus_OLD(member, status) {
    member.status = status;
    try {
        await fetch(`${API_BASE}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(member)
        });
        // Refresh to update UI properly (color classes etc)
        renderMembers();
        await fetchData();
        updateSummary();
    } catch (e) {
        console.error('Failed to update status', e);
        alert("상태 업데이트 실패");
        renderMembers(); // Revert UI
    }
}

// Registration
// Registration
async function handleRegister(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());

    // Unified Course + Time Handling
    // [FIX] Updated selector to match new HTML (.course-item)
    const courseUnits = document.querySelectorAll('.course-item');
    const selectedCourses = [];
    const selectedTimes = [];
    let hasSelectedCourse = false;
    let validTimeSelection = true;

    courseUnits.forEach(unit => {
        const checkbox = unit.querySelector('input[name="course_select"]');
        const timeSelect = unit.querySelector('select[name="time_select"]');

        if (checkbox && checkbox.checked) {
            hasSelectedCourse = true;
            const timeVal = timeSelect.value;

            if (!timeVal) {
                validTimeSelection = false;
            }

            const courseName = checkbox.value;
            selectedCourses.push({ name: courseName, time: timeVal });
            selectedTimes.push(timeVal);
        }
    });

    if (!hasSelectedCourse) {
        return alert("과정을 하나 이상 선택해주세요.");
    }

    if (!validTimeSelection) {
        return alert("과정의 시간을 선택해주세요.");
    }

    // --- Automatic Merging Exception Logic ---
    const jevaIdx = selectedCourses.findIndex(c => c.name === '제과기능사');
    const jepangIdx = selectedCourses.findIndex(c => c.name === '제빵기능사');

    if (jevaIdx !== -1 && jepangIdx !== -1) {
        // Both selected individualy -> Merge to 제과제빵기능사
        const jeva = selectedCourses[jevaIdx];
        const jepang = selectedCourses[jepangIdx];

        // Create merged time string
        const mergedTime = jeva.time === jepang.time ? jeva.time : `${jeva.time},${jepang.time}`;
        const newEntry = { name: '제과제빵기능사', time: mergedTime };

        // Replace both with one merged entry
        if (jevaIdx > jepangIdx) {
            selectedCourses.splice(jevaIdx, 1);
            selectedCourses.splice(jepangIdx, 1, newEntry);
        } else {
            selectedCourses.splice(jepangIdx, 1);
            selectedCourses.splice(jevaIdx, 1, newEntry);
        }
    }
    // ------------------------------------------

    data.course = selectedCourses.map(c => `${c.name}(${c.time})`).join(', ');
    data.timeSlot = selectedTimes.join(','); // Keep all selected times for filtering

    // Basic validation
    if (!data.name) return alert("이름을 입력해주세요.");

    try {
        const res = await fetch(`${API_BASE}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();

        if (json.success) {
            // UX Fix: Use custom modal instead of native confirm/alert
            const modal = document.getElementById('successModal');
            if (modal) {
                modal.style.display = 'flex';
            } else {
                // Fallback just in case
                if (confirm) {
                    window.location.href = 'index.html';
                }
            }

            // Clear form for next entry
            e.target.reset();
        } else {
            alert("등록 실패");
        }
    } catch (e) {
        alert("서버 오류");
    }
}

// ---- Auto Formatting Helpers ----
function setupAutoFormatting() {
    // Apply to both Modal Form and Standalone Page Form
    const forms = [
        document.getElementById('modalRegForm'),
        document.getElementById('regForm')
    ];

    forms.forEach(form => {
        if (form) {
            const attach = (name, handler) => {
                const el = form.querySelector(`input[name="${name}"]`);
                if (el) el.addEventListener('input', (e) => {
                    e.target.value = handler(e.target.value);
                });
            };

            attach('resident_num', formatResidentNum);
            attach('phone', formatPhoneNumber);
            attach('phone_home', formatPhoneNumber);
            attach('phone_guardian', formatPhoneNumber);
        }
    });
}

function formatResidentNum(val) {
    if (!val) return '';
    val = val.replace(/[^0-9]/g, ''); // numbers only
    if (val.length > 13) val = val.substring(0, 13);

    if (val.length < 7) return val;
    return val.substring(0, 6) + '-' + val.substring(6);
}

function formatPhoneNumber(val) {
    if (!val) return '';
    val = val.replace(/[^0-9]/g, '');
    if (val.length > 11) val = val.substring(0, 11);

    if (val.length < 4) return val;
    if (val.length < 7) {
        return val.substring(0, 3) + '-' + val.substring(3);
    }
    if (val.length < 11) {
        // 02-123-4567 or 010-123-4567
        // Simple logic for 3-3-4 or 3-4-4
        if (val.startsWith('02') && val.length < 10) {
            // 02-123-4567 (9 digits total? no 02 is 2 digits)
            // 02-xxx-xxxx = 9 digits. 
            return val.substring(0, 2) + '-' + val.substring(2, 5) + '-' + val.substring(5);
        }
        return val.substring(0, 3) + '-' + val.substring(3, 6) + '-' + val.substring(6);
    }
    // 11 digits: 010-1234-5678
    return val.substring(0, 3) + '-' + val.substring(3, 7) + '-' + val.substring(7);
}

// Global scope for onclick
window.toggleMemberType = function () {
    const type = document.getElementById('type').value;
    const studentFields = document.getElementById('student-fields');
    const generalFields = document.getElementById('general-fields');

    console.log('toggleMemberType called. Selected:', type);

    if (type === 'student') {
        if (studentFields) {
            studentFields.style.display = 'block'; // Or flex if preferred
            studentFields.classList.remove('hidden');
        }
        if (generalFields) {
            generalFields.style.display = 'none';
            generalFields.classList.add('hidden');
        }
    } else {
        if (studentFields) {
            studentFields.style.display = 'none';
            studentFields.classList.add('hidden');
        }
        if (generalFields) {
            generalFields.style.display = 'block';
            generalFields.classList.remove('hidden');
        }
    }
};
// Sidebar Toggle Logic
window.toggleNavSub = function (el) {
    const isAlreadyActive = el.classList.contains('active');
    const parentContainer = el.parentElement;

    // Close only SIBLING sub menus (keep parents open)
    Array.from(parentContainer.children).forEach(child => {
        if (child !== el && child.classList.contains('nav-category') && child.classList.contains('toggle-category')) {
            child.classList.remove('active');
            const menu = child.nextElementSibling;
            if (menu && menu.classList.contains('nav-sub-menu')) {
                menu.classList.remove('show');
            }
        }
    });

    // Toggle current one
    if (!isAlreadyActive) {
        el.classList.add('active');
        const subMenu = el.nextElementSibling;
        if (subMenu && subMenu.classList.contains('nav-sub-menu')) {
            subMenu.classList.add('show');
        }
    } else {
        // [FIX] If already active, close it
        el.classList.remove('active');
        const subMenu = el.nextElementSibling;
        if (subMenu && subMenu.classList.contains('nav-sub-menu')) {
            subMenu.classList.remove('show');
        }
    }
};

// Exam Board Logic
let examData = null;

window.loadExamView = async function (key) {
    console.log('Loading Exam View for key:', key);

    const [subject, year] = key.includes('_') ? key.split('_') : [key, ''];
    const container = document.getElementById('examBoardContainer');
    const memberSection = document.getElementById('memberListSection');
    const filterSection = document.querySelector('.filter-section');
    const courseTabs = document.querySelectorAll('.course-tabs');
    const title = document.getElementById('examBoardTitle');
    const listBody = document.getElementById('examQuestionList');

    // Safe checking for elements
    if (!container || !memberSection) {
        window.location.href = `index.html?viewExam=${key}`;
        return;
    }

    // Explicitly hide everything else
    memberSection.style.display = 'none';

    if (filterSection) {
        filterSection.style.display = 'none';
    }

    // Check for statCards (it might be defined globally or needs query)
    const statCardGrid = document.querySelector('.card-grid');
    if (statCardGrid) {
        statCardGrid.style.display = 'none';
    }

    if (courseTabs) {
        courseTabs.forEach(t => {
            t.style.display = 'none';
        });
    }

    // Show Container
    container.style.display = 'block';
    container.classList.remove('hidden');

    title.innerHTML = `
        <div class="print-header-web" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px;">
            <h1 style="font-family: 'Noto Sans KR', sans-serif; font-size: 1.8rem; font-weight: 800; margin: 0;">${year}년 ${subject} 조리/기능사 기출문제</h1>
            <div style="display: flex; gap: 10px;">
                <button onclick="window.print()" class="filter-btn" style="background-color: #00b050; color: white; font-weight: 700;">인쇄하기</button>
                <button onclick="closeExamView()" class="filter-btn">뒤로가기</button>
            </div>
        </div>
    `;

    listBody.innerHTML = '<div class="loading">문제를 불러오고 있습니다...</div>';

    // [FIX] Clear previous answer sheets if any
    const oldAnswerKeys = container.querySelectorAll('.web-answer-key-section');
    oldAnswerKeys.forEach(el => el.remove());

    try {
        // [FIX] Use global variable from questions_data.js (works with file:// protocol)
        if (!examData) {
            if (window.EXAM_DATA_DB) {
                examData = window.EXAM_DATA_DB;
            } else {
                // Fallback to fetch if needed
                const res = await fetch('questions_data.json');
                examData = await res.json();
            }
        }

        const questions = examData[key];
        if (!questions) {
            listBody.innerHTML = `<div class="error">데이터 로드 실패: ${key} 데이터가 없습니다.</div>`;
            return;
        }

        listBody.innerHTML = '';
        listBody.className = ''; // Reset class, we manage layout internally

        // Chunk questions into pages of 16
        for (let i = 0; i < questions.length; i += 16) {
            const pageChunk = questions.slice(i, i + 16);

            // Create Page Container
            const pageDiv = document.createElement('div');
            pageDiv.className = 'web-exam-page';

            // Left Column (First 8)
            const leftCol = document.createElement('div');
            leftCol.className = 'exam-col-left';
            const leftQuestions = pageChunk.slice(0, 8);

            leftQuestions.forEach((item, idx) => {
                const globalIndex = i + idx;
                const qBox = createQuestionElement(item, globalIndex);
                leftCol.appendChild(qBox);
            });

            // Right Column (Next 8)
            const rightCol = document.createElement('div');
            rightCol.className = 'exam-col-right';
            const rightQuestions = pageChunk.slice(8, 16);

            rightQuestions.forEach((item, idx) => {
                const globalIndex = i + 8 + idx;
                const qBox = createQuestionElement(item, globalIndex);
                rightCol.appendChild(qBox);
            });

            pageDiv.appendChild(leftCol);
            pageDiv.appendChild(rightCol);
            listBody.appendChild(pageDiv);
        }

        function createQuestionElement(item, index) {
            const qBox = document.createElement('div');
            qBox.className = 'pdf-q-item';

            const optionsHtml = item.o.map((opt, i) => `
                <div class="pdf-opt">
                    <span class="pdf-opt-num">${['①', '②', '③', '④'][i]}</span> ${opt}
                </div>
            `).join('');

            qBox.innerHTML = `
                <div class="pdf-q-text">
                    <span class="pdf-q-num">${index + 1}.</span> ${item.q}
                </div>
                <div class="pdf-options">${optionsHtml}</div>
            `;
            return qBox;
        }

        // Add Answer Key Section
        const answerSection = document.createElement('div');
        answerSection.className = 'web-answer-key-section';
        answerSection.style.breakBefore = 'always';
        answerSection.style.marginTop = '30px';
        answerSection.style.paddingTop = '10px';
        answerSection.style.borderTop = '2px solid #333';

        const answerHeader = document.createElement('div');
        answerHeader.className = 'pdf-answer-header';
        answerHeader.style.textAlign = 'center';
        answerHeader.style.fontWeight = '800';
        answerHeader.style.fontSize = '1.2rem';
        answerHeader.style.marginBottom = '10px';
        answerHeader.textContent = `${year}년 ${subject} 정 답 표`;

        const answerGrid = document.createElement('div');
        answerGrid.className = 'pdf-answer-grid';

        const answersHtml = questions.map((item, index) => {
            const ansChar = ['①', '②', '③', '④'][item.a - 1];
            return `
                <div class="pdf-answer-item">
                    <span class="num">${index + 1}</span>
                    <span class="ans">${ansChar}</span>
                </div>
            `;
        }).join('');

        answerGrid.innerHTML = answersHtml;
        answerSection.innerHTML = '';
        answerSection.appendChild(answerHeader);
        answerSection.appendChild(answerGrid);

        // [FIX] Append to container (outside column layout) to ensure page break works
        container.appendChild(answerSection);

    } catch (err) {
        console.error('Failed to load exam data:', err);
        listBody.innerHTML = '<div class="error">데이터 로드 실패</div>';
    }
};

window.closeExamView = function () {
    const container = document.getElementById('examBoardContainer');
    const memberSection = document.getElementById('memberListSection');
    const statCards = document.querySelector('.card-grid');
    const filterSection = document.querySelector('.filter-section');
    const courseTabs = document.querySelectorAll('.course-tabs');

    if (container) {
        container.style.display = 'none';
        container.classList.add('hidden');
    }
    if (memberSection) {
        memberSection.style.display = 'block';
        memberSection.classList.remove('hidden');
    }
    if (statCards) {
        statCards.style.display = 'grid';
        statCards.classList.remove('hidden');
    }
    if (filterSection) {
        filterSection.style.display = 'flex';
        filterSection.classList.remove('hidden');
    }

    if (courseTabs) {
        courseTabs.forEach(t => {
            t.style.display = 'block';
            if (t.classList.contains('time-tabs')) t.style.display = 'flex';
            t.classList.remove('hidden');
        });
    }
};

// Handle URL param for auto-view
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const viewYear = params.get('viewExam');
    if (viewYear) {
        setTimeout(() => loadExamView(viewYear), 500);
    }
    const filter = params.get('filter');
    if (filter === 'archive') {
        // Wait slightly for data to be loaded before switching
        setTimeout(() => loadArchive(), 500);
    }
});

// Archive View Helper
function loadArchive() {
    // Reset active buttons
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));

    currentFilter = 'archive';

    const archiveNavLink = document.getElementById('navArchive');
    if (archiveNavLink) archiveNavLink.classList.add('active');

    renderMembers();
}

// Trash View Helper
function loadTrash() {
    // Reset active buttons
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));

    currentFilter = 'trash';

    const trashNavLink = document.getElementById('navTrash');
    if (trashNavLink) trashNavLink.classList.add('active');

    renderMembers();
}

// Fixed Status Change Handler (Appended)
function openStatusModal(title, bodyHtml, actionCallback) {
    const modal = document.getElementById('statusModal');
    const modalTitle = document.getElementById('statusModalTitle');
    const modalBody = document.getElementById('statusModalBody');
    const actionBtn = document.getElementById('statusModalActionBtn');

    if (!modal || !modalTitle || !modalBody || !actionBtn) {
        console.error('Status modal elements not found');
        return;
    }

    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHtml;

    // Remove old listeners by cloning
    const newActionBtn = actionBtn.cloneNode(true);
    actionBtn.parentNode.replaceChild(newActionBtn, actionBtn);

    newActionBtn.addEventListener('click', () => {
        actionCallback();
    });

    modal.style.display = 'flex';
    modal.classList.remove('hidden');
}

function closeStatusModal() {
    const modal = document.getElementById('statusModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
    }
}

async function handleStatusChange(e, memberId) {
    const selectEl = e.target;
    const newStatus = selectEl.value;
    const prevStatus = selectEl.dataset.prev;
    const member = members.find(m => m.id === memberId);

    if (!member) {
        alert("수강생 정보를 찾을 수 없습니다.");
        return;
    }

    if (newStatus === 'hold') {
        openStatusModal(
            "보류 사유 입력",
            `<textarea id="holdReason" style="width:100%; height:100px; padding:10px; border-radius:8px; border:1px solid #ddd;" placeholder="보류 사유를 입력하세요..."></textarea>
             <button type="button" id="moveToArchiveBtn" class="btn-secondary" style="width:100%; margin-top:10px; background-color:#f0f9ff; color:#0369a1; border-color:#0369a1;">수료생 보관함으로 이동</button>`,
            () => {
                const reason = document.getElementById('holdReason').value;
                if (reason.trim()) {
                    const dateStr = new Date().toLocaleDateString();
                    member.notes = (member.notes || '') + '\n ' + reason;
                    updateMemberStatus(member, 'hold');
                    closeStatusModal();
                } else {
                    alert("사유를 입력해주세요.");
                }
            }
        );

        // Add handler for Archive button
        const archiveBtn = document.getElementById('moveToArchiveBtn');
        if (archiveBtn) {
            archiveBtn.onclick = async () => {
                const reason = document.getElementById('holdReason').value;
                if (reason.trim()) {
                    const dateStr = new Date().toLocaleDateString();
                    member.notes = (member.notes || '') + '\n ' + reason;
                }
                selectEl.value = 'completed';
                member.status = 'completed';
                await updateMemberStatus(member, 'completed');
                closeStatusModal();
                loadArchive();
            };
        }

        const cancelBtn = modal.querySelector('.btn-secondary:not(#moveToArchiveBtn)');
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                selectEl.value = prevStatus;
                closeStatusModal();
            };
        }
    }
    else if (newStatus === 'completed') {
        openStatusModal(
            "수료 처리 확인",
            `<p style="margin:0;">수료 처리하시겠습니까?</p>
             <p style="font-size:0.85rem; color:#666; margin-top:10px;">• 확인: 수료 상태로 <span style="font-weight:bold;">수료생 보관함</span>에 보관<br>• 아래 버튼: 휴지통으로 이동</p>
             <button type="button" id="moveToTrashBtn" class="btn-secondary" style="width:100%; margin-top:15px; border-color:#ef4444; color:#ef4444;">휴지통으로 이동</button>`,
            async () => {
                await updateMemberStatus(member, 'completed');
                closeStatusModal();
                loadArchive();
            }
        );

        document.getElementById('moveToTrashBtn').onclick = async () => {
            selectEl.value = 'trash';
            member.status = 'trash';
            await updateMemberStatus(member, 'trash');
            closeStatusModal();
        };

        const modal = document.getElementById('statusModal');
        if (modal) {
            const cancelBtn = modal.querySelector('.btn-secondary');
            if (cancelBtn) {
                cancelBtn.onclick = () => {
                    selectEl.value = prevStatus;
                    closeStatusModal();
                };
            }
        }
    }
    else if (newStatus === 'trash' || (newStatus === 'delete' && member.status !== 'trash')) {
        openStatusModal(
            "휴지통 이동 확인",
            `<p style="margin:0;">휴지통으로 이동하시겠습니까?</p>
             <p style="font-size:0.85rem; color:#666; margin-top:10px;">• 휴지통에서 다시 삭제하면 영구적으로 삭제됩니다.<br>• 거절하면 이전 상태가 유지됩니다.</p>`,
            async () => {
                selectEl.value = 'trash';
                member.status = 'trash';
                await updateMemberStatus(member, 'trash');
                closeStatusModal();
            }
        );
        const modal = document.getElementById('statusModal');
        if (modal) {
            const cancelBtn = modal.querySelector('.btn-secondary');
            if (cancelBtn) {
                cancelBtn.onclick = () => {
                    selectEl.value = prevStatus;
                    closeStatusModal();
                };
            }
        }
    }
    else if (newStatus === 'delete' && member.status === 'trash') {
        openStatusModal(
            "영구 삭제 확인",
            `<p style="margin:0;">정말 영구적으로 삭제하시겠습니까?</p>
             <p style="font-size:0.85rem; color:#ef4444; margin-top:10px;">⚠️ 삭제된 데이터는 절대로 복구할 수 없습니다.</p>`,
            async () => {
                try {
                    await fetch(API_BASE + '/members?id=' + member.id, { method: 'DELETE' });
                    alert("영구 삭제되었습니다.");
                    await fetchData();
                    renderMembers();
                    updateSummary();
                    closeStatusModal();
                } catch (err) {
                    alert("영구 삭제 중 오류 발생");
                    selectEl.value = prevStatus;
                    closeStatusModal();
                }
            }
        );
        const modal = document.getElementById('statusModal');
        if (modal) {
            const cancelBtn = modal.querySelector('.btn-secondary');
            if (cancelBtn) {
                cancelBtn.onclick = () => {
                    selectEl.value = prevStatus;
                    closeStatusModal();
                };
            }
        }
    } else {
        updateMemberStatus(member, newStatus);
    }
}

// Fixed Update Status Function (Appended)
async function updateMemberStatus(member, status) {
    member.status = status;
    try {
        await fetch(API_BASE + '/members', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(member)
        });
        await fetchData();
        renderMembers();
        updateSummary();
    } catch (e) {
        console.error('Failed to update status', e);
        alert("상태 업데이트 중 오류 발생");
        renderMembers();
    }
}

// Fixed Render Members (Appended)
function renderMembers() {

    try {
        console.log('Rendering members...', members.length);
        if (!memberListEl) {
            console.error('memberListEl is missing in renderMembers');

            return;
        }
        memberListEl.innerHTML = '';

        let displayMembers = members;

        // 1. Filter by Status (Archive vs Trash vs Active)
        if (currentFilter === 'archive') {
            // Show ONLY completed
            displayMembers = members.filter(m => m.status === 'completed');
            if (document.getElementById('pageTitle')) document.getElementById('pageTitle').textContent = '수 료 생 목 록';
        } else if (currentFilter === 'trash') {
            // Show ONLY trash
            displayMembers = members.filter(m => m.status === 'trash');
            if (document.getElementById('pageTitle')) document.getElementById('pageTitle').textContent = '휴 지 통';
        } else {
            // Show Active (exclude completed/trash/delete)
            displayMembers = members.filter(m => m.status !== 'completed' && m.status !== 'trash' && m.status !== 'delete');

            // Dynamic Title based on course filter
            let title = '수 강 생 대 장';
            if (currentFilter !== 'all') {
                const courseTitles = {
                    '한식기능사': '한식기능사 수강생 목록',
                    '양식기능사': '양식기능사 수강생 목록',
                    '일식기능사': '일식기능사 수강생 목록',
                    '중식기능사': '중식기능사 수강생 목록',
                    '제과기능사': '제과기능사 수강생 목록',
                    '제빵기능사': '제빵기능사 수강생 목록',
                    '제과+제빵': '제과제빵기능사 수강생 목록',
                    '제과제빵기능사': '제과제빵기능사 수강생 목록',
                    '제과제빵 기능사': '제과제빵기능사 수강생 목록',
                    '복어기능사': '복어기능사 수강생 목록',
                    '산업기사': '산업기사 수강생 목록',
                    '가정요리': '가정요리 수강생 목록',
                    '브런치': '브런치 수강생 목록'
                };
                title = courseTitles[currentFilter] || '수 강 생 대 장';
            }
            if (document.getElementById('pageTitle')) document.getElementById('pageTitle').textContent = title;
        }

        console.log(`Filter: ${currentFilter}, Display Count: ${displayMembers.length}`);


        // 2. Filter by Course (if not archive/trash mode, or apply to all?)
        if (currentFilter !== 'all' && currentFilter !== 'archive' && currentFilter !== 'trash') {
            displayMembers = displayMembers.filter(m => m.course && m.course.includes(currentFilter));
        }

        // 3. Filter by Search Term
        if (window.memberSearchTerm) {
            displayMembers = displayMembers.filter(m => (m.name || '').toLowerCase().includes(window.memberSearchTerm));
        }

        if (displayMembers.length === 0) {
            memberListEl.innerHTML = '<div style="text-align:center; padding:20px; color:#888;">표시할 회원이 없습니다.</div>';

            return;
        }

        // Create Table Structure for Ledger View
        const table = document.createElement('table');
        table.className = 'ledger-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th rowspan="2">성명</th>
                    <th rowspan="2">주민등록번호</th>
                    <th rowspan="2">주소</th>
                    <th colspan="2">연락처</th>
                    <th rowspan="2">과정</th>
                    <th rowspan="2">수강<br>시작일</th>
                    <th rowspan="2">비고<br></th>
                    <th rowspan="2">상태</th>
                </tr>
                <tr>
                    <th>본인</th>
                    <th>보호자</th>
                </tr>
            </thead>
            <tbody id="ledgerBody"></tbody>
        `;

        const tbody = table.querySelector('tbody');

        displayMembers.forEach(member => {
            const status = member.status || 'taking';
            // Reuse statusText logic if needed, but we use select primarily now

            const statusClass = {
                'taking': 'status-taking',
                'completed': 'status-completed',
                'retaking': 'status-retaking',
                'delete': 'status-delete',
                'hold': 'status-hold'
            }[status] || 'status-taking';

            // Remarks
            let remarks = '';
            if (member.type === 'student') {
                const schoolName = member.school || '';
                const schoolLevel = member.school_level ? `(${member.school_level})` : '';
                const grade = member.grade ? `${member.grade}학년` : '';
                remarks = `${schoolName} ${grade}`.trim();
            } else {
                remarks = member.job || '';
            }

            const tr = document.createElement('tr');

            // Add click event to open edit modal with confirmation
            tr.onclick = (e) => {
                // Prevent triggering when clicking interactive elements
                if (e.target.tagName === 'SELECT' || e.target.tagName === 'BUTTON' || e.target.closest('select') || e.target.closest('button')) {
                    return;
                }

                // Use Custom Modal instead of Native Confirm
                openEditConfirmModal(member.id);
            };

            // Status Select Options
            const statuses = [
                { val: 'taking', text: '수강중' },
                { val: 'completed', text: '수료' },
                { val: 'retaking', text: '재수강' },
                { val: 'hold', text: '보류' },
                { val: 'trash', text: '휴지통' }
            ];

            const optionsHtml = statuses.map(s =>
                `<option value="${s.val}" ${status === s.val ? 'selected' : ''}>${s.text}</option>`
            ).join('');

            // Safe notes handling
            const safeNotes = (member.notes || '').replace(/"/g, '&quot;');
            const nameHtml = `${member.name}${safeNotes ? `<span class="notes-indicator" data-notes="${safeNotes}">🗒️</span>` : ''}`;

            tr.innerHTML = `
                <td>${nameHtml}</td>
                <td>${member.resident_num || ''}</td>
                <td>${member.address || ''} ${member.address_detail || ''}</td>
                <td>${member.phone || ''}</td>
                <td>${member.phone_guardian || ''}</td>
                <td>${member.course || ''}</td>
                <td>${member.start_date || ''}</td>
                <td>${remarks}</td>
                <td>
                    <select class="status-select ${statusClass}" onchange="handleStatusChange(event, '${member.id}')">
                        ${optionsHtml}
                    </select>
                </td>
            `;

            const selectEl = tr.querySelector('.status-select');
            selectEl.dataset.prev = status;

            tbody.appendChild(tr);
        });

        memberListEl.appendChild(table);

    } catch (e) {
        console.error('Render Members Error:', e);

        if (memberListEl) memberListEl.innerHTML = `<div style="color:red; text-align:center; padding:20px;">Rendering Error: ${e.message}</div>`;
    }
}

// Phone Book View Helper
window.loadPhoneBook = function () {
    // Reset active buttons and nav highlights
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));

    document.getElementById('navPhoneBook')?.classList.add('active');
    currentFilter = 'phonebook';

    if (document.getElementById('pageTitle')) document.getElementById('pageTitle').textContent = '전 화 번 호 부';

    // Hide search for phonebook? Or keep it? Let's keep it but re-render
    renderMembers();
};

// Update existing renderMembers to support phonebook view
// I'll append a version that handles the switch
const originalRenderMembers = renderMembers;
renderMembers = function () {
    if (currentFilter !== 'phonebook') {
        originalRenderMembers();
        return;
    }

    memberListEl.innerHTML = '';
    let displayMembers = members.filter(m => m.status !== 'trash' && m.status !== 'delete');

    // Apply Search Term if exists
    if (window.memberSearchTerm) {
        displayMembers = displayMembers.filter(m => (m.name || '').toLowerCase().includes(window.memberSearchTerm));
    }

    if (displayMembers.length === 0) {
        memberListEl.innerHTML = '<div style="text-align:center; padding:20px; color:#888;">표시할 번호가 없습니다.</div>';
        return;
    }

    // Sort by name
    displayMembers.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ko'));

    // Consonant grouping helper
    const getInitial = (name) => {
        const charCode = (name || ' ').charCodeAt(0) - 0xAC00;
        if (charCode < 0 || charCode > 11171) return '#';
        const initialIdx = Math.floor(charCode / 588);
        return ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"][initialIdx];
    };

    const grouped = {};
    displayMembers.forEach(m => {
        const initial = getInitial(m.name);
        if (!grouped[initial]) grouped[initial] = [];
        grouped[initial].push(m);
    });

    const phoneBookContainer = document.createElement('div');
    phoneBookContainer.className = 'phonebook-list-container';
    phoneBookContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 0;
        background: white;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        overflow: hidden;
    `;

    Object.keys(grouped).sort().forEach(initial => {
        // Group Header
        const groupHeader = document.createElement('div');
        groupHeader.style.cssText = `
            background: #f8fafc;
            padding: 8px 20px;
            font-size: 1rem;
            font-weight: 900;
            color: #3b82f6;
            border-bottom: 1px solid #e2e8f0;
            border-top: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
        `;
        if (phoneBookContainer.children.length === 0) groupHeader.style.borderTop = 'none';
        groupHeader.innerHTML = `<span>${initial}</span>`;
        phoneBookContainer.appendChild(groupHeader);

        grouped[initial].forEach(m => {
            const row = document.createElement('div');
            row.style.cssText = `
                display: flex;
                align-items: center;
                padding: 10px 20px;
                border-bottom: 1px solid #f1f5f9;
                transition: background 0.2s;
            `;
            row.onmouseenter = () => row.style.backgroundColor = '#f8fafc';
            row.onmouseleave = () => row.style.backgroundColor = 'transparent';

            row.innerHTML = `
                <div style="width: 100px; font-weight: 800; color: #1e293b; font-size: 0.95rem;">${m.name}</div>
                <div style="width: 150px; display: flex; align-items: center; gap: 8px; border-left: 1px solid #f1f5f9; padding-left: 15px;">
                    <span style="font-size: 0.6rem; color: #3b82f6; font-weight: 800; background: #eff6ff; padding: 2px 5px; border-radius: 4px;">본인</span>
                    <span style="font-size: 0.9rem; font-weight: 800; color: #334155;">${m.phone || '-'}</span>
                </div>
                <div style="width: 150px; display: flex; align-items: center; gap: 8px; border-left: 1px solid #f1f5f9; padding-left: 15px;">
                    <span style="font-size: 0.6rem; color: #64748b; font-weight: 800; background: #f1f5f9; padding: 2px 5px; border-radius: 4px;">보호자</span>
                    <span style="font-size: 0.8rem; color: #64748b; font-weight: 600;">${m.phone_guardian || '-'}</span>
                </div>
                <div style="width: 100px; display: flex; gap: 8px; justify-content: center; border-left: 1px solid #f1f5f9;">
                    <a href="tel:${m.phone}" title="전화" style="width: 28px; height: 28px; background: #22c55e; color: white; border-radius: 6px; display: flex; align-items: center; justify-content: center; text-decoration: none;">
                        <span class="material-icons" style="font-size: 16px;">call</span>
                    </a>
                    <a href="sms:${m.phone}" title="문자" style="width: 28px; height: 28px; background: #3b82f6; color: white; border-radius: 6px; display: flex; align-items: center; justify-content: center; text-decoration: none;">
                        <span class="material-icons" style="font-size: 16px;">mail</span>
                    </a>
                </div>
                <div style="flex: 1; border-left: 1px solid #f1f5f9; padding-left: 15px; color: #94a3b8; font-size: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500;">
                    <span class="material-icons" style="font-size: 12px; vertical-align: middle; margin-right: 4px;">menu_book</span>${m.course || '-'}
                </div>
            `;
            phoneBookContainer.appendChild(row);
        });
    });

    memberListEl.appendChild(phoneBookContainer);
};
