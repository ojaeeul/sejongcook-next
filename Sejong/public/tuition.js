// tuition.js

let membersData = [];
let paymentsData = [];
let attendanceData = [];
let attendanceByMember = {}; // Optimized lookup for 8th attendance calculation
let currentState = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    course: 'all', // 'all', '한식', '양식', ...
    statusFilter: 'all', // 'all', 'unpaid', 'paid' (for dropdown)
    tab: 'unpaid' // 'unpaid', 'paid'
};

const DEFAULT_PRICE = 200000;

document.addEventListener('DOMContentLoaded', () => {
    handleUrlParams();
    initFilters();
    initTabs();
    loadData();
});

function handleUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const yr = params.get('year');
    const mo = params.get('month');
    const mid = params.get('memberId');

    if (yr) currentState.year = parseInt(yr);
    if (mo) currentState.month = parseInt(mo);
    if (mid) currentState.targetMemberId = mid;
}

function initFilters() {
    updateDateDisplay();

    // Month Picker Listener
    const monthPicker = document.getElementById('monthPicker');
    if (monthPicker) {
        monthPicker.addEventListener('change', (e) => {
            if (e.target.value) {
                const [y, m] = e.target.value.split('-');
                currentState.year = parseInt(y);
                currentState.month = parseInt(m);
                updateDateDisplay();
                renderTable();
            }
        });
    }

    // Course Filter
    const courseSelect = document.getElementById('courseFilter');
    if (courseSelect) {
        courseSelect.addEventListener('change', (e) => {
            currentState.course = e.target.value;
            renderTable();
        });
    }

    // Status Filter (Dropdown)
    const statusSelect = document.getElementById('statusFilter');
    if (statusSelect) {
        statusSelect.addEventListener('change', (e) => {
            currentState.statusFilter = e.target.value;
            renderTable();
        });
    }
}

function updateDateDisplay() {
    const title = document.getElementById('monthTitle');
    if (title) {
        title.textContent = `${currentState.year}년 ${currentState.month}월`;
    }
}

function changeMonth(delta) {
    currentState.month += delta;
    if (currentState.month > 12) {
        currentState.month = 1;
        currentState.year += 1;
    } else if (currentState.month < 1) {
        currentState.month = 12;
        currentState.year -= 1;
    }
    updateDateDisplay();
    renderTable();
}

function openMonthPicker() {
    const picker = document.getElementById('monthPicker');
    if (!picker) return;
    const mm = String(currentState.month).padStart(2, '0');
    picker.value = `${currentState.year}-${mm}`;

    try {
        picker.showPicker();
    } catch (e) {
        picker.style.visibility = 'visible';
        picker.focus();
        picker.click();
        picker.style.visibility = 'hidden';
    }
}


function initTabs() {
    const btnUnpaid = document.querySelector('.tab-unpaid');
    const btnPaid = document.querySelector('.tab-paid');

    btnUnpaid.addEventListener('click', () => {
        currentState.tab = 'unpaid';
        updateTabStyles();
        renderTable();
    });

    btnPaid.addEventListener('click', () => {
        currentState.tab = 'paid';
        updateTabStyles();
        renderTable();
    });

    // Initial style update
    updateTabStyles();
}

function updateTabStyles() {
    const btnUnpaid = document.querySelector('.tab-unpaid');
    const btnPaid = document.querySelector('.tab-paid');

    if (currentState.tab === 'unpaid') {
        btnUnpaid.style.opacity = '1';
        btnUnpaid.style.border = '2px solid #b45309'; // Highlight
        btnPaid.style.opacity = '0.6';
        btnPaid.style.border = '1px solid #10b981';
    } else {
        btnPaid.style.opacity = '1';
        btnPaid.style.border = '2px solid #059669'; // Highlight
        btnUnpaid.style.opacity = '0.6';
        btnUnpaid.style.border = 'none';
    }
}

