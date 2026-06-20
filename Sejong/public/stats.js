let globalMembers = [];
let globalPayments = [];
let globalAttendance = [];
let courseChartInstance = null;
let attendanceChartInstance = null;
let growthCharts = {};

document.addEventListener('DOMContentLoaded', async () => {
    const API_BASE = '/api/sejong';
    
    const startInput = document.getElementById('reportStartDate');
    const endInput = document.getElementById('reportEndDate');
    
    startInput.addEventListener('change', updateDashboard);
    endInput.addEventListener('change', updateDashboard);

    try {
        if(typeof window.loadCycleSettings === 'function') await window.loadCycleSettings();
        const [mRes, pRes, aRes, eRes, sRes] = await Promise.all([
            fetch(`${API_BASE}/members?t=${Date.now()}`),
            fetch(`${API_BASE}/payments?t=${Date.now()}`),
            fetch(`${API_BASE}/attendance?t=${Date.now()}`),
            fetch(`${API_BASE}/expense?year=all&t=${Date.now()}`).catch(() => ({ok: false})),
            fetch(`${API_BASE}/settings?t=${Date.now()}`).catch(() => ({ok: false}))
        ]);

        globalMembers = await mRes.json();
        globalPayments = await pRes.json();
        globalAttendance = await aRes.json();
        
        let rawSettings = { courseFees: {} };
        if (sRes && sRes.ok) {
            const parsed = await sRes.json();
            rawSettings = Array.isArray(parsed) ? parsed[0] : parsed;
        }
        window.courseFees = rawSettings && rawSettings.courseFees ? rawSettings.courseFees : {};
        
        let globalExpenses = [];
        if (eRes && eRes.ok) {
            try { 
                const dataArray = await eRes.json();
                const notebooks = Array.isArray(dataArray) ? dataArray : [dataArray];
                
                notebooks.forEach(data => {
                    if (!data) return;
                    let notebookYear = data.expenseYear || '2026';
                    notebookYear = notebookYear.replace(/[^0-9]/g, '');

                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = data.leftHTML || '';
                    
                    let lastSeenDate = '';

                    Array.from(tempDiv.querySelectorAll('.entry-line')).forEach(line => {
                        const dCol = line.querySelector('.date-col');
                        const descCol = line.querySelector('.desc-col');
                        const aCol = line.querySelector('.amount-col');
                        
                        if(!descCol || !aCol) return;
                        
                        let dText = dCol ? dCol.textContent.trim() : '';
                        if(dText) lastSeenDate = dText;
                        else dText = lastSeenDate;
                        
                        let amountText = aCol.textContent.trim();
                        let descText = descCol.textContent.trim();
                        if(!amountText || !descText) return;
                        
                        let match = dText.match(/^(\d+)\/(\d+)/);
                        if(match) {
                            let rowMonth = parseInt(match[1]);
                            let rowDay = parseInt(match[2]);
                            let rowYear = parseInt(notebookYear);
                            
                            let num = Number(amountText.replace(/,/g, '').replace(/\.—/g, '000').replace(/\.-/g, '000').replace(/[^0-9-]/g, ''));
                            if(isNaN(num)) num = 0;
                            
                            // Create JS Date object
                            const eDate = new Date(rowYear, rowMonth - 1, rowDay, 12, 0, 0);
                            
                            globalExpenses.push({
                                amount: num,
                                date: eDate.toISOString(),
                                desc: descText
                            });
                        }
                    });
                });
            } catch(e) {
                console.error("Expense parsing error:", e);
            }
        }

        window.globalExpenses = globalExpenses;

        initGrowthMonths();
        updateDashboard();

    } catch (e) {
        console.error("Failed to load dashboard data", e);
        document.getElementById('aiReportBox').innerHTML = `<span style="color: #ef4444;">데이터를 불러오는 데 실패했습니다.</span>`;
    }
});

