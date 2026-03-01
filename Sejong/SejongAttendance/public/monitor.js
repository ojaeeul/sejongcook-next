// Main Configuration
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000/api'
    : 'https://thin-bags-listen.loca.lt/api';
let currentInput = "";
let stream = null;
let currentMode = 'home';

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
    if (statusMsg) statusMsg.textContent = "";

    if (mode === 'home') {
        if (homeScreen) homeScreen.style.display = 'flex';
        if (workspace) workspace.style.display = 'none';
        stopCamera();
    } else {
        if (homeScreen) homeScreen.style.display = 'none';
        if (workspace) {
            workspace.style.display = 'flex';
            workspace.className = 'mode-' + mode;
        }

        if (mode === 'number') {
            setupUI("번호 출석", "휴대폰 뒷번호 8자리를 입력하세요", true, false, false);
            if (mirrorSection) mirrorSection.style.opacity = '0.2';
            stopCamera();
        }
        else if (mode === 'face_only') {
            setupUI("얼굴 출석", "카메라를 바라보고 아래 버튼을 누르세요", false, true, true);
            if (mirrorSection) mirrorSection.style.opacity = '1';
            startCamera();
            loadFaceModels(); // Preload ML
        }
        else if (mode === 'register') {
            setupUI("신규 얼굴 등록", "번호 입력 후 얼굴을 촬영하세요", true, false, true);
            if (mirrorSection) mirrorSection.style.opacity = '1';
            if (faceSubmitBtn) faceSubmitBtn.style.display = 'block';
            if (mainSubmitBtn) mainSubmitBtn.style.display = 'none';
            startCamera();
            loadFaceModels(); // Preload ML
        }
    }
}

let modelsLoaded = false;
let modelsLoading = false;

