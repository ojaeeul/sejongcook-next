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

    // Add touch swipe listeners for exam screen
    const solvingScreen = document.getElementById('solvingScreen');
    if (solvingScreen) {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        solvingScreen.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        solvingScreen.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const SWIPE_THRESHOLD = 50;
            const diffX = touchStartX - touchEndX;
            const diffY = Math.abs(touchStartY - touchEndY);
            
            // Trigger horizontal swipe only if X movement is greater than Y movement (to allow vertical scrolling)
            if (Math.abs(diffX) > diffY && Math.abs(diffX) > SWIPE_THRESHOLD) {
                // If it's a valid swipe and the exam screen is active
                if (diffX > 0) {
                    // Swiped left -> Next Question
                    nextQuestion();
                } else {
                    // Swiped right -> Previous Question
                    prevQuestion();
                }
            }
        }
    }
});

async function loadData() {
    try {
        // Fetch Questions Data
        const res = await fetch(`../questions_data.json?v=${Date.now()}`);
        questionsData = await res.json();
        
        for (const key in questionsData) {
            let courseName = key.split('_')[0];
            if (['한식', '양식', '일식', '중식', '제과', '제빵', '복어', '제과제빵'].includes(courseName)) {
                courseName = courseName + '기능사';
            }
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

        // Fetch Exam Records
        try {
            const examsRes = await fetch('/api/sejong/exams?t=' + Date.now());
            if (examsRes.ok) {
                window.allExams = await examsRes.json();
            } else {
                window.allExams = [];
            }
        } catch (e) {
            console.error('Failed to load exams', e);
            window.allExams = [];
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
        if (course.includes('과거기출')) continue;
        if (course.includes('제과제빵')) continue;

        let coreName = course.replace('기능사', '');

        if (loggedInStudentCourse) {
            if (!loggedInStudentCourse.includes(coreName)) {
                continue; // Skip courses they are not enrolled in
            }
        }

        visibleCount++;
        const icon = icons[coreName] || 'menu_book';
        const count = courses[course].length;
        
        const card = document.createElement('div');
        card.className = 'glass-container course-card';
        card.onclick = () => selectCourse(course);
        card.innerHTML = `
            <div class="course-icon" style="background: var(--primary);">
                <span class="material-icons">${icon}</span>
            </div>
            <h3>${course}</h3>
            <p>${count}개의 모의고사</p>
        `;
        grid.appendChild(card);
    }

    if (visibleCount === 0) {
        grid.innerHTML = `<p style="color: var(--text-sub); text-align: center; grid-column: span 2; padding: 20px;">수강 중인 필기 과목이 없습니다.</p>`;
    }
}

function selectCourse(courseName) {
    document.getElementById('selectedCourseName').textContent = courseName;
    
    const list = document.getElementById('examList');
    list.innerHTML = '';

    const sortedExams = courses[courseName].sort((a, b) => {
        const isA = a.includes('_시험지_');
        const isB = b.includes('_시험지_');
        if (isA && !isB) return -1;
        if (!isA && isB) return 1;
        if (isA && isB) return a.localeCompare(b);
        return b.localeCompare(a);
    });

    sortedExams.forEach(examKey => {
        let examTitle = examKey;
        if (examKey.includes('_A_Z_')) {
            const letter = examKey.split('_A_Z_')[1];
            examTitle = `모의고사 ${letter}`;
        } else {
            const parts = examKey.split('_');
            examTitle = parts.pop() || examKey;
            examTitle = examTitle.replace('.hwp', '').replace('.pdf', '').replace('(교사용)', '').normalize('NFC');
        }
        
        const dateMap = {
  "2004년제과1회": "2004.3.7", "2004년제과2회": "2004.5.9", "2004년제과4회": "2004.8.8", "2004년제과5회": "2004.10.10",
  "2004년제빵1회": "2004.3.7", "2004년제빵2회": "2004.5.9", "2004년제빵4회": "2004.8.8", "2004년제빵5회": "2004.10.10",
  "2003년도 제과1회": "2003.3.9", "2003년도 제과2회": "2003.5.11", "2003년도 제과4회": "2003.8.10", "2003년도 제과5회": "2003.10.12",
  "2003년도 제빵1회": "2003.3.9", "2003년도 제빵2회": "2003.5.11", "2003년도 제빵4회": "2003.8.10", "2003년도 제빵5회": "2003.10.12",
  "2002년도 제과1회": "2002.3.17", "2002년도 제과2회": "2002.5.26", "2002년도 제과4회": "2002.8.18", "2002년도 제과5회": "2002.10.6",
  "2002년도 제빵1회": "2002.3.17", "2002년도 제빵2회": "2002.5.26", "2002년도 제빵4회": "2002.8.18", "2002년도 제빵5회": "2002.10.6",
  "2011년도 제과1회": "2011.3.6", "2011년도 제과2회": "2011.5.8", "2011년도 제과4회": "2011.8.7", "2011년도 제과5회": "2011.10.9",
  "2011년도 제빵1회": "2011.3.6", "2011년도 제빵2회": "2011.5.8", "2011년도 제빵4회": "2011.8.7", "2011년도 제빵5회": "2011.10.9",
  "2010년 1회": "2010.3.7", "2010년 1회제빵": "2010.3.7", "2010년도 2회제과": "2010.5.9", "2010년도 2회제빵": "2010.5.9",
  "2010년도 4회제과": "2010.8.8", "2010년도 4회제빵": "2010.8.8", "2010년도 5회제과": "2010.10.10", "2010년도 5회제빵": "2010.10.10",
  "2009년 1회": "2009.3.8", "2009년 1회제빵": "2009.3.8", "2009년 2회": "2009.5.10", "2009년 2회제빵": "2009.5.10",
  "2009년 4회": "2009.8.9", "2009년 4회제빵": "2009.8.9", "2009년 5회": "2009.10.4", "2009년 5회제빵": "2009.10.4",
  "2008년 1회제과(2008년답안지포함)": "2008.3.2", "2008년 1회제빵": "2008.3.2", "2008년 2회제과": "2008.5.11",
  "2008년 2회제빵": "2008.5.11", "2008년 4회제과": "2008.8.10", "2008년 4회제빵": "2008.8.10", "2008년 5회제과": "2008.10.5",
  "2008년 5회제빵": "2008.10.5",
  "2007년제과1회": "2007.3.4", "2007년제과2회": "2007.5.13", "2007년제과4회": "2007.8.12", "2007년제과5회": "2007.10.7",
  "2007년제빵1회": "2007.3.4", "2007년제빵2회": "2007.5.13", "2007년제빵4회": "2007.8.12", "2007년제빵5회": "2007.10.7",
  "2006년제과1회": "2006.3.5", "2006년제과2회": "2006.5.7", "2006년제과4회": "2006.8.6", "2006년제과5회": "2006.10.8",
  "2006년제빵1회": "2006.3.5", "2006년제빵2회": "2006.5.7", "2006년제빵4회": "2006.8.6", "2006년제빵5회": "2006.10.8",
  "2005년제과1회": "2005.3.6", "2005년제과2회": "2005.5.8", "2005년제과4회": "2005.8.7", "2005년제과5회": "2005.10.9",
  "2005년제빵1회": "2005.3.6", "2005년제빵2회": "2005.5.8", "2005년제빵4회": "2005.8.7", "2005년제빵5회": "2005.10.9"
        };
        for (const k in dateMap) {
            if (k.normalize('NFC') === examTitle) {
                examTitle = dateMap[k] + " 기출문제";
                break;
            }
        }
        
        // Check if the student has already taken this exam
        let completedRecord = null;
        if (currentPin !== '7777' && window.allExams) {
            completedRecord = window.allExams.find(e => e.phone === currentPin && e.examKey === examKey && e.score !== undefined);
        }

        const item = document.createElement('div');
        item.className = 'exam-item';
        
        let displayTitle = examTitle;
        if (displayTitle.includes('시험지 ')) {
            displayTitle = displayTitle.split('시험지 ')[1].replace(' (60문항)', '');
        } else if (displayTitle.includes('제과기능사 ')) {
            displayTitle = displayTitle.replace('제과기능사 ', '');
        } else if (displayTitle.includes('제빵기능사 ')) {
            displayTitle = displayTitle.replace('제빵기능사 ', '');
        }

        if (completedRecord) {
            item.classList.add('completed');
            item.innerHTML = `
                <span class="material-icons" style="color: #cbd5e1; font-size: 8px; margin-bottom: 2px;">check_circle</span>
                <h4 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: #64748b; line-height: 1.2; word-break: keep-all;">${displayTitle}</h4>
                <p style="font-size: 0.8rem; color: #94a3b8; margin-top: 6px;">${completedRecord.score}점</p>
            `;
            item.onclick = () => {
                showCompletedExamResult(examKey, completedRecord);
            };
        } else {
            item.innerHTML = `
                <span class="material-icons" style="color: var(--primary-light); font-size: 8px; margin-bottom: 2px;">play_circle</span>
                <h4 style="margin: 0; font-size: 1.1rem; font-weight: 700; line-height: 1.2; word-break: keep-all;">${displayTitle}</h4>
                <p style="font-size: 0.8rem; color: var(--text-sub); margin-top: 6px;">${questionsData[examKey].length}문항</p>
            `;
            item.onclick = () => startExam(examKey);
        }
        
        list.appendChild(item);
    });

    showScreen('exam');
}

function startExam(examKey, completedRecord = null) {
    currentExamKey = examKey;
    currentQuestions = questionsData[examKey];
    currentQuestionIndex = 0;
    
    if (completedRecord) {
        userAnswers = [...completedRecord.answers];
        isReviewMode = true;
    } else {
        userAnswers = new Array(currentQuestions.length).fill(null);
        isReviewMode = false;
        
        // Start Timer
        timeRemaining = 3600; // 60 minutes
        examStartTime = new Date().toISOString();
        startTimer();
    }
    
    // reset omr
    document.getElementById('omrModal').classList.remove('open');
    
    showScreen('solving');
    renderQuestion();
    if(window.updatePaperPreviewSwiper) window.updatePaperPreviewSwiper();
    if(window.initPaperPreviewSwiper) window.initPaperPreviewSwiper();

    if (isReviewMode) {
        document.getElementById('headerTitle').textContent = '응시 완료된 시험지 (오답 노트)';
    }
}

function renderQuestion() {
    const qInfo = currentQuestions[currentQuestionIndex];
    document.getElementById('progressText').textContent = `${currentQuestionIndex + 1} / ${currentQuestions.length}`;
    
    const textEl = document.getElementById('qText');
    textEl.innerHTML = `<span style="color: var(--primary-light); margin-right: 5px;">Q${currentQuestionIndex + 1}.</span> ${qInfo.q}`;
    
    const paperQText = document.getElementById('paperQText3D');
    if (paperQText) {
        paperQText.innerHTML = `Q${currentQuestionIndex + 1}. ${qInfo.q}`;
    }

    const optsEl = document.getElementById('optionsList');
    optsEl.innerHTML = '';

    if (qInfo.is_subjective) {
        const ansContainer = document.createElement('div');
        ansContainer.className = 'subjective-container';
        ansContainer.style.textAlign = 'center';
        ansContainer.style.marginTop = '20px';
        
        const ansBox = document.createElement('div');
        ansBox.className = 'subjective-answer';
        ansBox.style.display = (userAnswers[currentQuestionIndex] || isReviewMode) ? 'block' : 'none';
        ansBox.style.background = 'rgba(255, 255, 255, 0.1)';
        ansBox.style.padding = '20px';
        ansBox.style.borderRadius = '10px';
        ansBox.style.color = '#ff6b6b';
        ansBox.style.fontSize = '1.1rem';
        ansBox.style.marginTop = '15px';
        ansBox.style.whiteSpace = 'pre-wrap';
        ansBox.textContent = qInfo.a_text;

        if (isReviewMode) {
             const label = document.createElement('div');
             label.style.color = 'var(--text-sub)';
             label.style.marginBottom = '10px';
             label.textContent = userAnswers[currentQuestionIndex] ? '✔ 본인 확인 여부: 확인됨' : '본인 확인 여부: 미확인';
             if (userAnswers[currentQuestionIndex]) label.style.color = '#059669';
             
             ansContainer.appendChild(label);
             ansContainer.appendChild(ansBox);
        } else {
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
        }
        
        optsEl.appendChild(ansContainer);
    } else {
        qInfo.o.forEach((optText, index) => {
            const optNum = index + 1;
            const optLabel = ['가', '나', '다', '라'][index];
            const btn = document.createElement('div');
            btn.className = 'option-btn';
            
            if (userAnswers[currentQuestionIndex] === optNum) {
                btn.classList.add('selected');
            }

            // Review Mode Logic
            if (isReviewMode) {
                const isCorrectAnswer = (optNum === qInfo.a);
                const isMyAnswer = (optNum === userAnswers[currentQuestionIndex]);
                
                let correctStyle = isCorrectAnswer ? 'background: rgba(239, 68, 68, 0.1); border-color: #ef4444;' : '';
                let numStyle = isCorrectAnswer ? 'background: #ef4444 !important; color: white;' : '';
                
                let checkMark = isMyAnswer ? ' <span class="material-icons" style="color: #059669; font-size: 1.1rem; vertical-align: middle; margin-left: 5px;">check_circle</span>' : '';

                if (isCorrectAnswer) {
                    btn.setAttribute('style', correctStyle);
                }

                btn.innerHTML = `
                    <div class="opt-num" style="${numStyle}">${optLabel}</div>
                    <div style="flex: 1; word-break: keep-all; display: flex; align-items: center;">
                        ${optText}${checkMark}
                    </div>
                `;
            } else {
                btn.onclick = () => {
                    userAnswers[currentQuestionIndex] = optNum;
                    const clickedIndex = currentQuestionIndex;
                    renderQuestion();
                    if(window.updatePaperPreviewSwiper) window.updatePaperPreviewSwiper(); // re-render to update selection
                    
                    // Auto next after 0.3s or check submit status on last question
                    if (window.autoNextTimeout) clearTimeout(window.autoNextTimeout);
                    window.autoNextTimeout = setTimeout(() => {
                        if (currentQuestionIndex === clickedIndex) {
                            if (currentQuestionIndex < currentQuestions.length - 1) {
                                nextQuestion();
                            } else {
                                const unansweredCount = userAnswers.filter(ans => ans === null).length;
                                if (unansweredCount === 0) {
                                    alert("모든 문제를 풀었습니다. 화면 하단의 '제출하기' 버튼을 눌러 제출해주세요.");
                                } else {
                                    alert(`아직 못 푼 문항이 ${unansweredCount}개 있습니다. 하단의 OMR 버튼을 눌러 확인해주세요.`);
                                }
                            }
                        }
                    }, 300);
                };
                
                btn.innerHTML = `
                    <div class="opt-num">${optLabel}</div>
                    <div style="flex: 1; word-break: keep-all;">${optText}</div>
                `;
            }
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
    if(window.updatePaperPreviewSwiper) window.updatePaperPreviewSwiper();
    }
}

function nextQuestion() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    if(window.updatePaperPreviewSwiper) window.updatePaperPreviewSwiper();
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
                const optLabel = ['가', '나', '다', '라'][opt - 1];
                const bubble = document.createElement('div');
                bubble.className = 'omr-bubble';
                bubble.textContent = optLabel;
                
                if (userAnswers[i] === opt) {
                    bubble.classList.add('selected');
                }

                if (isReviewMode) {
                    if (qInfo.a === opt) {
                        bubble.style.background = '#ef4444';
                        bubble.style.color = 'white';
                        bubble.style.borderColor = '#ef4444';
                    }
                    if (userAnswers[i] === opt && qInfo.a !== opt) {
                         // keep it selected (blue/green), maybe change it slightly if needed, but default selected is fine
                    }
                } else {
                    bubble.onclick = (e) => {
                        e.stopPropagation(); // prevent modal close or row click
                        
                        const wasUnsolved = (userAnswers[i] === null);

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
    if(window.updatePaperPreviewSwiper) window.updatePaperPreviewSwiper();
                        } else if (wasUnsolved) {
                            // 못푼 문제 답안을 클릭하면 그문제로 가게 해주세요
                            currentQuestionIndex = i;
                            renderQuestion();
    if(window.updatePaperPreviewSwiper) window.updatePaperPreviewSwiper();
                            setTimeout(() => {
                                const modal = document.getElementById('omrModal');
                                if (modal.classList.contains('open')) {
                                    toggleOMR();
                                }
                            }, 150);
                        }
                    };
                }
                bubbles.appendChild(bubble);
            }
        }

        row.appendChild(num);
        row.appendChild(bubbles);

        // Click row to jump to question
        row.onclick = () => {
            currentQuestionIndex = i;
            renderQuestion();
    if(window.updatePaperPreviewSwiper) window.updatePaperPreviewSwiper();
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
            let examsArray = Array.isArray(existingExams) ? existingExams : [];
            // Remove previous record for same student & examKey (overwrite on retake)
            examsArray = examsArray.filter(e => !(e.phone === resultData.phone && e.examKey === resultData.examKey));
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
    document.getElementById('totalCountDisplay').textContent = total;
    
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

function showCompletedExamResult(examKey, record) {
    currentExamKey = examKey;
    currentQuestions = questionsData[examKey];
    userAnswers = [...record.answers];
    isReviewMode = true;

    document.getElementById('resultScore').textContent = `${record.score}점`;
    document.getElementById('correctCount').textContent = record.correctCount;
    document.getElementById('totalCountDisplay').textContent = record.total;
    
    const passed = record.score >= 60;
    const statusEl = document.getElementById('resultStatus');
    if (passed) {
        statusEl.textContent = '합격입니다! 🎉';
        statusEl.className = 'result-status status-pass';
    } else {
        statusEl.textContent = '불합격입니다. 😢';
        statusEl.className = 'result-status status-fail';
    }

    renderChart(record.correctCount, record.total - record.correctCount);
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
        let myAnsStr = '-';
        let correctAnsStr = '-';
        
        if (q.is_subjective) {
            isCorrect = !!myAns;
            myAnsStr = isCorrect ? '확인됨' : '미확인';
            correctAnsStr = '주관식';
        } else {
            isCorrect = (myAns === q.a);
            myAnsStr = myAns ? ['가', '나', '다', '라'][myAns - 1] : '-';
            correctAnsStr = q.a ? ['가', '나', '다', '라'][q.a - 1] : '-';
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
    if(window.updatePaperPreviewSwiper) window.updatePaperPreviewSwiper();
    if(window.initPaperPreviewSwiper) window.initPaperPreviewSwiper();

    // Change back button behavior in review mode
    document.getElementById('backBtn').onclick = () => {
        showScreen('result');
    };
    document.getElementById('headerTitle').textContent = '응시 완료된 시험지 (오답 노트)';
}

function retakeCurrentExam() {
    if (confirm('재시험을 보시겠습니까? 기존 오답 노트는 초기화되며 처음부터 다시 풉니다.')) {
        startExam(currentExamKey);
    }
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
// Swiper Cards Exam Paper Preview Logic
window.swiperQuestionsPerCard = 5;

window.setQuestionsPerCard = function(num) {
    window.swiperQuestionsPerCard = num;
    if (window.initPaperPreviewSwiper) {
        window.initPaperPreviewSwiper();
        // Also update highlight for the new elements
        if (window.updatePaperPreviewSwiper) {
            window.updatePaperPreviewSwiper();
        }
    }
};

window.initPaperPreviewSwiper = function() {
    const wrapper = document.getElementById('swiperWrapperContent');
    if (!wrapper) return;
    
    const questionsPerCard = window.swiperQuestionsPerCard || 5;
    const numCards = Math.ceil(currentQuestions.length / questionsPerCard);
    
    wrapper.innerHTML = '';
    
    for (let i = 0; i < numCards; i++) {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        // Allow scrolling inside the card if content is too long
        slide.style.overflowY = 'auto'; 
        slide.style.maxHeight = '100%';
        
        const startQ = i * questionsPerCard;
        const endQ = Math.min(startQ + questionsPerCard, currentQuestions.length);
        
        let html = `<div class="card-title" style="position: sticky; top: 0; background: white; z-index: 10;">시험지 - ${i + 1}페이지 (${startQ + 1}~${endQ}번)</div>`;
        html += `<div class="card-questions">`;
        
        for (let j = startQ; j < endQ; j++) {
            const q = currentQuestions[j];
            let answerText = '';
            const ans = userAnswers[j];
            const isCorrect = isReviewMode && q.a && parseInt(q.a) === ans;
            const isWrong = isReviewMode && ans && q.a && parseInt(q.a) !== ans;
            
            let highlightStyle = '';
            if (isReviewMode) {
                if (isCorrect) highlightStyle = 'color: #16a34a; font-weight: bold;';
                else if (isWrong) highlightStyle = 'color: #dc2626; font-weight: bold;';
            } else if (ans !== null && ans !== undefined) {
                highlightStyle = 'color: #2563eb; font-weight: bold;'; // User marked an answer
            }

            html += `<div class="card-q-item" id="card-q-${j}" style="margin-bottom: 10px; cursor: pointer;" onclick="currentQuestionIndex = ${j}; renderQuestion();">
                        <div style="${highlightStyle}"><strong>Q${j + 1}.</strong> ${q.q}</div>`;
            
            // Add Options
            if (q.o && q.o.length > 0) {
                html += `<div style="margin-top: 4px; padding-left: 10px; color: #475569; font-size: 0.8rem; line-height: 1.4; display: flex; flex-direction: column; gap: 2px;">`;
                const circleNums = ['①', '②', '③', '④', '⑤'];
                q.o.forEach((opt, idx) => {
                    let optStyle = '';
                    if (isReviewMode) {
                        if (idx + 1 === parseInt(q.a)) optStyle = 'color: #16a34a; font-weight: bold;';
                        else if (idx + 1 === ans) optStyle = 'color: #dc2626; text-decoration: line-through;';
                    } else if (ans === idx + 1) {
                        optStyle = 'color: #2563eb; font-weight: bold;';
                    }
                    const numStr = circleNums[idx] || (idx + 1 + ')');
                    html += `<div style="${optStyle}">${numStr} ${opt}</div>`;
                });
                html += `</div>`;
            }
            html += `</div>`;
        }
        
        html += `</div>`;
        slide.innerHTML = html;
        wrapper.appendChild(slide);
    }
    
    if (window.paperSwiper) {
        window.paperSwiper.destroy(true, false);
    }
    
    window.paperSwiper = new Swiper(".mySwiperCards", {
        effect: "cards",
        grabCursor: true,
        keyboard: {
            enabled: true,
        },
        mousewheel: {
            invert: false,
        },
        cardsEffect: {
            perSlideOffset: 8,
            perSlideRotate: 2,
            rotate: true,
            slideShadows: true,
        },
    });
};

window.updatePaperPreviewSwiper = function() {
    if (!currentQuestions) return;
    
    for (let j = 0; j < currentQuestions.length; j++) {
        const el = document.getElementById(`card-q-${j}`);
        if (!el) continue;
        
        const q = currentQuestions[j];
        const ans = userAnswers[j];
        const isCorrect = isReviewMode && q.a && parseInt(q.a) === ans;
        const isWrong = isReviewMode && ans && q.a && parseInt(q.a) !== ans;
        
        let highlightStyle = '';
        if (isReviewMode) {
            if (isCorrect) highlightStyle = 'color: #16a34a; font-weight: bold;';
            else if (isWrong) highlightStyle = 'color: #dc2626; font-weight: bold;';
        } else if (ans !== null && ans !== undefined) {
            highlightStyle = 'color: #2563eb; font-weight: bold;'; // User marked an answer
        }

        let html = `<div style="${highlightStyle}"><strong>Q${j + 1}.</strong> ${q.q}</div>`;
        if (q.o && q.o.length > 0) {
            html += `<div style="margin-top: 4px; padding-left: 10px; color: #475569; font-size: 0.8rem; line-height: 1.4; display: flex; flex-direction: column; gap: 2px;">`;
            const circleNums = ['①', '②', '③', '④', '⑤'];
            q.o.forEach((opt, idx) => {
                let optStyle = '';
                if (isReviewMode) {
                    if (idx + 1 === parseInt(q.a)) optStyle = 'color: #16a34a; font-weight: bold;';
                    else if (idx + 1 === ans) optStyle = 'color: #dc2626; text-decoration: line-through;';
                } else if (ans === idx + 1) {
                    optStyle = 'color: #2563eb; font-weight: bold;';
                }
                const numStr = circleNums[idx] || (idx + 1 + ')');
                html += `<div style="${optStyle}">${numStr} ${opt}</div>`;
            });
            html += `</div>`;
        }
        el.innerHTML = html;
    }
    
    // Move to the card containing the current question
    if (window.paperSwiper) {
        const questionsPerCard = window.swiperQuestionsPerCard || 5;
        const cardIndex = Math.floor(currentQuestionIndex / questionsPerCard);
        window.paperSwiper.slideTo(cardIndex);
    }
};

