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

document.addEventListener('DOMContentLoaded', async () => {
    await fetchData();
    renderDropdown();
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

function renderDropdown() {
    const select = document.getElementById('studentSelect');
    select.innerHTML = '';
    
    if (examsData.length === 0) {
        select.innerHTML = `<option value="">응시 기록이 없습니다.</option>`;
        document.getElementById('noDataMessage').style.display = 'block';
        document.getElementById('reportArea').style.display = 'none';
        document.querySelector('.report-bottom-action').style.display = 'none';
        return;
    }
    
    document.getElementById('noDataMessage').style.display = 'none';
    document.getElementById('reportArea').style.display = 'flex';
    document.querySelector('.report-bottom-action').style.display = 'block';

    examsData.forEach((exam, index) => {
        const name = membersData[exam.phone] ? `${membersData[exam.phone]}` : `알수없음`;
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${name} - ${exam.examKey} (${formatDate(exam.startTime)}) - ${exam.score}점`;
        select.appendChild(option);
    });

    // Auto load first
    if (examsData.length > 0) {
        openAnalysis(0);
    }
}

function getSectionName(index, examKey) {
    const sections = getSections(examKey);
    for (let sec of sections) {
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
