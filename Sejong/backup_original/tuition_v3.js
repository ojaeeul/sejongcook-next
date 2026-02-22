
// tuition_v3.js

let membersData = [];
let paymentsData = [];
let currentState = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    course: 'all',
    statusFilter: 'all',
    tab: 'unpaid'
};

const DEFAULT_PRICE = 200000;

document.addEventListener('DOMContentLoaded', () => {
    initYearOptions();
    initFilters();
    initTabs();
    loadData();
});

function initYearOptions() {
    const yearSelect = document.getElementById('yearSelect');
    if (!yearSelect) return;

    yearSelect.innerHTML = '';
    for (let y = 2025; y <= 3000; y++) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = `${y}년`;
        if (y === currentState.year) opt.selected = true;
        yearSelect.appendChild(opt);
    }
}

function initFilters() {
    // Year Select
    const yearSelect = document.getElementById('yearSelect');
    if (yearSelect) {
        yearSelect.addEventListener('change', (e) => {
            currentState.year = parseInt(e.target.value);
            renderTable();
        });
    }

    // Month Select
    const monthSelect = document.getElementById('monthSelect');
    if (monthSelect) {
        monthSelect.value = currentState.month;
        monthSelect.addEventListener('change', (e) => {
            currentState.month = parseInt(e.target.value);
            renderTable();
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

    // Status Filter
    const statusSelect = document.getElementById('statusFilter');
    if (statusSelect) {
        statusSelect.addEventListener('change', (e) => {
            currentState.statusFilter = e.target.value;
            renderTable();
        });
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

    // Sync Selects
    const yearSelect = document.getElementById('yearSelect');
    const monthSelect = document.getElementById('monthSelect');
    if (yearSelect) yearSelect.value = currentState.year;
    if (monthSelect) monthSelect.value = currentState.month;

    renderTable();
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

    updateTabStyles();
}

function updateTabStyles() {
    const btnUnpaid = document.querySelector('.tab-unpaid');
    const btnPaid = document.querySelector('.tab-paid');

    if (currentState.tab === 'unpaid') {
        btnUnpaid.style.opacity = '1';
        btnUnpaid.style.border = '2px solid #b45309';
        btnPaid.style.opacity = '0.6';
        btnPaid.style.border = '1px solid #10b981';
    } else {
        btnPaid.style.opacity = '1';
        btnPaid.style.border = '2px solid #059669';
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
    if (!tbody) return;
    tbody.innerHTML = '';

    const filteredMembers = membersData.filter(m => {
        if (currentState.course !== 'all' && currentState.course !== '전체 강좌') {
            if (!m.course || !m.course.includes(currentState.course)) return false;
        }
        return true;
    });

    const rows = [];
    filteredMembers.forEach(m => {
        const payment = paymentsData.find(p =>
            p.memberId == m.id &&
            p.year == currentState.year &&
            p.month == currentState.month
        );

        const isPaid = payment && payment.status === 'paid';
        const amount = DEFAULT_PRICE;

        if (currentState.tab === 'unpaid' && isPaid) return;
        if (currentState.tab === 'paid' && !isPaid) return;

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
        const paidAmount = row.isPaid ? row.amount : 0;
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
                    <span style="font-size:0.8em; color:#888;">${getCourseShort(m.course)}</span>
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
    return courseStr.split(',').map(s => s.split('(')[0].trim()).join(', ');
}

async function togglePayment(memberId) {
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
                amount: DEFAULT_PRICE,
                updatedAt: new Date().toISOString()
            })
        });
        await loadData();
    } catch (e) {
        console.error("Update failed", e);
        alert('업데이트 실패');
    }
}
