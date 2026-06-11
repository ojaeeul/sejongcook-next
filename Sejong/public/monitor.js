// Main Configuration

function getFetchUrl(endpoint, isPost = false) {
    const url = `/api/sejong/${endpoint}`;
    return isPost ? url : url + (url.includes('?') ? '&' : '?') + `t=${Date.now()}`;
}

const API_BASE = '/api/sejong';
let currentInput = "";
let stream = null;
let currentMode = 'home';
let pendingStatus = null;

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const shutter = document.getElementById('shutterEffect');
const statusMsg = document.getElementById('statusMsg');
const inputDisplay = document.getElementById('inputDisplay');

// DOM Sections
const homeScreen = document.getElementById('homeScreen');
const workspace = document.getElementById('workspace');

// Keypad UI elements
const inputWrapper = document.getElementById('inputWrapper');
const keypadGrid = document.getElementById('keypadGrid');
const faceOnlyPanel = document.getElementById('faceOnlyPanel');

// Titles
const mainTitle = document.getElementById('mainTitle');
const mainSub = document.getElementById('mainSub');
const mainSubmitBtn = document.getElementById('mainSubmitBtn');
const faceSubmitBtn = document.getElementById('faceSubmitBtn');
const mirrorSection = document.getElementById('mirrorSection');

// ---------------------------------------------------------
// Navigation Logic
// ---------------------------------------------------------

function switchMode(mode) {
    currentMode = mode;
    clearNum();
    pendingStatus = null;
    updatePendingStatusUI();
    if (statusMsg) statusMsg.textContent = "";

    // 화면 전환 시 무조건 루프 정지 (안전 장치)
    if (typeof stopAutoDetectionLoop === 'function') stopAutoDetectionLoop();

    if (mode === 'home') {
        if (homeScreen) homeScreen.style.display = 'flex';
        if (workspace) workspace.style.display = 'none';
        stopCamera();
        stopQRScanner();
    } else {
        if (homeScreen) homeScreen.style.display = 'none';
        if (workspace) {
            workspace.style.display = 'flex';
            workspace.className = 'mode-' + mode;
        }

        stopCamera();
        stopQRScanner();

        if (mode === 'number') {
            setupUI("번호 출석", "휴대폰 뒷번호 8자리를 입력하세요", true, false, false, false, true);
            if (mirrorSection) mirrorSection.style.opacity = '0.2';
        }
        else if (mode === 'face_only') {
            setupUI("얼굴 출석", "버튼을 누를 필요 없이 카메라를 정면으로 바라봐 주세요", false, true, true, false, false);
            if (mirrorSection) mirrorSection.style.opacity = '1';
            startCamera().then(() => {
                startAutoDetectionLoop();
            });
            loadFaceModels();
        }
        else if (mode === 'register') {
            setupUI("신규 얼굴 등록", "번호 입력 후 얼굴을 촬영하세요", true, false, true, false, false);
            if (mirrorSection) mirrorSection.style.opacity = '1';
            if (faceSubmitBtn) faceSubmitBtn.style.display = 'block';
            if (mainSubmitBtn) mainSubmitBtn.style.display = 'none';
            startCamera();
            loadFaceModels(); // Preload ML
        }
        else if (mode === 'qr') {
            setupUI("QR 출석", "학원에서 발급된 QR코드를 스캔하세요", false, false, false, true, false);
            if (mirrorSection) mirrorSection.style.opacity = '1';
            startQRScanner();
        }
        else if (mode === 'hybrid') {
            setupUI("스마트 출석", "얼굴, QR, 또는 번호 중 하나로 출석하세요", true, false, true, true, true);
            if (mirrorSection) mirrorSection.style.opacity = '1';
            // Start Face Camera and Auto Detection
            startCamera().then(() => {
                startAutoDetectionLoop();
            });
            // Also Start QR Scanner
            startQRScanner();
            loadFaceModels();
        }
    }
}

let modelsLoaded = false;
let modelsLoading = false;

async function loadFaceModels() {
    if (modelsLoaded || modelsLoading) return;
    modelsLoading = true;
    
    try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/gh/vladmandic/face-api/model/';
        showStatus("AI 엔진(고속+정밀) 불러오는 중...", "#059669");
        if (shutter) shutter.style.opacity = '1';

        try { await faceapi.tf.setBackend('webgl'); } catch (e) { console.log('WebGL backend not supported, fallback to default'); }

        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        
        modelsLoaded = true;
        showStatus("AI 인식 준비 완료", "#059669");
        setTimeout(() => showStatus("", ""), 1500);
    } catch (e) {
        showStatus("AI 엔진 로드 실패. 관리자에게 문의하세요.", "red");
        console.error("Face API load error:", e);
    } finally {
        modelsLoading = false;
    }
}