async function loadData() {
    try {
        const [mRes, pRes, aRes] = await Promise.all([
            fetch('/api/members'),
            fetch('/api/payments'),
            fetch('/api/attendance')
        ]);
        membersData = await mRes.json();
        paymentsData = await pRes.json();
        attendanceData = await aRes.json();

        processAttendanceData();

        // [신규] 특정 학생(targetMemberId)이 지정된 경우 해당 학생의 납부 상태에 맞게 탭 자동 전환
        if (currentState.targetMemberId) {
            const mId = currentState.targetMemberId;
            const pm = paymentsData.find(p => p.memberId == mId && p.year == currentState.year && p.month == currentState.month);
            currentState.tab = (pm && pm.status === 'paid') ? 'paid' : 'unpaid';
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

    // Deduplicate and group by member
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

    // Sort by date
    for (const mid in attendanceByMember) {
        attendanceByMember[mid].sort((a, b) => a.dateObj - b.dateObj);
    }
}

/**
 * Ledger.js에서 사용하는 8회차 납부일(Scheduled Date) 계산 로직을 공유
 */
function getMemberEighthDayInMonth(memberId, year, month, courseFilter = null) {
    const memberRecords = attendanceByMember[memberId] || [];
    let eighthDay = null;
    let rollingTotal = 0;

    for (const r of memberRecords) {
        if (courseFilter) {
            if (!r.course) continue;
            const recordCourseName = r.course.split('(')[0].trim();
            const filterCourseName = courseFilter.split('(')[0].trim();
            if (recordCourseName !== filterCourseName) continue;
        }

        // 현재 조회 월보다 미래의 기록은 무시
        if (r.yearNum > year || (r.yearNum === year && r.monthNum > month)) continue;

        const inc = (r.course && r.course.includes('제과제빵')) ? 0.5 : 1.0;
        const isMarker = ['[', ']'].includes(r.status);
        const isNumericPresent = ['10', '12', '2', '5', '7'].includes(r.status);
        const isAbsent = r.status === 'absent' || (typeof r.status === 'string' && r.status.startsWith('X'));
        const isRegular = r.status === 'present' || isNumericPresent || isAbsent;

        const prevRolling = rollingTotal;
        if (isMarker || isRegular) {
            rollingTotal += inc;
            // 이전까지 8의 배수를 넘지 않았다가 r 기록에서 넘게 되면 그날이 '납부 예정일'
            if (r.yearNum === year && r.monthNum === month && Math.floor(prevRolling / 8) < Math.floor(rollingTotal / 8)) {
                eighthDay = r.dateObj.getDate();
            }
        }
    }
    return { eighthDay };
}

function renderTable() {
    const tbody = document.getElementById('tuitionListBody');
    tbody.innerHTML = '';

    // Filter Members
    const rows = [];
    membersData.forEach(m => {
        // Course Filter (UI Dropdown)
        if (currentState.course !== 'all') {
            if (!m.course || !m.course.includes(currentState.course)) return;
        }

        // [핵심] 사용자의 요청: "납부대장 '예' 날짜에 해당하는 사람만 결재(목록)에 나오게"
        // 해당 월에 8회차(납부일)가 도래하는지 체크
        const myCourses = (m.course || '').split(',').map(c => c.trim()).filter(c => c !== '');
        let isDueThisMonth = false;
        let scheduledDay = null;

        for (const fullCourse of myCourses) {
            const courseNameOnly = fullCourse.split('(')[0].trim();
            // 과정 필터가 적용된 경우 해당 과정만 체크
            if (currentState.course !== 'all' && courseNameOnly !== currentState.course) continue;

            const stats = getMemberEighthDayInMonth(m.id, currentState.year, currentState.month, courseNameOnly);
            if (stats && stats.eighthDay) {
                isDueThisMonth = true;
                scheduledDay = stats.eighthDay;
                break;
            }
        }

        // '예' 날짜(8회차)가 이 달에 없는 사람은 목록에서 제외
        if (!isDueThisMonth) return;

        // Find payment record
        const payment = paymentsData.find(p =>
            p.memberId == m.id &&
            p.year == currentState.year &&
            p.month == currentState.month
        );

        const isPaid = payment && payment.status === 'paid';
        const amount = DEFAULT_PRICE;

        // Tab Filter
        if (currentState.tab === 'unpaid' && isPaid) return;
        if (currentState.tab === 'paid' && !isPaid) return;

        // Dropdown Filter (Status)
        if (currentState.statusFilter === 'unpaid' && isPaid) return;
        if (currentState.statusFilter === 'paid' && !isPaid) return;

        rows.push({ member: m, payment, isPaid, amount, scheduledDay });
    });

    if (rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 30px;">데이터가 없습니다.</td></tr>';
        return;
    }

    rows.forEach(row => {
        const m = row.member;
        const p = row.payment;
        const paidAmount = row.isPaid ? row.amount : 0;
        const statusBadge = row.isPaid
            ? '<span class="badge badge-yellow">납부완료</span>'
            : '<span class="badge badge-blue">미납</span>'; // Using '미납' text map to badge-blue

        // Let's match image: 
        // Unpaid -> "발송전" (Before sending bill) -> Blue
        // Paid -> "납부완료" (Paid) -> Yellow? Image had "발송완료" as Yellow. 
        // Let's use:
        // Unpaid = "발송전" (Blue) 
        // Paid = "납부완료" (Green/Yellow?) -> badge-yellow

        const badgeHtml = row.isPaid
            ? `<span class="badge badge-yellow" onclick="togglePayment('${m.id}')" style="cursor:pointer">납부완료</span>`
            : `<span class="badge badge-blue" onclick="togglePayment('${m.id}')" style="cursor:pointer">미납</span>`;

        const isTarget = currentState.targetMemberId && String(m.id) === String(currentState.targetMemberId);

        const tr = document.createElement('tr');
        if (isTarget) {
            tr.style.background = '#fffbeb';
            tr.style.outline = '2px solid #fbbf24';
            tr.style.boxShadow = '0 0 10px rgba(251, 191, 36, 0.2)';
            setTimeout(() => {
                tr.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }

        tr.innerHTML = `
            <td>${badgeHtml}</td>
            <td><input type="checkbox"></td>
            <td>
                <div class="student-cell">
                    <span class="s-name" style="${isTarget ? 'color:#b45309; font-weight:900;' : ''}">${m.name || '이름없음'}</span>
                    <span style="font-size:0.8em; color: #d946ef; font-weight: 700;">(예정: ${row.scheduledDay}일)</span>
                </div>
            </td>
            <td class="text-right">${row.amount.toLocaleString()}</td>
            <td class="text-right">${paidAmount.toLocaleString()}</td>
            <td class="text-right">0</td>
            <td class="text-right">0</td>
            <td><div class="bar-gray" style="width:${row.isPaid ? '100%' : '10%'}; background:${row.isPaid ? '#4ade80' : '#e2e8f0'}"></div></td>
        `;
        tbody.appendChild(tr);
    });

    // 타겟 강조 후 초기화 (다음 렌더링 시에는 강조 안 함)
    // currentState.targetMemberId = null; 
    // -> 여기서는 주석 처리하거나 필요시 제거. 일단 유지해도 무방.
}

function getCourseShort(courseStr) {
    if (!courseStr) return '';
    // "한식(10:00), 양식..." -> "한식, 양식"
    return courseStr.split(',').map(s => s.split('(')[0]).join(', ');
}

async function togglePayment(memberId) {
    // Determine current status to toggle
    const payment = paymentsData.find(p =>
        p.memberId == memberId &&
        p.year == currentState.year &&
        p.month == currentState.month
    );
    const isPaid = payment && payment.status === 'paid';
    const newStatus = isPaid ? 'unpaid' : 'paid';

    try {
        await fetch('/api/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                memberId: memberId,
                year: currentState.year,
                month: currentState.month,
                status: newStatus,
                amount: DEFAULT_PRICE, // should be dynamic, but fixed for now
                updatedAt: new Date().toISOString()
            })
        });
        // Reload
        await loadData();
    } catch (e) {
        console.error("Update failed", e);
        alert('납부 상태 업데이트에 실패했습니다.');
    }
}