function initGrowthMonths() {
    const container = document.getElementById('monthBtnContainer');
    if (!container) return;
    container.innerHTML = '';
    
    const currentMonth = new Date().getMonth() + 1;
    for (let i = 1; i <= 12; i++) {
        const btn = document.createElement('button');
        btn.className = `month-btn ${i === currentMonth ? 'active' : ''}`;
        btn.innerText = `${i}월`;
        btn.onclick = (e) => {
            document.querySelectorAll('.month-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderGrowthCharts(i);
        };
        container.appendChild(btn);
    }
}

function updateDashboard() {
    const startDateStr = document.getElementById('reportStartDate').value;
    const endDateStr = document.getElementById('reportEndDate').value;
    
    if (!startDateStr || !endDateStr) return;
    
    const startObj = new Date(startDateStr);
    const endObj = new Date(endDateStr);
    endObj.setHours(23, 59, 59, 999);

    const activeMembers = globalMembers.filter(m => !['completed', 'trash', 'delete'].includes(m.status));
    
    // Total & Period Revenue
    let periodRevenue = 0;
    let totalRevenue = 0;
    globalPayments.forEach(p => {
        if (p.status === 'paid') {
            const amt = p.amount || 200000;
            totalRevenue += amt;
            const pDate = new Date(p.updatedAt || p.date);
            if (pDate >= startObj && pDate <= endObj) {
                periodRevenue += amt;
            }
        }
    });

    let periodUnpaid = 0; // 당일 미납 (선택기간 내 결제일 도래)
    let totalUnpaid = 0;  // 당월 누적 미납 (선택한 월 기준)
    
    const selectedYear = startObj.getFullYear();
    const selectedMonth = startObj.getMonth() + 1;
    const DEFAULT_PRICE = 200000;

    activeMembers.forEach(m => {
        let myCourses = (m.course || '').split(',').map(c => c.trim()).filter(c => c !== '');
        
        const hasJeggwa = myCourses.some(c => c.includes('제과') && !c.includes('제과제빵'));
        const hasJeppang = myCourses.some(c => c.includes('제빵') && !c.includes('제과제빵'));
        if (hasJeggwa && hasJeppang) {
            myCourses = myCourses.filter(c => !c.includes('제과') && !c.includes('제빵'));
            myCourses.push('제과제빵기능사');
        }
        if (myCourses.some(c => c.includes('제과') && !c.includes('제과제빵')) && myCourses.some(c => c.includes('제빵') && !c.includes('제과제빵'))) {
            myCourses = myCourses.filter(c => !c.includes('제과') && !c.includes('제빵'));
            myCourses.push('제과제빵기능사');
        }
        if (myCourses.length === 0) myCourses.push('');

        myCourses.forEach(fullCourse => {
            const courseNameOnly = fullCourse ? fullCourse.split('(')[0].trim() : '';
            const courseFee = window.courseFees[courseNameOnly] || window.courseFees['all'] || DEFAULT_PRICE;
            
            if (typeof window.calculateRedBoxesForMonth === 'function') {
                const stats = window.calculateRedBoxesForMonth(m, selectedYear, selectedMonth, window.globalAttendance, courseNameOnly, {});
                
                if (stats && stats.allMilestones) {
                    let currentProgressObj = stats.currentCount || { count: 0, target: 9 };
                    let remainingForLoop = currentProgressObj.count;
                    const isDualBakeryLocal = (courseNameOnly && courseNameOnly.replace(/\s/g, '').includes('제과제빵')) || (!courseNameOnly && m.course && m.course.replace(/\s/g, '').includes('제과제빵'));
                    const firstTargetCount = isDualBakeryLocal ? 17 : 9;
                    const subTargetCount = isDualBakeryLocal ? 16 : 8;
                    let isFirstCycleForThisCourse = true;
                    const normalizeCourse = (c) => (!c || c === 'null') ? null : String(c).trim();

                    stats.allMilestones.forEach(ms => {
                        let currentTargetCount = isFirstCycleForThisCourse ? firstTargetCount : subTargetCount;
                        const msPayment = globalPayments.find(p => p.memberId == m.id && p.year == ms.year && p.month == ms.month && normalizeCourse(p.course) === normalizeCourse(courseNameOnly) && p.status !== 'delete');
                        
                        if (msPayment && msPayment.status === 'paid') {
                            remainingForLoop -= currentTargetCount;
                            isFirstCycleForThisCourse = false;
                        } else {
                            const msDateObj = new Date(ms.year, ms.month - 1, ms.day);
                            const isActualOverdue = remainingForLoop >= currentTargetCount || (ms.isReal !== false && msDateObj <= new Date());
                            
                            if (isActualOverdue) {
                                // 당월 누적 미납 (선택한 월 기준)
                                if (ms.year === selectedYear && ms.month === selectedMonth) {
                                    totalUnpaid += courseFee;
                                }
                                
                                // 기간 미납 (선택한 기간 내에 결제일이 있는 경우)
                                if (msDateObj >= startObj && msDateObj <= endObj) {
                                    periodUnpaid += courseFee;
                                }
                            }
                            remainingForLoop -= currentTargetCount;
                            isFirstCycleForThisCourse = false;
                        }
                    });
                }
            }
        });
    });

    // Expenses calculations (Always Today & This Month)
    let todayExpense = 0;
    let thisMonthExpense = 0;
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = now.getMonth();
    const todayDate = now.getDate();

    if (window.globalExpenses) {
        window.globalExpenses.forEach(e => {
            const eAmt = parseInt(e.amount) || 0;
            const eDate = new Date(e.date || e.updatedAt || Date.now());
            
            if (eDate.getFullYear() === todayYear && eDate.getMonth() === todayMonth) {
                thisMonthExpense += eAmt;
                if (eDate.getDate() === todayDate) {
                    todayExpense += eAmt;
                }
            }
        });
    }

    // Attendance
    const attendanceInPeriod = globalAttendance.filter(a => {
        if (!a.date) return false;
        const d = new Date(a.date);
        return d >= startObj && d <= endObj;
    });
    const uniquePeriodAttenders = new Set(attendanceInPeriod.map(a => a.memberId));

    // Update Top Summary Cards (If they exist)
    if(document.getElementById('statActiveMembers')) document.getElementById('statActiveMembers').innerText = `${activeMembers.length}명`;
    if(document.getElementById('statMonthlyRevenue')) document.getElementById('statMonthlyRevenue').innerText = `${periodRevenue.toLocaleString()}원`;
    if(document.getElementById('statTodayAttendance')) document.getElementById('statTodayAttendance').innerText = `${uniquePeriodAttenders.size}명`;

    // Update Tab 1: Daily Dashboard (9 cards)
    if(document.getElementById('dashPayment')) document.getElementById('dashPayment').innerText = periodRevenue.toLocaleString();
    if(document.getElementById('dashPaymentAcc')) document.getElementById('dashPaymentAcc').innerText = totalRevenue.toLocaleString();
    
    if(document.getElementById('dashUnpaid')) document.getElementById('dashUnpaid').innerText = periodUnpaid === 0 ? '당일 미납 없음' : periodUnpaid.toLocaleString();
    if(document.getElementById('dashUnpaidAcc')) document.getElementById('dashUnpaidAcc').innerText = totalUnpaid.toLocaleString();

    if(document.getElementById('dashExpense')) document.getElementById('dashExpense').innerText = todayExpense.toLocaleString() + '원';
    if(document.getElementById('dashExpenseAcc')) document.getElementById('dashExpenseAcc').innerText = thisMonthExpense.toLocaleString() + '원';

    if(document.getElementById('dashStudents')) document.getElementById('dashStudents').innerText = activeMembers.length;
    if(document.getElementById('dashStudentsNew')) document.getElementById('dashStudentsNew').innerText = Math.max(0, Math.floor(activeMembers.length * 0.05)); // mock new
    if(document.getElementById('dashStudentsLeave')) document.getElementById('dashStudentsLeave').innerText = Math.max(0, Math.floor(activeMembers.length * 0.02)); // mock leave
    
    const courseSet = new Set();
    let adults = 0;
    let students = 0;
    let children = 0;
    activeMembers.forEach(m => {
        if (m.course) {
            m.course.split(',').forEach(c => courseSet.add(c.split('(')[0].trim()));
        }
        if (m.age) {
            const ageNum = parseInt(m.age);
            if (ageNum >= 20) adults++;
            else if (ageNum >= 14) students++;
            else children++;
        } else {
            adults++; // default to adult
        }
    });
    
    if(document.getElementById('dashCourses')) document.getElementById('dashCourses').innerText = courseSet.size;
    if(document.getElementById('ageAdult')) document.getElementById('ageAdult').innerText = adults;
    if(document.getElementById('ageStudent')) document.getElementById('ageStudent').innerText = students;
    if(document.getElementById('ageChild')) document.getElementById('ageChild').innerText = children;
    
    // Vehicles & Missed Calls
    let vehicle1 = 0;
    let vehicle2 = 0;
    activeMembers.forEach(m => {
        const note = m.notes || m.note || '';
        if (note.includes('1호차')) vehicle1++;
        if (note.includes('2호차')) vehicle2++;
    });
    if(document.getElementById('dashVehicle1')) document.getElementById('dashVehicle1').innerText = vehicle1;
    if(document.getElementById('dashVehicle2')) document.getElementById('dashVehicle2').innerText = vehicle2;
    if(document.getElementById('dashMissed')) document.getElementById('dashMissed').innerText = '준비 중';
    
    // Absent
    const absentCount = Math.max(0, activeMembers.length - uniquePeriodAttenders.size);
    if(document.getElementById('dashAbsent')) document.getElementById('dashAbsent').innerText = absentCount;

    let consultationCount = 0;
    let makeupCount = 0;
    let extensionCount = 0;
    attendanceInPeriod.forEach(a => {
        const st = a.status || '';
        if (st === '상담' || st.includes('consultation')) consultationCount++;
        else if (st === '보강' || st.includes('makeup')) makeupCount++;
        else if (st === 'extension' || st.includes('연장') || st === '연' || st === 'E') extensionCount++;
    });

    if(document.getElementById('dashConsultation')) document.getElementById('dashConsultation').innerText = `상담 ${consultationCount}`;
    if(document.getElementById('dashMakeup')) document.getElementById('dashMakeup').innerText = `보강 ${makeupCount}`;
    if(document.getElementById('dashExtension')) document.getElementById('dashExtension').innerText = `연장 ${extensionCount}`;

    // Update Tab 3: Comprehensive
    if(document.getElementById('compTotalMembers')) document.getElementById('compTotalMembers').innerText = activeMembers.length;
    if(document.getElementById('compNewMembers')) document.getElementById('compNewMembers').innerText = Math.floor(activeMembers.length * 0.05);
    
    if(document.getElementById('compAtt')) document.getElementById('compAtt').innerText = uniquePeriodAttenders.size;
    if(document.getElementById('compAbs')) document.getElementById('compAbs').innerText = absentCount;
    
    if(document.getElementById('compRev')) document.getElementById('compRev').innerText = periodRevenue.toLocaleString();
    if(document.getElementById('compRev2')) document.getElementById('compRev2').innerText = periodRevenue.toLocaleString();
    if(document.getElementById('compRev3')) document.getElementById('compRev3').innerText = periodRevenue.toLocaleString();

    // Render other charts
    renderCourseChart(activeMembers);
    renderAttendanceChart(globalAttendance, startObj, endObj);
    
    // Initial Growth Chart render
    renderGrowthCharts(new Date().getMonth() + 1);

    generateSmartReport(activeMembers, globalPayments, globalAttendance, startObj, endObj);
}

function renderGrowthCharts(month) {
    const createMiniChart = (id, color, dataArr) => {
        if (growthCharts[id]) growthCharts[id].destroy();
        const ctx = document.getElementById(id);
        if (!ctx) return;
        growthCharts[id] = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월'],
                datasets: [{
                    data: dataArr,
                    backgroundColor: (ctx) => {
                        const idx = ctx.dataIndex;
                        return idx === month - 1 ? color : '#f1f5f9';
                    },
                    borderRadius: 6,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: {
                    x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10, weight: 'bold' }, color: '#94a3b8' } },
                    y: { display: false }
                }
            }
        });
    };

    // Dummy data generation based on month selected to give a dynamic feel
    const genData = (base) => Array.from({length: 8}, (_, i) => base + Math.random() * (base * 0.5));
    
    createMiniChart('chartIncome', '#14b8a6', genData(100)); // Teal
    createMiniChart('chartExpense', '#f43f5e', genData(60)); // Rose
    createMiniChart('chartProfit', '#cbd5e1', genData(40));  // Slate
    createMiniChart('chartMembers', '#6366f1', genData(150)); // Indigo
}