function setupUI(title, sub, showKeypad, showFacePanel, showFaceCamera, showQRScanner, showManualButtons) {
    if (mainTitle) mainTitle.textContent = title;
    if (mainSub) mainSub.textContent = sub;

    if (inputWrapper) inputWrapper.style.display = showKeypad ? 'block' : 'none';
    if (keypadGrid) keypadGrid.style.display = showKeypad ? 'grid' : 'none';
    if (faceOnlyPanel) faceOnlyPanel.style.display = showFacePanel ? 'block' : 'none';

    const faceCameraWrapper = document.getElementById('faceCameraWrapper');
    if (faceCameraWrapper) faceCameraWrapper.style.display = showFaceCamera ? 'block' : 'none';

    const qrReaderWrapper = document.getElementById('qrReaderWrapper');
    if (qrReaderWrapper) qrReaderWrapper.style.display = showQRScanner ? 'block' : 'none';

    const manualStatusBtns = document.getElementById('manualStatusBtns');
    if (manualStatusBtns) manualStatusBtns.style.display = showManualButtons ? 'grid' : 'none';

    if (mainSubmitBtn) {
        // Only show main submit button in pure number mode if manual buttons are not taking its place
        // Actually, let's hide main submit if manual buttons are showing.
        mainSubmitBtn.style.display = (currentMode === 'number' && !showManualButtons) ? 'block' : 'none';
        // Wait, hybrid mode uses keypad too. Let's show submit if it's hybrid and we don't force manual buttons.
        // The image shows manual buttons INSTEAD of submit? No, the image has '확인' and below it manual buttons.
        // So we show it for both number and hybrid.
        mainSubmitBtn.style.display = (currentMode === 'number' || currentMode === 'hybrid') ? 'block' : 'none';
    }
    if (faceSubmitBtn) faceSubmitBtn.style.display = (currentMode === 'register') ? 'block' : 'none';

    // Scan status icon/text update based on mode
    const scanStatusIcon = document.getElementById('scanStatusIcon');
    const scanStatusText = document.getElementById('scanStatusText');
    if (scanStatusIcon && scanStatusText) {
        if (showQRScanner) {
            scanStatusIcon.textContent = 'qr_code_scanner';
            scanStatusText.textContent = 'QR 코드를 스캐너에 비춰주세요';
        } else if (showFaceCamera) {
            scanStatusIcon.textContent = 'videocam';
            scanStatusText.textContent = '실시간 에코 미러 작동 중';
        }
    }
}

// ---------------------------------------------------------
// Attendance Logic
// ---------------------------------------------------------

async function submitAttendance(forcedStatus = null) {
    if (currentInput.length !== 8) {
        showStatus("번호 8자리를 입력해주세요.", "red");
        return;
    }
    if (mainSubmitBtn) { mainSubmitBtn.disabled = true; mainSubmitBtn.textContent = "처리중..."; mainSubmitBtn.style.opacity = "0.7"; }
    showStatus("출석 처리 중입니다...", "#3b82f6");
    await processAttendance(currentInput, null, forcedStatus);
    if (mainSubmitBtn) { mainSubmitBtn.disabled = false; mainSubmitBtn.textContent = "출석"; mainSubmitBtn.style.opacity = "1"; }
}

function submitAttendanceWithStatus(status) {
    submitAttendance(status);
}

function handleManualStatusBtn(status) {
    if (currentInput.length === 8) {
        submitAttendance(status);
        pendingStatus = null;
        updatePendingStatusUI();
    } else {
        // Toggle pending status
        if (pendingStatus === status) {
            pendingStatus = null; // 취소
        } else {
            pendingStatus = status;
        }
        updatePendingStatusUI();
    }
}

function updatePendingStatusUI() {
    const btns = document.querySelectorAll('.status-action-btn');
    btns.forEach(btn => btn.classList.remove('pending'));

    const msgEl = document.getElementById('pendingStatusMsg');
    
    if (pendingStatus) {
        const activeBtn = document.querySelector(`.status-action-btn.${pendingStatus}`);
        if (activeBtn) activeBtn.classList.add('pending');
        
        const labels = { present: '입실', early: '퇴실', outing: '외출', return: '복귀' };
        if (msgEl) {
            msgEl.textContent = `[${labels[pendingStatus]}] 선택됨. 카메라를 보거나 번호를 누르세요.`;
            msgEl.style.display = 'block';
        }
    } else {
        if (msgEl) {
            msgEl.textContent = '';
            msgEl.style.display = 'none';
        }
    }
}

let autoDetectInterval = null;
let isAuthenticating = false;

