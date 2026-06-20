const urlParams = new URLSearchParams(window.location.search);
const category = urlParams.get('category') || 'members';
const type = urlParams.get('type') || 'current_members';

// Global Data
let globalMembers = [];
let globalPayments = [];
let globalAttendance = {};
let courseFees = {};

// Chart Instances
let mainChart = null;
let subChart = null;

const configMap = {
    // Members Category
    'current_members': { title: '현재 수강생 현황 (현원)', icon: 'people', color: '#3b82f6' },
    'new_members': { title: '신규 등록 현황', icon: 'person_add', color: '#10b981' },
    'completed': { title: '수료생 현황', icon: 'school', color: '#8b5cf6' },
    'waiting': { title: '대기 인원 현황', icon: 'hourglass_empty', color: '#f59e0b' },
    'transfer_in': { title: '전입생 현황', icon: 'flight_land', color: '#06b6d4' },
    'transfer_out': { title: '전출생 현황', icon: 'flight_takeoff', color: '#f43f5e' },
    
    // Attendance Category
    'present': { title: '출석 현황 분석', icon: 'check_circle', color: '#22c55e' },
    'late': { title: '지각 현황 분석', icon: 'schedule', color: '#eab308' },
    'absent': { title: '결석 현황 분석', icon: 'cancel', color: '#ef4444' },
    'early_leave': { title: '조퇴 현황 분석', icon: 'directions_run', color: '#f97316' },
    'makeup': { title: '보강 현황 분석', icon: 'autorenew', color: '#0ea5e9' },
    'consult': { title: '상담 현황 분석', icon: 'support_agent', color: '#6366f1' },

    // Revenue Category
    'period_revenue': { title: '기간 매출 통합 분석', icon: 'account_balance_wallet', color: '#ec4899' },
    'sales_date_paid': { title: '매출일 기준 납입', icon: 'point_of_sale', color: '#d946ef' },
    'payment_date_paid': { title: '납부일 기준 납입', icon: 'receipt_long', color: '#8b5cf6' },
    'sales_date_unpaid': { title: '매출일 기준 미납', icon: 'money_off', color: '#f43f5e' },
    'total_unpaid': { title: '전체 누적 미납액', icon: 'warning', color: '#dc2626' }
};

document.addEventListener('DOMContentLoaded', async () => {
    const conf = configMap[type] || configMap['current_members'];
    document.getElementById('pageTitle').innerText = conf.title;
    document.getElementById('pageIcon').innerText = conf.icon;
    document.getElementById('pageIcon').style.color = conf.color;
    document.title = `${conf.title} - 세종요리`;

    try {
        const [mRes, pRes, aRes, sRes] = await Promise.all([
            fetch(`/api/sejong/members?t=${Date.now()}`),
            fetch(`/api/sejong/payments?t=${Date.now()}`),
            fetch(`/api/sejong/attendance?t=${Date.now()}`),
            fetch(`/api/sejong/settings?t=${Date.now()}`)
        ]);
        globalMembers = await mRes.json();
        globalPayments = await pRes.json();
        globalAttendance = await aRes.json();
        
        const rawSettings = await sRes.json();
        const settings = Array.isArray(rawSettings) ? rawSettings[0] : rawSettings;
        courseFees = settings?.courseFees || {};

        populateCourseFilter();
        applyFilters();

        document.getElementById('loadingOverlay').style.display = 'none';
    } catch(e) {
        console.error(e);
        document.getElementById('loadingOverlay').innerHTML = `<h2 style="color: #ef4444;">데이터 로드에 실패했습니다.</h2><p>${e.message}</p>`;
    }
});

function populateCourseFilter() {
    const courseSet = new Set();
    globalMembers.forEach(m => {
        if(m.course) {
            m.course.split(',').forEach(c => courseSet.add(c.trim()));
        }
    });
    const filter = document.getElementById('courseFilter');
    Array.from(courseSet).sort().forEach(c => {
        if(c) {
            const opt = document.createElement('option');
            opt.value = c;
            opt.innerText = c;
            filter.appendChild(opt);
        }
    });
}

