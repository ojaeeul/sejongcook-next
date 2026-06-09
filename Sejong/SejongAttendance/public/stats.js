document.addEventListener('DOMContentLoaded', async () => {
    const API_BASE = '/api/sejong';
    
    try {
        const [mRes, pRes, aRes] = await Promise.all([
            fetch(`${API_BASE}/members?t=${Date.now()}`),
            fetch(`${API_BASE}/payments?t=${Date.now()}`),
            fetch(`${API_BASE}/attendance?t=${Date.now()}`)
        ]);

        const members = await mRes.json();
        const payments = await pRes.json();
        const attendance = await aRes.json();

        // 1. Summary Cards
        const activeMembers = members.filter(m => !['completed', 'trash', 'delete'].includes(m.status));
        document.getElementById('statActiveMembers').innerText = `${activeMembers.length}명`;

        // This Month Revenue
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        
        let thisMonthRevenue = 0;
        payments.forEach(p => {
            if (p.status === 'paid') {
                const pDate = new Date(p.updatedAt || p.date);
                if (pDate.getFullYear() === currentYear && pDate.getMonth() + 1 === currentMonth) {
                    thisMonthRevenue += (p.amount || 200000);
                }
            }
        });
        document.getElementById('statMonthlyRevenue').innerText = `${thisMonthRevenue.toLocaleString()}원`;

        // Today's attendance
        const offset = today.getTimezoneOffset() * 60000;
        const localToday = new Date(today.getTime() - offset);
        const todayStr = localToday.toISOString().split('T')[0];
        
        const todaysAttendance = attendance.filter(a => a.date && a.date.startsWith(todayStr));
        const uniqueTodayAttenders = new Set(todaysAttendance.map(a => a.memberId));
        document.getElementById('statTodayAttendance').innerText = `${uniqueTodayAttenders.size}명`;

        // 2. Render Charts
        renderRevenueChart(payments);
        renderCourseChart(activeMembers);
        renderAttendanceChart(attendance);

        // 3. Generate AI Smart Report
        generateSmartReport(activeMembers, payments, attendance);

    } catch (e) {
        console.error("Failed to load dashboard data", e);
        document.getElementById('aiReportBox').innerHTML = `<span style="color: #ef4444;">데이터를 불러오는 데 실패했습니다.</span>`;
    }
});

function generateSmartReport(members, payments, attendance) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    let lastMonth = currentMonth - 1;
    let lastMonthYear = currentYear;
    if (lastMonth === 0) {
        lastMonth = 12;
        lastMonthYear--;
    }

    // 1. 매출 계산
    let thisMonthRevenue = 0;
    let lastMonthRevenue = 0;
    payments.forEach(p => {
        if (p.status === 'paid') {
            const pDate = new Date(p.updatedAt || p.date);
            if (pDate.getFullYear() === currentYear && pDate.getMonth() + 1 === currentMonth) {
                thisMonthRevenue += (p.amount || 200000);
            } else if (pDate.getFullYear() === lastMonthYear && pDate.getMonth() + 1 === lastMonth) {
                lastMonthRevenue += (p.amount || 200000);
            }
        }
    });

    let revenueTrend = "";
    if (lastMonthRevenue === 0 && thisMonthRevenue > 0) {
        revenueTrend = `이번 달 수납액은 ${thisMonthRevenue.toLocaleString()}원으로 안정적인 매출이 발생했습니다.`;
    } else if (thisMonthRevenue > lastMonthRevenue) {
        const inc = Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);
        revenueTrend = `저번 달 대비 이번 달 수납액이 <b>${inc}% 증가</b>하며 좋은 상승세를 보이고 있습니다.`;
    } else if (thisMonthRevenue < lastMonthRevenue) {
        const dec = Math.round(((lastMonthRevenue - thisMonthRevenue) / lastMonthRevenue) * 100);
        revenueTrend = `저번 달 대비 수납액이 약 ${dec}% 감소하였으나, 월말 결제 예정자를 고려하면 예년 수준을 유지할 것으로 예상됩니다.`;
    } else {
        revenueTrend = `수납액은 지난 달과 동일한 수준을 꾸준히 유지하고 있습니다.`;
    }

    // 2. 인기 과목
    const courseCounts = {};
    members.forEach(m => {
        if (!m.course) return;
        const courses = m.course.split(',').map(c => c.split('(')[0].trim()).filter(c => c);
        courses.forEach(c => { courseCounts[c] = (courseCounts[c] || 0) + 1; });
    });
    
    let topCourse = "없음";
    let topCourseRatio = 0;
    if (Object.keys(courseCounts).length > 0) {
        const sortedCourses = Object.keys(courseCounts).sort((a,b) => courseCounts[b] - courseCounts[a]);
        topCourse = sortedCourses[0];
        topCourseRatio = Math.round((courseCounts[topCourse] / members.length) * 100);
    }

    // 3. 출석 현황
    const dayMap = {};
    attendance.forEach(a => {
        if (!a.date) return;
        const dStr = a.date.split('T')[0];
        if (!dayMap[dStr]) dayMap[dStr] = new Set();
        dayMap[dStr].add(a.memberId);
    });

    let totalAttendance14 = 0;
    let validDays = 0;
    for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const offset = d.getTimezoneOffset() * 60000;
        const localDate = new Date(d.getTime() - offset);
        const dStr = localDate.toISOString().split('T')[0];
        if (dayMap[dStr] && dayMap[dStr].size > 0) {
            totalAttendance14 += dayMap[dStr].size;
            validDays++;
        }
    }
    const avgAttendance = validDays > 0 ? Math.round(totalAttendance14 / validDays) : 0;

    // 4. 결론 및 발전방향성 도출
    let statusText = "매우 안정적이고 우수한 상태";
    let directionText = "";

    if (avgAttendance < members.length * 0.3) {
        statusText = "출석 독려가 다소 필요한 상태";
        directionText = "최근 출석률이 저조한 학생들을 파악하여, SMS 학원 문자를 통해 결석 방지 및 동기 부여 격려 문자를 발송하는 것을 강력히 추천합니다.";
    } else if (topCourseRatio > 50) {
        directionText = `현재 '${topCourse}' 과정의 수요가 폭발적으로 높습니다. 해당 과목의 심화반(또는 추가 개설)을 검토하시거나, 관련된 특강 이벤트로 추가 수익 창출을 노려볼 수 있습니다.`;
    } else if (thisMonthRevenue > lastMonthRevenue) {
        directionText = "신규 수강생 유입 및 결제가 활발합니다. 현재의 교육 품질과 학원 홍보 방식을 꾸준히 유지하는 것이 좋습니다.";
    } else {
        directionText = "학생들의 출석 패턴이 일정하게 잘 유지되고 있습니다. 수강생들의 만족도를 높이기 위해 중간 피드백(상담)을 진행해 보시는 것을 권장합니다.";
    }

    // 5. HTML 조합
    const reportHtml = `
        <div style="margin-bottom: 12px;"><span style="color:#60a5fa; font-weight:bold;">[서론]</span> 현재 세종요리제과학원은 총 <b style="color:white;">${members.length}명</b>의 수강생이 활발히 수강 중이며, 학원 시스템이 안정적으로 운영되고 있습니다.</div>
        <div style="margin-bottom: 12px;"><span style="color:#34d399; font-weight:bold;">[본론]</span> ${revenueTrend} 또한, <b>'${topCourse}'</b> 과목이 전체 수강생의 <b>${topCourseRatio}%</b>를 차지하며 가장 높은 인기를 끌고 있습니다. 최근 2주간 학원이 운영된 날의 일일 평균 출석자는 <b>${avgAttendance}명</b>으로 분석되었습니다.</div>
        <div style="margin-bottom: 12px;"><span style="color:#f472b6; font-weight:bold;">[결론]</span> 종합적으로 판단할 때, 현재 학원의 운영 및 수강 상태는 <b>${statusText}</b>입니다.</div>
        <div style="margin-bottom: 12px;"><span style="color:#fbbf24; font-weight:bold;">[진행 상황]</span> 키오스크 출석과 수강료 납부 관리가 체계적으로 이루어지고 있어 업무 효율성이 극대화되고 있습니다.</div>
        <div><span style="color:#a78bfa; font-weight:bold;">[발전 방향성]</span> 💡 ${directionText}</div>
    `;

    // 타이핑 효과 없이 부드럽게 페이드인
    const box = document.getElementById('aiReportBox');
    box.style.opacity = '0';
    setTimeout(() => {
        box.innerHTML = reportHtml;
        box.style.transition = 'opacity 1s ease-in-out';
        box.style.opacity = '1';
    }, 800);
}