function startAutoDetectionLoop() {
    if (autoDetectInterval) clearInterval(autoDetectInterval);
    isAuthenticating = false;
    autoDetectInterval = setInterval(async () => {
        if (!modelsLoaded || isAuthenticating || currentMode !== 'face_only' || !video || video.paused) return;

        try {
            // 빠른 추적용 (초점 UI용) - TinyFaceDetector
            const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });
            const detections = await faceapi.detectAllFaces(video, options).withFaceLandmarks();
            
            drawMultiFocusUI(detections);

            // 안정적으로 감지되면 고정밀 모델(ssdMobilenetv1) 구동하여 출석 체크
            if (detections.length > 0 && !isAuthenticating) {
                const box = detections[0].detection.box;
                if (box.width > 80 && box.height > 80) { // 너무 멀리 있는 얼굴은 무시
                    isAuthenticating = true;
                    await processAutoAttendance(pendingStatus);
                }
            }
        } catch(e) {
            console.error("Auto detect error:", e);
        }
    }, 100); // 초당 약 10프레임 속도로 십자선 업데이트
}

function stopAutoDetectionLoop() {
    if (autoDetectInterval) {
        clearInterval(autoDetectInterval);
        autoDetectInterval = null;
    }
    const overlayCanvas = document.getElementById('overlayCanvas');
    if (overlayCanvas) {
        const ctx = overlayCanvas.getContext('2d');
        ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }
}

function drawMultiFocusUI(detections) {
    const overlayCanvas = document.getElementById('overlayCanvas');
    if (!overlayCanvas || !video) return;

    if (overlayCanvas.width !== video.clientWidth) {
        overlayCanvas.width = video.clientWidth;
        overlayCanvas.height = video.clientHeight;
    }

    const ctx = overlayCanvas.getContext('2d');
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    if (!detections || detections.length === 0) return;

    const dims = faceapi.matchDimensions(overlayCanvas, video, true);
    const resizedDetections = faceapi.resizeResults(detections, dims);

    ctx.strokeStyle = '#10b981'; // 에메랄드 그린
    ctx.lineWidth = 2;
    ctx.fillStyle = '#10b981';

    resizedDetections.forEach(det => {
        const box = det.detection.box;
        const landmarks = det.landmarks;
        
        // 다중 십자 타겟팅 포인트들 (얼굴 윤곽, 눈, 코, 입)
        const pointsToTrack = [
            landmarks.getLeftEye()[0],
            landmarks.getLeftEye()[3],
            landmarks.getRightEye()[0],
            landmarks.getRightEye()[3],
            landmarks.getNose()[0],
            landmarks.getNose()[3],
            landmarks.getMouth()[0],
            landmarks.getMouth()[6],
            {x: box.x, y: box.y},
            {x: box.x + box.width, y: box.y},
            {x: box.x, y: box.y + box.height},
            {x: box.x + box.width, y: box.y + box.height}
        ];

        const drawCrosshair = (x, y, size) => {
            ctx.beginPath();
            ctx.moveTo(x - size, y); ctx.lineTo(x + size, y);
            ctx.moveTo(x, y - size); ctx.lineTo(x, y + size);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, 2*Math.PI);
            ctx.fill();
        };

        pointsToTrack.forEach(p => {
            if(p) drawCrosshair(p.x, p.y, 8);
        });
        
        // 큰 타겟 윤곽선 박스
        ctx.beginPath();
        ctx.rect(box.x, box.y, box.width, box.height);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.stroke();
    });
}

async function processAutoAttendance(forcedStatus = null) {
    if (!modelsLoaded) return;
    
    try {
        if (shutter) shutter.style.opacity = '1';
        setTimeout(() => { if (shutter) shutter.style.opacity = '0'; }, 150);

        showStatus("AI 얼굴 특징 매칭 중...", "#3b82f6");
        const [detection, res] = await Promise.all([
            faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor(),
            fetch(getFetchUrl('members') + '&t=' + Date.now())
        ]);

        if (!detection) {
            showStatus("초점이 맞지 않았습니다. 다시 스캔합니다.", "red");
            setTimeout(() => { isAuthenticating = false; }, 800);
            return;
        }

        const rawMembers = await res.json();
        const members = Array.isArray(rawMembers) ? rawMembers.filter(m => !['delete', 'trash', 'hold', 'completed'].includes(m.status)) : [];

        let bestMatch = null;
        let savedSens = localStorage.getItem('kiosk_sensitivity');
        if (savedSens === '0.65') {
            savedSens = '0.45';
            localStorage.setItem('kiosk_sensitivity', '0.45');
        }
        let smallestDistance = parseFloat(savedSens) || 0.45;

        const captureData = capturePrettyFrame();

        for (const m of members) {
            if (m.faceDescriptor) {
                const desc = new Float32Array(m.faceDescriptor);
                const distance = faceapi.euclideanDistance(detection.descriptor, desc);
                if (distance < smallestDistance) {
                    smallestDistance = distance;
                    bestMatch = m;
                }
            }
        }

        if (bestMatch) {
            const phoneStr = bestMatch.phone.replace(/-/g, '');
            const phone8 = phoneStr.length >= 8 ? phoneStr.slice(-8) : phoneStr;
            await processAttendance(phone8, captureData, forcedStatus);
            // 성공 시 상태 초기화
            pendingStatus = null;
            updatePendingStatusUI();
            
            // 성공 시 연속 출석 방지를 위한 3초 쿨다운
            setTimeout(() => { isAuthenticating = false; }, 3000);
        } else {
            showStatus("미등록 얼굴입니다.", "red");
            // 실패 시 1.5초 후 다시 시도
            setTimeout(() => { isAuthenticating = false; }, 1500);
        }

    } catch(e) {
        showStatus("스캔 시스템 오류", "red");
        console.error(e);
        setTimeout(() => { isAuthenticating = false; }, 2000);
    }
}

