let globalMembers = {};
let groupedData = {}; // year -> month -> day -> { attendance:0, absence:0, lateness:0, early:0, extension:0, details: [] }
let totalOverall = 0; // total attendance

let selectedYear = null;
let selectedMonth = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch both members (for names) and attendance
        const [mRes, aRes] = await Promise.all([
            fetch(`/api/sejong/members?t=${Date.now()}`),
            fetch(`/api/sejong/attendance?t=${Date.now()}`)
        ]);
        
        if (!mRes.ok || !aRes.ok) throw new Error('Failed to fetch data');
        
        const membersList = await mRes.json();
        const attendanceList = await aRes.json();
        
        // Build member map
        membersList.forEach(m => {
            globalMembers[m.id] = m.name;
        });

        processAttendanceData(attendanceList);
        renderTotalOverall();
        renderYearList();
        
    } catch (e) {
        console.error("Failed to load attendance:", e);
        document.getElementById('totalAttendanceAmount').innerText = "데이터 로딩 실패";
        document.getElementById('tier-year-list').innerHTML = `<div class="empty-state"><span class="material-icons">error_outline</span><span>데이터를 불러올 수 없습니다.</span></div>`;
    }
});

function processAttendanceData(dataArray) {
    totalOverall = 0;
    groupedData = {};
    
    dataArray.forEach(record => {
        if(!record || !record.date) return;
        
        const dObj = new Date(record.date);
        if(isNaN(dObj.getTime())) return;

        const year = dObj.getFullYear();
        const month = dObj.getMonth() + 1;
        const day = dObj.getDate();
        
        let st = record.status || '';
        st = st.toLowerCase().trim();
        
        // Normalize status
        let category = '출석'; // default mapped
        if (st === '출석' || st === 'attendance' || st === 'present') category = '출석';
        else if (st === '결석' || st === 'absent' || st === 'absence') category = '결석';
        else if (st === '지각' || st === 'late' || st.includes('기각')) category = '지각'; // user typo '기각'
        else if (st === '조퇴' || st === 'early') category = '조퇴';
        else if (st === '연장' || st === 'extension' || st.includes('연장') || st === '연' || st === 'e') category = '연장';
        else return; // Ignore other statuses like 상담, 보강 if they don't count as standard day logic, but we could add them if wanted.

        // Initialize nested objects
        if (!groupedData[year]) groupedData[year] = { total: 0, months: {} };
        if (!groupedData[year].months[month]) groupedData[year].months[month] = { total: 0, days: {} };
        if (!groupedData[year].months[month].days[day]) {
            groupedData[year].months[month].days[day] = {
                출석: 0, 결석: 0, 지각: 0, 조퇴: 0, 연장: 0,
                details: []
            };
        }
        
        // Increment counts
        if (category === '출석') {
            totalOverall++;
            groupedData[year].total++;
            groupedData[year].months[month].total++;
        }
        
        groupedData[year].months[month].days[day][category]++;
        
        const memberName = globalMembers[record.memberId] || `학생(${record.memberId})`;
        groupedData[year].months[month].days[day].details.push({
            name: memberName,
            status: category
        });
    });
}

function renderTotalOverall() {
    document.getElementById('totalAttendanceAmount').innerText = totalOverall.toLocaleString() + '건';
}

function renderYearList() {
    const listEl = document.getElementById('tier-year-list');
    listEl.innerHTML = '';
    
    const years = Object.keys(groupedData).sort((a, b) => b - a);
    
    if (years.length === 0) {
        listEl.innerHTML = `<div class="empty-state">출석 데이터가 없습니다.</div>`;
        return;
    }
    
    years.forEach(year => {
        const d = groupedData[year];
        const el = document.createElement('div');
        el.className = 'drill-item';
        el.innerHTML = `
            <span class="di-label">${year}년</span>
            <span class="di-val">출석 ${d.total.toLocaleString()}건</span>
        `;
        el.onclick = () => {
            document.querySelectorAll('#tier-year-list .drill-item').forEach(n => n.classList.remove('active'));
            el.classList.add('active');
            selectedYear = year;
            selectedMonth = null;
            renderMonthList();
            clearDayList();
        };
        listEl.appendChild(el);
    });
}

