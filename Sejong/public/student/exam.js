let questionsData = {};
let courses = {};
let members = [];
let loggedInStudentCourse = null;
let currentPin = '';

let currentExamKey = null;
let currentQuestions = [];
let userAnswers = [];
let currentQuestionIndex = 0;
let isReviewMode = false;
let resultChartInstance = null;

let timeRemaining = 3600;
let timerInterval = null;
let examStartTime = null;

// DOM Elements
const screens = {
    login: document.getElementById('loginScreen'),
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
        // Fetch Questions Data
        const res = await fetch(`../questions_data.json?v=${Date.now()}`);
        questionsData = await res.json();
        
        // Process courses
        for (const key in questionsData) {
            const courseName = key.split('_')[0];
            if (!courses[courseName]) {
                courses[courseName] = [];
            }
            courses[courseName].push(key);
        }

        // Fetch Members Data
        try {
            const mRes = await fetch('/api/sejong/members?t=' + Date.now());
            if (mRes.ok) {
                members = await mRes.json();
            } else {
                const mResFallback = await fetch('../test_members.json');
                members = await mResFallback.json();
            }
        } catch(e) {
            console.error('Failed to load members', e);
        }

        checkAutoLogin();
    } catch (e) {
        console.error('Failed to load data', e);
        document.getElementById('courseGrid').innerHTML = '<p style="color:red; text-align:center;">데이터를 불러오는 데 실패했습니다.</p>';
        showScreen('course');
    }
}

function checkAutoLogin() {
    const urlParams = new URLSearchParams(window.location.search);
    const phoneParam = urlParams.get('phone');
    if (phoneParam && phoneParam.length === 4) {
        authenticateUser(phoneParam);
    } else {
        showScreen('login');
    }
}

// --- Login Logic ---
function inputPin(num) {
    if (currentPin.length < 4) {
        currentPin += num;
        updatePinDisplay();
        if (currentPin.length === 4) {
            authenticateUser(currentPin);
        }
    }
}

function backspacePin() {
    if (currentPin.length > 0) {
        currentPin = currentPin.slice(0, -1);
        updatePinDisplay();
        document.getElementById('loginErrorMsg').textContent = '';
    }
}

function clearPin() {
    currentPin = '';
    updatePinDisplay();
    document.getElementById('loginErrorMsg').textContent = '';
}

function updatePinDisplay() {
    const dots = document.querySelectorAll('.pin-dot');
    dots.forEach((dot, index) => {
        if (index < currentPin.length) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
    });
}

function authenticateUser(pin) {
    // 마스터 키 (원장님 테스트용)
    if (pin === '7777') {
        loggedInStudentCourse = null; // null이면 모든 과목이 노출됩니다.
        renderCourses();
        showScreen('course');
        return;
    }

    const member = members.find(m => m.phone && m.phone.endsWith(pin));
    if (member) {
        loggedInStudentCourse = member.course || '';
        renderCourses();
        showScreen('course');
    } else {
        document.getElementById('loginErrorMsg').textContent = '등록되지 않은 번호입니다.';
        setTimeout(() => clearPin(), 500);
    }
}
// -------------------

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
    if (screens.exam.classList.contains('active')) {
        showScreen('course');
    } else if (screens.solving.classList.contains('active')) {
        if (confirm('문제 풀이를 중단하고 나가시겠습니까?')) {
            showScreen('exam');
        }
    } else if (screens.result.classList.contains('active')) {
        showScreen('course');
    }
}