function capturePrettyFrame() {
    const context = canvas.getContext('2d');
    const vW = video.videoWidth || 1280;
    const vH = video.videoHeight || 720;
    const cW = canvas.width || 640;
    const cH = canvas.height || 480;
    const vRatio = vW / vH;
    const cRatio = cW / cH;
    let sW, sH, sX = 0, sY = 0;
    
    // 비율 왜곡 방지 (찌그러짐 방지 - 가운데 크롭)
    if (vRatio > cRatio) {
        sH = vH;
        sW = vH * cRatio;
        sX = (vW - sW) / 2;
    } else {
        sW = vW;
        sH = vW / cRatio;
        sY = (vH - sH) / 2;
    }
    
    // 뷰티 필터 (뽀샤시 효과: 밝기+15%, 대비+5%, 채도+15%)
    context.filter = 'brightness(1.15) contrast(1.05) saturate(1.15)';
    
    // 좌우 반전 (거울 모드로 찍히도록)
    context.save();
    context.scale(-1, 1);
    context.translate(-cW, 0);
    
    context.drawImage(video, sX, sY, sW, sH, 0, 0, cW, cH);
    context.restore();
    
    return canvas.toDataURL('image/jpeg', 0.85); // 고화질
}

async function capturePhoto() {
    if (currentInput.length !== 8) {
        showStatus("먼저 뒷번호 8자리를 입력해주세요.", "red");
        return;
    }

    if (!modelsLoaded) {
        showStatus("AI 엔진 대기중... 10초 뒤 다시 시도해주세요.", "orange");
        return;
    }

    if (faceSubmitBtn) {
        faceSubmitBtn.disabled = true;
        faceSubmitBtn.innerHTML = "AI 분석 대기중...<br>잠시 대기!";
        faceSubmitBtn.style.background = "#94a3b8";
    }

    showStatus("사진 촬영 및 얼굴 특징을 추출 중입니다...", "#3b82f6");
    if (shutter) shutter.style.opacity = '1';
    setTimeout(() => { if (shutter) shutter.style.opacity = '0'; }, 150);

    // Yield for UI paint
    await new Promise(r => setTimeout(r, 10));

    try {
        const photoDataUrl = capturePrettyFrame();

        const [res, detection] = await Promise.all([
            fetch(getFetchUrl('members') + '&t=' + Date.now()),
            faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor()
        ]);

        const rawMembers = await res.json();
        const members = Array.isArray(rawMembers) ? rawMembers.filter(m => !['delete', 'trash', 'hold', 'completed'].includes(m.status)) : [];
        const member = members.find(m => m.phone && m.phone.replace(/-/g, '').endsWith(currentInput));

        if (!member) {
            showStatus("뒷번호 8자리와 일치하는 수강생 대장 회원이 없습니다.", "red");
            return;
        }

        if (!detection) {
            showStatus("얼굴이 명확히 인식되지 않았습니다. 밝은 곳에서 시도해주세요.", "red");
            return;
        }

        showStatus("신규 얼굴 데이터를 서버에 등록 중입니다...", "#059669");

        member.photo = photoDataUrl;
        member.faceDescriptor = Array.from(detection.descriptor); // Store for euclidean comparison

        await fetch(getFetchUrl('members', true), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(member)
        });

        showStatus("얼굴 등록 완료! 홈 화면으로 돌아갑니다. 다시 로그인 해주세요.", "#059669");
        setTimeout(() => switchMode('home'), 2500);
    } catch (e) {
        console.error('Registration Error:', e);
        showStatus(`저장 오류! (${e.message || '통신 실패'})`, "red");
    } finally {
        if (faceSubmitBtn) {
            faceSubmitBtn.disabled = false;
            faceSubmitBtn.innerHTML = "얼굴 촬영<br>및 출석";
            faceSubmitBtn.style.background = "#059669";
        }
    }
}

function determineAttendanceStatus(member) {
    if (!member || !member.timeSlot) return 'present';

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    const slots = member.timeSlot.split(',').map(s => {
        const parts = s.trim().split(':');
        if (parts.length < 2) return -1;
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }).filter(m => m !== -1);

    if (slots.length === 0) return 'present';

    for (const slotMins of slots) {
        // Valid attendance window: 120 mins before to 120 mins after the slot
        if (currentMins >= (slotMins - 120) && currentMins <= (slotMins + 120)) {
            if (currentMins >= slotMins + 5) {
                return 'late';
            }
            const h = Math.floor(slotMins / 60);
            if (h === 10) return '10';
            if (h === 12) return '12';
            if (h === 14 || h === 2) return '2';
            if (h === 17 || h === 5) return '5';
            if (h === 19 || h === 7) return '7';
            return 'present';
        }
    }
    return 'invalid_time';
}