function renderRevenueChart(payments) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    
    const labels = [];
    const data = [];
    
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        labels.push(`${m}월`);
        
        let sum = 0;
        payments.forEach(p => {
            if (p.status === 'paid') {
                const pDate = new Date(p.updatedAt || p.date);
                if (pDate.getFullYear() === y && pDate.getMonth() + 1 === m) {
                    sum += (p.amount || 200000);
                }
            }
        });
        data.push(sum);
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '월별 납부 수입 (원)',
                data: data,
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return (value / 10000) + '만';
                        }
                    }
                }
            }
        }
    });
}

function renderCourseChart(members) {
    const ctx = document.getElementById('courseChart').getContext('2d');
    
    const courseCounts = {};
    members.forEach(m => {
        if (!m.course) return;
        const courses = m.course.split(',').map(c => c.split('(')[0].trim()).filter(c => c);
        courses.forEach(c => {
            courseCounts[c] = (courseCounts[c] || 0) + 1;
        });
    });

    const labels = Object.keys(courseCounts).sort((a,b) => courseCounts[b] - courseCounts[a]);
    const data = labels.map(l => courseCounts[l]);

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
                    '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
                ],
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: { 
                        boxWidth: 12,
                        font: { size: 11 }
                    }
                }
            }
        }
    });
}

function renderAttendanceChart(attendance) {
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    
    const labels = [];
    const data = [];
    
    const dayMap = {};
    attendance.forEach(a => {
        if (!a.date) return;
        const dStr = a.date.split('T')[0];
        if (!dayMap[dStr]) dayMap[dStr] = new Set();
        dayMap[dStr].add(a.memberId);
    });

    for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        
        const offset = d.getTimezoneOffset() * 60000;
        const localDate = new Date(d.getTime() - offset);
        const dStr = localDate.toISOString().split('T')[0];
        
        const shortLabel = `${d.getMonth()+1}/${d.getDate()}`;
        labels.push(shortLabel);
        
        data.push(dayMap[dStr] ? dayMap[dStr].size : 0);
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '출석 수 (명)',
                data: data,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#8b5cf6',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function toggleAccordion(id, element) {
    const body = document.getElementById(id);
    const checkbox = element.querySelector('input[type="checkbox"]');
    
    if (body.style.display === 'none') {
        body.style.display = 'block';
        if (checkbox) checkbox.checked = true;
    } else {
        body.style.display = 'none';
        if (checkbox) checkbox.checked = false;
    }
}