function generateSmartReport(members, payments, attendance, startObj, endObj) {
    // Keep identical to previous version, excluded for brevity as it's already working
    let periodRevenue = 0;
    payments.forEach(p => {
        if (p.status === 'paid') {
            const pDate = new Date(p.updatedAt || p.date);
            if (pDate >= startObj && pDate <= endObj) periodRevenue += (p.amount || 200000);
        }
    });

    let revenueTrend = `선택된 기간 내 총 수납액은 <b>${periodRevenue.toLocaleString()}원</b>으로 집계되었습니다.`;

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

    const dayMap = {};
    attendance.forEach(a => {
        if (!a.date) return;
        const dStr = a.date.split('T')[0];
        const dObj = new Date(a.date);
        if (dObj >= startObj && dObj <= endObj) {
            if (!dayMap[dStr]) dayMap[dStr] = new Set();
            dayMap[dStr].add(a.memberId);
        }
    });

    let totalAttendance = 0;
    let validDays = Object.keys(dayMap).length;
    Object.values(dayMap).forEach(set => { totalAttendance += set.size; });
    const avgAttendance = validDays > 0 ? Math.round(totalAttendance / validDays) : 0;

    let statusText = "안정적이고 우수한 상태";
    let directionText = "현재 학생들의 전반적인 출석 및 결제 상태가 안정적으로 파악됩니다.";

    if (avgAttendance < members.length * 0.3) {
        statusText = "출석 독려가 필요한 상태";
        directionText = "최근 출석률이 저조한 학생들을 파악하여, SMS 학원 문자를 통해 결석 방지 안내 문자를 발송하는 것을 추천합니다.";
    }

    const reportHtml = `
        <div style="margin-bottom: 12px;"><span style="color:#60a5fa; font-weight:bold;">[서론]</span> 현재 총 <b style="color:white;">${members.length}명</b>의 수강생이 활발히 수강 중이며 학원 시스템이 안정적으로 운영되고 있습니다.</div>
        <div style="margin-bottom: 12px;"><span style="color:#34d399; font-weight:bold;">[본론]</span> ${revenueTrend} 가장 수요가 높은 과목은 <b>'${topCourse}'</b>(${topCourseRatio}%)입니다. 지정된 기간 내 일일 평균 출석자는 <b>${avgAttendance}명</b>으로 확인되었습니다.</div>
        <div style="margin-bottom: 12px;"><span style="color:#f472b6; font-weight:bold;">[결론]</span> 학원의 운영 상태는 <b>${statusText}</b>입니다.</div>
        <div><span style="color:#a78bfa; font-weight:bold;">[발전 방향]</span> 💡 ${directionText}</div>
    `;

    const box = document.getElementById('aiReportBox');
    if (!box) return;
    box.style.opacity = '0';
    setTimeout(() => {
        box.innerHTML = reportHtml;
        box.style.transition = 'opacity 1s ease-in-out';
        box.style.opacity = '1';
    }, 800);
}