let timetableData = {
    '한식기능사': [1, 3],
    '양식기능사': [2, 4],
    '일식기능사': [2, 4],
    '중식기능사': [2, 4],
    '제과기능사': [1, 3],
    '제빵기능사': [2, 4],
    '제과제빵기능사': [1, 2, 3, 4],
    '복어기능사': [5],
    '산업기사': [5],
    '가정요리': [2, 4],
    '브런치': [5]
};

async function checkTimetableAllowed(member) {
    if (!member || !member.course) return true;
    
    try {
        const res = await fetch(getFetchUrl('timetable') + '&t=' + Date.now());
        if (res.ok) {
            const apiData = await res.json();
            if (apiData && Object.keys(apiData).length > 0) {
                timetableData = { ...timetableData, ...apiData };
            }
        }
    } catch (e) {
        console.error("Timetable fetch failed", e);
    }
    
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0(Sun) ~ 6(Sat)
    
    const courses = member.course.split(',').map(c => c.trim().replace(/\([^)]*\)/g, '').trim());
    
    let hasClassToday = false;
    let foundTimetableEntry = false;
    
    for (const cName of courses) {
        if (timetableData[cName]) {
            foundTimetableEntry = true;
            if (timetableData[cName].includes(dayOfWeek)) {
                hasClassToday = true;
                break;
            }
        } else if (timetableData[cName.replace(/\s/g, '')]) {
             foundTimetableEntry = true;
             if (timetableData[cName.replace(/\s/g, '')].includes(dayOfWeek)) {
                hasClassToday = true;
                break;
             }
        }
    }
    
    if (foundTimetableEntry && !hasClassToday) {
        return false;
    }
    return true;
}

async function processAttendance(inputNumOrObj, overridePhoto = null, forcedStatus = null) {
    try {
        let member = null;
        if (typeof inputNumOrObj === 'object' && inputNumOrObj !== null) {
            member = inputNumOrObj;
        } else {
            const res = await fetch(getFetchUrl('members') + '&t=' + Date.now());
            const rawMembers = await res.json();
            const members = Array.isArray(rawMembers) ? rawMembers.filter(m => !['delete', 'trash', 'hold', 'completed'].includes(m.status)) : [];
            member = members.find(m => m.phone && m.phone.replace(/-/g, '').endsWith(inputNumOrObj));
        }

        if (!member) {
            showStatus("등록되지 않은 번호입니다.", "red");
            return;
        }

        // --- NEW: Check if already logged in today ---
        const todayStrForCheck = new Date().toISOString().split('T')[0];
        try {
            const attRes = await fetch(getFetchUrl(`attendance?date=${todayStrForCheck}`));
            if (attRes.ok) {
                const attData = await attRes.json();
                const alreadyCheckedIn = attData.some(row => row.memberId === member.id && row.status !== 'unchecked');
                if (alreadyCheckedIn) {
                    const msg = "이미 로그인되어 있습니다.";
                    showStatus(msg, "orange");
                    if (localStorage.getItem('kiosk_voice_enabled') !== 'false' && window.speakTTS) {
                        speakTTS(msg, 'browser');
                    }
                    setTimeout(() => switchMode('home'), 2500);
                    return;
                }
            }
        } catch(e) {
            console.error("Duplicate check failed", e);
        }
        // ---------------------------------------------
        
        // --- NEW: Check if today is a valid class day ---
        if (!forcedStatus) {
            const isAllowed = await checkTimetableAllowed(member);
            if (!isAllowed) {
                const msg = "오늘은 수강 요일이 아닙니다.";
                showStatus(msg, "red");
                if (localStorage.getItem('kiosk_voice_enabled') !== 'false' && window.speakTTS) {
                    speakTTS(msg, 'browser');
                }
                return; // Reject attendance
            }
        }
        // ------------------------------------------------

        const today = new Date().toISOString().split('T')[0];
        const status = forcedStatus || determineAttendanceStatus(member);

        if (status === 'invalid_time' && !forcedStatus) {
            const msg = "현재는 예약된 수강 시간이 아닙니다.";
            showStatus(msg, "red");
            if (localStorage.getItem('kiosk_voice_enabled') !== 'false' && window.speakTTS) {
                speakTTS(msg, 'browser');
            }
            return; // Reject attendance
        }

        const postRes = await fetch(getFetchUrl('attendance', true), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberId: member.id, date: today, status: status, course: member.course })
        });

        if (postRes.ok) {
            showStatus(`${member.name}님, 등원 완료!`, "#3b82f6");
            showFaceOverlay(overridePhoto || member.photo, member.name);
            
            // Play login success sound
            if (window.playLoginSound) window.playLoginSound();

            // Notify other tabs (like Monthly Sheet) to sync automatically
            localStorage.setItem('sejong_attendance_sync', Date.now().toString());

            // TTS Voice Feedback
            if (localStorage.getItem('kiosk_voice_enabled') !== 'false') {
                const mode = localStorage.getItem('kiosk_tts_mode') || 'browser';
                let ttsMsg = '';
                if (mode === 'browser') {
                    const template = localStorage.getItem('kiosk_tts_template') || '{name}님 등원 완료되었습니다.';
                    ttsMsg = template.replace(/{name}/g, member.name);
                } else if (mode === 'api') {
                    const template = localStorage.getItem('kiosk_tts_api_template') || '{name}님 등원 완료되었습니다.';
                    ttsMsg = template.replace(/{name}/g, member.name);
                } else if (mode === 'mp3') {
                    ttsMsg = '__MP3_SUCCESS__';
                }
                if (window.speakTTS) speakTTS(ttsMsg, mode);
            }
            
            setTimeout(() => switchMode('home'), 2500);
        }
    } catch (e) {
        showStatus("통신 장애!", "red");
    }
}

