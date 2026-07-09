let questionsData = {};
let courses = {};
let currentExamKey = null;
let currentQuestions = [];
let userAnswers = [];
let currentQuestionIndex = 0;
let isReviewMode = false;
let resultChartInstance = null;

// DOM Elements
const screens = {
    course: document.getElementById('courseSelection'),
    exam: document.getElementById('examSelection'),
    solving: document.getElementById('solvingScreen'),
    result: document.getElementById('resultScreen')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});

async function loadData() {
    try {
        const res = await fetch('../sejong/questions_data.json');
        questionsData = await res.json();
        
        // Process courses
        for (const key in questionsData) {
            const courseName = key.split('_')[0];
            if (!courses[courseName]) {
                courses[courseName] = [];
            }
            courses[courseName].push(key);
        }

        renderCourses();
    } catch (e) {
        console.error('Failed to load data', e);
        document.getElementById('courseGrid').innerHTML = '<p style="color:red; text-align:center;">데이터를 불러오는 데 실패했습니다.</p>';
    }
}

function showScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenName].classList.add('active');

    const backBtn = document.getElementById('backBtn');
    const headerTitle = document.getElementById('headerTitle');

    if (screenName === 'course') {
        backBtn.style.visibility = 'hidden';
        headerTitle.textContent = '과목 선택';
    } else if (screenName === 'exam') {
        backBtn.style.visibility = 'visible';
        backBtn.onclick = () => showScreen('course');
        headerTitle.textContent = '기출문제 선택';
    } else if (screenName === 'solving') {
        backBtn.style.visibility = 'visible';
        backBtn.onclick = () => {
            if (confirm('시험을 중단하고 나가시겠습니까? 진행 상황이 초기화됩니다.')) {
                showScreen('exam');
            }
        };
        headerTitle.textContent = currentExamKey.replace('_', ' ');
    } else if (screenName === 'result') {
        backBtn.style.visibility = 'hidden';
        headerTitle.textContent = '진단 리포트';
    }
}

function goBack() {
    // handled in showScreen dynamically
}

function goHome() {
    if (confirm('메인 화면으로 돌아가시겠습니까?')) {
        window.location.href = 'login.html';
    }
}

const icons = {
    '한식': 'restaurant',
    '양식': 'restaurant_menu',
    '일식': 'set_meal',
    '중식': 'ramen_dining',
    '제과': 'cake',
    '제빵': 'bakery_dining',
    '복어': 'water_drop'
};

function renderCourses() {
    const grid = document.getElementById('courseGrid');
    grid.innerHTML = '';

    for (const course in courses) {
        const icon = icons[course] || 'menu_book';
        const count = courses[course].length;
        
        const card = document.createElement('div');
        card.className = 'glass-container course-card';
        card.onclick = () => selectCourse(course);
        card.innerHTML = `
            <div class="course-icon" style="background: var(--primary);">
                <span class="material-icons">${icon}</span>
            </div>
            <h3>${course}조리기능사</h3>
            <p>${count}개의 기출문제</p>
        `;
        grid.appendChild(card);
    }
}

function selectCourse(courseName) {
    document.getElementById('selectedCourseName').textContent = `${courseName}조리기능사`;
    
    const list = document.getElementById('examList');
    list.innerHTML = '';

    const sortedExams = courses[courseName].sort((a,b) => b.localeCompare(a));

    sortedExams.forEach(examKey => {
        const year = examKey.split('_')[1] || '미상';
        const item = document.createElement('div');
        item.className = 'exam-item';
        item.style.borderBottom = '1px solid var(--border-color)';
        item.innerHTML = `
            <div>
                <h4 style="font-size: 1.1rem; font-weight: 700;">${year}년도 기출문제</h4>
                <p style="font-size: 0.8rem; color: var(--text-sub); margin-top: 5px;">총 ${questionsData[examKey].length}문항</p>
            </div>
            <span class="material-icons" style="color: var(--primary-light);">play_circle</span>
        `;
        item.onclick = () => startExam(examKey);
        list.appendChild(item);
    });

    showScreen('exam');
}

function startExam(examKey) {
    currentExamKey = examKey;
    currentQuestions = questionsData[examKey];
    userAnswers = new Array(currentQuestions.length).fill(null);
    currentQuestionIndex = 0;
    isReviewMode = false;
    
    // reset omr
    document.getElementById('omrModal').classList.remove('open');
    
    showScreen('solving');
    renderQuestion();
}

