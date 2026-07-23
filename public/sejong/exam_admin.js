let examsData = [];
let membersData = {};
let questionsData = {};
let barChartInstance = null;
let radarChartInstance = null;

const SECTIONS_COOK = [
    { name: '위생 및 관련법규', start: 0, end: 15 },
    { name: '공중보건학', start: 15, end: 30 },
    { name: '식품학', start: 30, end: 45 },
    { name: '조리이론 및 원가', start: 45, end: 60 }
];

const SECTIONS_BAKE = [
    { name: '제조이론(제과/제빵)', start: 0, end: 15 },
    { name: '재료과학', start: 15, end: 30 },
    { name: '식품위생학', start: 30, end: 45 },
    { name: '영양학 및 기타', start: 45, end: 60 }
];

function getSections(examKey) {
    if (examKey && (examKey.includes('제과') || examKey.includes('제빵'))) {
        return SECTIONS_BAKE;
    }
    return SECTIONS_COOK;
}

async function initAdminApp() {
    console.log("initAdminApp CALLED");
    await loadExamAdminData();
    initCalendar();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminApp);
} else {
    initAdminApp();
}

async function loadExamAdminData() {
    console.log("loadExamAdminData CALLED");
    try {
        const [examsRes, membersRes, qRes] = await Promise.all([
            fetch('/api/sejong/exams?t=' + Date.now()),
            fetch('/api/sejong/members?t=' + Date.now()),
            fetch('questions_data.json?v=' + Date.now())
        ]);
        
        examsData = await examsRes.json();
        const memArray = await membersRes.json();
        questionsData = await qRes.json();
        
        if (!Array.isArray(examsData)) examsData = [];
        
        // Map members by phone for quick lookup
        memArray.forEach(m => {
            membersData[m.phone] = m.name;
        });
        
        // Sort exams by submit time descending
        examsData.sort((a, b) => new Date(b.submitTime || b.startTime || 0) - new Date(a.submitTime || a.startTime || 0));
        
    } catch (e) {
        console.error("Failed to fetch data:", e);
    }
}

function getStudentName(examPhone) {
    if (!examPhone) return '알수없음';
    if (membersData[examPhone]) return membersData[examPhone];
    
    // Check if examPhone is 4 digits and match the end of member phones
    const cleanedExamPhone = examPhone.replace(/-/g, '');
    for (const phone in membersData) {
        const cleanedPhone = phone.replace(/-/g, '');
        if (cleanedPhone.endsWith(cleanedExamPhone)) {
            return membersData[phone];
        }
    }
    return '알수없음';
}