function addNum(num) {
    if (currentInput.length < 8) {
        currentInput += num;
        updateDisplay();
        if (currentInput.length === 8 && currentMode === 'number') {
            submitAttendance();
        }
    }
}
function clearNum() { currentInput = ""; updateDisplay(); }
function updateDisplay() { if (inputDisplay) inputDisplay.textContent = currentInput; }

let cameraHealthCheckInterval = null;
let lastVideoTime = 0;

let html5QrCode = null;

function startQRScanner() {
    if (html5QrCode) return;
    html5QrCode = new Html5Qrcode("qrReader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    html5QrCode.start({ facingMode: "user" }, config, async (decodedText) => {
        if (isAuthenticating) return;
        isAuthenticating = true;
        
        showStatus("QR코드 인식 완료. 처리 중...", "#3b82f6");
        
        let phone8 = decodedText.replace(/-/g, '');
        if (phone8.length >= 8) phone8 = phone8.slice(-8);
        
        await processAttendance(phone8, null, pendingStatus);
        
        pendingStatus = null;
        updatePendingStatusUI();
        
        setTimeout(() => { isAuthenticating = false; }, 3000);
    }, (error) => {
        // ignore
    }).catch(err => {
        showStatus("QR 스캐너 시작 오류: " + err, "red");
        console.error(err);
    });
}

function stopQRScanner() {
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            html5QrCode.clear();
            html5QrCode = null;
        }).catch(err => {
            html5QrCode = null;
        });
    }
}

async function startCamera() {
    try {
        const cameraId = localStorage.getItem('kiosk_camera_id');
        const constraints = { video: { width: 1280, height: 720, focusMode: { ideal: "continuous" } } };
        
        if (cameraId) {
            constraints.video.deviceId = { exact: cameraId };
        }
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (video) video.srcObject = stream;

        // 카메라 헬스체크 시작 (검은 화면 멈춤 복구용)
        if (cameraHealthCheckInterval) clearInterval(cameraHealthCheckInterval);
        lastVideoTime = 0;
        cameraHealthCheckInterval = setInterval(async () => {
            if (video && stream && currentMode !== 'home' && currentMode !== 'number') {
                if (video.currentTime === lastVideoTime) {
                    // 비디오가 멈췄거나 오류 상태
                    console.warn("Camera frozen detected! Restarting...");
                    stopCamera();
                    try {
                        stream = await navigator.mediaDevices.getUserMedia(constraints);
                        if (video) video.srcObject = stream;
                    } catch(e) { console.error("Camera recovery failed", e); }
                }
                lastVideoTime = video.currentTime;
            }
        }, 3000); // 3초마다 체크
    } catch (e) {
        console.error("Camera Error:", e);
        // Fallback if specific camera fails
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, focusMode: { ideal: "continuous" } } });
            if (video) video.srcObject = stream;
        } catch(e2) {
            showStatus("카메라 에러", "red");
        }
    }
}

function stopCamera() {
    if (cameraHealthCheckInterval) {
        clearInterval(cameraHealthCheckInterval);
        cameraHealthCheckInterval = null;
    }
    if (stream) stream.getTracks().forEach(t => t.stop());
    if (video) video.srcObject = null;
}

function showFaceOverlay(url, name) {
    if (!url) return;
    const overlay = document.createElement('div');
    overlay.style = "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 320px; height: 320px; border-radius: 50%; border: 10px solid #4ade80; box-shadow: 0 0 100px rgba(74, 222, 128, 0.6); background: url(" + url + ") center/cover; z-index: 100; animation: popIn 0.5s;";
    const label = document.createElement('div');
    label.style = "position: absolute; bottom: -60px; left: 50%; transform: translateX(-50%); color: white; font-size: 2rem; font-weight: 900; white-space: nowrap; text-shadow: 0 4px 10px rgba(0,0,0,0.8);";
    label.textContent = name + "님 반가워요!";
    overlay.appendChild(label);
    const frame = document.querySelector('.camera-frame');
    if (frame) frame.appendChild(overlay);
    setTimeout(() => { if (overlay) overlay.remove(); }, 2500);
}

