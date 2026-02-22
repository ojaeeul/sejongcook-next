
let membersData = [];
let paymentsData = [];
let currentYear = new Date().getFullYear();

async function loadData() {
    const container = document.getElementById('paidListContainer');
    try {
        const [mRes, pRes] = await Promise.all([
            fetch('/api/members?t=' + Date.now()),
            fetch('/api/payments?t=' + Date.now())
        ]);

        membersData = await mRes.json();
        paymentsData = await pRes.json();

        if (!Array.isArray(membersData)) membersData = [];
        if (!Array.isArray(paymentsData)) paymentsData = [];

        initYearSelect();
        renderPaidList();
    } catch (e) {
        console.error("Failed to load data", e);
        if (container) container.innerHTML = '<div style="padding:20px; color:red; text-align:center;">데이터 로드 중 오류가 발생했습니다.</div>';
    }
}

function initYearSelect() {
    const select = document.getElementById('yearSelect');
    if (!select) return;
    select.innerHTML = '';
    const startYear = 2024;
    const endYear = 3000;
    for (let y = startYear; y <= endYear; y++) {
        const opt = document.createElement('option');
        opt.value = y; opt.textContent = `${y}년 조회`;
        if (y === currentYear) opt.selected = true;
        select.appendChild(opt);
    }
    select.onchange = (e) => {
        currentYear = parseInt(e.target.value);
        renderPaidList();
    };
}

function renderPaidList() {
    const container = document.getElementById('paidListContainer');
    if (!container) return;

    const paidPayments = paymentsData.filter(p =>
        String(p.year) === String(currentYear) &&
        p.status === 'paid'
    ).sort((a, b) => new Date(b.updatedAt || b.date) - new Date(a.updatedAt || a.date));

    let html = `
        <div class="course-header" style="background:#fff; padding:15px 0; border-bottom:3px solid #059669; margin-bottom:20px; display:flex; align-items:flex-end; justify-content: space-between;">
            <h2 style="margin:0; font-size:1.5rem; color:#065f46; font-weight:900;">전체 납부 완료 내역 <span style="font-size:1rem; color:#64748b; font-weight:500; margin-left:10px;">(총 ${paidPayments.length}건)</span></h2>
            <div style="font-size: 0.9rem; color: #64748b; font-weight: 700;">${currentYear}년 기준</div>
        </div>
        <div class="ledger-table-wrapper" style="overflow-x:auto; background:white; border:1.5px solid #059669; border-radius:12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
            <table style="width:100%; border-collapse: collapse; font-family: 'Noto Sans KR', sans-serif;">
                <thead>
                    <tr style="background:#f0fdf4; border-bottom:2px solid #059669;">
                        <th style="padding:15px; font-size:0.9rem; color:#065f46; border-right:1px solid #d1fae5; width:60px;">번호</th>
                        <th style="padding:15px; font-size:0.9rem; color:#065f46; border-right:1px solid #d1fae5; text-align:left;">수강생 이름</th>
                        <th style="padding:15px; font-size:0.9rem; color:#065f46; border-right:1px solid #d1fae5; text-align:left;">납부 과목 (과정)</th>
                        <th style="padding:15px; font-size:0.9rem; color:#065f46; border-right:1px solid #d1fae5; width:100px;">해당 월</th>
                        <th style="padding:15px; font-size:0.9rem; color:#065f46; border-right:1px solid #d1fae5; text-align:right; width:150px;">납부 금액</th>
                        <th style="padding:15px; font-size:0.9rem; color:#065f46; border-right:1px solid #d1fae5; width:180px;">납부 일시</th>
                        <th style="padding:15px; font-size:0.9rem; color:#065f46; width:120px;">관리</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (paidPayments.length === 0) {
        html += `<tr><td colspan="7" style="padding:60px; text-align:center; color:#64748b; font-size:1.1rem; font-weight:500;">해당 연도의 납부 완료 내역이 존재하지 않습니다.</td></tr>`;
    } else {
        paidPayments.forEach((p, idx) => {
            const member = membersData.find(m => String(m.id) === String(p.memberId));
            const date = p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : (p.date || '-');
            const time = p.updatedAt ? new Date(p.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

            html += `
                <tr style="border-bottom:1px solid #d1fae5; transition: background 0.2s;">
                    <td style="padding:15px; text-align:center; color:#64748b; font-size:0.9rem; border-right:1px solid #f0fdf4; font-weight:700;">${idx + 1}</td>
                    <td style="padding:15px; font-weight:800; color:#1e293b; border-right:1px solid #f0fdf4; font-size:1rem;">${member ? member.name : 'Unknown Member'}</td>
                    <td style="padding:15px; color:#059669; font-weight:700; border-right:1px solid #f0fdf4;">${p.course || '전체 교육 과정'}</td>
                    <td style="padding:15px; text-align:center; font-weight:800; color:#1e293b; border-right:1px solid #f0fdf4; font-size:1rem;">${p.month}월</td>
                    <td style="padding:15px; text-align:right; font-weight:900; color:#059669; border-right:1px solid #f0fdf4; font-family:'Roboto Mono', monospace; font-size:1.1rem;">${p.amount?.toLocaleString() || 0}원</td>
                    <td style="padding:15px; text-align:center; color:#64748b; border-right:1px solid #f0fdf4;">
                        <div style="font-weight:700; color:#475569; font-size:0.95rem;">${date}</div>
                        <div style="font-size:0.8rem; margin-top:2px;">${time}</div>
                    </td>
                    <td style="padding:15px; text-align:center;">
                        <div style="display:flex; flex-direction:column; gap:5px; align-items:center;">
                            <select onchange="updatePaymentStatus('${p.memberId}', '${p.year}', '${p.month}', '${p.course || ''}', this.value)" 
                                    class="form-select" style="font-size:0.75rem; padding:4px 8px; width:110px; height:32px; font-weight:700; border-color:#059669; color:#065f46;">
                                <option value="paid" selected disabled>상태 변경</option>
                                <option value="enrolled">수강중</option>
                                <option value="unpaid">미납완료</option>
                            </select>
                            <button onclick="window.location.href='tuition.html?memberId=${p.memberId}'" class="mini-btn emerald" title="수강료 이력 보기" style="height: 28px; font-size: 0.7rem; width: 110px; padding: 0;">
                                상세보기
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

async function updatePaymentStatus(memberId, year, month, course, newStatus) {
    if (!confirm('이 납부 내역의 상태를 변경하시겠습니까?\n(납부완료 명단에서 제외됩니다.)')) {
        renderPaidList(); // Reset select
        return;
    }

    try {
        const payload = {
            memberId: String(memberId),
            year: parseInt(year),
            month: parseInt(month),
            course: course,
            status: newStatus,
            updatedAt: new Date().toISOString()
        };

        const res = await fetch('/api/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert('상태가 정상적으로 변경되었습니다.');
            loadData(); // Reload all to refresh UI
        } else {
            alert('변경 중 오류가 발생했습니다.');
        }
    } catch (e) {
        console.error(e);
        alert('서버 응답 오류가 발생했습니다.');
    }
}

document.addEventListener('DOMContentLoaded', loadData);
window.toggleNavSub = function (el) { el.classList.toggle('active'); el.nextElementSibling?.classList.toggle('show'); };
window.loadExamView = function (key) { window.location.href = `index.html?viewExam=${key}`; };