function renderCourseChart(members) {
    if (courseChartInstance) courseChartInstance.destroy();
    const ctx = document.getElementById('courseChart');
    if (!ctx) return;
    
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

    courseChartInstance = new Chart(ctx.getContext('2d'), {
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
                    labels: { boxWidth: 12, font: { size: 11 } }
                }
            }
        }
    });
}

function renderAttendanceChart(attendance, startObj, endObj) {
    if (attendanceChartInstance) attendanceChartInstance.destroy();
    const ctx = document.getElementById('attendanceChart');
    if (!ctx) return;
    
    const chartTitle = document.querySelector('#acc-attendance h3');
    if (chartTitle) chartTitle.innerText = `📅 기간 내 일일 출석 현황`;

    const labels = [];
    const data = [];
    
    const dayMap = {};
    attendance.forEach(a => {
        if (!a.date) return;
        const dStr = a.date.split('T')[0];
        if (!dayMap[dStr]) dayMap[dStr] = new Set();
        dayMap[dStr].add(a.memberId);
    });

    const diffDays = Math.ceil((endObj - startObj) / (1000 * 60 * 60 * 24));
    let step = 1;
    if (diffDays > 30) step = Math.ceil(diffDays / 30);

    for (let d = new Date(startObj); d <= endObj; d.setDate(d.getDate() + step)) {
        const offset = d.getTimezoneOffset() * 60000;
        const localDate = new Date(d.getTime() - offset);
        const dStr = localDate.toISOString().split('T')[0];
        
        labels.push(`${d.getMonth()+1}/${d.getDate()}`);
        data.push(dayMap[dStr] ? dayMap[dStr].size : 0);
    }

    attendanceChartInstance = new Chart(ctx.getContext('2d'), {
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
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
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
