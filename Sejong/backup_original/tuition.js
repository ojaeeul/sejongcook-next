
// tuition.js

let membersData = [];
let paymentsData = [];
let currentState = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    course: 'all', // 'all', '한식', '양식', ...
    statusFilter: 'all', // 'all', 'unpaid', 'paid' (for dropdown)
    tab: 'unpaid' // 'unpaid', 'paid'
};

const DEFAULT_PRICE = 200000;

document.addEventListener('DOMContentLoaded', () => {
    initFilters();
    initTabs();
    loadData();
});

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
        const [mRes, pRes] = await Promise.all([
            fetch('/api/members'),
            fetch('/api/payments')
        ]);
        membersData = await mRes.json();
        paymentsData = await pRes.json();
        renderTable();
    } catch (e) {
        console.error("Failed to load data", e);
    }
}

function renderTable() {
    const tbody = document.getElementById('tuitionListBody');
    tbody.innerHTML = '';

    // Filter Members
    const filteredMembers = membersData.filter(m => {
        // Course Filter
        if (currentState.course !== 'all' && currentState.course !== '전체 강좌') {
            // member course string: "한식(10:00), 양식..."
            if (!m.course || !m.course.includes(currentState.course)) return false;
        }
        return true;
    });

    // Process Payments for current Year/Month
    const rows = [];
    filteredMembers.forEach(m => {
        // Find payment record
        const payment = paymentsData.find(p =>
            p.memberId == m.id &&
            p.year == currentState.year &&
            p.month == currentState.month
        );

        const isPaid = payment && payment.status === 'paid';
        const amount = DEFAULT_PRICE; // Or derive from course count * unit price

        // Tab Filter
        if (currentState.tab === 'unpaid' && isPaid) return;
        if (currentState.tab === 'paid' && !isPaid) return;

        // Dropdown Filter (Status) - acts as additional filter?
        if (currentState.statusFilter === 'unpaid' && isPaid) return;
        if (currentState.statusFilter === 'paid' && !isPaid) return;

        rows.push({ member: m, payment, isPaid, amount });
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
            : '<span class="badge badge-blue">미납</span>'; // Using '미납' text map to badge-blue (Request image had '발송전' which is blue, '발송완료' yellow. I'll use simple terms first)

        // Let's match image: 
        // Unpaid -> "발송전" (Before sending bill) -> Blue
        // Paid -> "납부완료" (Paid) -> Yellow? Image had "발송완료" as Yellow. 
        // Let's use:
        // Unpaid = "발송전" (Blue) 
        // Paid = "납부완료" (Green/Yellow?) -> badge-yellow

        const badgeHtml = row.isPaid
            ? `<span class="badge badge-yellow" onclick="togglePayment('${m.id}')" style="cursor:pointer">납부완료</span>`
            : `<span class="badge badge-blue" onclick="togglePayment('${m.id}')" style="cursor:pointer">미납</span>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${badgeHtml}</td>
            <td><input type="checkbox"></td>
            <td>
                <div class="student-cell">
                    <span class="s-name">${m.name || '이름없음'}</span>
                    <span style="font-size:0.8em; color:#888;">${m.courseShort || ''}</span>
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
        alert('업데이트 실패');
    }
}