async function loadFaceModels() {
    if (modelsLoaded || modelsLoading) return;
    modelsLoading = true;
    showStatus("AI 얼굴 인식 엔진 준비 중...", "#3b82f6");

    try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        try { await faceapi.tf.setBackend('webgl'); } catch (e) { console.log('WebGL backend not supported, fallback to default'); }

        await Promise.all([
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

function setupUI(title, sub, showKeypad, showFacePanel, showMirror) {
    if (mainTitle) mainTitle.textContent = title;
    if (mainSub) mainSub.textContent = sub;

    if (inputWrapper) inputWrapper.style.display = showKeypad ? 'block' : 'none';
    if (keypadGrid) keypadGrid.style.display = showKeypad ? 'grid' : 'none';
    if (faceOnlyPanel) faceOnlyPanel.style.display = showFacePanel ? 'block' : 'none';

    if (mainSubmitBtn) mainSubmitBtn.style.display = (currentMode === 'number') ? 'block' : 'none';
    if (faceSubmitBtn) faceSubmitBtn.style.display = (currentMode === 'register') ? 'block' : 'none';
}

// ---------------------------------------------------------
// Attendance Logic
// ---------------------------------------------------------

async function submitAttendance() {
    if (currentInput.length !== 8) {
        showStatus("번호 8자리를 입력해주세요.", "red");
        return;
    }
    if (mainSubmitBtn) { mainSubmitBtn.disabled = true; mainSubmitBtn.textContent = "처리중..."; mainSubmitBtn.style.opacity = "0.7"; }
    showStatus("출석 처리 중입니다...", "#3b82f6");
    await processAttendance(currentInput);
    if (mainSubmitBtn) { mainSubmitBtn.disabled = false; mainSubmitBtn.textContent = "출석"; mainSubmitBtn.style.opacity = "1"; }
}

async function recognizeAndAttend() {
    if (!modelsLoaded) {
        showStatus("AI 엔진 모델 로딩 중입니다. 잠시 후 10초 뒤 시도해주세요.", "orange");
        return;
    }

    const btn = document.querySelector('#faceOnlyPanel button');
    if (btn) {
        btn.disabled = true;
        btn.textContent = "AI 분석 대기중...";
        btn.style.opacity = "0.7";
    }

    showStatus("얼굴 특징을 분석 중입니다. 가만히 바라봐주세요...", "#3b82f6");
    if (shutter) shutter.style.opacity = '1';
    setTimeout(() => { if (shutter) shutter.style.opacity = '0'; }, 150);

    // Give browser time to paint the UI text updates before heavy ML block
    await new Promise(r => setTimeout(r, 50));

    try {
        const detection = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor();

        if (!detection) {
            showStatus("얼굴이 감지되지 않았습니다. 밝은 곳에서 시도하세요.", "red");
            return;
        }

        showStatus("서버 데이터를 불러오는 중...", "#059669");
        await new Promise(r => setTimeout(r, 20));

        const res = await fetch(`${API_BASE}/members?t=` + Date.now());
        const rawMembers = await res.json();
        const members = Array.isArray(rawMembers) ? rawMembers.filter(m => !['delete', 'trash', 'hold', 'completed'].includes(m.status)) : [];

        showStatus("매칭되는 회원을 찾는 중...", "#059669");

        let bestMatch = null;
        let smallestDistance = 0.65; // Confidence matching threshold - increased for better recognition

        // Save current frame for the popup overlay instead of stored photo
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, 640, 480);
        const captureData = canvas.toDataURL('image/jpeg', 0.5);

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
            await processAttendance(phone8, captureData);
        } else {
            showStatus("등록된 얼굴을 찾을 수 없습니다. 신규 등록을 이용해보세요.", "red");
        }
    } catch (e) {
        showStatus("인식 시스템 오류!", "red");
        console.error(e);
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = "얼굴로 출석하기"; btn.style.opacity = "1"; }
    }
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
    await new Promise(r => setTimeout(r, 50));

    try {
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, 640, 480);
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.7);

        showStatus("회원 정보를 조회 중입니다...", "#3b82f6");
        const res = await fetch(`${API_BASE}/members?t=` + Date.now());
        const rawMembers = await res.json();
        const members = Array.isArray(rawMembers) ? rawMembers.filter(m => !['delete', 'trash', 'hold', 'completed'].includes(m.status)) : [];
        const member = members.find(m => m.phone && m.phone.replace(/-/g, '').endsWith(currentInput));

        if (!member) {
            showStatus("뒷번호 8자리와 일치하는 수강생 대장 회원이 없습니다.", "red");
            return;
        }

        showStatus("얼굴 데이터를 병합 분석 중입니다. 가만히 계세요...", "#3b82f6");
        await new Promise(r => setTimeout(r, 50));

        const detection = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor();

        if (!detection) {
            showStatus("얼굴이 명확히 인식되지 않았습니다. 밝은 곳에서 시도해주세요.", "red");
            return;
        }

        showStatus("신규 얼굴 데이터를 서버에 등록 중입니다...", "#059669");

        member.photo = photoDataUrl;
        member.faceDescriptor = Array.from(detection.descriptor); // Store for euclidean comparison

        await fetch(`${API_BASE}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(member)
        });

        showStatus("얼굴 등록 완료! 자동으로 출석 체크를 진행합니다...", "#059669");
        await processAttendance(member, photoDataUrl);
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

    for (const slotMins of slots) {
        if (currentMins >= (slotMins - 80) && currentMins <= (slotMins + 30)) {
            const h = Math.floor(slotMins / 60);
            if (h === 10) return '10';
            if (h === 12) return '12';
            if (h === 14 || h === 2) return '2';
            if (h === 17 || h === 5) return '5';
            if (h === 19 || h === 7) return '7';
        }
    }
    return 'present';
}

async function processAttendance(inputNumOrObj, overridePhoto = null) {
    try {
        let member = null;
        if (typeof inputNumOrObj === 'object' && inputNumOrObj !== null) {
            member = inputNumOrObj;
        } else {
            const res = await fetch(`${API_BASE}/members?t=` + Date.now());
            const rawMembers = await res.json();
            const members = Array.isArray(rawMembers) ? rawMembers.filter(m => !['delete', 'trash', 'hold', 'completed'].includes(m.status)) : [];
            member = members.find(m => m.phone && m.phone.replace(/-/g, '').endsWith(inputNumOrObj));
        }

        if (!member) {
            showStatus("등록되지 않은 번호입니다.", "red");
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const status = determineAttendanceStatus(member);

        const postRes = await fetch(`${API_BASE}/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberId: member.id, date: today, status: status })
        });

        if (postRes.ok) {
            showStatus(`${member.name}님, 등원 완료!`, "#3b82f6");
            showFaceOverlay(overridePhoto || member.photo, member.name);
            setTimeout(() => switchMode('home'), 2500);
        }
    } catch (e) {
        showStatus("통신 장애!", "red");
    }
}

function addNum(num) { if (currentInput.length < 8) { currentInput += num; updateDisplay(); } }
function clearNum() { currentInput = ""; updateDisplay(); }
function updateDisplay() { if (inputDisplay) inputDisplay.textContent = currentInput; }

async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        if (video) video.srcObject = stream;
    } catch (e) { showStatus("카메라 에러", "red"); }
}

function stopCamera() {
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

function showStatus(msg, color) { if (statusMsg) { statusMsg.textContent = msg; statusMsg.style.color = color; } }

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