function goHome() {
    if (confirm('첫 화면으로 돌아가시겠습니까? 진행 중인 내용이 초기화됩니다.')) {
        showScreen('course');
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

    let visibleCount = 0;

    for (const course in courses) {
        // Check if currentStudent's courses array includes this course (allow '과거기출' for everyone)
        if (course !== "과거기출" && loggedInStudentCourse && !loggedInStudentCourse.includes(course)) {
            continue; // Skip courses they are not enrolled in
        }

        visibleCount++;
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

    if (visibleCount === 0) {
        grid.innerHTML = `<p style="color: var(--text-sub); text-align: center; grid-column: span 2; padding: 20px;">수강 중인 필기 과목이 없습니다.</p>`;
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
    
    // Start Timer
    timeRemaining = 3600; // 60 minutes
    examStartTime = new Date().toISOString();
    startTimer();
    
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

    if (qInfo.is_subjective) {
        const ansContainer = document.createElement('div');
        ansContainer.className = 'subjective-container';
        ansContainer.style.textAlign = 'center';
        ansContainer.style.marginTop = '20px';
        
        const ansBox = document.createElement('div');
        ansBox.className = 'subjective-answer';
        ansBox.style.display = userAnswers[currentQuestionIndex] ? 'block' : 'none';
        ansBox.style.background = 'rgba(255, 255, 255, 0.1)';
        ansBox.style.padding = '20px';
        ansBox.style.borderRadius = '10px';
        ansBox.style.color = '#ff6b6b';
        ansBox.style.fontSize = '1.1rem';
        ansBox.style.marginTop = '15px';
        ansBox.style.whiteSpace = 'pre-wrap';
        ansBox.textContent = qInfo.a_text;

        const btn = document.createElement('button');
        btn.className = 'btn-primary';
        btn.textContent = userAnswers[currentQuestionIndex] ? '정답 숨기기' : '정답 확인하기';
        btn.onclick = () => {
            if (userAnswers[currentQuestionIndex]) {
                userAnswers[currentQuestionIndex] = null;
                ansBox.style.display = 'none';
                btn.textContent = '정답 확인하기';
            } else {
                userAnswers[currentQuestionIndex] = true;
                ansBox.style.display = 'block';
                btn.textContent = '정답 숨기기';
            }
            renderOMR(); // Update OMR to reflect viewed status
        };

        ansContainer.appendChild(btn);
        ansContainer.appendChild(ansBox);
        optsEl.appendChild(ansContainer);
    } else {
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
    }

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
        const row = document.createElement('div');
        row.className = 'omr-row';
        if (i === currentQuestionIndex) row.classList.add('current');

        const num = document.createElement('div');
        num.className = 'omr-row-num';
        num.textContent = `${i + 1}`;

        const bubbles = document.createElement('div');
        bubbles.className = 'omr-bubbles';

        const qInfo = currentQuestions[i];
        if (qInfo.is_subjective) {
            const bubble = document.createElement('div');
            bubble.className = 'omr-bubble';
            bubble.style.width = '60px';
            bubble.textContent = userAnswers[i] ? '확인됨' : '미확인';
            if (userAnswers[i]) {
                bubble.classList.add('selected');
            }
            bubbles.appendChild(bubble);
        } else {
            for (let opt = 1; opt <= 4; opt++) {
                const bubble = document.createElement('div');
                bubble.className = 'omr-bubble';
                bubble.textContent = opt;
                
                if (userAnswers[i] === opt) {
                    bubble.classList.add('selected');
                }

                bubble.onclick = (e) => {
                    e.stopPropagation(); // prevent modal close or row click
                    
                    // Toggle off if same bubble clicked again
                    if (userAnswers[i] === opt) {
                        userAnswers[i] = null;
                    } else {
                        userAnswers[i] = opt;
                    }
                    
                    renderOMR();
                    
                    // Also update the main screen if we are currently on this question
                    if (currentQuestionIndex === i) {
                        renderQuestion();
                    }
                };
                bubbles.appendChild(bubble);
            }
        }

        row.appendChild(num);
        row.appendChild(bubbles);

        // Click row to jump to question
        row.onclick = () => {
            currentQuestionIndex = i;
            renderQuestion();
            toggleOMR();
        };

        grid.appendChild(row);
    }
}

function submitExam(isForced = false) {
    if (!isForced) {
        const unAnsweredIndices = [];
        userAnswers.forEach((a, idx) => {
            if (a === null) unAnsweredIndices.push(idx + 1);
        });

        if (unAnsweredIndices.length > 0) {
            let msg = `아직 풀지 않은 문제가 ${unAnsweredIndices.length}개 있습니다.\n`;
            if (unAnsweredIndices.length > 15) {
                msg += `(안 푼 번호: ${unAnsweredIndices.slice(0, 15).join(', ')} ...등)\n\n`;
            } else {
                msg += `(안 푼 번호: ${unAnsweredIndices.join(', ')})\n\n`;
            }
            msg += `그래도 채점하시겠습니까?`;
            
            if (!confirm(msg)) {
                return;
            }
        }
    }
    
    stopTimer();
    document.getElementById('omrModal').classList.remove('open');
    calculateResult();
}

function calculateResult() {
    let correctCount = 0;
    
    currentQuestions.forEach((q, idx) => {
        if (q.is_subjective) {
            if (userAnswers[idx]) correctCount++;
        } else {
            if (userAnswers[idx] === q.a) correctCount++;
        }
    });

    const total = currentQuestions.length;
    const score = Math.round((correctCount / total) * 100);
    const passed = score >= 60; // 60점 이상 합격

    // Calculate section rates for analysis
    // Assume 4 sections: 0~15, 15~30, 30~45, 45~60
    const SECTIONS = [
        { start: 0, end: 15 },
        { start: 15, end: 30 },
        { start: 30, end: 45 },
        { start: 45, end: 60 }
    ];
    
    const sectionRates = SECTIONS.map(sec => {
        let secCorrect = 0;
        let secTotal = 0;
        for (let i = sec.start; i < sec.end && i < total; i++) {
            secTotal++;
            const q = currentQuestions[i];
            if (q.is_subjective) {
                if (userAnswers[i]) secCorrect++;
            } else {
                if (userAnswers[i] === q.a) secCorrect++;
            }
        }
        return secTotal > 0 ? Math.round((secCorrect / secTotal) * 100) : 0;
    });

    // Save exam result to server
    const submitTime = new Date().toISOString();
    const resultData = {
        phone: currentPin || '0000',
        examKey: currentExamKey,
        startTime: examStartTime,
        submitTime: submitTime,
        score: score,
        correctCount: correctCount,
        total: total,
        timeRemaining: timeRemaining,
        sectionRates: sectionRates,
        answers: userAnswers
    };
    
    // Fire and forget POST request (Get existing, append, save)
    fetch('/api/sejong/exams')
        .then(res => res.json())
        .then(existingExams => {
            const examsArray = Array.isArray(existingExams) ? existingExams : [];
            examsArray.push(resultData);
            return fetch('/api/sejong/exams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(examsArray)
            });
        })
        .catch(e => console.error("Failed to save exam result:", e));

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
        let isCorrect = false;
        let myAnsStr = myAns || '-';
        let correctAnsStr = q.a;
        
        if (q.is_subjective) {
            isCorrect = !!myAns;
            myAnsStr = isCorrect ? '확인됨' : '미확인';
            correctAnsStr = '주관식';
        } else {
            isCorrect = (myAns === q.a);
        }

        const tr = document.createElement('tr');
        if (!isCorrect) {
            tr.classList.add('wrong');
            // Allow click to review
            tr.onclick = () => reviewQuestion(idx);
            tr.style.cursor = 'pointer';
        }

        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td style="color: ${myAns === null ? '#94a3b8' : 'white'}">${myAnsStr}</td>
            <td style="color: var(--primary-light); font-weight: bold;">${correctAnsStr}</td>
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

// --- Timer & Extension Logic ---
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    updateTimerUI();
    timerInterval = setInterval(() => {
        if (isReviewMode) {
            clearInterval(timerInterval);
            return;
        }
        
        timeRemaining--;
        updateTimerUI();
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            alert("시험 시간이 종료되어 자동으로 채점됩니다.");
            submitExam(true);
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
}

function updateTimerUI() {
    const timerText = document.getElementById('timerText');
    if (!timerText) return;
    
    if (timeRemaining <= 0) {
        timerText.textContent = "00:00";
        timerText.style.color = "var(--incorrect)";
        return;
    }
    
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerText.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (timeRemaining <= 300) { // last 5 minutes
        timerText.style.color = "var(--incorrect)";
    } else {
        timerText.style.color = "var(--primary-light)";
    }
}

function openExtensionModal() {
    if (isReviewMode) return;
    document.getElementById('extensionModal').classList.add('open');
    document.getElementById('extPinSection').style.display = 'block';
    document.getElementById('extTimeSection').style.display = 'none';
    document.getElementById('extPinInput').value = '';
}

function closeExtensionModal() {
    document.getElementById('extensionModal').classList.remove('open');
}

function checkExtPin() {
    const pin = document.getElementById('extPinInput').value;
    if (pin === '7777') {
        document.getElementById('extPinSection').style.display = 'none';
        document.getElementById('extTimeSection').style.display = 'block';
    } else {
        alert('비밀번호가 틀렸습니다.');
    }
}

function extendTime(minutes) {
    timeRemaining += minutes * 60;
    updateTimerUI();
    alert(`시험 시간이 ${minutes}분 연장되었습니다.`);
    closeExtensionModal();
}
// ---------------------------------
