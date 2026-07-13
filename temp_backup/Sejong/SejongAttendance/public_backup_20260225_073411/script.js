const API_BASE = '/api';

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
const currentDateEl = document.getElementById('currentDate');
const memberListEl = document.getElementById('memberList');
const totalMembersEl = document.getElementById('totalMembers');
const presentCountEl = document.getElementById('presentCount');

// Function to format date to YYYY.MM.DD
function formatDateDisplay(dateStr) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    // Determine page
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
            registerModal.style.display = 'flex';
        });
    }

    if (btnCloseRegister) {
        btnCloseRegister.addEventListener('click', () => {
            registerModal.style.display = 'none';
        });
    }

    if (modalRegForm) {
        modalRegForm.addEventListener('submit', handleModalRegister);
    }

    // Modal close on outside click
    window.addEventListener('click', (e) => {
        if (e.target == registerModal) {
            registerModal.style.display = 'none';
        }
        const statusModal = document.getElementById('statusModal');
        if (statusModal && e.target == statusModal) {
            closeStatusModal();
        }
    });

    // Date navigation
    document.getElementById('prevDate')?.addEventListener('click', () => changeDate(-1));
    document.getElementById('nextDate')?.addEventListener('click', () => changeDate(1));
});

// New Function: handleModalRegister
async function handleModalRegister(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());

    // Course handling for Modal checkboxes
    const checkboxes = e.target.querySelectorAll('input[name="course_select"]:checked');
    const courses = Array.from(checkboxes).map(cb => cb.value);
    data.course = courses.join(', ');

    // Basic Validation
    if (!data.name) return alert('이름을 입력해주세요.');

    try {
        const res = await fetch(`${API_BASE}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        if (json.success) {
            alert('등록되었습니다.');
            document.getElementById('registerModal').style.display = 'none';
            e.target.reset();
            // Refresh data
            fetchData().then(() => {
                renderMembers();
                updateSummary();
            });
        } else {
            alert('등록 실패: ' + json.error);
        }
    } catch (err) {
        alert('오류 발생: ' + err.message);
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
        const [mRes, aRes] = await Promise.all([
            fetch(`${API_BASE}/members`),
            fetch(`${API_BASE}/attendance?date=${currentDate}`)
        ]);
        members = await mRes.json();
        attendanceLogs = await aRes.json();
    } catch (e) {
        console.error('Failed to fetch data', e);
    }
}

function getStatus(memberId) {
    const log = attendanceLogs.find(l => l.memberId === memberId);
    return log ? log.status : 'unchecked';
}

function renderMembers() {
    memberListEl.innerHTML = '';

    let displayMembers = members;
    if (currentFilter !== 'all') {
        // Support multi-value course string "A,B"
        displayMembers = members.filter(m => m.course && m.course.includes(currentFilter));
    }

    // Filter out 'completed' members unless on Graduates page (which uses same script? No, likely separate file or check)
    displayMembers = displayMembers.filter(m => m.status !== 'completed');

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
                <th rowspan="2">비고<br>(과정)</th>
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
        // Determine status display
        const status = member.status || 'active';
        let statusText = '수강';
        let statusColorClass = 'status-active';

        if (status === 'retaking') {
            statusText = '재수강';
            statusColorClass = 'status-retaking';
        } else if (status === 'completed') {
            statusText = '수료';
            statusColorClass = 'status-completed';
        } else if (status === 'delete') {
            statusText = '삭제';
            statusColorClass = 'status-delete';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${member.name}</td>
            <td>${member.resident_num || ''}</td>
            <td>${member.address || ''} ${member.address_detail || ''}</td>
            <td>${member.phone || ''}</td>
            <td>${member.phone_home || ''}</td>
            <td>${member.phone_guardian || ''}</td>
            <td>${member.start_date || ''}</td>
            <td>${member.course || ''}</td>
            <td>
                <span class="status-cell ${statusColorClass}" style="color: ${status === 'delete' ? 'red' : (status === 'active' ? 'blue' : (status === 'completed' ? 'green' : '#f59e0b'))};">${statusText}</span>
            </td>
        `;

        // Status click -> Toggle Cycle: active -> completed -> retaking -> delete -> active
        const statusCell = tr.querySelector('.status-cell');
        statusCell.style.cursor = 'pointer';
        statusCell.onclick = (e) => {
            e.stopPropagation();

            const currentStatus = member.status || 'active';
            let nextStatus = 'active';

            // Cycle logic
            if (currentStatus === 'active') nextStatus = 'completed';
            else if (currentStatus === 'completed') nextStatus = 'retaking';
            else if (currentStatus === 'retaking') nextStatus = 'delete';
            else if (currentStatus === 'delete') nextStatus = 'active';

            try {
                // Helper to update UI
                const updateVisuals = (status) => {
                    const newText = {
                        'active': '수강',
                        'retaking': '재수강',
                        'completed': '수료',
                        'delete': '삭제'
                    }[status];

                    const newColorClass = {
                        'active': 'status-active',
                        'retaking': 'status-retaking',
                        'completed': 'status-completed',
                        'delete': 'status-delete'
                    }[status];

                    statusCell.innerText = newText;
                    statusCell.className = `status-cell ${newColorClass}`;
                    statusCell.style.color = '';
                    if (status === 'active') statusCell.style.color = 'blue';
                    else if (status === 'retaking') statusCell.style.color = '#f59e0b';
                    else if (status === 'completed') statusCell.style.color = 'green';
                    else if (status === 'delete') statusCell.style.color = 'red';
                };

                const saveStatus = async (status) => {
                    member.status = status;
                    try {
                        const res = await fetch(`${API_BASE}/members`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(member)
                        });
                        if (!res.ok) throw new Error('Network response was not ok');
                    } catch (err) {
                        console.error('Failed to update status', err);
                        alert(`상태 업데이트 실패: ${err.message}`);
                        updateVisuals(currentStatus); // Revert on error
                    }
                };

                // Delete Confirmation (Synchronous)
                if (nextStatus === 'delete') {
                    // Ask immediately.
                    // Note: Visuals will still show 'retaking' (Orange) while this popup is open.
                    // This is necessary to ensure the popup is not blocked by the browser.
                    const confirmed = confirm('정말로 삭제하시겠습니까?');

                    if (confirmed) {
                        // User said YES -> Update to Delete
                        updateVisuals('delete');
                        saveStatus('delete');
                    } else {
                        // User said NO -> Do nothing (stay as retaking)
                    }
                } else {
                    // Normal update
                    updateVisuals(nextStatus);
                    saveStatus(nextStatus);
                }
            } catch (error) {
                console.error('Click handler error:', error);
                alert(`오류가 발생했습니다: ${error.message}`);
            }
        };

        tbody.appendChild(tr);
    });

    memberListEl.appendChild(table);
}