function renderMonthList() {
    const listEl = document.getElementById('tier-month-list');
    listEl.innerHTML = '';
    
    document.getElementById('tier-month-title').innerText = `${selectedYear}년 월별 출석`;
    
    if (!selectedYear || !groupedData[selectedYear]) return;
    
    const months = Object.keys(groupedData[selectedYear].months).sort((a, b) => b - a);
    
    months.forEach(month => {
        const d = groupedData[selectedYear].months[month];
        const el = document.createElement('div');
        el.className = 'drill-item';
        el.innerHTML = `
            <span class="di-label">${month}월</span>
            <span class="di-val">출석 ${d.total.toLocaleString()}건</span>
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

function renderDayList() {
    const listEl = document.getElementById('tier-day-list');
    listEl.innerHTML = '';
    
    document.getElementById('tier-day-title').innerText = `${selectedYear}년 ${selectedMonth}월 일별 상세`;
    
    if (!selectedYear || !selectedMonth || !groupedData[selectedYear] || !groupedData[selectedYear].months[selectedMonth]) {
        clearDayList();
        return;
    }
    
    const daysObj = groupedData[selectedYear].months[selectedMonth].days;
    const days = Object.keys(daysObj).sort((a, b) => b - a); // descending day
    
    if (days.length === 0) {
        clearDayList();
        return;
    }
    
    days.forEach(day => {
        const dInfo = daysObj[day];
        
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day-group';
        
        dayDiv.innerHTML = `
            <div class="day-header">
                <span>${selectedMonth}월 ${day}일</span>
                <span class="day-total">총 출석 ${dInfo['출석']}건</span>
            </div>
            <div class="day-item" style="display:flex; gap:10px; flex-wrap:wrap; background:#f8fafc; border-bottom:1px solid #e2e8f0; padding:10px 15px;">
                <span style="color:#10b981; font-weight:700;">출석: ${dInfo['출석']}</span>
                <span style="color:#ef4444; font-weight:700;">결석: ${dInfo['결석']}</span>
                <span style="color:#f59e0b; font-weight:700;">지각: ${dInfo['지각']}</span>
                <span style="color:#8b5cf6; font-weight:700;">조퇴: ${dInfo['조퇴']}</span>
                <span style="color:#6366f1; font-weight:700;">연장: ${dInfo['연장']}</span>
            </div>
            <div style="padding: 10px 15px; font-size: 0.9rem; color: #475569; display:none;" id="details-${selectedYear}-${selectedMonth}-${day}">
                <!-- Will be populated dynamically if wanted -->
            </div>
            <div style="text-align:center; padding:5px; background:#f1f5f9; cursor:pointer; color:#94a3b8; font-size:0.85rem;" onclick="toggleDetails('${selectedYear}', '${selectedMonth}', '${day}', this)">
                명단 보기 ▼
            </div>
        `;
        listEl.appendChild(dayDiv);
    });
}

window.toggleDetails = function(y, m, d, btn) {
    const detailDiv = document.getElementById(`details-${y}-${m}-${d}`);
    if(detailDiv.style.display === 'none') {
        const dInfo = groupedData[y].months[m].days[d];
        const detailsStr = dInfo.details.map(item => {
            let color = '#333';
            if(item.status==='출석') color='#10b981';
            else if(item.status==='결석') color='#ef4444';
            else if(item.status==='지각') color='#f59e0b';
            else if(item.status==='조퇴') color='#8b5cf6';
            else if(item.status==='연장') color='#6366f1';
            
            return `<span style="display:inline-block; margin-right:10px; margin-bottom:5px;"><span style="color:${color}; font-weight:700;">[${item.status}]</span> ${item.name}</span>`;
        }).join('');
        
        detailDiv.innerHTML = detailsStr || '상세 내역 없음';
        detailDiv.style.display = 'block';
        btn.innerText = '명단 접기 ▲';
    } else {
        detailDiv.style.display = 'none';
        btn.innerText = '명단 보기 ▼';
    }
}

function clearDayList() {
    const listEl = document.getElementById('tier-day-list');
    listEl.innerHTML = `
        <div class="empty-state">
            <span class="material-icons">touch_app</span>
            <span>좌측에서 월을 먼저 선택해주세요.</span>
        </div>
    `;
    document.getElementById('tier-day-title').innerText = `3단계: 일별 상세`;
}