function renderQuestion() {
    const qInfo = currentQuestions[currentQuestionIndex];
    document.getElementById('progressText').textContent = `${currentQuestionIndex + 1} / ${currentQuestions.length}`;
    
    const textEl = document.getElementById('qText');
    textEl.innerHTML = `<span style="color: var(--primary-light); margin-right: 5px;">Q${currentQuestionIndex + 1}.</span> ${qInfo.q}`;

    const optsEl = document.getElementById('optionsList');
    optsEl.innerHTML = '';

    qInfo.o.forEach((optText, index) => {
        const optNum = index + 1;
        const btn = document.createElement('div');
        btn.className = 'option-btn';
        
        if (userAnswers[currentQuestionIndex] === optNum) {
            btn.classList.add('selected');
        }

        // Review Mode Logic
        if (isReviewMode) {
            const isCorrectAnswer = (optNum === qInfo.a);
            const isMyAnswer = (optNum === userAnswers[currentQuestionIndex]);
            
            if (isCorrectAnswer) {
                btn.classList.add('correct-ans');
            } else if (isMyAnswer && !isCorrectAnswer) {
                btn.classList.add('wrong-ans');
            }
        } else {
            // Only attach click handler in solving mode
            btn.onclick = () => {
                userAnswers[currentQuestionIndex] = optNum;
                renderQuestion(); // re-render to update selection
                
                // Auto next after 0.3s
                setTimeout(() => {
                    if (currentQuestionIndex < currentQuestions.length - 1) {
                        nextQuestion();
                    }
                }, 300);
            };
        }

        btn.innerHTML = `
            <div class="opt-num">${optNum}</div>
            <div style="flex: 1; word-break: keep-all;">${optText}</div>
        `;
        optsEl.appendChild(btn);
    });

    // Update bottom nav buttons
    document.getElementById('prevBtn').disabled = (currentQuestionIndex === 0);
    const nextBtn = document.getElementById('nextBtn');
    if (currentQuestionIndex === currentQuestions.length - 1) {
        if (!isReviewMode) {
            nextBtn.innerHTML = '제출하기 <span class="material-icons">send</span>';
            nextBtn.onclick = () => toggleOMR(); // Prompt OMR before submit
        } else {
            nextBtn.disabled = true;
            nextBtn.innerHTML = '마지막 <span class="material-icons">done</span>';
        }
    } else {
        nextBtn.innerHTML = '다음 <span class="material-icons">chevron_right</span>';
        nextBtn.disabled = false;
        nextBtn.onclick = nextQuestion;
    }

    renderOMR();
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
    }
}

function nextQuestion() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    }
}

function toggleOMR() {
    const modal = document.getElementById('omrModal');
    if (modal.classList.contains('open')) {
        modal.classList.remove('open');
    } else {
        renderOMR();
        modal.classList.add('open');
    }
}

function renderOMR() {
    const grid = document.getElementById('omrGrid');
    grid.innerHTML = '';
    
    for (let i = 0; i < currentQuestions.length; i++) {
        const cell = document.createElement('div');
        cell.className = 'omr-cell';
        if (userAnswers[i] !== null) cell.classList.add('answered');
        if (i === currentQuestionIndex) cell.classList.add('current');
        
        cell.textContent = i + 1;
        cell.onclick = () => {
            currentQuestionIndex = i;
            renderQuestion();
            toggleOMR();
        };
        grid.appendChild(cell);
    }
}

function submitExam() {
    const unAnswered = userAnswers.filter(a => a === null).length;
    if (unAnswered > 0) {
        if (!confirm(`아직 풀지 않은 문제가 ${unAnswered}개 있습니다.\n그래도 채점하시겠습니까?`)) {
            return;
        }
    }
    
    document.getElementById('omrModal').classList.remove('open');
    calculateResult();
}

function calculateResult() {
    let correctCount = 0;
    
    currentQuestions.forEach((q, idx) => {
        if (userAnswers[idx] === q.a) correctCount++;
    });

    const total = currentQuestions.length;
    const score = Math.round((correctCount / total) * 100);
    const passed = score >= 60; // 60점 이상 합격

    document.getElementById('resultScore').textContent = `${score}점`;
    document.getElementById('correctCount').textContent = correctCount;
    
    const statusEl = document.getElementById('resultStatus');
    if (passed) {
        statusEl.textContent = '합격입니다! 🎉';
        statusEl.className = 'result-status status-pass';
        fireConfetti();
    } else {
        statusEl.textContent = '불합격입니다. 😢';
        statusEl.className = 'result-status status-fail';
    }

    renderChart(correctCount, total - correctCount);
    renderAnalysisTable();
    showScreen('result');
}

function renderChart(correct, wrong) {
    const ctx = document.getElementById('resultChart').getContext('2d');
    
    if (resultChartInstance) {
        resultChartInstance.destroy();
    }

    resultChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['정답', '오답'],
            datasets: [{
                data: [correct, wrong],
                backgroundColor: ['#3b82f6', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#f8fafc', font: { family: 'Noto Sans KR' } }
                }
            }
        }
    });
}

function renderAnalysisTable() {
    const tbody = document.getElementById('analysisTableBody');
    tbody.innerHTML = '';

    currentQuestions.forEach((q, idx) => {
        const myAns = userAnswers[idx];
        const correctAns = q.a;
        const isCorrect = (myAns === correctAns);

        const tr = document.createElement('tr');
        if (!isCorrect) {
            tr.classList.add('wrong');
            // Allow click to review
            tr.onclick = () => reviewQuestion(idx);
            tr.style.cursor = 'pointer';
        }

        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td style="color: ${myAns === null ? '#94a3b8' : 'white'}">${myAns || '-'}</td>
            <td style="color: var(--primary-light); font-weight: bold;">${correctAns}</td>
            <td class="ox-mark ${isCorrect ? 'ox-o' : 'ox-x'}">${isCorrect ? 'O' : 'X'}</td>
        `;
        tbody.appendChild(tr);
    });
}

function reviewQuestion(index) {
    isReviewMode = true;
    currentQuestionIndex = index;
    showScreen('solving');
    renderQuestion();

    // Change back button behavior in review mode
    document.getElementById('backBtn').onclick = () => {
        showScreen('result');
    };
    document.getElementById('headerTitle').textContent = '오답 노트';
}

function goBackToExamList() {
    const courseName = currentExamKey.split('_')[0];
    selectCourse(courseName);
}

function fireConfetti() {
    var duration = 3 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 999 };

    var myCanvas = document.getElementById('confetti-canvas');
    var myConfetti = confetti.create(myCanvas, { resize: true });

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function() {
        var timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        var particleCount = 50 * (timeLeft / duration);
        myConfetti(Object.assign({}, defaults, { particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        }));
        myConfetti(Object.assign({}, defaults, { particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        }));
    }, 250);
}