// --- Status Management ---
let selectedMemberIdForStatus = null;

function openStatusModal(memberId) {
    selectedMemberIdForStatus = memberId;
    document.getElementById('statusModal').style.display = 'flex';
}

function closeStatusModal() {
    document.getElementById('statusModal').style.display = 'none';
    selectedMemberIdForStatus = null;
}

async function changeMemberStatus(newStatus) {
    if (!selectedMemberIdForStatus) return;

    // Optimistic update logic if needed, but simple reload is safer
    // Find member
    const member = members.find(m => m.id === selectedMemberIdForStatus);
    if (member) {
        member.status = newStatus;

        // Check if we need to remove from view (if completed)
        // Re-render
        renderMembers(); // This will filter it out if completed

        // API Call
        try {
            await fetch(`${API_BASE}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(member)
            });
        } catch (e) {
            console.error('Failed to update status', e);
            alert('상태 업데이트 실패');
        }
    }

    closeStatusModal();
}


function updateSummary() {
    if (totalMembersEl) totalMembersEl.textContent = members.length;
    if (presentCountEl) presentCountEl.textContent = attendanceLogs.filter(l => l.status === 'present').length;
}

async function toggleStatus(memberId) {
    const currentStatus = getStatus(memberId);
    const nextStatusMap = {
        'unchecked': 'present',
        'present': 'absent',
        'absent': 'extension',
        'extension': 'unchecked'
    };
    const nextStatus = nextStatusMap[currentStatus];

    // Optimistic update
    const existingLogIdx = attendanceLogs.findIndex(l => l.memberId === memberId);
    if (existingLogIdx !== -1) attendanceLogs.splice(existingLogIdx, 1);

    if (nextStatus !== 'unchecked') {
        attendanceLogs.push({ memberId, date: currentDate, status: nextStatus });
    }

    // Save current scroll position or just re-render is fine
    renderMembers();
    // Re-calculating summary based on ALL logs, not just filtered. 
    // If we want summary to match filter, we can update logic.
    updateSummary();

    // API Call
    try {
        await fetch(`${API_BASE}/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                memberId,
                date: currentDate,
                status: nextStatus === 'unchecked' ? null : nextStatus
            })
        });
    } catch (e) {
        console.error('Failed to save status', e);
        // Revert? (omitted)
    }
}

// Registration
// Registration
async function handleRegister(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());

    // Unified Course + Time Handling
    const courseUnits = document.querySelectorAll('.course-unit');
    const selectedCourses = [];
    const selectedTimes = [];

    courseUnits.forEach(unit => {
        const checkbox = unit.querySelector('input[name="course_select"]');
        const timeSelect = unit.querySelector('select[name="time_select"]');

        if (checkbox && checkbox.checked) {
            const courseName = checkbox.value;
            const timeVal = timeSelect.value;

            // Format: "한식기능사(10:00)"
            selectedCourses.push(`${courseName}(${timeVal})`);
            selectedTimes.push(timeVal);
        }
    });

    data.course = selectedCourses.join(', ');
    data.timeSlot = selectedTimes.join(','); // Store pure times for filtering if needed

    // Basic validation
    if (!data.name) return alert('이름을 입력해주세요.');
    if (!data.course) return alert('수강 과목을 하나 이상 선택해주세요.');

    try {
        const res = await fetch(`${API_BASE}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        if (json.success) {
            alert('등록되었습니다.');
            window.location.href = 'index.html';
        } else {
            alert('등록 실패: ' + json.error);
        }
    } catch (e) {
        alert('오류 발생: ' + e.message);
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