function showStatus(msg, color) { 
    if (statusMsg) { 
        statusMsg.textContent = msg; 
        statusMsg.style.color = color; 
    } 
    const scanStatusText = document.querySelector('#scanStatus span:nth-child(2)');
    if (scanStatusText) {
        scanStatusText.textContent = msg;
        scanStatusText.style.color = color;
    }
}

function updateKioskTime() {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const dateStr = now.getFullYear() + '. ' + String(now.getMonth() + 1).padStart(2, '0') + '. ' + String(now.getDate()).padStart(2, '0');
    if (document.getElementById('homeTime')) document.getElementById('homeTime').textContent = timeStr;
    if (document.getElementById('homeDate')) document.getElementById('homeDate').textContent = dateStr;
}

// Launch
setInterval(updateKioskTime, 1000);
updateKioskTime();
document.addEventListener('DOMContentLoaded', () => { switchMode('home'); });



window.speakTTS = function(text, forceMode = null) {
    const mode = forceMode || localStorage.getItem('kiosk_tts_mode') || 'browser';
    
    if (mode === 'mp3' && text === '__MP3_SUCCESS__') {
        const mp3Index = localStorage.getItem('kiosk_tts_mp3') || '1';
        const audio = new Audio(`/audio/voice_${mp3Index}.mp3`);
        audio.play().catch(e => console.error("MP3 Play Error:", e));
        return;
    }

    if (mode === 'api' && text !== '__MP3_SUCCESS__') {
        // TODO: Call cloud API backend when implemented
        console.log("Cloud TTS API Mode - text to synthesize:", text);
    }

    // Fallback or explicit browser mode
    if (!window.speechSynthesis) return;
    
    // Stop any currently playing audio
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    
    const style = localStorage.getItem('kiosk_tts_style') || '1';
    let pitch = 1.0, rate = 1.0;
    switch(style) {
        case '1': pitch = 1.0; rate = 1.0; break;
        case '2': pitch = 1.2; rate = 1.1; break;
        case '3': pitch = 0.9; rate = 0.9; break;
        case '4': pitch = 1.3; rate = 1.3; break;
        case '5': pitch = 0.7; rate = 0.8; break;
        case '6': pitch = 1.8; rate = 1.1; break;
        case '7': pitch = 2.0; rate = 1.5; break;
        case '8': pitch = 0.5; rate = 0.85; break;
        case '9': pitch = 0.1; rate = 0.9; break;
        case '10': pitch = 1.1; rate = 0.95; break;
        case '11': pitch = 1.5; rate = 1.6; break;
        case '12': pitch = 1.6; rate = 0.7; break;
        case '13': pitch = 0.4; rate = 0.7; break;
        case '14': pitch = 0.8; rate = 1.2; break;
        case '15': pitch = 1.4; rate = 1.2; break;
        case '16': pitch = 1.0; rate = 1.15; break;
        case '17': pitch = 0.6; rate = 0.6; break;
        case '18': pitch = 1.1; rate = 0.8; break;
        case '19': pitch = 0.2; rate = 1.4; break;
        case '20': pitch = 1.7; rate = 1.2; break;
    }
    utterance.pitch = pitch;
    utterance.rate = rate;
    
    const voices = window.speechSynthesis.getVoices();
    const koVoice = voices.find(v => v.lang.includes('ko'));
    if (koVoice) utterance.voice = koVoice;
    
    window.speechSynthesis.speak(utterance);
};