function formatDate(isoString) {
    if (!isoString) return '-';
    const d = new Date(isoString);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${m}/${day} ${h}:${min}`;
}

function formatDuration(startTime, submitTime) {
    if (!startTime || !submitTime) return '-';
    const diffMs = new Date(submitTime) - new Date(startTime);
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    return `${diffMins}분 ${diffSecs}초`;
}

let currentCalDate = new Date();

function initCalendar() {
    const dateSelect = document.getElementById('examDateSelect');
    // Set today as default
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateSelect.value = `${yyyy}-${mm}-${dd}`;
    
    // Show calendar by default instead of filtering to today immediately
    renderCalendar();
}

function changeMonth(delta) {
    currentCalDate.setMonth(currentCalDate.getMonth() + delta);
    renderCalendar();
}

function renderCalendar() {
    document.getElementById('reportContainer').style.display = 'none';
    document.getElementById('dateListArea').style.display = 'none';
    document.getElementById('noDataMessage').style.display = 'none';
    document.getElementById('calendarSection').style.display = 'block';

    const year = currentCalDate.getFullYear();
    const month = currentCalDate.getMonth();
    document.getElementById('calendarMonthLabel').textContent = `${year}년 ${month + 1}월`;
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const grid = document.getElementById('calendarGrid');
    
    while (grid.children.length > 7) {
        grid.removeChild(grid.lastChild);
    }
    
    const recordsByDay = {};
    examsData.forEach(r => {
        const timeField = r.submitTime || r.startTime;
        if (!timeField) return;
        
        // Use exact same UTC date string as exam_management.html to ensure 100% match
        const dateStr = timeField.split('T')[0];
        
        if (!recordsByDay[dateStr]) recordsByDay[dateStr] = [];
        recordsByDay[dateStr].push(r);
    });
    
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.style.padding = '10px';
        grid.appendChild(empty);
    }
    
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const todayKST = new Date(now.getTime() - offset);
    const todayStr = todayKST.toISOString().split('T')[0];
    
    for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month, d);
        const yStr = dateObj.getFullYear();
        const mStr = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dStr = String(dateObj.getDate()).padStart(2, '0');
        const ds = `${yStr}-${mStr}-${dStr}`;
        
        const dayCell = document.createElement('div');
        dayCell.style.padding = '8px 1px';
        dayCell.style.border = '1px solid #f1f5f9';
        dayCell.style.borderRadius = '4px';
        dayCell.style.position = 'relative';
        dayCell.style.cursor = 'pointer';
        dayCell.style.minHeight = '70px';
        dayCell.style.minWidth = '0';
        dayCell.style.overflow = 'hidden';
        
        if (ds === todayStr) {
            dayCell.style.backgroundColor = '#eff6ff';
            dayCell.style.borderColor = '#bfdbfe';
        }
        
        let color = '#475569';
        if (dateObj.getDay() === 0) color = '#ef4444';
        else if (dateObj.getDay() === 6) color = '#3b82f6';
        
        let html = `<div style="font-weight:500; color:${color}">${d}</div>`;
        
        if (recordsByDay[ds] && recordsByDay[ds].length > 0) {
            const count = recordsByDay[ds].length;
            let namesHtml = '';
            const MAX_NAMES = 3;
            const shownRecords = recordsByDay[ds].slice(0, MAX_NAMES);
            shownRecords.forEach(r => {
                const studentName = getStudentName(r.phone) || (r.name ? r.name : r.phone);
                namesHtml += `<div style="font-size:0.65rem; color:#1e293b; margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding:0 1px; letter-spacing:-0.5px;">${studentName}</div>`;
            });
            if (count > MAX_NAMES) {
                namesHtml += `<div style="font-size:0.65rem; color:#64748b; margin-top:2px;">외 ${count - MAX_NAMES}명</div>`;
            }
            html += `<div style="margin-top:6px; background:#10b981; color:white; font-size:0.65rem; border-radius:12px; padding:2px 0; font-weight:bold; box-shadow:0 1px 2px rgba(0,0,0,0.1); letter-spacing:-0.5px;">${count}명 응시</div>`;
            html += namesHtml;
            if (ds !== todayStr) {
                dayCell.style.backgroundColor = '#f0fdf4';
                dayCell.style.borderColor = '#bbf7d0';
            }
        }
        
        dayCell.onclick = () => {
            document.getElementById('examDateSelect').value = ds;
            filterExamsByDate(ds);
            
            // Scroll to the list area on mobile to show the result
            if (window.innerWidth <= 600) {
                setTimeout(() => {
                    document.getElementById('dateListArea').scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        };
        
        dayCell.innerHTML = html;
        
        grid.appendChild(dayCell);
    }
}


function filterExamsByDate(dateString) {
    const tbody = document.getElementById('dateListBody');
    tbody.innerHTML = '';
    
    document.getElementById('reportContainer').style.display = 'none';
    
    if (!dateString) {
        document.getElementById('noDataMessage').style.display = 'block';
        document.getElementById('noDataMessage').querySelector('div').textContent = '날짜를 선택해 주세요.';
        document.getElementById('dateListArea').style.display = 'none';
        return;
    }
    
    // dateString format is "YYYY-MM-DD"
    const filteredExams = examsData.map((exam, index) => ({ exam, index }))
        .filter(item => {
            const timeField = item.exam.submitTime || item.exam.startTime;
            if (!timeField) return false;
            
            const examDateStr = timeField.split('T')[0];
            
            return examDateStr === dateString;
        });
        
    if (filteredExams.length === 0) {
        document.getElementById('noDataMessage').style.display = 'block';
        document.getElementById('noDataMessage').querySelector('div').textContent = '해당 일자에 응시 내역이 없습니다.';
        document.getElementById('dateListArea').style.display = 'none';
        return;
    }
    
    document.getElementById('noDataMessage').style.display = 'none';
    document.getElementById('dateListArea').style.display = 'block';
    document.getElementById('dateListHeader').innerHTML = `<i class="far fa-calendar-check" style="margin-right:8px; color:#10b981;"></i>${dateString} 응시 내역 (총 ${filteredExams.length}명)`;
    
    filteredExams.forEach(item => {
        const exam = item.exam;
        const name = getStudentName(exam.phone);
        const timeStr = formatDate(exam.startTime);
        
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.style.transition = 'background 0.2s';
        tr.onclick = () => openAnalysis(item.index);
        
        tr.innerHTML = `
            <td data-label="학생명 (과목)" style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; line-height: 1.4;">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <b style="font-size: 1.15rem; color: #1e293b; letter-spacing: -0.5px;">${name}</b>
                    <span style="color: #475569; font-size: 0.85rem; font-weight: 500; background: #f1f5f9; padding: 3px 8px; border-radius: 6px; border: 1px solid #e2e8f0;">${exam.examKey}</span>
                </div>
            </td>
            <td data-label="응시 일시" style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #475569; font-size: 0.85rem;">${timeStr}</td>
            <td data-label="점수" style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: var(--primary); font-size: 1.2rem;">${exam.score}점</td>
        `;
        
        tbody.appendChild(tr);
    });
}

function backToList() {
    document.getElementById('reportContainer').style.display = 'none';
    document.querySelector('.container').style.display = 'flex';
    document.getElementById('dateListArea').style.display = 'block';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToCalendar() {
    document.getElementById('reportContainer').style.display = 'none';
    document.getElementById('dateListArea').style.display = 'none';
    document.getElementById('noDataMessage').style.display = 'none';
    document.getElementById('calendarSection').style.display = 'block';
    
    // Update the calendar rendering to reflect the month we came back from
    const dateSelect = document.getElementById('examDateSelect');
    if (dateSelect.value) {
        const [y, m, d] = dateSelect.value.split('-');
        currentCalDate = new Date(parseInt(y), parseInt(m) - 1, 1);
    }
    renderCalendar();
}

function getSectionName(index, examKey) {
    const sections = getSections(examKey);
    for (let sec of sections) {
        if (index >= sec.start && index < sec.end) return sec.name;
    }
    return '기타';
}

let preloadedKakaoUrl = null;
let isPreloadingKakao = false;

function preloadKakaoImage(studentName, exam) {
    preloadedKakaoUrl = null;
    isPreloadingKakao = true;
    
    if (typeof Kakao !== 'undefined' && !Kakao.isInitialized()) {
        Kakao.init('cd49bded279e39feb3c56279fd6290af');
    }

    const reportArea = document.getElementById('reportArea');
    const originalBorder = reportArea.style.border;
    const originalShadow = reportArea.style.boxShadow;
    const originalRadius = reportArea.style.borderRadius;
    
    reportArea.style.border = 'none';
    reportArea.style.boxShadow = 'none';
    reportArea.style.borderRadius = '0';
    
    html2canvas(reportArea, { scale: 2, useCORS: true }).then(canvas => {
        reportArea.style.border = originalBorder;
        reportArea.style.boxShadow = originalShadow;
        reportArea.style.borderRadius = originalRadius;
        
        canvas.toBlob(blob => {
            if (!blob) {
                isPreloadingKakao = false;
                return;
            }
            const dateStr = formatDate(exam.startTime).split(' ')[0].replace(/\//g, '');
            const filename = `모의고사결과_${studentName}_${dateStr}.png`;
            const file = new File([blob], filename, { type: "image/png" });
            
            const dt = new DataTransfer();
            dt.items.add(file);
            const fileList = dt.files;
            
            if (typeof Kakao !== 'undefined') {
                Kakao.Share.uploadImage({
                    file: fileList
                }).then(function(response) {
                    preloadedKakaoUrl = response.infos.original.url.replace('http://', 'https://');
                    isPreloadingKakao = false;
                }).catch(function(error) {
                    console.error("Kakao preload failed", error);
                    isPreloadingKakao = false;
                });
            } else {
                isPreloadingKakao = false;
            }
        }, "image/png");
    });
}

function sendToKakao() {
    if (isPreloadingKakao) {
        alert("이미지를 생성 중입니다. 잠시 후(1~2초) 다시 눌러주세요!");
        return;
    }
    
    if (!preloadedKakaoUrl) {
        // Fallback to manual download if preload failed
        alert("카카오 연결 오류: 팝업 차단 혹은 네트워크 문제로 자동 첨부가 불가능합니다.\n이미지를 수동으로 저장하여 전송해주세요.");
        const reportArea = document.getElementById('reportArea');
        html2canvas(reportArea, { scale: 2, useCORS: true }).then(canvas => {
            canvas.toBlob(blob => {
                const studentName = document.getElementById('reportStudent').textContent.split(' ')[0] || '학생';
                const dateStr = document.getElementById('reportDate').textContent.replace(/\//g, '-').replace(/:/g, '');
                const filename = `모의고사결과_${studentName}_${dateStr}.png`;
                fallbackDownload(blob, filename);
            }, "image/png");
        });
        return;
    }
    
    const studentName = document.getElementById('reportStudent').textContent.split(' ')[0] || '학생';
    
    // Call Kakao SDK synchronously to avoid Safari popup blocker
    const viewerUrl = `https://sejongcook.co.kr/sejong/student/view_image.html?t=${Date.now()}&url=${encodeURIComponent(preloadedKakaoUrl)}`;
    
    Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
            title: `${studentName} 학생 모의고사 결과`,
            description: '세종요리제과기술학원 모의고사 결과 분석표입니다.',
            imageUrl: preloadedKakaoUrl,
            link: {
                mobileWebUrl: viewerUrl,
                webUrl: viewerUrl
            }
        },
        buttons: [
            {
                title: '모바일웹에서 열기',
                link: {
                    mobileWebUrl: viewerUrl,
                    webUrl: viewerUrl
                }
            },
            {
                title: '크게 보기 (확대/저장)',
                link: {
                    mobileWebUrl: viewerUrl + '&btn=1',
                    webUrl: viewerUrl + '&btn=1'
                }
            }
        ]
    });
}

function fallbackDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    alert("이미지가 다운로드 되었습니다.\n카카오톡 앨범에서 사진으로 직접 전송하시면 학부모님이 확대해서 보실 수 있습니다!");
}

function downloadImage() {
    const reportArea = document.getElementById('reportArea');
    const originalBorder = reportArea.style.border;
    const originalShadow = reportArea.style.boxShadow;
    const originalRadius = reportArea.style.borderRadius;
    
    reportArea.style.border = 'none';
    reportArea.style.boxShadow = 'none';
    reportArea.style.borderRadius = '0';
    
    html2canvas(reportArea, { scale: 2, useCORS: true }).then(canvas => {
        reportArea.style.border = originalBorder;
        reportArea.style.boxShadow = originalShadow;
        reportArea.style.borderRadius = originalRadius;
        
        canvas.toBlob(blob => {
            if (!blob) return;
            const studentName = document.getElementById('reportStudent').textContent.split(' ')[0] || '학생';
            const dateStr = document.getElementById('reportDate').textContent.replace(/\//g, '-').replace(/:/g, '');
            const filename = `모의고사결과_${studentName}_${dateStr}.png`;
            fallbackDownload(blob, filename);
        }, "image/png");
    });
}

function openAnalysis(index) {
    document.querySelector('.container').style.display = 'none';
    document.getElementById('reportContainer').style.display = 'flex';
    document.getElementById('reportArea').style.display = 'flex';
    
    // Scroll to top for the report
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const exam = examsData[index];
    const name = getStudentName(exam.phone);
    const examQuestions = questionsData[exam.examKey] || [];
    
    // Header Info
    document.getElementById('reportStudent').textContent = `${name} (${exam.phone})`;
    document.getElementById('reportExamName').textContent = exam.examKey;
    document.getElementById('reportDate').textContent = formatDate(exam.startTime);
    document.getElementById('reportTime').textContent = "기본";
    
    // Build Questions Table
    const tbody1 = document.querySelector('#qTable1 tbody');
    const tbody2 = document.querySelector('#qTable2 tbody');
    tbody1.innerHTML = '';
    tbody2.innerHTML = '';
    
    const maxQ = Math.max(exam.total, examQuestions.length);
    for (let i = 0; i < maxQ; i++) {
        const tr = document.createElement('tr');
        
        const qNum = i + 1;
        const studentAns = (exam.answers && exam.answers[i]) ? exam.answers[i] : '-';
        const correctAns = (examQuestions[i] && examQuestions[i].a) ? examQuestions[i].a : '-';
        const isCorrect = (studentAns === correctAns && studentAns !== '-');
        const correctMark = isCorrect ? '<span class="q-correct">O</span>' : '<span class="q-wrong">X</span>';
        const secName = getSectionName(i, exam.examKey);
        
        tr.innerHTML = `
            <td>${qNum}</td>
            <td>${correctAns}</td>
            <td>${studentAns}</td>
            <td>${correctMark}</td>
            <td>${secName}</td>
        `;
        
        if (i < 30) {
            tbody1.appendChild(tr);
        } else {
            tbody2.appendChild(tr);
        }
    }
    
    drawCharts(exam, examQuestions);
    
    // Wait 1 second for UI to finish rendering, then preload image
    setTimeout(() => {
        const studentName = document.getElementById('reportStudent').textContent.split(' ')[0] || '학생';
        preloadKakaoImage(studentName, exam);
    }, 1000);
}

function closeModal() {
    // no-op
}

function drawCharts(exam, examQuestions) {
    const sections = getSections(exam.examKey);
    // Calculate exact section stats
    const sectionStats = sections.map(sec => {
        let correct = 0;
        let count = 0;
        
        for (let i = sec.start; i < sec.end; i++) {
            if (i >= exam.total) break;
            count++;
            const studentAns = (exam.answers && exam.answers[i]) ? exam.answers[i] : null;
            const correctAns = (examQuestions[i] && examQuestions[i].a) ? examQuestions[i].a : null;
            if (studentAns !== null && studentAns === correctAns) {
                correct++;
            }
        }
        
        const rate = count > 0 ? Math.round((correct / count) * 100) : 0;
        return { name: sec.name, count, correct, rate };
    });
    
    // Render Analysis Table
    const anaBody = document.querySelector('#analysisTable tbody');
    anaBody.innerHTML = '';
    sectionStats.forEach(stat => {
        anaBody.innerHTML += `
            <tr>
                <td><b>${stat.name}</b></td>
                <td>${stat.count}</td>
                <td>${stat.correct}</td>
                <td>${stat.rate}%</td>
            </tr>
        `;
    });

    const labels = sectionStats.map(s => s.name);
    const chartData = sectionStats.map(s => s.rate);
    
    const barCtx = document.getElementById('barChart').getContext('2d');
    if (barChartInstance) barChartInstance.destroy();
    barChartInstance = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '정답률 (%)',
                data: chartData,
                backgroundColor: '#60a5fa',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 100 }
            }
        }
    });

    const radarCtx = document.getElementById('radarChart').getContext('2d');
    if (radarChartInstance) radarChartInstance.destroy();
    radarChartInstance = new Chart(radarCtx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: '학생 밸런스',
                data: chartData,
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: '#2563eb',
                pointBackgroundColor: '#2563eb',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#2563eb'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { display: true },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            }
        }
    });
}