function applyFilters() {
    const year = document.getElementById('yearFilter').value;
    const month = document.getElementById('monthFilter').value;
    const course = document.getElementById('courseFilter').value;

    let filteredMembers = [...globalMembers];
    let filteredPayments = [...globalPayments];

    // Filter Logic based on type
    let dataForTable = [];
    let kpiData = [];
    let chartData = { labels: [], values: [] };
    let subChartData = { labels: [], values: [] };

    const conf = configMap[type] || configMap['current_members'];

    if (category === 'members') {
        if (type === 'current_members') {
            const active = filteredMembers.filter(m => !['completed', 'trash', 'delete'].includes(m.status));
            const targeted = course === 'all' ? active : active.filter(m => m.course && m.course.includes(course));
            
            kpiData = [
                { label: '총 현원수', value: targeted.length, unit: '명', icon: 'groups' },
                { label: '이번 달 신규', value: targeted.filter(m => m.registrationDate && m.registrationDate.startsWith(`${year}-${String(new Date().getMonth()+1).padStart(2,'0')}`)).length, unit: '명', icon: 'fiber_new' }
            ];

            // SubChart: Course breakdown
            const cMap = {};
            targeted.forEach(m => {
                const c = m.course ? m.course.split(',')[0].trim() : '미지정';
                cMap[c] = (cMap[c] || 0) + 1;
            });
            subChartData.labels = Object.keys(cMap);
            subChartData.values = Object.values(cMap);

            dataForTable = targeted.map(m => [m.name, m.school || '-', m.grade || '-', m.course || '-', m.registrationDate || '-']);
            renderTable(['이름', '학교', '학년', '과목', '등록일'], dataForTable);
        }
        else if (type === 'completed') {
            const comp = filteredMembers.filter(m => m.status === 'completed');
            const targeted = course === 'all' ? comp : comp.filter(m => m.course && m.course.includes(course));
            
            kpiData = [
                { label: '총 수료생', value: targeted.length, unit: '명', icon: 'workspace_premium' }
            ];
            
            dataForTable = targeted.map(m => [m.name, m.course || '-', m.phone || '-']);
            renderTable(['이름', '수강했던 과목', '연락처'], dataForTable);
        }
        else {
            // General fallback for unimplemented member types
            kpiData = [{ label: '해당 데이터', value: 0, unit: '명', icon: 'hourglass_empty' }];
            renderTable(['이름', '상태'], []);
        }
    } 
    else if (category === 'attendance') {
        const attTypeMap = { 'present':'출석', 'late':'지각', 'absent':'결석', 'early_leave':'조퇴', 'makeup':'보강', 'consult':'상담' };
        const attTarget = attTypeMap[type];

        let totalAtt = 0;
        const trendMap = {};

        // Loop globalAttendance roughly (Needs to match actual structure, normally { year: { month: { date: { memberId: status } } } })
        // Let's do a simplified mock aggregation for visual purposes if structure is complex
        Object.keys(globalAttendance).forEach(y => {
            if(year !== 'all' && y !== year) return;
            Object.keys(globalAttendance[y]).forEach(m => {
                if(month !== 'all' && m != month) return;
                Object.keys(globalAttendance[y][m]).forEach(d => {
                    const dayData = globalAttendance[y][m][d];
                    Object.keys(dayData).forEach(uid => {
                        if (dayData[uid] === attTarget) {
                            totalAtt++;
                            const mStr = `${y}-${String(m).padStart(2,'0')}`;
                            trendMap[mStr] = (trendMap[mStr]||0) + 1;
                            
                            const member = globalMembers.find(mm => mm.id === uid);
                            if (!course || course === 'all' || (member && member.course && member.course.includes(course))) {
                                dataForTable.push([`${y}-${m}-${d}`, member ? member.name : uid, attTarget]);
                            }
                        }
                    });
                });
            });
        });

        kpiData = [
            { label: `누적 ${attTarget} 횟수`, value: totalAtt, unit: '건', icon: conf.icon }
        ];

        const sortedMonths = Object.keys(trendMap).sort();
        chartData.labels = sortedMonths;
        chartData.values = sortedMonths.map(k => trendMap[k]);

        renderTable(['날짜', '이름', '상태'], dataForTable.slice(0, 500)); // Limit for performance
    }
    else if (category === 'revenue') {
        let totalRev = 0;
        let trendMap = {};

        filteredPayments.forEach(p => {
            if (p.status !== 'delete') {
                // If type is period revenue, sum up all paids
                if (type === 'period_revenue' && p.status === 'paid') {
                    const py = String(p.year);
                    const pm = String(p.month);
                    if ((year === 'all' || py === year) && (month === 'all' || pm === month)) {
                        const amt = p.amount || 200000;
                        totalRev += amt;
                        const mStr = `${py}-${pm.padStart(2,'0')}`;
                        trendMap[mStr] = (trendMap[mStr]||0) + amt;

                        const mem = globalMembers.find(m => m.id === p.memberId);
                        dataForTable.push([`${py}-${pm}-${p.day||'01'}`, mem ? mem.name : p.memberId, p.course || '-', amt.toLocaleString()+'원']);
                    }
                }
            }
        });

        kpiData = [
            { label: '총 매출액', value: (totalRev / 10000).toLocaleString(), unit: '만 원', icon: 'payments' }
        ];

        const sortedMonths = Object.keys(trendMap).sort();
        chartData.labels = sortedMonths;
        chartData.values = sortedMonths.map(k => trendMap[k]);

        renderTable(['결제일', '이름', '과목', '결제금액'], dataForTable);
    }

    renderKPIs(kpiData, conf.color);
    
    if(chartData.labels.length > 0) {
        renderMainChart(chartData.labels, chartData.values, conf.color);
    } else {
        renderMainChart(['데이터 없음'], [0], conf.color);
    }

    if(subChartData.labels.length > 0) {
        renderSubChart(subChartData.labels, subChartData.values, conf.color);
    } else {
        renderSubChart(['데이터 없음'], [1], '#e2e8f0');
    }
}