window.playLoginSound = function() {
    const type = localStorage.getItem('kiosk_sound_type') || 'dingdong';
    if (type === 'none') return;
    
    if (type === 'custom') {
        const customData = localStorage.getItem('kiosk_custom_sound');
        if (customData) {
            const audio = new Audio(customData);
            audio.play().catch(e => console.log("Custom audio play blocked", e));
        }
        return;
    }
    
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        function playNote(freq, startTime, duration, vol=0.3, wave='sine') {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.type = wave;
            oscillator.frequency.value = freq;
            
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(vol, startTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        }

        const now = audioCtx.currentTime;
        if (type === 'dingdong') {
            playNote(659.25, now, 0.4); playNote(523.25, now + 0.3, 0.6); 
        } else if (type === 'chime') {
            playNote(523.25, now, 0.2); playNote(659.25, now + 0.1, 0.2); playNote(783.99, now + 0.2, 0.2); playNote(1046.50, now + 0.3, 0.5);
        } else if (type === 'beep') {
            playNote(1046.50, now, 0.15);
        } else if (type === 'mario') {
            playNote(987.77, now, 0.1, 0.2, 'square'); playNote(1318.51, now + 0.1, 0.4, 0.2, 'square');
        } else if (type === 'arcade1') {
            for(let i=0; i<5; i++) playNote(400 + i*100, now + i*0.05, 0.1, 0.2, 'square');
        } else if (type === 'arcade2') {
            playNote(300, now, 0.1, 0.2, 'sawtooth'); playNote(600, now+0.1, 0.2, 0.2, 'sawtooth');
        } else if (type === 'magic') {
            [523, 659, 783, 1046, 1318].forEach((f, i) => playNote(f, now + i*0.05, 0.3, 0.1, 'sine'));
        } else if (type === 'level_up') {
            playNote(523, now, 0.15); playNote(659, now+0.15, 0.15); playNote(783, now+0.3, 0.15); playNote(1046, now+0.45, 0.4);
        } else if (type === 'bell1') {
            playNote(880, now, 0.8, 0.4, 'sine');
        } else if (type === 'bell2') {
            playNote(880, now, 0.2, 0.3, 'sine'); playNote(880, now+0.25, 0.6, 0.3, 'sine');
        } else if (type === 'sci_fi') {
            playNote(2000, now, 0.05, 0.1, 'square'); playNote(2200, now+0.1, 0.05, 0.1, 'square'); playNote(2400, now+0.2, 0.1, 0.1, 'square');
        } else if (type === 'future_click') {
            playNote(3000, now, 0.02, 0.1, 'triangle');
        } else if (type === 'bubble') {
            const osc = audioCtx.createOscillator(); const gn = audioCtx.createGain();
            osc.connect(gn); gn.connect(audioCtx.destination);
            osc.frequency.setValueAtTime(200, now); osc.frequency.exponentialRampToValueAtTime(800, now+0.1);
            gn.gain.setValueAtTime(0.3, now); gn.gain.exponentialRampToValueAtTime(0.01, now+0.1);
            osc.start(now); osc.stop(now+0.1);
        } else if (type === 'laser') {
            const osc = audioCtx.createOscillator(); const gn = audioCtx.createGain();
            osc.connect(gn); gn.connect(audioCtx.destination); osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(1200, now); osc.frequency.exponentialRampToValueAtTime(100, now+0.2);
            gn.gain.setValueAtTime(0.2, now); gn.gain.exponentialRampToValueAtTime(0.01, now+0.2);
            osc.start(now); osc.stop(now+0.2);
        } else if (type === 'fanfare') {
            playNote(523, now, 0.1, 0.2, 'square'); playNote(523, now+0.15, 0.1, 0.2, 'square'); playNote(523, now+0.3, 0.1, 0.2, 'square'); playNote(880, now+0.45, 0.6, 0.2, 'square');
        } else if (type === 'drum_kick') {
            const osc = audioCtx.createOscillator(); const gn = audioCtx.createGain();
            osc.connect(gn); gn.connect(audioCtx.destination);
            osc.frequency.setValueAtTime(150, now); osc.frequency.exponentialRampToValueAtTime(0.01, now+0.2);
            gn.gain.setValueAtTime(0.5, now); gn.gain.exponentialRampToValueAtTime(0.01, now+0.2);
            osc.start(now); osc.stop(now+0.2);
        } else if (type === 'robot') {
            [400,300,500,200].forEach((f,i) => playNote(f, now+i*0.1, 0.1, 0.2, 'sawtooth'));
        } else if (type === 'bird') {
            const osc = audioCtx.createOscillator(); const gn = audioCtx.createGain();
            osc.connect(gn); gn.connect(audioCtx.destination);
            osc.frequency.setValueAtTime(2000, now); osc.frequency.linearRampToValueAtTime(3000, now+0.05); osc.frequency.linearRampToValueAtTime(2000, now+0.1);
            gn.gain.setValueAtTime(0, now); gn.gain.linearRampToValueAtTime(0.2, now+0.05); gn.gain.linearRampToValueAtTime(0, now+0.1);
            osc.start(now); osc.stop(now+0.1);
        } else if (type === 'coin2') {
            playNote(1200, now, 0.05, 0.2, 'square'); playNote(1600, now+0.05, 0.3, 0.2, 'square');
        } else if (type === 'trill') {
            for(let i=0; i<8; i++) playNote(i%2===0?800:1000, now+i*0.05, 0.05, 0.2);
        } else if (type === 'soft_pop') {
            playNote(400, now, 0.05, 0.1);
        } else if (type === 'warm_pad') {
            playNote(300, now, 1.0, 0.15, 'triangle'); playNote(380, now, 1.0, 0.15, 'triangle'); playNote(450, now, 1.0, 0.15, 'triangle');
        } else if (type === 'xylophone') {
            playNote(800, now, 0.1, 0.4, 'triangle');
        } else if (type === 'success2') {
            playNote(440, now, 0.15); playNote(554, now+0.15, 0.15); playNote(659, now+0.3, 0.4);
        }
    } catch(e) {
        console.log("Audio not supported or blocked");
    }
};
