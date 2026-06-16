let rawExpenses = [];
let groupedData = {}; // year -> month -> day -> array of expenses
let totalOverall = 0;

let selectedYear = null;
let selectedMonth = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch(`/api/sejong/sejong_expense?t=${Date.now()}`);
        if (!res.ok) throw new Error('Failed to fetch expenses');
        rawExpenses = await res.json();
        
        processExpenseData(rawExpenses);
        renderTotalOverall();
        renderYearList();
        
    } catch (e) {
        console.error("Failed to load expenses:", e);
        document.getElementById('totalExpenseAmount').innerText = "데이터 로딩 실패";
        document.getElementById('tier-year-list').innerHTML = `<div class="empty-state"><span class="material-icons">error_outline</span><span>데이터를 불러올 수 없습니다.</span></div>`;
    }
});

function processExpenseData(expenses) {
    totalOverall = 0;
    groupedData = {};
    
    expenses.forEach(exp => {
        const amt = parseInt(exp.amount) || 0;
        const eDate = new Date(exp.date || exp.updatedAt || Date.now());
        
        if (isNaN(eDate.getTime())) return; // skip invalid dates
        
        const year = eDate.getFullYear();
        const month = eDate.getMonth() + 1;
        const day = eDate.getDate();
        
        totalOverall += amt;
        
        if (!groupedData[year]) groupedData[year] = { total: 0, months: {} };
        groupedData[year].total += amt;
        
        if (!groupedData[year].months[month]) groupedData[year].months[month] = { total: 0, days: {} };
        groupedData[year].months[month].total += amt;
        
        if (!groupedData[year].months[month].days[day]) groupedData[year].months[month].days[day] = { total: 0, items: [] };
        groupedData[year].months[month].days[day].total += amt;
        groupedData[year].months[month].days[day].items.push(exp);
    });
}

function renderTotalOverall() {
    document.getElementById('totalExpenseAmount').innerText = totalOverall.toLocaleString() + '원';
}

function renderYearList() {
    const listEl = document.getElementById('tier-year-list');
    listEl.innerHTML = '';
    
    const years = Object.keys(groupedData).sort((a, b) => b - a); // descending
    
    if (years.length === 0) {
        listEl.innerHTML = `<div class="empty-state">지출 데이터가 없습니다.</div>`;
        return;
    }
    
    years.forEach(year => {
        const d = groupedData[year];
        const el = document.createElement('div');
        el.className = 'drill-item';
        el.innerHTML = `
            <span class="di-label">${year}년</span>
            <span class="di-val">${d.total.toLocaleString()}원</span>
        `;
        el.onclick = () => {
            document.querySelectorAll('#tier-year-list .drill-item').forEach(n => n.classList.remove('active'));
            el.classList.add('active');
            selectedYear = year;
            selectedMonth = null; // reset month
            renderMonthList();
            clearDayList();
        };
        listEl.appendChild(el);
    });
}

function renderMonthList() {
    const listEl = document.getElementById('tier-month-list');
    listEl.innerHTML = '';
    
    document.getElementById('tier-month-title').innerText = `${selectedYear}년 월별 지출`;
    
    if (!selectedYear || !groupedData[selectedYear]) return;
    
    const months = Object.keys(groupedData[selectedYear].months).sort((a, b) => b - a); // descending month
    
    months.forEach(month => {
        const d = groupedData[selectedYear].months[month];
        const el = document.createElement('div');
        el.className = 'drill-item';
        el.innerHTML = `
            <span class="di-label">${month}월</span>
            <span class="di-val">${d.total.toLocaleString()}원</span>
        `;
        el.onclick = () => {
            document.querySelectorAll('#tier-month-list .drill-item').forEach(n => n.classList.remove('active'));
            el.classList.add('active');
            selectedMonth = month;
            renderDayList();
        };
        listEl.appendChild(el);
    });
}

function clearDayList() {
    document.getElementById('tier-day-title').innerText = `3단계: 일별 지출 상세`;
    document.getElementById('tier-day-list').innerHTML = `
        <div class="empty-state">
            <span class="material-icons">touch_app</span>
            <span>좌측에서 월을 먼저 선택해주세요.</span>
        </div>
    `;
}

function renderDayList() {
    const listEl = document.getElementById('tier-day-list');
    listEl.innerHTML = '';
    
    document.getElementById('tier-day-title').innerText = `${selectedYear}년 ${selectedMonth}월 상세 내역`;
    
    if (!selectedYear || !selectedMonth || !groupedData[selectedYear].months[selectedMonth]) return;
    
    const daysData = groupedData[selectedYear].months[selectedMonth].days;
    const days = Object.keys(daysData).sort((a, b) => b - a); // descending day
    
    days.forEach(day => {
        const d = daysData[day];
        const groupEl = document.createElement('div');
        groupEl.className = 'day-group';
        
        let itemsHtml = d.items.map(item => `
            <div class="day-item">
                <span class="day-item-name">${item.desc || '항목 없음'} ${item.method ? '<span style="color:#94a3b8;font-size:0.8rem;margin-left:5px;">('+item.method+')</span>' : ''}</span>
                <span class="day-item-amount">${(parseInt(item.amount) || 0).toLocaleString()}원</span>
            </div>
        `).join('');
        
        groupEl.innerHTML = `
            <div class="day-header">
                <span>${day}일</span>
                <span class="day-total">${d.total.toLocaleString()}원</span>
            </div>
            <div>
                ${itemsHtml}
            </div>
        `;
        listEl.appendChild(groupEl);
    });
}