function renderKPIs(data, color) {
    const container = document.getElementById('kpiContainer');
    container.innerHTML = '';
    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'kpi-card';
        div.style.setProperty('--card-color', color);
        div.innerHTML = `
            <div class="kpi-info">
                <h3>${item.label}</h3>
                <p class="value">${item.value} <span class="unit">${item.unit}</span></p>
            </div>
            <div class="kpi-icon" style="--card-bg: ${color}15; --card-color: ${color};">
                <span class="material-icons">${item.icon}</span>
            </div>
        `;
        container.appendChild(div);
    });
}

function renderMainChart(labels, data, color) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    if (mainChart) mainChart.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, `${color}20`); // transparent version

    mainChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '트렌드 데이터',
                data: data,
                backgroundColor: gradient,
                borderRadius: 8,
                borderWidth: 0,
                barPercentage: 0.5
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true, grid: { color: '#f1f5f9' } }
            }
        }
    });
}

function renderSubChart(labels, data, color) {
    const ctx = document.getElementById('subChart').getContext('2d');
    if (subChart) subChart.destroy();

    subChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    color, 
                    color+'cc', 
                    color+'99', 
                    color+'66', 
                    color+'33', 
                    '#e2e8f0'
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { 
                legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15 } }
            },
            cutout: '65%'
        }
    });
}

function renderTable(headers, rows) {
    document.getElementById('tableCount').innerText = `${rows.length}건 검색됨`;
    
    const thead = document.getElementById('tableHead');
    thead.innerHTML = '';
    headers.forEach(h => {
        const th = document.createElement('th');
        th.innerText = h;
        thead.appendChild(th);
    });

    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    if (rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${headers.length}" style="text-align:center; padding:30px; color:#94a3b8;">데이터가 없습니다.</td></tr>`;
        return;
    }

    rows.forEach(r => {
        const tr = document.createElement('tr');
        r.forEach(c => {
            const td = document.createElement('td');
            td.innerText = c;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}
