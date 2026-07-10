let examsData = [];
let membersData = {};
let questionsData = {};
let barChartInstance = null;
let radarChartInstance = null;

const SECTIONS = [
    { name: '위생 및 관련법규', start: 0, end: 15 },
    { name: '공중보건학', start: 15, end: 30 },
    { name: '식품학', start: 30, end: 45 },
    { name: '조리이론 및 원가', start: 45, end: 60 }
];

document.addEventListener('DOMContentLoaded', async () => {
    await fetchData();
    renderTable();
});

async function fetchData() {
    try {
        const [examsRes, membersRes, qRes] = await Promise.all([
            fetch('/api/sejong/exams'),
            fetch('/api/sejong/members'),
            fetch('/questions_data.json')
        ]);
        
        examsData = await examsRes.json();
        const memArray = await membersRes.json();
        questionsData = await qRes.json();
        
        if (!Array.isArray(examsData)) examsData = [];
        
        // Map members by phone for quick lookup
        memArray.forEach(m => {
            membersData[m.phone] = m.name;
        });
        
        // Sort exams by start time descending
        examsData.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        
    } catch (e) {
        console.error("Failed to fetch data:", e);
    }
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

function renderTable() {
    const tbody = document.getElementById('examTableBody');
    tbody.innerHTML = '';
    
    if (examsData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding: 30px;">응시 기록이 없습니다.</td></tr>`;
        return;
    }
    
    examsData.forEach((exam, index) => {
        const name = membersData[exam.phone] ? `${membersData[exam.phone]}(${exam.phone})` : `알수없음(${exam.phone})`;
        const isPass = exam.score >= 60;
        const passLabel = isPass ? '<span class="score-badge score-pass">합격</span>' : '<span class="score-badge score-fail">불합격</span>';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><b>${name}</b></td>
            <td>${exam.examKey}</td>
            <td>${formatDate(exam.startTime)}</td>
            <td>${formatDuration(exam.startTime, exam.submitTime)}</td>
            <td><b>${exam.score}점</b> (${exam.correctCount}/${exam.total})</td>
            <td>${passLabel}</td>
        `;
        
        tr.onclick = () => openAnalysis(index);
        tbody.appendChild(tr);
    });
}

function getSectionName(index) {
    for (let sec of SECTIONS) {
        if (index >= sec.start && index < sec.end) return sec.name;
    }
    return '기타';
}

function openAnalysis(index) {
    const exam = examsData[index];
    const name = membersData[exam.phone] ? membersData[exam.phone] : `알수없음`;
    const examQuestions = questionsData[exam.examKey] || [];
    
    // Header Info
    document.getElementById('reportStudent').textContent = `${name} (${exam.phone})`;
    document.getElementById('reportExamName').textContent = exam.examKey;
    document.getElementById('reportDate').textContent = formatDate(exam.startTime);
    document.getElementById('reportTime').textContent = formatDuration(exam.startTime, exam.submitTime);
    document.getElementById('reportScore').textContent = `${exam.score}점 (${exam.correctCount}/${exam.total}개)`;
    
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
        const secName = getSectionName(i);
        
        tr.innerHTML = `
            <td>${qNum}</td>
            <td>${studentAns}</td>
            <td>${correctAns}</td>
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
    
    document.getElementById('analysisModal').classList.add('active');
}

function closeModal() {
    document.getElementById('analysisModal').classList.remove('active');
}

function drawCharts(exam, examQuestions) {
    // Calculate exact section stats
    const sectionStats = SECTIONS.map(sec => {
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
